import type { TaskView } from '../../../../../../../../lib/socket';

interface TaskCardProps {
  task: TaskView;
  mine: boolean;
}

function TaskCard({ task, mine }: TaskCardProps) {
  const border = mine ? 'border-accent' : 'border-edge';
  const owner = <span className={mine ? 'text-accent' : 'text-subtle'}>{mine ? 'you' : 'visitor'}</span>;

  return (
    <li
      className={`animate-pop-in rounded-lg border-[1.5px] bg-canvas px-2.5 py-2 font-mono text-xs ${border} ${
        task.status === 'failed' ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">#{task.id}</span>
        {owner}
      </div>

      {task.status === 'waiting' && task.retrying && (
        <div className="mt-1 text-subtle">
          ↻ retry {task.attempt}/{task.maxAttempts}
        </div>
      )}

      {task.status === 'active' && (
        <>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-subtle">
            <span>{Math.round(task.progress)}%</span>
            {task.attempt > 1 && (
              <span>
                try {task.attempt}/{task.maxAttempts}
              </span>
            )}
          </div>
        </>
      )}

      {task.status === 'completed' && (
        <div className="mt-1 text-subtle">
          <span className="text-accent">✓</span> {((task.durationMs ?? 0) / 1000).toFixed(1)}s
          {task.attempt > 1 && ` · ${task.attempt} tries`}
        </div>
      )}

      {task.status === 'failed' && <div className="mt-1 text-subtle">✕ gave up after {task.attempt}</div>}
    </li>
  );
}

export default TaskCard;
