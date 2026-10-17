import Reveal from "./Reveal";

export default function SectionTitle({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <Reveal as="h2" className="section-title">
      <span className="mono accent">{index}.</span> {children}
    </Reveal>
  );
}
