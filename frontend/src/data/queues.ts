// Content of the /queues screen: a step-by-step walkthrough of the task queue demo.
// Code excerpts are trimmed copies of backend/src/server.ts, backend/src/tasks.ts and
// the frontend files: keep them in sync when that code changes.

export type Actor = 'browser' | 'express' | 'redis' | 'worker';

export const actors: { id: Actor; name: string; role: string }[] = [
  { id: 'browser', name: 'Browser', role: 'you + others' },
  { id: 'express', name: 'Express', role: 'server.ts' },
  { id: 'redis', name: 'Redis', role: 'the queue' },
  { id: 'worker', name: 'Worker', role: 'tasks.ts' },
];

export interface FlowMessage {
  from: Actor;
  to: Actor;
  label: string;
  /** socket = Socket.IO broadcast to every open browser */
  kind: 'http' | 'redis' | 'socket';
}

export const flow: FlowMessage[] = [
  { from: 'browser', to: 'express', label: 'POST /api/tasks', kind: 'http' },
  { from: 'express', to: 'redis', label: 'queue.addBulk()', kind: 'redis' },
  { from: 'express', to: 'browser', label: '{ ids } · ~5 ms', kind: 'http' },
  { from: 'express', to: 'browser', label: 'task:waiting', kind: 'socket' },
  { from: 'redis', to: 'worker', label: 'next job, when a slot is free', kind: 'redis' },
  { from: 'worker', to: 'browser', label: 'task:active', kind: 'socket' },
  { from: 'worker', to: 'browser', label: 'task:progress · 20 … 100%', kind: 'socket' },
  { from: 'worker', to: 'redis', label: 'failed? back in line (1 s, 2 s)', kind: 'redis' },
  { from: 'worker', to: 'browser', label: 'task:completed / retrying / failed', kind: 'socket' },
];

export type TaskState = 'waiting' | 'active' | 'completed' | 'failed';

export const transitions: { from: TaskState; to: TaskState; when: string }[] = [
  { from: 'waiting', to: 'active', when: 'a worker slot is free' },
  { from: 'active', to: 'completed', when: 'all 5 steps done' },
  { from: 'active', to: 'waiting', when: 'fails with attempts left · retry in 1 s, then 2 s' },
  { from: 'active', to: 'failed', when: 'fails on the 3rd attempt' },
];

export const intro: string[] = [
  "Some work is too slow to do while the visitor waits for an answer: sending emails, resizing images, generating reports. If the server does it inside the request, the browser hangs and every other request competes for the same time.",
  "A queue splits the job in two. The request only writes a note in Redis (\"this needs doing\") and answers right away. A separate worker reads those notes in order and does the heavy part, as many at a time as it has slots. If a job fails, the queue puts it back in line and tries again.",
  "The demo adds one more piece: every change of state is pushed to every open browser through a WebSocket, so the board moves on its own, for you and for anyone else watching.",
];

export interface TutorialStep {
  part: 'backend' | 'frontend';
  title: string;
  file: string;
  /** Paragraphs; text between backticks renders as inline code */
  body: string[];
  code: string;
}

