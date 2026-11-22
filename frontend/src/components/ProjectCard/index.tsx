import type { Project } from '../../data/portfolio';

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
      className={`relative flex flex-col gap-3 rounded-[14px] border-[1.5px] border-fg bg-surface p-[18px] shadow-layer transition-transform hover:-translate-y-1 ${isMiddle ? 'md:mt-10' : ''}`}
    >
      <span
        className={`absolute -top-3.5 right-4 rounded-lg border-[1.5px] border-canvas px-2.5 py-0.5 font-mono text-[0.72rem] font-bold text-canvas ${isMiddle ? 'bg-fg' : 'bg-accent'} ${tilts[index % tilts.length]}`}
      >
        {project.category}
      </span>
      <div className="flex h-40 items-center justify-center rounded-lg bg-raised font-mono text-sm text-subtle">
        [screenshot]
      </div>
      <h3 className="font-display text-xl font-bold">{project.name}</h3>
      <p className="text-[0.95rem] text-muted">{project.description}</p>
      <div className="flex gap-[18px] font-mono text-sm">
        <a href={project.codeUrl} className="hover:text-accent">
          code ↗
        </a>
        <a href={project.demoUrl} className="hover:text-accent">
          demo ↗
        </a>
      </div>
    </article>
  );
}

export default ProjectCard;
