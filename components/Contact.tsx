import { profile, socials } from "@/lib/data";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <Reveal as="section" id="contact" className="section contact">
      <p className="mono accent">
        04. What&apos;s next?
      </p>
      <h2 className="contact-title">
        Let&apos;s build something <span className="gradient-text">extraordinary</span>.
      </h2>
      <p className="contact-sub">
        My inbox is always open — whether it&apos;s a project, an opportunity, or just a hello.
      </p>
      <a href={`mailto:${profile.email}`} className="btn btn-primary btn-lg">
        Say hello <span aria-hidden="true">→</span>
      </a>
      <div className="socials mono">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </Reveal>
  );
}
