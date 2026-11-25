import Window from '../../../../components/Window';
import type { TutorialStep } from '../../../../data/queues';

interface StepCardProps {
  step: TutorialStep;
  number: number;
}

// Text between backticks becomes inline code.
function renderInline(text: string) {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded bg-raised px-1.5 py-0.5 text-[0.85em] text-fg">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

function StepCard({ step, number }: StepCardProps) {
  return (
    <Window title={step.file} meta={`step ${String(number).padStart(2, '0')}`}>
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <h3 className="flex items-baseline gap-3 font-display text-2xl font-bold">
          <span className="font-mono text-base text-accent">{String(number).padStart(2, '0')}</span>
          {step.title}
        </h3>
        {step.body.map((paragraph, i) => (
          <p key={i} className="max-w-[680px] font-mono text-sm leading-relaxed text-muted">
            {renderInline(paragraph)}
          </p>
        ))}
        <pre className="overflow-x-auto rounded-[10px] border-[1.5px] border-edge bg-canvas p-4 font-mono text-[0.78rem] leading-relaxed">
          <code>{step.code}</code>
        </pre>
      </div>
    </Window>
  );
}

export default StepCard;
