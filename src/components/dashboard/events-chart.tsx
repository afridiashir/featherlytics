"use client";

import { useRef, useState } from "react";

import { formatNumber } from "@/lib/format";
import type { EventSeries } from "@/lib/ga";

// Validated colorblind-safe categorical palette (fixed order, never cycled).
const PALETTE = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

const W = 760;
const H = 240;
const PX = 8;
const PT = 12;
const PB = 24;

/** Smooth (rounded) line through points via Catmull-Rom → cubic Bézier. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export function EventsChart({ data }: { data: EventSeries }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { labels, series } = data;
  const n = labels.length;
  const hasData = n > 1 && series.length > 0;

  const innerW = W - PX * 2;
  const innerH = H - PT - PB;
  const max = Math.max(
    1,
    ...series.flatMap((s) => s.values),
  );

  const xFor = (i: number) => PX + (i / Math.max(1, n - 1)) * innerW;
  const yFor = (v: number) => PT + innerH - (v / max) * innerH;

  const lines = series.map((s, si) => ({
    ...s,
    color: PALETTE[si % PALETTE.length],
    d: smoothPath(s.values.map((v, i) => ({ x: xFor(i), y: yFor(v) }))),
  }));

  function nearestIndex(clientX: number): number | null {
    const svg = svgRef.current;
    if (!svg || n === 0) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const svgX = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((svgX - PX) / innerW) * (n - 1));
    return Math.max(0, Math.min(n - 1, idx));
  }

  const activeX = hover != null ? xFor(hover) : 0;
  // Tooltip rows for the hovered date, sorted by value desc.
  const tipRows =
    hover != null
      ? lines
          .map((l) => ({ name: l.name, color: l.color, value: l.values[hover] }))
          .sort((a, b) => b.value - a.value)
      : [];
  const tipLeft = `${(activeX / W) * 100}%`;
  const tipOnRight = hover != null && activeX < W * 0.6;

  if (!hasData) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        No event data in this range yet.
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-label={`Daily counts for ${series.length} events over ${n} days`}
          onPointerMove={(e) => setHover(nearestIndex(e.clientX))}
          onPointerDown={(e) => setHover(nearestIndex(e.clientX))}
          onPointerLeave={() => setHover(null)}
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={PX}
              x2={W - PX}
              y1={PT + innerH * t}
              y2={PT + innerH * t}
              className="stroke-border"
              strokeDasharray="2 4"
            />
          ))}

          {hover != null && (
            <line
              x1={activeX}
              x2={activeX}
              y1={PT}
              y2={H - PB}
              className="stroke-muted-foreground/40"
              strokeWidth="1"
            />
          )}

          {lines.map((l) => (
            <path
              key={l.name}
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={hover == null ? 1 : 0.9}
            />
          ))}

          {hover != null &&
            lines.map((l) => (
              <circle
                key={l.name}
                cx={activeX}
                cy={yFor(l.values[hover])}
                r="3"
                fill={l.color}
                className="stroke-background"
                strokeWidth="1.5"
              />
            ))}

          {n > 0 && (
            <text x={PX} y={H - 6} className="fill-muted-foreground text-[10px]">
              {labels[0]}
            </text>
          )}
          <text
            x={W - PX}
            y={H - 6}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {labels[n - 1]}
          </text>
        </svg>

        {hover != null && (
          <div
            className="pointer-events-none absolute top-1 z-10 w-40 rounded-lg border bg-popover p-2 text-xs shadow-md"
            style={{
              left: tipLeft,
              transform: tipOnRight
                ? "translateX(8px)"
                : "translateX(calc(-100% - 8px))",
            }}
          >
            <div className="mb-1 font-medium text-muted-foreground">
              {labels[hover]}
            </div>
            <div className="flex flex-col gap-0.5">
              {tipRows.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: r.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{r.name}</span>
                  <span className="tabular-nums font-medium">
                    {formatNumber(r.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {lines.map((l) => (
          <span key={l.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: l.color }}
              aria-hidden
            />
            <span className="text-foreground">{l.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatNumber(l.total)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
