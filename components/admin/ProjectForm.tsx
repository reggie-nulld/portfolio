"use client";

import Link from "next/link";
import type { FormState } from "@/lib/admin/validation";
import { FieldError, FormFooter, useAdminForm } from "./forms";
import ImageField from "./ImageField";

export type ProjectValues = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  githubUrl: string | null;
  imageUrl: string | null;
  year: string | null;
  featured: boolean;
  published: boolean;
};

export const emptyProject: ProjectValues = {
  title: "",
  description: "",
  tags: [],
  href: "",
  githubUrl: null,
  imageUrl: null,
  year: String(new Date().getFullYear()),
  featured: false,
  published: true,
};

export default function ProjectForm({
  action,
  project,
  uploadsEnabled,
  submitLabel,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  project: ProjectValues;
  uploadsEnabled: boolean;
  submitLabel: string;
}) {
  const { state, errors, pending, dirty, markDirty, onInput, onSubmit } = useAdminForm(action);

  return (
    <form className="admin-form panel glass" onSubmit={onSubmit} onInput={onInput} noValidate>
      <label className="field" data-field="title">
        <span>Title</span>
        <input name="title" defaultValue={project.title} required maxLength={80} autoFocus={!project.title} />
        <FieldError errors={errors} name="title" />
      </label>

      <label className="field" data-field="description">
        <span>Description</span>
        <textarea name="description" defaultValue={project.description} rows={4} maxLength={600} required />
        <FieldError errors={errors} name="description" />
      </label>

      <label className="field" data-field="tags">
        <span>Tags</span>
        <input name="tags" defaultValue={project.tags.join(", ")} placeholder="Next.js, TypeScript, Supabase" />
        <small className="field-hint">Separate with commas.</small>
        <FieldError errors={errors} name="tags" />
      </label>

      <div className="form-grid">
        <label className="field" data-field="href">
          <span>Live link</span>
          <input name="href" type="url" defaultValue={project.href === "#" ? "" : project.href} placeholder="https://…" />
          <small className="field-hint">Where the card goes when clicked. Leave empty if there isn&apos;t one.</small>
          <FieldError errors={errors} name="href" />
        </label>
        <label className="field" data-field="githubUrl">
          <span>GitHub link</span>
          <input name="githubUrl" type="url" defaultValue={project.githubUrl ?? ""} placeholder="https://github.com/…" />
          <FieldError errors={errors} name="githubUrl" />
        </label>
      </div>

      <ImageField
        name="imageUrl"
        label="Screenshot"
        folder="projects"
        defaultValue={project.imageUrl ?? ""}
        uploadsEnabled={uploadsEnabled}
        error={errors.imageUrl}
        onChange={markDirty}
        hint="Optional. A wide (16:9) screenshot works best."
      />

      <div className="form-grid">
        <label className="field" data-field="year">
          <span>Year</span>
          <input name="year" defaultValue={project.year ?? ""} maxLength={12} placeholder="2026" />
          <FieldError errors={errors} name="year" />
        </label>
        <div className="switches">
          <label className="switch-field">
            <input type="checkbox" name="published" defaultChecked={project.published} />
            <span className="switch" aria-hidden="true" />
            <span>
              Published
              <small className="field-hint">Off keeps it as a draft only you can see.</small>
            </span>
          </label>
          <label className="switch-field">
            <input type="checkbox" name="featured" defaultChecked={project.featured} />
            <span className="switch" aria-hidden="true" />
            <span>
              Featured
              <small className="field-hint">Shown full width on your site.</small>
            </span>
          </label>
        </div>
      </div>

      <div className="form-footer-row">
        <Link href="/admin/projects" className="btn btn-ghost">
          ← All projects
        </Link>
        <FormFooter state={state} pending={pending} dirty={dirty} label={submitLabel} />
      </div>
    </form>
  );
}
