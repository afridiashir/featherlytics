"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

import { selectProperty } from "@/app/connect/actions";
import { Button } from "@/components/ui/button";
import type { GaProperty } from "@/lib/ga-admin";

export function PropertyPicker({
  properties,
  current,
}: {
  properties: GaProperty[];
  current?: string;
}) {
  const [selected, setSelected] = useState<string | undefined>(current);
  const [pending, start] = useTransition();

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No GA4 properties found for this Google account. Make sure it has access
        to at least one Google Analytics 4 property.
      </p>
    );
  }

  const save = () => {
    const p = properties.find((x) => x.id === selected);
    if (p) start(() => selectProperty(p.id, p.name));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {properties.map((p) => {
          const active = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-[#2a78d6] bg-[#2a78d6]/5 dark:border-[#3987e5]"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.account} · ID {p.id}
                </div>
              </div>
              {active && (
                <Check
                  className="size-5 shrink-0 text-[#2a78d6] dark:text-[#3987e5]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <Button onClick={save} disabled={!selected || pending} className="self-start gap-2">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Use this property
      </Button>
    </div>
  );
}