export const steps: TutorialStep[] = [
  {
    part: 'backend',
    title: 'One Redis connection and one Socket.IO server',
    file: 'backend/src/server.ts',
    body: [
      "Express, Socket.IO and the Redis connection are created once in `server.ts` and handed to the demo. Socket.IO shares the same HTTP server as Express, so REST and WebSockets live on one port.",
      "`maxRetriesPerRequest: null` is required by BullMQ: its workers use blocking Redis commands that must be allowed to wait.",
      "The Socket.IO server is typed with the events it can send, so a typo in an event name or payload is a compile error, not a silent bug.",
    ],
    code: `const httpServer = createServer(app);
const io = new Server<Record<string, never>, ServerToClientEvents>(httpServer);

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

app.use('/api/tasks', createTasksDemo(io, connection));`,
  },
  {
    part: 'backend',
    title: 'Define the queue and its retry policy',
    file: 'backend/src/tasks.ts',
    body: [
      "A BullMQ `Queue` is a named list of jobs stored in Redis. The default job options say what happens to every task: 3 attempts, an exponential wait between them, and automatic clean-up so Redis only keeps the last 50 finished jobs.",
    ],
    code: `const queue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }, // 1 s, then 2 s
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  },
});`,
  },
  {
    part: 'backend',
    title: 'The worker does the slow part',
    file: 'backend/src/tasks.ts',
    body: [
      "The `Worker` listens to the same queue name. `concurrency: 2` means it runs two jobs at the same time: those are the 2 slots in the demo, and the reason the active column never holds more than two cards.",
      "Each fake task takes 5 steps of 400 ms and reports its progress after each one. About 20% of the attempts throw on purpose, so you can watch BullMQ retry them.",
    ],
    code: `const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const failAt = Math.random() < FAILURE_RATE ? 1 + Math.floor(Math.random() * (STEPS - 1)) : -1;
    for (let step = 1; step <= STEPS; step++) {
      await sleep(STEP_MS);
      if (step === failAt) throw new Error('Simulated failure');
      await job.updateProgress((step / STEPS) * 100);
    }
  },
  { connection, concurrency: 2 },
);`,
  },
  {
    part: 'backend',
    title: 'Enqueue over HTTP and answer right away',
    file: 'backend/src/tasks.ts',
    body: [
      "`POST /api/tasks` never processes anything. It validates the request, applies the limits, adds the jobs to Redis and responds with their ids, in a few milliseconds.",
      "Right after adding them it broadcasts `task:waiting`, so every open browser draws the new cards. The ids go back only to the sender, which is how the board knows which cards are yours.",
    ],
    code: `router.post('/', async (req, res) => {
  const count = Number(req.body?.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH) return res.status(400)…
  if (isRateLimited(req.ip ?? 'unknown', count)) return res.status(429)…
  // 503 when more than MAX_PENDING tasks are already waiting

  const jobs = await withTimeout(
    queue.addBulk(Array.from({ length: count }, () => ({ name: 'demo', data: {} }))),
  );
  for (const job of jobs) io.emit('task:waiting', toView(job, 'waiting'));
  res.json({ ids: jobs.map((job) => job.id ?? '') });
});`,
  },
  {
    part: 'backend',
    title: 'Turn worker events into Socket.IO events',
    file: 'backend/src/tasks.ts',
    body: [
      "The worker emits an event every time a job changes: `active`, `progress`, `completed`, `failed`. Each one is converted to a small `TaskView` (id, status, progress, attempt) and sent to everyone with `io.emit`.",
      "A failure is not always final: if the job still has attempts left, BullMQ puts it back in the queue by itself, so the server announces `task:retrying` instead of `task:failed`.",
    ],
    code: `worker.on('active', (job) => io.emit('task:active', toView(job, 'active', { progress: 0 })));
worker.on('progress', (job) => io.emit('task:progress', toView(job, 'active')));
worker.on('completed', (job) => io.emit('task:completed', toView(job, 'completed')));

worker.on('failed', (job) => {
  if (!job) return;
  if (job.attemptsMade < (job.opts.attempts ?? 1)) {
    io.emit('task:retrying', toView(job, 'waiting', { progress: 0 }));
  } else {
    io.emit('task:failed', toView(job, 'failed'));
  }
});`,
  },
  {
    part: 'backend',
    title: 'A snapshot for whoever arrives late',
    file: 'backend/src/tasks.ts',
    body: [
      "Events only describe changes. A visitor who opens the page while tasks are running would see an empty board, so each new connection first gets `tasks:snapshot` (the current board, read from Redis) and `queue:info`.",
      "`queue:info` asks Redis how many workers are listening. That is the \"1 worker × 2 slots\" in the demo title bar: if the worker stops, it drops to 0.",
    ],
    code: `io.on('connection', (socket) => {
  queueInfo().then((info) => socket.emit('queue:info', info));
  withTimeout(snapshot())
    .then((tasks) => socket.emit('tasks:snapshot', tasks))
    .catch(() => socket.emit('tasks:snapshot', []));
});

async function queueInfo(): Promise<QueueInfo> {
  const workers = await withTimeout(queue.getWorkersCount()).catch(() => 0);
  return { workers, concurrency: CONCURRENCY };
}`,
  },
  {
    part: 'frontend',
    title: 'One shared, typed socket',
    file: 'frontend/src/lib/socket.ts',
    body: [
      "The browser opens a single Socket.IO connection, created the first time a demo needs it. It connects to a relative URL: Vite in development and Caddy in production forward `/socket.io` to the backend.",
      "The event types mirror the backend ones, so `socket.on('task:active', …)` already knows its payload is a `TaskView`.",
    ],
    code: `export interface ServerToClientEvents {
  'queue:info': (info: QueueInfo) => void;
  'tasks:snapshot': (tasks: TaskView[]) => void;
  'task:waiting': (task: TaskView) => void;
  // … active, progress, retrying, completed, failed
}

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  socket ??= io();
  return socket;
}`,
  },
  {
    part: 'frontend',
    title: 'A hook that keeps the board in sync',
    file: 'TaskQueueDemo/useTaskQueue.ts',
    body: [
      "`useTaskQueue` keeps every task in a `Map` by id. Almost every event is an upsert: replace the card with its newest version. The snapshot replaces the whole map.",
      "`task:waiting` is the exception: it only adds new cards, so a late event can never drag a running task back to the waiting column.",
      "Sending a task is a plain `fetch`. The hook times the answer and stores the returned ids, which is how the board labels cards as \"you\" or \"visitor\".",
    ],
    code: `const upsert = (task: TaskView) => setTasks((prev) => prune(new Map(prev).set(task.id, task)));
const addWaiting = (task: TaskView) =>
  setTasks((prev) => (prev.has(task.id) ? prev : new Map(prev).set(task.id, task)));

socket.on('tasks:snapshot', replaceAll);
socket.on('task:waiting', addWaiting);
socket.on('task:active', upsert);
socket.on('task:progress', upsert);
// … retrying, completed and failed are upserts too, and the effect cleans up with socket.off

const start = performance.now();
const response = await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ count }), … });
setMine((prev) => new Set([...prev, ...ids]));
setLastSend({ count, responseMs: Math.round(performance.now() - start) });`,
  },
  {
    part: 'frontend',
    title: 'Render the columns',
    file: 'TaskQueueDemo/index.tsx',
    body: [
      "The board is just a filter: each column shows the tasks with its status, pending ones by id and finished ones newest first. `TaskCard` draws the progress bar, the retry badge or the duration depending on the status.",
      "When a card changes column React mounts it again, which replays a short pop-in animation. That small detail is what makes the movement easy to follow.",
    ],
    code: `{columns.map(({ status, label }) => {
  const list = tasks.filter((task) => task.status === status).sort(finished ? byNewest : byId);
  return (
    <div key={status}>
      <span>{label}</span> <span>{list.length}</span>
      <ul>
        {list.slice(0, MAX_VISIBLE).map((task) => (
          <TaskCard key={task.id} task={task} mine={mine.has(task.id)} />
        ))}
      </ul>
    </div>
  );
})}`,
  },
];

export const guardrails: { title: string; text: string }[] = [
  { title: 'Rate limit', text: '30 tasks per IP per minute, counted in memory.' },
  { title: 'Global cap', text: 'At most 60 pending tasks across all visitors; beyond that the API answers 503.' },
  {
    title: 'Fail fast',
    text: 'With Redis down, ioredis would queue commands forever. Every call has a 3 s timeout and the API answers 503 instead.',
  },
  { title: 'Bounded storage', text: 'Redis keeps only the last 50 completed and 50 failed jobs.' },
  { title: 'No user data', text: 'Tasks carry no content, so there is nothing to validate or moderate.' },
];
