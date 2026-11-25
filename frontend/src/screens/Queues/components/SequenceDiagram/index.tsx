import { actors, flow, type Actor, type FlowMessage } from '../../../../data/queues';

const laneIndex = (actor: Actor) => actors.findIndex((a) => a.id === actor);
const laneCenter = (index: number) => ((index + 0.5) / actors.length) * 100;

const lineStyle: Record<FlowMessage['kind'], string> = {
  http: 'border-fg',
  redis: 'border-muted',
  socket: 'border-dashed border-accent',
};

// Sequence diagram: one column (lifeline) per actor, one arrow per message, top to bottom.
function SequenceDiagram() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-2">
        {actors.map((actor) => (
          <div
            key={actor.id}
            className="rounded-lg border-[1.5px] border-edge-strong bg-raised px-1 py-2 text-center font-mono"
          >
            <div className="text-xs font-bold sm:text-sm">{actor.name}</div>
            <div className="text-[0.65rem] text-subtle sm:text-xs">{actor.role}</div>
          </div>
        ))}
      </div>

      <ol className="relative flex flex-col gap-3">
        {actors.map((actor, i) => (
          <span
            key={actor.id}
            aria-hidden
            className="absolute inset-y-0 border-l-[1.5px] border-dashed border-edge"
            style={{ left: `${laneCenter(i)}%` }}
          />
        ))}

        {flow.map((message, i) => {
          const from = laneIndex(message.from);
          const to = laneIndex(message.to);
          const left = laneCenter(Math.min(from, to));
          const width = laneCenter(Math.max(from, to)) - left;
          const rightward = to > from;

          return (
            <li key={i} className="relative" style={{ marginLeft: `${left}%`, width: `${width}%` }}>
              <div className="px-1 pb-1 text-center font-mono text-[0.68rem] leading-tight break-words sm:text-xs">
                <span className="text-subtle">{i + 1}. </span>
                <span className={message.kind === 'socket' ? 'text-accent' : ''}>{message.label}</span>
              </div>
              <div className={`relative border-t-[1.5px] ${lineStyle[message.kind]}`}>
                <span
                  aria-hidden
                  className={`absolute -top-[7px] text-[0.6rem] leading-none ${
                    message.kind === 'socket' ? 'text-accent' : message.kind === 'http' ? 'text-fg' : 'text-muted'
                  } ${rightward ? '-right-1' : '-left-1'}`}
                >
                  {rightward ? '▶' : '◀'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 border-t-[1.5px] border-edge pt-4 font-mono text-xs text-muted">
        <li className="flex items-center gap-2">
          <span className="w-6 border-t-[1.5px] border-fg" /> HTTP request / response
        </li>
        <li className="flex items-center gap-2">
          <span className="w-6 border-t-[1.5px] border-muted" /> Redis (BullMQ)
        </li>
        <li className="flex items-center gap-2">
          <span className="w-6 border-t-[1.5px] border-dashed border-accent" /> Socket.IO, sent to every open browser
        </li>
      </ul>
    </div>
  );
}

export default SequenceDiagram;
