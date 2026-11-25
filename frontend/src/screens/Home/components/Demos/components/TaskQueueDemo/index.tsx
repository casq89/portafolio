import Window from '../../../../../../components/Window';
import type { TaskStatus, TaskView } from '../../../../../../lib/socket';
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

function TaskQueueDemo() {
  const { tasks, mine, connected, sending, error, lastSend, send } = useTaskQueue();

  return (
    <Window
      title="demo/01 — redis + bullmq"
      meta={connected ? '● live · 2 workers' : '○ connecting…'}
      className="w-full max-w-[680px]"
    >
      <div className="flex flex-col gap-4 p-6 md:pb-[130px]">
        <h3 className="font-display text-3xl font-bold">Task queue</h3>
        <p className="max-w-[520px] font-mono text-sm text-muted">
          Send tasks to the server. Redis holds them in line and 2 workers process them, two at a time. Some
          fail on purpose and get retried.
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
