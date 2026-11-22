import { projects } from '../../data/portfolio';
import ProjectCard from '../ProjectCard';
import SectionHeader from '../SectionHeader';

function Projects() {
  return (
    <section id="projects" className="scroll-mt-8 pt-12 pb-24">
      <SectionHeader path="~/projects" title="Things I've built" />
      <div className="grid items-start gap-x-8 gap-y-10 md:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
