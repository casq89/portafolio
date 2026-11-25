import { Link } from 'react-router';
import Window from '../../../../../../components/Window';
import type { QueueInfo, TaskStatus, TaskView } from '../../../../../../lib/socket';
import TaskCard from './components/TaskCard';
import { useTaskQueue } from './useTaskQueue';

const MAX_VISIBLE = 4;

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'waiting', label: 'waiting' },
  { status: 'active', label: 'active' },
  { status: 'completed', label: 'completed' },
  { status: 'failed', label: 'failed' },
];

const byId = (a: TaskView, b: TaskView) => Number(a.id) - Number(b.id);
const byNewest = (a: TaskView, b: TaskView) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function statusLabel(connected: boolean, info: QueueInfo | null): string {
  if (!connected) return '○ connecting…';
  if (!info) return '● live';
  return `● live · ${plural(info.workers, 'worker')} × ${plural(info.concurrency, 'slot')}`;
}

function TaskQueueDemo() {
  const { tasks, mine, connected, info, sending, error, lastSend, send } = useTaskQueue();

  return (
    <Window title="demo/01 — redis + bullmq" meta={statusLabel(connected, info)} className="w-full max-w-[680px]">
      <div className="flex flex-col gap-4 p-6 md:pb-[130px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-3xl font-bold">Task queue</h3>
          <Link
            to="/queues"
            className="group inline-flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-accent bg-canvas px-4 py-2 font-mono text-sm font-semibold text-accent shadow-layer-sm transition hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-light-sm"
          >
            <span aria-hidden>{'</>'}</span>
            How I built it
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        <p className="max-w-[520px] font-mono text-sm text-muted">
          Send tasks to the server. Redis holds them in line and a worker takes them in order, as many at a
          time as it has free slots. Some fail on purpose and get retried.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => send(1)}
            disabled={sending}
            className="cursor-pointer rounded-[10px] bg-accent px-5 py-[11px] font-semibold text-on-accent disabled:cursor-wait disabled:opacity-60"
          >
            Send 1 task
          </button>
          <button
            type="button"
            onClick={() => send(10)}
            disabled={sending}
            className="cursor-pointer rounded-[10px] border-[1.5px] border-edge-strong px-5 py-[11px] font-semibold disabled:cursor-wait disabled:opacity-60"
          >
            Send 10 at once
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {columns.map(({ status, label }) => {
            const finished = status === 'completed' || status === 'failed';
            const list = tasks.filter((task) => task.status === status).sort(finished ? byNewest : byId);
            const hidden = list.length - MAX_VISIBLE;

            return (
              <div key={status} className="flex min-h-[220px] flex-col gap-2 rounded-[10px] bg-raised p-2">
                <div className="flex items-center justify-between px-1 font-mono text-[0.7rem] tracking-wider text-subtle uppercase">
                  <span className={status === 'active' ? 'text-accent' : ''}>{label}</span>
                  <span>{list.length}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {list.slice(0, MAX_VISIBLE).map((task) => (
                    <TaskCard key={task.id} task={task} mine={mine.has(task.id)} />
                  ))}
                </ul>
                {!finished && hidden > 0 && (
                  <div className="px-1 font-mono text-xs text-subtle">+{hidden} more</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="min-h-[3em] font-mono text-xs leading-relaxed text-muted" aria-live="polite">
          {error ? (
            <span className="text-accent">! {error}</span>
          ) : lastSend ? (
            <>
              <span className="text-accent">&gt;</span> The server accepted your {lastSend.count === 1 ? 'task' : `${lastSend.count} tasks`} in{' '}
              {lastSend.responseMs} ms. The work runs afterwards, in the background, and every change reaches your
              browser through a WebSocket.
            </>
          ) : (
            <span className="text-subtle">&gt; Waiting for your first task…</span>
          )}
        </div>
      </div>
    </Window>
  );
}

export default TaskQueueDemo;
