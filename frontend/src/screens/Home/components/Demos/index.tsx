import SectionHeader from '../../../../components/SectionHeader';
import Window from '../../../../components/Window';
import TaskQueueDemo from './components/TaskQueueDemo';

function Demos() {
  return (
    <section id="demos" className="scroll-mt-8 py-16 md:pb-24">
      <SectionHeader
        path="~/demos"
        title="Try it live"
        description="Two demos wired to the real backend behind this portfolio."
      />

      <div className="flex flex-col">
        <TaskQueueDemo />

        {/* On desktop this window overlaps the previous one */}
        <Window
          title="demo/02 — socket.io"
          meta="coming soon"
          highlighted
          className="relative z-10 mt-10 w-full max-w-[620px] md:-mt-[110px] md:mr-2 md:ml-auto"
        >
          <div className="flex flex-col gap-3.5 p-6">
            <h3 className="font-display text-3xl font-bold">Real time</h3>
            <p className="font-mono text-muted">The server notifies the browser as soon as something finishes, no page reload.</p>
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
