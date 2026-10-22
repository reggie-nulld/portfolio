"use client";

import { saveProfile } from "@/app/admin/(panel)/content/actions";
import type { Profile } from "@/lib/content";
import { FieldError, FormFooter, useAdminForm } from "./forms";
import ImageField from "./ImageField";

export default function ProfileForm({ profile, uploadsEnabled }: { profile: Profile; uploadsEnabled: boolean }) {
  const { state, errors, pending, dirty, markDirty, onInput, onSubmit } = useAdminForm(saveProfile);

  return (
    <form className="admin-form" onSubmit={onSubmit} onInput={onInput} noValidate>
      <div className="form-grid">
        <label className="field" data-field="name">
          <span>Name</span>
          <input name="name" defaultValue={profile.name} required maxLength={60} />
          <FieldError errors={errors} name="name" />
        </label>
        <label className="field" data-field="domain">
          <span>Domain</span>
          <input name="domain" defaultValue={profile.domain} required maxLength={80} placeholder="reggie.dev" />
          <FieldError errors={errors} name="domain" />
        </label>
      </div>

      <ImageField
        name="avatar"
        label="Photo"
        folder="avatar"
        defaultValue={profile.avatar}
        uploadsEnabled={uploadsEnabled}
        error={errors.avatar}
        onChange={markDirty}
        hint="Square photos look best. Shown in the circle next to your name."
      />

      <label className="field" data-field="tagline">
        <span>Tagline</span>
        <textarea name="tagline" defaultValue={profile.tagline} rows={3} maxLength={300} required />
        <FieldError errors={errors} name="tagline" />
      </label>

      <label className="field" data-field="typedWords">
        <span>Typing phrases</span>
        <textarea name="typedWords" defaultValue={profile.typedWords.join("\n")} rows={4} />
        <small className="field-hint">One per line. They follow &ldquo;I build&rdquo; in the hero.</small>
        <FieldError errors={errors} name="typedWords" />
      </label>

      <label className="field" data-field="about">
        <span>About</span>
        <textarea name="about" defaultValue={profile.about.join("\n\n")} rows={8} />
        <small className="field-hint">Leave a blank line between paragraphs.</small>
        <FieldError errors={errors} name="about" />
      </label>

      <div className="form-grid">
        <label className="field" data-field="email">
          <span>Contact email</span>
          <input type="email" name="email" defaultValue={profile.email} required />
          <small className="field-hint">Used by the &ldquo;Say hello&rdquo; button.</small>
          <FieldError errors={errors} name="email" />
        </label>
        <label className="switch-field">
          <input type="checkbox" name="available" defaultChecked={profile.available} />
          <span className="switch" aria-hidden="true" />
          <span>
            Available for new projects
            <small className="field-hint">Shows the green badge above your name.</small>
          </span>
        </label>
      </div>

      <FormFooter state={state} pending={pending} dirty={dirty} />
    </form>
  );
}
