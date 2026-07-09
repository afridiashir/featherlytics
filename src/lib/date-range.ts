export type RangePreset = "today" | "7d" | "30d" | "custom";

export type ResolvedRange = {
  preset: RangePreset;
  /** GA4 Data API date string: "today" / "NdaysAgo" / "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  /** inclusive day count, for display */
  days: number;
  /** short label for the picker trigger, e.g. "Last 7 days" */
  label: string;
};

const PAD = (n: number) => String(n).padStart(2, "0");

/** Today's date as YYYY-MM-DD, in the server's local time zone. */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${PAD(d.getMonth() + 1)}-${PAD(d.getDate())}`;
}

function isValidIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T00:00:00Z").getTime();
  const b = new Date(toIso + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Resolve the active date range from URL search params:
 *   ?range=today | 7d | 30d | custom
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD   (only used when range=custom)
 * Falls back to the last 30 days for anything missing or invalid.
 */
export function resolveDateRange(searchParams: {
  range?: string;
  from?: string;
  to?: string;
}): ResolvedRange {
  const preset = (
    ["today", "7d", "30d", "custom"] as const
  ).includes(searchParams.range as RangePreset)
    ? (searchParams.range as RangePreset)
    : "30d";

  if (preset === "today") {
    return {
      preset,
      startDate: "today",
      endDate: "today",
      days: 1,
      label: "Today",
    };
  }

  if (preset === "7d") {
    return {
      preset,
      startDate: "6daysAgo",
      endDate: "today",
      days: 7,
      label: "Last 7 days",
    };
  }

  if (preset === "custom") {
    const from = searchParams.from;
    const to = searchParams.to;
    if (from && to && isValidIsoDate(from) && isValidIsoDate(to) && from <= to) {
      const cappedTo = to > todayIso() ? todayIso() : to;
      return {
        preset,
        startDate: from,
        endDate: cappedTo,
        days: daysBetween(from, cappedTo),
        label: `${formatDisplay(from)} – ${formatDisplay(cappedTo)}`,
      };
    }
    // Invalid/missing custom range — fall through to 30d default.
  }

  return {
    preset: "30d",
    startDate: "29daysAgo",
    endDate: "today",
    days: 30,
    label: "Last 30 days",
  };
}

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "custom", label: "Custom" },
];
