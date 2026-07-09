"use client";

import { useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
// nextjs-toploader's own useRouter wraps next/navigation's router so that
// the top progress bar reliably starts on router.push() (including
// query-param-only navigations like ours) and completes once Next.js
// actually finishes the navigation — plain next/navigation's useRouter
// doesn't reliably drive the bar for this case.
import { useRouter } from "nextjs-toploader/app";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { DateRange as CalendarRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RANGE_PRESETS, resolveDateRange, type RangePreset } from "@/lib/date-range";

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Tracks the navigation until the dashboard's new data has actually
  // loaded (not just until the URL changes) — used for a local pending
  // state on the picker itself, on top of the global top bar.
  const [pending, startTransition] = useTransition();

  const current = resolveDateRange({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CalendarRange | undefined>(
    current.preset === "custom"
      ? {
          from: new Date(current.startDate + "T00:00:00"),
          to: new Date(current.endDate + "T00:00:00"),
        }
      : undefined,
  );

  function applyPreset(preset: RangePreset) {
    if (preset === "custom") {
      setOpen(true);
      return;
    }
    startTransition(() => {
      router.push(`${pathname}?range=${preset}`);
    });
  }

  function applyCustom() {
    if (!draft?.from) return;
    const from = toIso(draft.from);
    const to = toIso(draft.to ?? draft.from);
    startTransition(() => {
      router.push(`${pathname}?range=custom&from=${from}&to=${to}`);
    });
    setOpen(false);
  }

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg border bg-card p-0.5 transition-opacity ${
        pending ? "opacity-70" : ""
      }`}
    >
      {RANGE_PRESETS.map((p) => {
        const active = current.preset === p.value;
        if (p.value === "custom") {
          return (
            <Popover key={p.value} open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  disabled={pending}
                  onClick={() => applyPreset("custom")}
                >
                  {active && pending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <CalendarIcon className="size-3.5" aria-hidden />
                  )}
                  {active ? current.label : "Custom"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={draft}
                  onSelect={setDraft}
                  defaultMonth={draft?.from}
                  disabled={{ after: new Date() }}
                />
                <div className="flex items-center justify-end gap-2 border-t p-3">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applyCustom} disabled={!draft?.from}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          );
        }
        return (
          <Button
            key={p.value}
            variant={active ? "secondary" : "ghost"}
            size="sm"
            disabled={pending}
            className="gap-1.5"
            onClick={() => applyPreset(p.value)}
          >
            {active && pending && (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            )}
            {p.label}
          </Button>
        );
      })}
    </div>
  );
}
