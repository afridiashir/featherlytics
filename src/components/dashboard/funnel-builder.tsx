"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { saveFunnelAction, updateFunnelAction } from "@/app/funnel/actions";
import { Button } from "@/components/ui/button";
import type { FunnelStep } from "@/lib/funnel-store";

export function FunnelBuilder({
  availableEvents,
  initialSteps,
  funnelId,
  initialName,
  onSaved,
}: {
  availableEvents: string[];
  initialSteps: FunnelStep[];
  /** when set, saving updates this funnel instead of creating a new one */
  funnelId?: string;
  initialName?: string;
  onSaved?: () => void;
}) {
  const [steps, setSteps] = useState<FunnelStep[]>(initialSteps);
  const [name, setName] = useState(initialName ?? "");
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  const touch = () => setSaved(false);
  const add = (event: string) => {
    if (event) {
      setSteps((cur) => [...cur, { event, label: "" }]);
      touch();
    }
  };
  const remove = (i: number) => {
    setSteps((cur) => cur.filter((_, idx) => idx !== i));
    touch();
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    setSteps((cur) => {
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    touch();
  };
  const setLabel = (i: number, label: string) => {
    setSteps((cur) => cur.map((s, idx) => (idx === i ? { ...s, label } : s)));
    touch();
  };

  function save() {
    if (steps.length < 2 || !name.trim()) return;
    startSave(async () => {
      const run: Promise<unknown> = funnelId
        ? updateFunnelAction(funnelId, name, steps)
        : saveFunnelAction(name, steps);
      toast.promise(run, {
        loading: funnelId ? "Saving changes…" : "Creating funnel…",
        success: funnelId ? "Funnel updated" : "Funnel created",
        error: "Something went wrong",
      });
      try {
        await run;
        if (!funnelId) setName("");
        setSaved(true);
        onSaved?.();
      } catch {
        // error toast already shown by toast.promise
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* steps — event + custom name, reorderable */}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={`${step.event}-${i}`}>
            {i > 0 && (
              <div className="py-1 pl-11 text-muted-foreground">
                <ArrowDown className="size-3" aria-hidden />
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>

              <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border bg-background px-3">
                <input
                  value={step.label}
                  onChange={(e) => setLabel(i, e.target.value)}
                  placeholder={step.event}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
                  aria-label={`Custom name for ${step.event}`}
                />
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {step.event}
                </span>
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
        ))}
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
          {saved ? "Saved" : funnelId ? "Save changes" : "Save funnel"}
        </Button>
      </div>
    </div>
  );
}
