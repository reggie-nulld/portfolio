"use client";

import { useEffect, useState, useTransition } from "react";
import { deleteMessage, setRead } from "@/app/admin/(panel)/messages/actions";

export type MessageRow = { id: number; name: string; email: string; body: string; read: boolean; createdAt: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
/** "23 Oct, 14:05" in the viewer's time zone. Rendered after load so server and browser agree. */
function when(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ""}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MessageList({ messages, emptyText }: { messages: MessageRow[]; emptyText: string }) {
  const [items, setItems] = useState(messages);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => setItems(messages), [messages]);
  useEffect(() => setMounted(true), []);

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError("");
      const result = await fn();
      if (result.error) {
        setError(result.error);
        setItems(messages);
      }
    });

  const toggleRead = (m: MessageRow, read: boolean) => {
    setItems((all) => all.map((x) => (x.id === m.id ? { ...x, read } : x)));
    run(() => setRead(m.id, read));
  };

  const toggleOpen = (m: MessageRow) => {
    const opening = open !== m.id;
    setOpen(opening ? m.id : null);
    if (opening && !m.read) toggleRead(m, true);
  };

  if (!items.length) return <p className="panel glass empty-state">{emptyText}</p>;

  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ol className="inbox">
        {items.map((m) => {
          const isOpen = open === m.id;
          const reply = `mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}&body=${encodeURIComponent(
            `\n\n---\nOn ${when(m.createdAt)}, ${m.name} wrote:\n> ${m.body.replace(/\n/g, "\n> ")}`
          )}`;
          return (
            <li key={m.id} className={`inbox-item glass ${m.read ? "" : "unread"} ${isOpen ? "open" : ""}`}>
              <button type="button" className="inbox-head" onClick={() => toggleOpen(m)} aria-expanded={isOpen}>
                <span className="inbox-dot" aria-label={m.read ? undefined : "Unread"} />
                <span className="inbox-from">
                  <strong>{m.name}</strong>
                  <span className="mono">{m.email}</span>
                </span>
                <span className="inbox-preview">{m.body}</span>
                <time className="inbox-time mono" dateTime={m.createdAt}>
                  {mounted ? when(m.createdAt) : ""}
                </time>
              </button>
              {isOpen && (
                <div className="inbox-body">
                  <p>{m.body}</p>
                  <div className="inbox-actions">
                    <a href={reply} className="btn btn-primary btn-sm">
                      Reply by email
                    </a>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleRead(m, !m.read)}>
                      Mark as {m.read ? "unread" : "read"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm inbox-delete"
                      onClick={() => {
                        if (!confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
                        setItems((all) => all.filter((x) => x.id !== m.id));
                        run(() => deleteMessage(m.id));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
