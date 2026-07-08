import type { BarItem } from "@/lib/ga";

export function BarList({
  title,
  valueLabel,
  items,
  emptyLabel = "No data yet",
}: {
  title: string;
  valueLabel: string;
  items: BarItem[];
  emptyLabel?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{valueLabel}</span>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
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
              <span className="relative z-10 truncate font-medium" title={item.label}>
                {item.label}
              </span>
              <span className="relative z-10 shrink-0 tabular-nums text-muted-foreground">
                {item.display}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
