"use client";

import Link from "next/link";
import { type DragEvent, useEffect, useState, useTransition } from "react";
import { deleteProject, reorderProjects, setPublished } from "@/app/admin/(panel)/projects/actions";

export type ProjectRow = {
  id: number;
  title: string;
  year: string | null;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
};

export default function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const [items, setItems] = useState(projects);
  const [dragId, setDragId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // Take the server's copy whenever it changes (after a save or delete).
  useEffect(() => setItems(projects), [projects]);

  const run = (fn: () => Promise<{ error?: string } | undefined>) => {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) {
        setError(result.error);
        setItems(projects);
      } else setSaved(true);
    });
  };

  const saveOrder = (next: ProjectRow[]) => {
    setItems(next);
    run(() => reorderProjects(next.map((p) => p.id)));
  };

  const move = (i: number, by: number) => {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    saveOrder(next);
  };

  const onDragOver = (e: DragEvent, overId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === overId) return;
    const from = items.findIndex((p) => p.id === dragId);
    const to = items.findIndex((p) => p.id === overId);
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setItems(next);
  };

  const onDragEnd = () => {
    setDragId(null);
    if (items.some((p, i) => p.id !== projects[i]?.id)) saveOrder(items);
  };

  if (!items.length) {
    return (
      <div className="panel glass empty-state">
        <p>No projects yet.</p>
        <Link href="/admin/projects/new" className="btn btn-primary">
          + Add your first project
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="list-hint">
        <p className="mono">
          Changes on this page save automatically. Use the arrows (or drag on a computer) to reorder; this is
          the order on your site. Tap <strong>Edit</strong> to change a project&apos;s details.
        </p>
        <span className={`save-status ${pending ? "" : saved ? "is-ok" : ""}`} role="status">
          {pending ? "Saving…" : saved ? "✓ Saved. Your live site is updated." : ""}
        </span>
      </div>
      <ol className="project-list">
        {items.map((p, i) => (
          <li
            key={p.id}
            className={`project-row glass ${dragId === p.id ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => {
              setDragId(p.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => onDragOver(e, p.id)}
            onDragEnd={onDragEnd}
          >
            <span className="drag-handle" aria-hidden="true">
              ⋮⋮
            </span>
            <div className="project-thumb">
              {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span className="mono">{String(i + 1).padStart(2, "0")}</span>}
            </div>
            <div className="project-info">
              <Link href={`/admin/projects/${p.id}`} className="project-title" draggable={false}>
                {p.title}
              </Link>
              <div className="project-meta mono">
                <span className={`pill ${p.published ? "pill-live" : "pill-draft"}`}>{p.published ? "Live" : "Draft"}</span>
                {p.featured && <span className="pill">Featured</span>}
                {p.year && <span>{p.year}</span>}
              </div>
            </div>
            <div className="row-actions">
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0 || pending} aria-label={`Move ${p.title} up`}>
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1 || pending}
                aria-label={`Move ${p.title} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={pending}
                onClick={() => {
                  setItems(items.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)));
                  run(() => setPublished(p.id, !p.published));
                }}
              >
                {p.published ? "Unpublish" : "Publish"}
              </button>
              <Link href={`/admin/projects/${p.id}`} className="btn btn-ghost btn-sm" draggable={false}>
                Edit
              </Link>
              <button
                type="button"
                className="icon-btn danger"
                disabled={pending}
                aria-label={`Delete ${p.title}`}
                onClick={() => {
                  if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
                  setItems(items.filter((x) => x.id !== p.id));
                  run(() => deleteProject(p.id));
                }}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
