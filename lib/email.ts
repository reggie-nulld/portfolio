import "server-only";

// RESEND_API_URL only exists so tests can point alerts at a local stand-in.
const RESEND_URL = process.env.RESEND_API_URL || "https://api.resend.com/emails";
const apiKey = process.env.RESEND_API_KEY ?? "";

export const isEmailConfigured = Boolean(apiKey);

/** Where alerts go: CONTACT_TO_EMAIL, else the first ADMIN_EMAILS address. */
const alertTo = () =>
  (process.env.CONTACT_TO_EMAIL || (process.env.ADMIN_EMAILS ?? "").split(",")[0] || "").trim();

// Resend's shared test sender only delivers to your own Resend account email. After you
// verify a domain in Resend, set RESEND_FROM to e.g. "Portfolio <hello@yourdomain.com>".
const from = () => process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Emails you about a new contact form message. Never throws; returns false if it couldn't send. */
export async function sendMessageAlert(msg: { name: string; email: string; body: string }, siteUrl: string) {
  const to = alertTo();
  if (!apiKey || !to) return false;
  const inbox = `${siteUrl}/admin/messages`;
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: from(),
        to: [to],
        reply_to: msg.email,
        subject: `New message from ${msg.name.replace(/[\r\n]+/g, " ")}`,
        text: `${msg.name} <${msg.email}> wrote:\n\n${msg.body}\n\nReply to this email to answer them, or open your inbox: ${inbox}`,
        html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p><strong>${escape(msg.name)}</strong> &lt;${escape(msg.email)}&gt; wrote:</p>
<blockquote style="margin:0;padding:12px 16px;border-left:3px solid #40a070;background:#f4f8f5;white-space:pre-wrap">${escape(msg.body)}</blockquote>
<p style="color:#555">Reply to this email to answer them, or <a href="${escape(inbox)}">open your inbox</a>.</p>
</div>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Resend alert failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("Resend alert failed", e);
    return false;
  }
}
