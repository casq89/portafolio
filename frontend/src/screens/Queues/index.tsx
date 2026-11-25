import { Link } from 'react-router';
import BackLink from '../../components/BackLink';
import SectionHeader from '../../components/SectionHeader';
import Window from '../../components/Window';
import { guardrails, intro, steps, type TutorialStep } from '../../data/queues';
import SequenceDiagram from './components/SequenceDiagram';
import StepCard from './components/StepCard';
import TaskLifecycle from './components/TaskLifecycle';

const parts: { id: TutorialStep['part']; title: string; description: string }[] = [
  { id: 'backend', title: 'Backend', description: 'Express, BullMQ and Socket.IO in Node.' },
  { id: 'frontend', title: 'Frontend', description: 'React listening to the socket.' },
];

function Queues() {
  return (
    <section className="py-10 md:pb-24">
      <BackLink to="/#demos" path="~/demos" />

      <div className="mt-8">
        <SectionHeader
          path="~/demos/queues"
          title="Building the task queue"
          description="How the live demo works, step by step: Redis and BullMQ for the queue, Socket.IO to move the board in real time."
        />
      </div>

      <div className="flex flex-col gap-8">
        <Window title="README.md" meta="why a queue">
          <div className="flex flex-col gap-4 p-5 md:p-6">
            {intro.map((paragraph, i) => (
              <p key={i} className="max-w-[720px] font-mono text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </Window>

        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <Window title="flow — one task, start to finish" meta="sequence" highlighted>
            <div className="p-5 md:p-6">
              <SequenceDiagram />
            </div>
          </Window>
          <Window title="states of a task" meta="lifecycle" className="self-start">
            <div className="flex flex-col gap-5 p-5 md:p-6">
              <TaskLifecycle />
              <p className="font-mono text-xs leading-relaxed text-subtle">
                Each state is one column of the board. A task only reaches <span className="text-fg">failed</span>{' '}
                after 3 attempts, so most failures end up completed.
              </p>
            </div>
          </Window>
        </div>

        {parts.map((part) => (
          <div key={part.id} className="flex flex-col gap-6">
            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-3xl font-bold">{part.title}</h2>
              <span className="font-mono text-sm text-subtle">{part.description}</span>
            </div>
            {steps.map((step, i) =>
              step.part === part.id ? <StepCard key={i} step={step} number={i + 1} /> : null,
            )}
          </div>
        ))}

        <Window title="guardrails" meta="it's a public demo">
          <ul className="grid gap-4 p-5 sm:grid-cols-2 md:p-6 lg:grid-cols-3">
            {guardrails.map((item) => (
              <li key={item.title} className="flex flex-col gap-1 font-mono text-sm">
                <span className="font-bold text-accent">{item.title}</span>
                <span className="text-muted">{item.text}</span>
              </li>
            ))}
          </ul>
        </Window>

        <Link
          to="/#demos"
          className="group mt-4 inline-flex items-center gap-3 self-center rounded-[10px] bg-accent px-6 py-3 font-semibold text-on-accent shadow-light-sm transition hover:-translate-y-0.5 hover:shadow-light"
        >
          Now try it live
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}

export default Queues;
