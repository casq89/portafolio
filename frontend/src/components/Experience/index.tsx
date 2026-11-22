import { jobs } from '../../data/portfolio';
import SectionHeader from '../SectionHeader';
import Window from '../Window';

function Experience() {
  return (
    <section id="experience" className="scroll-mt-8 py-16 md:pb-24">
      <SectionHeader path="~/experience" title="Where I've worked" />
      <Window title='$ git log --author="[your name]"'>
        <ol className="divide-y divide-line px-6 py-2">
          {jobs.map((job, index) => (
            <li key={index} className="flex flex-wrap gap-x-7 gap-y-1.5 py-5">
              <p className={`flex-[0_0_160px] font-mono text-sm ${job.current ? 'text-accent' : 'text-subtle'}`}>
                {job.period}
              </p>
              <div className="min-w-0 flex-[1_1_380px]">
                <h3 className="font-display text-xl font-bold">
                  {job.role} · {job.company}
                </h3>
                <p className="mt-1 text-muted">{job.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Window>
    </section>
  );
}

export default Experience;
