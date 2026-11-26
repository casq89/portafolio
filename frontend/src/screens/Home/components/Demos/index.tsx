import SectionHeader from '../../../../components/SectionHeader';
import ServerMetricsDemo from './components/ServerMetricsDemo';
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
        <ServerMetricsDemo className="relative z-10 mt-10 w-full max-w-[620px] md:-mt-[110px] md:mr-2 md:ml-auto" />
      </div>
    </section>
  );
}

export default Demos;
