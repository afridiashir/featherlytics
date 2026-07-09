import { formatNumber } from "@/lib/format";
import type { FunnelStepResult } from "@/lib/ga";

/** A vertical bar chart of a funnel — one descending column per step. */
export function FunnelChart({ results }: { results: FunnelStepResult[] }) {
  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data for this funnel in the last 30 days.
      </p>
    );
  }

  const max = Math.max(1, ...results.map((r) => r.users));
  const first = results[0]?.users ?? 0;

  return (
    <div>
      <div className="flex h-56 items-end gap-2 sm:gap-4">
        {results.map((r, i) => {
          const pct = (r.users / max) * 100;
          return (
            <div
              key={`${r.name}-${i}`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-xs font-semibold tabular-nums">
                {formatNumber(r.users)}
              </span>
              <div
                className="w-full rounded-t-md bg-[#2a78d6] dark:bg-[#3987e5]"
                style={{ height: `${Math.max(pct, r.users === 0 ? 0 : 2)}%` }}
                title={`${r.name}: ${formatNumber(r.users)}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-2 sm:gap-4">
        {results.map((r, i) => {
          const conv = first > 0 ? (r.users / first) * 100 : 0;
          return (
            <div key={`${r.name}-${i}-label`} className="min-w-0 flex-1 text-center">
              <div className="truncate text-xs font-medium" title={r.name}>
                {r.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {conv.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
