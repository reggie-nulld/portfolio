"use client";

import { type FormEvent, startTransition, useActionState, useEffect, useState } from "react";
import type { FormState } from "@/lib/admin/validation";

/**
 * useActionState plus "unsaved changes" tracking. Submits through onSubmit rather
 * than <form action>, because React resets a form after an action runs, which would
 * wipe what was typed whenever validation fails.
 */
export function useAdminForm(action: (prev: FormState, data: FormData) => Promise<FormState>) {
  const [state, formAction, pending] = useActionState(action, {});
  const [dirty, setDirty] = useState(false);
  // Errors for fields edited since the last save attempt are hidden.
  const [edited, setEdited] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.savedAt) setDirty(false);
  }, [state.savedAt]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setEdited(new Set());
    startTransition(() => formAction(data));
  };

  /** For onInput: marks the form unsaved and clears the error of the field being edited. */
  const onInput = (e: FormEvent<HTMLFormElement>) => {
    setDirty(true);
    const key = (e.target as HTMLElement).closest<HTMLElement>("[data-field]")?.dataset.field;
    if (key && state.fieldErrors?.[key] && !edited.has(key)) setEdited(new Set(edited).add(key));
  };

  const errors: Record<string, string> = {};
  for (const [key, message] of Object.entries(state.fieldErrors ?? {})) {
    if (!edited.has(key)) errors[key] = message;
  }

  return { state, errors, pending, dirty, markDirty: () => setDirty(true), onInput, onSubmit };
}

export function FieldError({ errors, name }: { errors: Record<string, string>; name: string }) {
  const message = errors[name];
  return message ? <small className="field-error">{message}</small> : null;
}

export function FormFooter({
  state,
  pending,
  dirty,
  label = "Save changes",
}: {
  state: FormState;
  pending: boolean;
  dirty: boolean;
  label?: string;
}) {
  let status = null;
  if (pending) status = <span className="save-status">Saving…</span>;
  else if (state.error) status = <span className="save-status is-error" role="alert">{state.error}</span>;
  else if (dirty) status = <span className="save-status is-dirty">Unsaved changes</span>;
  else if (state.ok) status = <span className="save-status is-ok" role="status">✓ Saved. Your live site is updated.</span>;

  return (
    <div className="form-footer">
      {status}
      <button type="submit" className="btn btn-primary admin-submit" disabled={pending}>
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}
