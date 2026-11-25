import { transitions, type TaskState } from '../../../../data/queues';

const chipStyle: Record<TaskState, string> = {
  waiting: 'border-edge-strong',
  active: 'border-accent text-accent',
  completed: 'border-accent bg-accent font-bold text-on-accent',
  failed: 'border-edge-strong text-subtle line-through',
};

function StateChip({ state }: { state: TaskState }) {
  return (
    <span className={`shrink-0 rounded-lg border-[1.5px] px-2.5 py-1 font-mono text-xs ${chipStyle[state]}`}>
      {state}
    </span>
  );
}

// Every way a task can move between the board's columns.
function TaskLifecycle() {
  return (
    <ul className="flex flex-col gap-3">
      {transitions.map(({ from, to, when }) => (
        <li key={`${from}-${to}`} className="flex items-center gap-2 sm:gap-3">
          <StateChip state={from} />
          <span className="flex min-w-0 flex-1 flex-col items-center">
            <span className="text-center font-mono text-[0.68rem] leading-tight text-muted sm:text-xs">{when}</span>
            <span className="relative mt-1 w-full border-t-[1.5px] border-edge-strong">
              <span aria-hidden className="absolute -top-[7px] -right-1 text-[0.6rem] leading-none text-muted">
                ▶
              </span>
            </span>
          </span>
          <StateChip state={to} />
        </li>
      ))}
    </ul>
  );
}

export default TaskLifecycle;
