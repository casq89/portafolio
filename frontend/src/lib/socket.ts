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

export interface ServerToClientEvents {
  'tasks:snapshot': (tasks: TaskView[]) => void;
  'task:waiting': (task: TaskView) => void;
  'task:active': (task: TaskView) => void;
  'task:progress': (task: TaskView) => void;
  'task:retrying': (task: TaskView) => void;
  'task:completed': (task: TaskView) => void;
  'task:failed': (task: TaskView) => void;
}

export type ClientToServerEvents = Record<string, never>;

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

// One shared connection, created the first time a demo needs it. Relative URL:
// Vite (dev) and Caddy (prod) proxy /socket.io to the backend.
export function getSocket(): AppSocket {
  socket ??= io();
  return socket;
}
