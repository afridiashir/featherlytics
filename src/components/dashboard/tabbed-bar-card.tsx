"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BarItem } from "@/lib/ga";
import { BarRows } from "./bar-list";

export type BarTab = {
  key: string;
  label: string;
  items: BarItem[];
  empty?: string;
  /** show favicons/brand icons before labels (referrers) */
  showIcons?: boolean;
};

/** A card whose body switches between several ranked bar lists via tabs. */
export function TabbedBarCard({
  tabs,
  valueLabel,
  defaultTab,
}: {
  tabs: BarTab[];
  valueLabel: string;
  defaultTab?: string;
}) {
  const initial = defaultTab ?? tabs[0]?.key;

  return (
    <Tabs defaultValue={initial} className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <span className="text-xs text-muted-foreground">{valueLabel}</span>
      </div>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          <BarRows items={t.items} emptyLabel={t.empty} showIcons={t.showIcons} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
