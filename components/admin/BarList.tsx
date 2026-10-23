import type { Breakdown } from "@/lib/admin/insights";

/** Ranked horizontal bars with the value at each bar's tip. */
export default function BarList({
  title,
  rows,
  empty = "No data yet",
  format = (label: string) => label,
}: {
  title: string;
  rows: Breakdown;
  empty?: string;
  format?: (label: string) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((n, r) => n + r.value, 0);

  return (
    <section className="panel glass breakdown">
      <h2 className="panel-title">{title}</h2>
      {rows.length === 0 ? (
        <p className="breakdown-empty">{empty}</p>
      ) : (
        <ol className="bars">
          {rows.map((r) => {
            const label = format(r.label);
            const share = Math.round((r.value / total) * 100);
            return (
              <li key={r.label} title={`${label}: ${r.value.toLocaleString()} (${share}%)`}>
                <span className="bar-label">{label}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
                </span>
                <span className="bar-value">{r.value.toLocaleString()}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
