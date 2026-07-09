import { redirect } from "next/navigation";
import { Filter } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { FunnelBuilder } from "@/components/dashboard/funnel-builder";
import { Badge } from "@/components/ui/badge";
import { getEventNames, NotConnectedError, runFunnel } from "@/lib/ga";

export const dynamic = "force-dynamic";
export const metadata = { title: "Funnel · Featherlytics" };

// Preferred default order (kept only for events that actually exist).
const PREFERRED = [
  "session_start",
  "view_item",
  "add_to_cart",
  "begin_checkout",
  "purchase",
];

export default async function FunnelPage() {
  let events: string[] = [];
  let error: string | null = null;
  try {
    events = await getEventNames();
  } catch (e) {
    if (e instanceof NotConnectedError) redirect("/connect");
    error = e instanceof Error ? e.message : "Failed to load events";
  }

  const defaults = PREFERRED.filter((e) => events.includes(e));
  const initialSteps =
    defaults.length >= 2 ? defaults : events.slice(0, Math.min(3, events.length));
  const initialResults =
    initialSteps.length >= 2 ? await runFunnel(initialSteps) : [];

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <AppHeader active="/funnel" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Filter className="size-6 text-[#2a78d6] dark:text-[#3987e5]" aria-hidden />
            Funnel
          </h1>
          <p className="text-sm text-muted-foreground">
            Add events as steps to see how many users make it through each one.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">Conversion funnel</span>
            <Badge variant="outline">Last 30 days · users</Badge>
          </div>

          {error ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Couldn&apos;t load events: {error}
            </p>
          ) : (
            <FunnelBuilder
              availableEvents={events}
              initialSteps={initialSteps}
              initialResults={initialResults}
            />
          )}
        </div>
      </main>
    </div>
  );
}
