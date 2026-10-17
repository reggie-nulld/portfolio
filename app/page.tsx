import { links, profile, projects, stack } from "@/lib/data";

export default function Home() {
  return (
    <main className="page">
      <header className="intro">
        <h1>{profile.name}</h1>
        <p className="muted">
          {profile.role} · {profile.location}
        </p>
      </header>

      <section>
        {profile.bio.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        <ul className="projects">
          {projects.map((project) => (
            <li key={project.title}>
              <a href={project.href} className="project">
                <span className="project-title">{project.title}</span>
                <span className="dots" aria-hidden="true" />
                <span className="muted mono">{project.year}</span>
              </a>
              <p className="muted">{project.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Stack</h2>
        <p className="muted">{stack.join(" · ")}</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Reach me at <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p className="links">
          {links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} ↗
            </a>
          ))}
        </p>
      </section>

      <footer className="muted mono">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </main>
  );
}
