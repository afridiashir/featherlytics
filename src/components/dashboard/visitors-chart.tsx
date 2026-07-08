import { formatNumber } from "@/lib/format";
import type { TimePoint } from "@/lib/ga";

const W = 720;
const H = 220;
const PX = 8;
const PT = 16;
const PB = 26;

export function VisitorsChart({
  data,
  title = "Unique visitors",
  rangeLabel,
}: {
  data: TimePoint[];
  title?: string;
  rangeLabel?: string;
}) {
  const hasData = data.length > 1 && data.some((d) => d.value > 0);

  const innerW = W - PX * 2;
  const innerH = H - PT - PB;
  const max = Math.max(1, ...data.map((d) => d.value));

  const pts = data.map((d, i) => ({
    x: PX + (i / Math.max(1, data.length - 1)) * innerW,
    y: PT + innerH - (d.value / max) * innerH,
    point: d,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    pts.length > 0
      ? `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H - PB} L${pts[0].x.toFixed(1)},${H - PB} Z`
      : "";

  const last = pts[pts.length - 1];
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        {rangeLabel && (
          <span className="text-xs text-muted-foreground">{rangeLabel}</span>
        )}
      </div>
      <div className="mb-3 text-2xl font-semibold tabular-nums tracking-tight">
        {formatNumber(peak ? peak.value : 0)}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          peak / day
        </span>
      </div>

      {!hasData ? (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          No visitor data in this range yet.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${title} over time, ${data.length} days`}
        >
          <defs>
            <linearGradient id="fill-visitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a78d6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2a78d6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

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

          <path d={areaPath} fill="url(#fill-visitors)" />
          <path
            d={linePath}
            fill="none"
            stroke="#2a78d6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="dark:stroke-[#3987e5]"
          />

          {last && (
            <>
              <circle
                cx={last.x}
                cy={last.y}
                r="4"
                fill="#2a78d6"
                className="stroke-background dark:fill-[#3987e5]"
                strokeWidth="2"
              />
              <text
                x={last.x - 8}
                y={last.y - 10}
                textAnchor="end"
                className="fill-foreground text-[11px] font-medium"
              >
                {formatNumber(last.point.value)}
              </text>
            </>
          )}

          {pts[0] && (
            <text x={PX} y={H - 8} className="fill-muted-foreground text-[10px]">
              {pts[0].point.label}
            </text>
          )}
          {last && (
            <text
              x={W - PX}
              y={H - 8}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {last.point.label}
            </text>
          )}
        </svg>
      )}
    </div>
  );
}
