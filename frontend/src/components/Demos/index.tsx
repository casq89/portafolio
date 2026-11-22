import SectionHeader from '../SectionHeader';
import Window from '../Window';

const taskStates = ['waiting', 'active', 'completed'] as const;

function Demos() {
  return (
    <section id="demos" className="scroll-mt-8 py-16 md:pb-24">
      <SectionHeader
        path="~/demos"
        title="Try it live"
        description="Two demos wired to the real backend behind this portfolio."
      />

      <div className="flex flex-col">
        <Window title="demo/01 — redis + bullmq" meta="coming soon" className="w-full max-w-[680px]">
          <div className="flex flex-col gap-3.5 p-6 md:pb-[130px]">
            <h3 className="font-display text-3xl font-bold">Task queue</h3>
            <p className="max-w-[460px] text-muted">
              Send a task, it gets queued in Redis and a worker processes it. Watch it move through each state.
            </p>
            <ol className="flex flex-wrap items-center gap-2 font-mono text-sm">
              {taskStates.map((state, i) => (
                <li key={state} className="flex items-center gap-2">
                  {i > 0 && <span className="text-subtle">→</span>}
                  <span
                    className={
                      state === 'completed'
                        ? 'rounded-lg bg-accent px-3 py-1.5 font-bold text-canvas'
                        : 'rounded-lg border-[1.5px] border-edge-strong px-3 py-1.5'
                    }
                  >
                    {state}
                  </span>
                </li>
              ))}
            </ol>
            <a
              href="#"
              className="mt-1.5 self-start rounded-[10px] bg-accent px-5 py-[11px] font-semibold text-canvas"
            >
              Open demo ↗
            </a>
          </div>
        </Window>

        {/* On desktop this window overlaps the previous one */}
        <Window
          title="demo/02 — socket.io"
          meta="coming soon"
          highlighted
          className="relative z-10 mt-10 w-full max-w-[620px] md:-mt-[110px] md:mr-2 md:ml-auto"
        >
          <div className="flex flex-col gap-3.5 p-6">
            <h3 className="font-display text-3xl font-bold">Real time</h3>
            <p className="text-muted">The server notifies the browser as soon as something finishes, no page reload.</p>
            <div className="overflow-x-auto rounded-[10px] border-[1.5px] border-edge bg-canvas px-4 py-3.5 font-mono text-[0.82rem] leading-[1.9] whitespace-nowrap">
              <div className="text-subtle">→ socket connected</div>
              <div>
                <span className="text-accent">←</span> task:completed
              </div>
            </div>
            <a href="#" className="self-start rounded-[10px] bg-fg px-5 py-[11px] font-semibold text-canvas">
              Open demo ↗
            </a>
          </div>
        </Window>
      </div>
    </section>
  );
}

export default Demos;
