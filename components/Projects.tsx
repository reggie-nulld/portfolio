import { projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";
import SectionTitle from "./SectionTitle";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <SectionTitle index="02">Selected Projects</SectionTitle>
      <div className="projects">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
