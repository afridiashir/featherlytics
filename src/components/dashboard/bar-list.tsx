import type { BarItem } from "@/lib/ga";
import { SiteIcon } from "./site-icon";

/** Just the ranked bar rows (no card chrome) — reused by cards and tabs. */
export function BarRows({
  items,
  emptyLabel = "No data yet",
  showIcons = false,
}: {
  items: BarItem[];
  emptyLabel?: string;
  /** show a favicon (or globe fallback) before each label, using item.domain */
  showIcons?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative flex items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-sm"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-[#2a78d6]/10 dark:bg-[#3987e5]/15"
            style={{ width: `${item.pct}%` }}
            aria-hidden
          />
          <span className="relative z-10 flex min-w-0 items-center gap-2 font-medium">
            {showIcons && <SiteIcon domain={item.domain ?? null} />}
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
          </span>
          <span className="relative z-10 shrink-0 tabular-nums text-muted-foreground">
            {item.display}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarList({
  title,
  valueLabel,
  items,
  emptyLabel,
  showIcons = false,
}: {
  title: string;
  valueLabel: string;
  items: BarItem[];
  emptyLabel?: string;
  showIcons?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{valueLabel}</span>
      </div>
      <BarRows items={items} emptyLabel={emptyLabel} showIcons={showIcons} />
    </div>
  );
}
