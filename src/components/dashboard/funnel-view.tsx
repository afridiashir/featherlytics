import { ArrowDown } from "lucide-react";

import { formatNumber } from "@/lib/format";
import type { FunnelStepResult } from "@/lib/ga";

/** Read-only funnel visualization (bars + drop-off) for a saved funnel. */
export function FunnelView({ results }: { results: FunnelStepResult[] }) {
  if (results.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No data for this funnel in the last 30 days.
      </p>
    );
  }

  const first = results[0]?.users ?? 0;

  return (
    <div className="flex flex-col">
      {results.map((step, i) => {
        const pct = first > 0 ? (step.users / first) * 100 : 0;
        const prev = i > 0 ? results[i - 1].users : undefined;
        const drop =
          prev !== undefined && prev > 0
            ? ((prev - step.users) / prev) * 100
            : undefined;

        return (
          <div key={`${step.name}-${i}`}>
            {i > 0 && drop !== undefined && (
              <div className="flex items-center gap-2 py-1 pl-11 text-xs text-muted-foreground">
                <ArrowDown className="size-3" aria-hidden />
                {drop.toFixed(0)}% drop-off
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div className="relative h-11 flex-1 overflow-hidden rounded-lg border bg-background">
                <div
                  className="absolute inset-y-0 left-0 bg-[#2a78d6]/15 dark:bg-[#3987e5]/20"
                  style={{ width: `${Math.max(pct, step.users === 0 ? 0 : 2)}%` }}
                  aria-hidden
                />
                <div className="relative flex h-full items-center justify-between px-3">
                  <span className="truncate font-medium" title={step.name}>
                    {step.name}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">
                    <span className="font-semibold">
                      {formatNumber(step.users)}
                    </span>
                    <span className="text-muted-foreground"> · {pct.toFixed(0)}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
