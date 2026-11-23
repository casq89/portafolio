import type { ReactNode } from 'react';
import type { CaseStudy } from '../../data/caseStudy';
import BackLink from '../BackLink';

interface CaseHeroProps {
  study: CaseStudy;
  /** Image or composition shown next to the text. */
  visual: ReactNode;
}

// Header of a project case study: back link, title, intro, tags, visual and highlights.
function CaseHero({ study, visual }: CaseHeroProps) {
  return (
    <section className="py-10">
      <BackLink to="/#projects" path="~/projects" />

      <div className="mt-8 flex flex-wrap items-center gap-14">
        <div className="min-w-0 flex-[1_1_420px]">
          <p className="mb-2 font-mono text-sm text-accent">{study.path}</p>
          <h1 className="font-display text-5xl leading-none font-bold tracking-tight sm:text-6xl">
            {study.name}
            {study.client && (
              <>
                {' '}
                <span className="text-accent">·</span> {study.client}
              </>
            )}
          </h1>
          {study.via && <p className="mt-3 font-mono text-sm text-subtle">via {study.via}</p>}
          <p className="mt-4 font-display text-2xl font-medium text-fg">{study.tagline}</p>
          <p className="mt-6 max-w-[540px] font-mono text-lg text-muted">{study.intro}</p>
          <ul className="mt-8 flex flex-wrap gap-2.5 font-mono text-xs">
            {study.tags.map((tag) => (
              <li key={tag} className="rounded-full border-[1.5px] border-edge-strong px-3 py-1 text-muted">
                {tag}
              </li>
            ))}
          </ul>
          {study.link && (
            <a
              href={study.link.url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block rounded-[10px] border-[1.5px] border-accent bg-accent px-[22px] py-3 font-semibold text-on-accent shadow-light-sm transition-transform hover:-translate-y-0.5"
            >
              {study.link.label} ↗
            </a>
          )}
        </div>

        <div className="relative min-w-0 flex-[1_1_380px]">{visual}</div>
      </div>

      <dl className="mt-16 grid gap-4 sm:grid-cols-3">
        {study.highlights.map((highlight) => (
          <div key={highlight.label} className="rounded-[14px] border-[1.5px] border-edge bg-surface px-5 py-4">
            <dt className="font-mono text-xs text-accent">{highlight.label}</dt>
            <dd className="mt-1 font-display text-lg font-bold">{highlight.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default CaseHero;
