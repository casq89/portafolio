import { io, type Socket } from 'socket.io-client';

// Mirrors the types in backend/src/tasks.ts.
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

// Mirrors the types in backend/src/metrics.ts.
export interface MetricsSample {
  /** Server time in ms */
  t: number;
  /** CPU usage across all cores, 0 to 100 */
  cpu: number;
  /** Open TCP connections, IPv4 + IPv6. null when the server can't measure it (not Linux) */
  tcp: number | null;
  /** Bytes per second received. null when the server can't measure it (not Linux) */
  netIn: number | null;
  /** Bytes per second sent */
  netOut: number | null;
  /** Worst event loop delay in the interval, in ms */
  lag: number;
}

export interface MetricsInfo {
  cores: number;
  intervalMs: number;
}

export interface ServerToClientEvents {
  'metrics:snapshot': (snapshot: { info: MetricsInfo; samples: MetricsSample[] }) => void;
  'metrics:sample': (sample: MetricsSample) => void;
  'queue:info': (info: QueueInfo) => void;
  'tasks:snapshot': (tasks: TaskView[]) => void;
  'task:waiting': (task: TaskView) => void;
  'task:active': (task: TaskView) => void;
  'task:progress': (task: TaskView) => void;
  'task:retrying': (task: TaskView) => void;
  'task:completed': (task: TaskView) => void;
  'task:failed': (task: TaskView) => void;
}

export interface ClientToServerEvents {
  'metrics:subscribe': () => void;
  'metrics:unsubscribe': () => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

// One shared connection, created the first time a demo needs it. Relative URL:
// Vite (dev) and Caddy (prod) proxy /socket.io to the backend.
export function getSocket(): AppSocket {
  socket ??= io();
  return socket;
}
