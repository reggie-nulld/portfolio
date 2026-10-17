import { profile, stats } from "@/lib/data";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import Stat from "./Stat";

export default function About() {
  return (
    <section id="about" className="section">
      <SectionTitle index="01">About</SectionTitle>
      <div className="about-grid">
        <Reveal className="about-text">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <Reveal className="stats" delay={80}>
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
