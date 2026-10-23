"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import type { DayPoint } from "@/lib/admin/insights";

const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
const SERIES = [
  { key: "views", label: "Page views", color: "var(--viz-1)" },
  { key: "visitors", label: "Visitors", color: "var(--viz-2)" },
] as const;

// Formatted by hand: Node and browsers ship different locale data, and any
// difference between the server and browser text breaks hydration.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDay = (day: string, long = false) => {
  const d = new Date(`${day}T00:00:00Z`);
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return long ? `${WEEKDAYS[d.getUTCDay()]} ${date}` : date;
};
const fmtNum = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n));

/** A clean axis maximum and 4 ticks (0, ¼, ½, ¾, max) on round numbers. */
function niceScale(max: number) {
  if (max <= 4) return { top: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  return { top: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => i * step) };
}

export default function TrafficChart({ data }: { data: DayPoint[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { top, ticks } = niceScale(Math.max(...data.map((d) => Math.max(d.views, d.visitors)), 0));
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const path = (key: "views" | "visitors") => data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d[key])}`).join("");
  const area = `${path("views")}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;

  // As many date labels as fit (about 80px each), always ending on the last day,
  // and never one squeezed in right before it.
  const maxLabels = Math.max(2, Math.floor(innerW / 80));
  const every = Math.max(1, Math.ceil((data.length - 1) / (maxLabels - 1)));
  const last = data.length - 1;
  const xTicks = data
    .map((_, i) => i)
    .filter((i) => i === last || (i % every === 0 && x(last) - x(i) >= 70));

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    setActive(Math.round(t * (data.length - 1)));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    setActive((a) => Math.min(data.length - 1, Math.max(0, (a ?? data.length - 1) + step)));
  };

  const point = active === null ? null : data[active];
  const tipLeft = active === null ? 0 : Math.min(Math.max(x(active), 80), width - 80);

  return (
    <div className="viz">
      <ul className="viz-legend" aria-hidden="true">
        {SERIES.map((s) => (
          <li key={s.key}>
            <span className="viz-key" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div ref={wrap} className="viz-frame">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Page views and visitors per day, ${fmtDay(data[0].day)} to ${fmtDay(data[data.length - 1].day)}. Use the arrow keys to read each day.`}
          tabIndex={0}
          onKeyDown={onKey}
          onFocus={() => setActive((a) => a ?? data.length - 1)}
          onBlur={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="viz-grid" />
              <text x={PAD.left - 8} y={y(t)} className="viz-tick" textAnchor="end" dominantBaseline="middle">
                {compact(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={HEIGHT - 8}
              className="viz-tick"
              textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            >
              {fmtDay(data[i].day)}
            </text>
          ))}
          <path d={area} fill="var(--viz-1)" opacity={0.1} />
          {SERIES.map((s) => (
            <path key={s.key} d={path(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {point && active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} className="viz-crosshair" />
              {SERIES.map((s) => (
                <circle key={s.key} cx={x(active)} cy={y(point[s.key])} r={4} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
              ))}
            </g>
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
        {point && (
          <div className="viz-tooltip" style={{ left: tipLeft }} role="status">
            <span className="viz-tooltip-title">{fmtDay(point.day, true)}</span>
            {SERIES.map((s) => (
              <span key={s.key} className="viz-tooltip-row">
                <span className="viz-line-key" style={{ background: s.color }} />
                <strong>{fmtNum(point[s.key])}</strong>
                <span>{s.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <details className="viz-table">
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Page views</th>
              <th scope="col">Visitors</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.day}>
                <th scope="row">{fmtDay(d.day, true)}</th>
                <td>{fmtNum(d.views)}</td>
                <td>{fmtNum(d.visitors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
