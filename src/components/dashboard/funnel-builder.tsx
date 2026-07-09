"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, X } from "lucide-react";

import { runFunnelAction, saveFunnelAction } from "@/app/funnel/actions";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { FunnelStepResult } from "@/lib/ga";
import type { FunnelStep } from "@/lib/funnel-store";

export function FunnelBuilder({
  availableEvents,
  initialSteps,
  initialResults,
  onSaved,
}: {
  availableEvents: string[];
  initialSteps: FunnelStep[];
  initialResults: FunnelStepResult[];
  onSaved?: () => void;
}) {
  const [steps, setSteps] = useState<FunnelStep[]>(initialSteps);
  const [results, setResults] = useState<FunnelStepResult[]>(initialResults);
  const [pending, start] = useTransition();

  const [name, setName] = useState("");
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  // Re-run the funnel report (only the events matter to GA, not the labels).
  function apply(next: FunnelStep[]) {
    setSteps(next);
    setSaved(false);
    start(async () => {
      setResults(await runFunnelAction(next.map((s) => s.event)));
    });
  }

  const add = (event: string) =>
    event && apply([...steps, { event, label: "" }]);
  const remove = (i: number) => apply(steps.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    apply(next);
  };
  // Editing a label doesn't change the GA query, so no re-fetch.
  const setLabel = (i: number, label: string) => {
    setSteps((cur) => cur.map((s, idx) => (idx === i ? { ...s, label } : s)));
    setSaved(false);
  };

  function save() {
    if (steps.length < 2 || !name.trim()) return;
    startSave(async () => {
      await saveFunnelAction(name, steps);
      setName("");
      setSaved(true);
      onSaved?.();
    });
  }

  const aligned = results.length === steps.length;
  const first = aligned ? results[0]?.users ?? 0 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* funnel steps — each row is also the editor */}
      <div
        className={`flex flex-col transition-opacity ${pending ? "opacity-60" : ""}`}
      >
        {steps.map((step, i) => {
          const users = aligned ? results[i]?.users ?? 0 : undefined;
          const prev = aligned && i > 0 ? results[i - 1]?.users ?? 0 : undefined;
          const pct = users !== undefined && first > 0 ? (users / first) * 100 : 0;
          const drop =
            prev !== undefined && users !== undefined && prev > 0
              ? ((prev - users) / prev) * 100
              : undefined;

          return (
            <div key={`${step.event}-${i}`}>
              {i > 0 && (
                <div className="flex items-center gap-2 py-1 pl-11 text-xs text-muted-foreground">
                  <ArrowDown className="size-3" aria-hidden />
                  {drop !== undefined ? (
                    <span>
                      {drop.toFixed(0)}% drop-off
                      {prev !== undefined && users !== undefined && (
                        <span className="text-muted-foreground/70">
                          {" "}
                          · {formatNumber(prev - users)} users lost
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>

                <div className="relative h-11 flex-1 overflow-hidden rounded-lg border bg-background">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#2a78d6]/15 dark:bg-[#3987e5]/20"
                    style={{ width: `${Math.max(pct, users === 0 ? 0 : 2)}%` }}
                    aria-hidden
                  />
                  <div className="relative flex h-full items-center gap-2 px-3">
                    <input
                      value={step.label}
                      onChange={(e) => setLabel(i, e.target.value)}
                      placeholder={step.event}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
                      aria-label={`Custom name for ${step.event}`}
                    />
                    <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                      {step.event}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">
                      {users === undefined ? (
                        <span className="text-muted-foreground">…</span>
                      ) : (
                        <>
                          <span className="font-semibold">
                            {formatNumber(users)}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {pct.toFixed(0)}%
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Move step up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === steps.length - 1}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    aria-label="Move step down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove step"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {steps.length < 2 && (
        <p className="text-sm text-muted-foreground">
          Add at least 2 steps to build a funnel.
        </p>
      )}

      {/* add-step control */}
      <div className="flex items-center gap-2">
        <Plus className="size-4 text-muted-foreground" aria-hidden />
        <select
          value=""
          onChange={(e) => {
            add(e.target.value);
            e.target.value = "";
          }}
          className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Add a funnel step"
        >
          <option value="" disabled>
            Add an event step…
          </option>
          {availableEvents.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>
      </div>

      {/* name + save */}
      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Funnel name (e.g. Checkout)"
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Funnel name"
        />
        <Button
          onClick={save}
          disabled={steps.length < 2 || !name.trim() || saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : saved ? (
            <Check className="size-4" aria-hidden />
          ) : null}
          {saved ? "Saved" : "Save funnel"}
        </Button>
      </div>
    </div>
  );
}
