export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

export function ComingSoon({ phase, children }: { phase: number; children: React.ReactNode }) {
  return (
    <div className="panel glass coming-soon">
      <span className="mono badge">phase {phase}</span>
      <p>{children}</p>
    </div>
  );
}
