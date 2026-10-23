"use client";

import Image from "next/image";
import { PointerEvent, useRef } from "react";
import type { Project } from "@/lib/content";
import { useInView } from "@/lib/hooks";
import { track } from "@/lib/track-client";

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);

  // Moves the spotlight gradient to follow the cursor.
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article
      ref={ref}
      className={`card glass reveal ${project.featured ? "card-featured" : ""} ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${(index % 2) * 80}ms` }}
      onPointerMove={onPointerMove}
    >
      <div className="card-top">
        <span className="mono card-index">
          P/{String(index + 1).padStart(2, "0")}
          {project.year && <span className="card-year"> · {project.year}</span>}
        </span>
        <a
          href={project.href}
          className="card-link"
          aria-label={`Open ${project.title}`}
          onClick={() => track("project_click", { target: project.title })}
          {...(project.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
        >
          <span className="card-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      {project.imageUrl && (
        <div className="card-media">
          <Image
            src={project.imageUrl}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes={project.featured ? "(max-width: 860px) 100vw, 1100px" : "(max-width: 860px) 100vw, 550px"}
          />
        </div>
      )}
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ul className="tags mono">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          className="card-source mono"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("project_click", { target: `${project.title} (source)` })}
        >
          View source ↗
        </a>
      )}
    </article>
  );
}
