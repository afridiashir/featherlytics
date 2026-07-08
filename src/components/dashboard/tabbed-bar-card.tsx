"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BarItem } from "@/lib/ga";
import { BarRows, type IconKind } from "./bar-list";

export type BarTab = {
  key: string;
  label: string;
  items: BarItem[];
  empty?: string;
  /** leading icon style for rows (referrer favicons, browser/os/device icons) */
  iconKind?: IconKind;
  /** overrides the card's valueLabel while this tab is active */
  valueLabel?: string;
};

/** A card whose body switches between several ranked bar lists via tabs. */
export function TabbedBarCard({
  tabs,
  valueLabel,
  defaultTab,
}: {
  tabs: BarTab[];
  valueLabel?: string;
  defaultTab?: string;
}) {
  const initial = defaultTab ?? tabs[0]?.key;
  const [active, setActive] = useState(initial);

  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];
  const currentValueLabel = activeTab?.valueLabel ?? valueLabel;

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className="rounded-xl border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {currentValueLabel && (
          <span className="text-xs text-muted-foreground">
            {currentValueLabel}
          </span>
        )}
      </div>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          <BarRows items={t.items} emptyLabel={t.empty} iconKind={t.iconKind} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
