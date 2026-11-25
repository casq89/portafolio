import { Router } from 'express';
import type { Server } from 'socket.io';
import { Queue, Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';

// Task queue demo: visitors enqueue fake tasks, a worker processes them two at a
// time and every state change is broadcast to all browsers through Socket.IO.

export type TaskStatus = 'waiting' | 'active' | 'completed' | 'failed';

export interface TaskView {
  id: string;
  status: TaskStatus;
  /** 0 to 100 */
  progress: number;
  /** Current attempt (or the next one, while waiting for a retry) */
  attempt: number;
  maxAttempts: number;
  /** Waiting again after a failed attempt */
  retrying: boolean;
  durationMs?: number;
  finishedAt?: number;
}

export interface QueueInfo {
  /** Workers listening to the queue, as Redis reports them */
  workers: number;
  /** Tasks each worker processes at the same time */
  concurrency: number;
}

export interface TaskEvents {
  'queue:info': (info: QueueInfo) => void;
  'tasks:snapshot': (tasks: TaskView[]) => void;
  'task:waiting': (task: TaskView) => void;
  'task:active': (task: TaskView) => void;
  'task:progress': (task: TaskView) => void;
  'task:retrying': (task: TaskView) => void;
  'task:completed': (task: TaskView) => void;
  'task:failed': (task: TaskView) => void;
}

type TaskJob = Job<Record<string, never>, void>;

const QUEUE_NAME = 'tasks';
const CONCURRENCY = 2;
const MAX_ATTEMPTS = 3;
const STEPS = 5;
const STEP_MS = 400;
/** Chance that an attempt fails on purpose, to show retries */
const FAILURE_RATE = 0.2;
const MAX_BATCH = 10;
/** Waiting + active tasks allowed at once, across all visitors */
const MAX_PENDING = 60;
/** Tasks per IP per minute */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;
const REDIS_TIMEOUT_MS = 3000;
const RECENT_FINISHED = 6;
const QUEUE_INFO_INTERVAL_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// With Redis down, ioredis queues commands forever: fail fast instead.
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT_MS)),
  ]);
}

const recentTasks = new Map<string, number[]>();

function isRateLimited(ip: string, count: number): boolean {
  const now = Date.now();
  const sent = (recentTasks.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (sent.length + count > RATE_LIMIT) {
    recentTasks.set(ip, sent);
    return true;
  }
  recentTasks.set(ip, [...sent, ...Array<number>(count).fill(now)]);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, sent] of recentTasks) {
    if (sent.every((t) => now - t >= RATE_WINDOW_MS)) recentTasks.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

function toView(job: TaskJob, status: TaskStatus, overrides: Partial<TaskView> = {}): TaskView {
  const finished = status === 'completed' || status === 'failed';
  return {
    id: job.id ?? '',
    status,
    progress: typeof job.progress === 'number' ? job.progress : 0,
    attempt: finished ? job.attemptsMade : job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? MAX_ATTEMPTS,
    retrying: status === 'waiting' && job.attemptsMade > 0,
    durationMs: finished && job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined,
    finishedAt: job.finishedOn,
    ...overrides,
  };
}

export function createTasksDemo(io: Server<Record<string, never>, TaskEvents>, connection: Redis): Router {
  const queue = new Queue<Record<string, never>, void>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: MAX_ATTEMPTS,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 50 },
    },
  });

  const worker = new Worker<Record<string, never>, void>(
    QUEUE_NAME,
    async (job) => {
      const failAt = Math.random() < FAILURE_RATE ? 1 + Math.floor(Math.random() * (STEPS - 1)) : -1;
      for (let step = 1; step <= STEPS; step++) {
        await sleep(STEP_MS);
        if (step === failAt) throw new Error('Simulated failure');
        await job.updateProgress((step / STEPS) * 100);
      }
    },
    { connection, concurrency: CONCURRENCY },
  );

  worker.on('active', (job) => {
    io.emit('task:active', toView(job, 'active', { progress: 0, attempt: job.attemptsStarted }));
  });

  worker.on('progress', (job) => {
    io.emit('task:progress', toView(job, 'active', { attempt: job.attemptsStarted }));
  });

  worker.on('completed', (job) => {
    io.emit('task:completed', toView(job, 'completed'));
  });

  worker.on('failed', (job) => {
    if (!job) return;
    if (job.attemptsMade < (job.opts.attempts ?? 1)) {
      io.emit('task:retrying', toView(job, 'waiting', { progress: 0 }));
    } else {
      io.emit('task:failed', toView(job, 'failed'));
    }
  });

  worker.on('error', (err) => {
    console.error('Task worker error:', err.message);
  });

  async function snapshot(): Promise<TaskView[]> {
    const [active, waiting, delayed, completed, failed] = await Promise.all([
      queue.getActive(),
      queue.getWaiting(0, MAX_PENDING),
      queue.getDelayed(0, MAX_PENDING),
      queue.getCompleted(0, RECENT_FINISHED - 1),
      queue.getFailed(0, RECENT_FINISHED - 1),
    ]);
    return [
      ...active.map((job) => toView(job, 'active', { attempt: job.attemptsStarted })),
      ...waiting.map((job) => toView(job, 'waiting', { progress: 0 })),
      ...delayed.map((job) => toView(job, 'waiting', { progress: 0 })),
      ...completed.map((job) => toView(job, 'completed')),
      ...failed.map((job) => toView(job, 'failed')),
    ];
  }

  // Ask Redis how many workers are listening, so a stopped worker shows up as 0.
  async function queueInfo(): Promise<QueueInfo> {
    const workers = await withTimeout(queue.getWorkersCount()).catch(() => 0);
    return { workers, concurrency: CONCURRENCY };
  }

  let lastInfo: QueueInfo | null = null;
  setInterval(() => {
    queueInfo().then((info) => {
      if (info.workers !== lastInfo?.workers) io.emit('queue:info', info);
      lastInfo = info;
    });
  }, QUEUE_INFO_INTERVAL_MS).unref();

  // Every new browser (and every reconnection) gets the current board first.
  io.on('connection', (socket) => {
    queueInfo().then((info) => socket.emit('queue:info', info));
    withTimeout(snapshot())
      .then((tasks) => socket.emit('tasks:snapshot', tasks))
      .catch(() => socket.emit('tasks:snapshot', []));
  });

  const router = Router();

  router.post('/', async (req, res) => {
    const count = Number(req.body?.count ?? 1);
    if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH) {
      res.status(400).json({ error: `count must be between 1 and ${MAX_BATCH}` });
      return;
    }
    if (isRateLimited(req.ip ?? 'unknown', count)) {
      res.status(429).json({ error: 'Too many tasks, try again in a minute' });
      return;
    }

    try {
      const counts = await withTimeout(queue.getJobCounts('waiting', 'delayed', 'active'));
      const pending = (counts.waiting ?? 0) + (counts.delayed ?? 0) + (counts.active ?? 0);
      if (pending + count > MAX_PENDING) {
        res.status(503).json({ error: 'The queue is full right now, try again in a few seconds' });
        return;
      }

      const jobs = await withTimeout(queue.addBulk(Array.from({ length: count }, () => ({ name: 'demo', data: {} }))));
      for (const job of jobs) io.emit('task:waiting', toView(job, 'waiting'));
      res.json({ ids: jobs.map((job) => job.id ?? '') });
    } catch {
      res.status(503).json({ error: 'The queue is offline right now' });
    }
  });

  return router;
}
