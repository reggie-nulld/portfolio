import { skills } from "@/lib/data";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";

export default function Skills() {
  return (
    <section id="skills" className="section">
      <SectionTitle index="03">Skills &amp; Stack</SectionTitle>
      <div className="skills">
        {skills.map((s, i) => (
          <Reveal key={s.group} className="skill-group glass" delay={i * 80}>
            <h3 className="mono">{`// ${s.group}`}</h3>
            <ul>
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
