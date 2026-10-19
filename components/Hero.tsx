import Image from "next/image";
import { profile } from "@/lib/data";
import NetworkCanvas from "./NetworkCanvas";
import Typewriter from "./Typewriter";

export default function Hero() {
  return (
    <section className="hero">
      <NetworkCanvas />
      <div className="hero-inner">
        <div className="hero-text">
          {profile.available && (
            <p className="eyebrow mono">
              <span className="status-dot" /> Available for new projects
            </p>
          )}
          <h1 className="hero-title">
            Hi, I&apos;m <span className="gradient-text">{profile.name}</span>.
            <br />
            I build <Typewriter words={profile.typedWords} />
          </h1>
          <p className="hero-sub">{profile.tagline}</p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">
              View my work <span aria-hidden="true">→</span>
            </a>
            <a href="#contact" className="btn btn-ghost">
              Get in touch
            </a>
          </div>
        </div>
        <div className="hero-avatar">
          <span className="avatar-ring" aria-hidden="true" />
          <div className="avatar-frame">
            <Image
              src={profile.avatar}
              alt={`Portrait of ${profile.name}`}
              width={340}
              height={340}
              priority
              className="avatar-img"
            />
            <span className="avatar-scan" aria-hidden="true" />
          </div>

          {/* Floating code cards around the portrait. Decorative only. */}
          <div className="chip chip-code mono" aria-hidden="true">
            <span className="tok-key">const</span> dev = {"{"}
            <br />
            &nbsp;&nbsp;name: <span className="tok-str">&quot;{profile.name}&quot;</span>,
            <br />
            &nbsp;&nbsp;coffee: <span className="tok-num">Infinity</span>
            <br />
            {"}"};
          </div>
          <div className="chip chip-term mono" aria-hidden="true">
            <span className="tok-dim">$</span> npm run build
            <br />
            <span className="tok-ok">✓</span> compiled in 1.2s
          </div>
          <div className="chip chip-tag mono" aria-hidden="true">
            &lt;/&gt;
          </div>
        </div>
      </div>
      <a href="#about" className="scroll-hint mono" aria-label="Scroll down">
        scroll
        <span className="scroll-line" />
      </a>
    </section>
  );
}
