"use client";

import { useActionState, useEffect, useState } from "react";
import { type ContactState, sendMessage } from "@/app/actions/contact";

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});
  const [startedAt, setStartedAt] = useState(0);
  const [sentAgain, setSentAgain] = useState(false);

  // Set after load (not during render) so the server and browser HTML match. It only
  // restarts for a new message, so fixing a mistake and resending isn't seen as a bot.
  useEffect(() => setStartedAt(Date.now()), []);

  if (state.ok && !sentAgain) {
    return (
      <div className="contact-card glass contact-done" role="status">
        <span className="contact-done-icon" aria-hidden="true">✓</span>
        <h3>Message sent</h3>
        <p>Thanks for reaching out. I&apos;ll get back to you soon.</p>
        <button type="button" className="btn btn-ghost" onClick={() => {
            setSentAgain(true);
            setStartedAt(Date.now());
          }}>
          Send another
        </button>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  return (
    <form
      action={(data) => {
        setSentAgain(false);
        return action(data);
      }}
      className="contact-card glass contact-form"
      noValidate
    >
      <div className="contact-row">
        <label className="contact-field">
          <span>Name</span>
          <input name="name" autoComplete="name" required maxLength={80} defaultValue={state.values?.name} aria-invalid={!!err.name} />
          {err.name && <small>{err.name}</small>}
        </label>
        <label className="contact-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            defaultValue={state.values?.email}
            aria-invalid={!!err.email}
          />
          {err.email && <small>{err.email}</small>}
        </label>
      </div>
      <label className="contact-field">
        <span>Message</span>
        <textarea
          name="body"
          rows={5}
          required
          maxLength={4000}
          placeholder="Tell me about your project, idea or opportunity…"
          defaultValue={state.values?.body}
          aria-invalid={!!err.body}
        />
        {err.body && <small>{err.body}</small>}
      </label>
      {/* Spam traps: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="contact-trap" aria-hidden="true" />
      <input type="hidden" name="startedAt" value={startedAt || ""} />
      {state.error && (
        <p className="contact-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg contact-submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
