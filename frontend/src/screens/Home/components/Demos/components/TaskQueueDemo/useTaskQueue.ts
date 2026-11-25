import { useCallback, useEffect, useState } from 'react';
import { getSocket, type QueueInfo, type TaskView } from '../../../../../../lib/socket';

const RECENT_FINISHED = 6;

interface SendResult {
  ids?: string[];
  error?: string;
}

export interface LastSend {
  count: number;
  responseMs: number;
}

const isFinished = (task: TaskView) => task.status === 'completed' || task.status === 'failed';

// Keep every pending task, but only the most recent finished ones.
function prune(tasks: Map<string, TaskView>): Map<string, TaskView> {
  const finished = [...tasks.values()]
    .filter(isFinished)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  for (const task of finished.slice(RECENT_FINISHED * 2)) tasks.delete(task.id);
  return tasks;
}

export function useTaskQueue() {
  const [tasks, setTasks] = useState<Map<string, TaskView>>(new Map());
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(() => getSocket().connected);
  const [info, setInfo] = useState<QueueInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSend, setLastSend] = useState<LastSend | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const upsert = (task: TaskView) => setTasks((prev) => prune(new Map(prev).set(task.id, task)));
    // 'waiting' can only add a new card: it never moves a card back from active or finished.
    const addWaiting = (task: TaskView) =>
      setTasks((prev) => (prev.has(task.id) ? prev : new Map(prev).set(task.id, task)));
    const replaceAll = (list: TaskView[]) => setTasks(prune(new Map(list.map((task) => [task.id, task]))));
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:info', setInfo);
    socket.on('tasks:snapshot', replaceAll);
    socket.on('task:waiting', addWaiting);
    socket.on('task:active', upsert);
    socket.on('task:progress', upsert);
    socket.on('task:retrying', upsert);
    socket.on('task:completed', upsert);
    socket.on('task:failed', upsert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:info', setInfo);
      socket.off('tasks:snapshot', replaceAll);
      socket.off('task:waiting', addWaiting);
      socket.off('task:active', upsert);
      socket.off('task:progress', upsert);
      socket.off('task:retrying', upsert);
      socket.off('task:completed', upsert);
      socket.off('task:failed', upsert);
    };
  }, []);

  const send = useCallback(async (count: number) => {
    setSending(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const responseMs = Math.round(performance.now() - start);
      const result = (await response.json().catch(() => ({}))) as SendResult;
      if (!response.ok || !result.ids) {
        setError(result.error ?? 'The queue is offline right now');
        return;
      }
      const ids = result.ids;
      setMine((prev) => new Set([...prev, ...ids]));
      setLastSend({ count, responseMs });
    } catch {
      setError('Could not reach the server');
    } finally {
      setSending(false);
    }
  }, []);

  return { tasks: [...tasks.values()], mine, connected, info, sending, error, lastSend, send };
}
