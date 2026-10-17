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
          <Image
            src={profile.avatar}
            alt={`Portrait of ${profile.name}`}
            width={320}
            height={320}
            priority
            className="avatar-img"
          />
        </div>
      </div>
      <a href="#about" className="scroll-hint mono" aria-label="Scroll down">
        scroll
        <span className="scroll-line" />
      </a>
    </section>
  );
}
