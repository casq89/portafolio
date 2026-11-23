import { Link } from 'react-router';
import type { Project } from '../../../../../../data/portfolio';

interface ProjectCardProps {
  project: Project;
  index: number;
}

// Per-position variations so the cards don't look identical.
const tilts = ['rotate-3', '-rotate-3', 'rotate-2'];

function ProjectCard({ project, index }: ProjectCardProps) {
  const isMiddle = index % 3 === 1;

  return (
    <article
      className={`group relative flex flex-col gap-3 rounded-[14px] border-[1.5px] border-fg bg-surface p-[18px] shadow-layer transition-transform hover:-translate-y-1 ${isMiddle ? 'md:mt-10' : ''}`}
    >
      <span
        className={`absolute -top-3.5 right-4 z-10 rounded-lg border-[1.5px] border-canvas px-2.5 py-0.5 font-mono text-[0.72rem] font-bold ${isMiddle ? 'bg-fg text-canvas' : 'bg-accent text-on-accent'} ${tilts[index % tilts.length]}`}
      >
        {project.category}
      </span>
      {project.image ? (
        <img
          src={project.image.src}
          alt={project.image.alt}
          className="h-40 w-full rounded-lg object-cover"
          style={{ objectPosition: project.image.position }}
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg bg-raised font-mono text-sm text-subtle">
          [screenshot]
        </div>
      )}
      <h3 className="font-display text-xl font-bold">
        {project.route ? (
          // The link's ::after covers the whole card, so clicking anywhere opens the case study.
          <Link to={project.route} className="after:absolute after:inset-0 after:rounded-[14px] group-hover:text-accent">
            {project.name}
          </Link>
        ) : (
          project.name
        )}
      </h3>
      {(project.period || project.via) && (
        <p className="-mt-2 font-mono text-xs">
          {project.period && <span className="text-accent">{project.period}</span>}
          {project.period && project.via && <span className="text-subtle"> · </span>}
          {project.via && <span className="text-subtle">via {project.via}</span>}
        </p>
      )}
      <p className="font-mono text-[0.9rem] text-muted">{project.description}</p>
      <div className="flex gap-[18px] font-mono text-sm">
        {project.route && <span className="text-accent">read case study →</span>}
        {project.codeUrl && (
          <a href={project.codeUrl} className="relative z-10 hover:text-accent">
            code ↗
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} className="relative z-10 hover:text-accent">
            demo ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
