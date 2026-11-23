import type { ReactNode } from 'react';
import type { CaseStudyFeature } from '../../data/caseStudy';

interface FeatureRowProps {
  feature: CaseStudyFeature;
  /** Puts the visual on the left, so consecutive rows alternate sides. */
  reversed?: boolean;
  visual: ReactNode;
}

// One feature of a case study: text on one side, its visual on the other.
function FeatureRow({ feature, reversed = false, visual }: FeatureRowProps) {
  return (
    <article className="flex flex-wrap items-center gap-x-16 gap-y-10 py-14">
      <div className={`min-w-0 flex-[1_1_360px] ${reversed ? 'md:order-2' : ''}`}>
        <p className="mb-2 font-mono text-sm text-accent">{feature.kicker}</p>
        <h2 className="font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{feature.title}</h2>
        <p className="mt-4 font-mono text-muted">{feature.body}</p>
        <ul className="mt-6 flex flex-col gap-2 font-mono text-sm">
          {feature.points.map((point) => (
            <li key={point}>
              <span className="text-accent">✓</span> {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={`min-w-0 flex-[1_1_400px] ${reversed ? 'md:order-1' : ''}`}>{visual}</div>
    </article>
  );
}

export default FeatureRow;
