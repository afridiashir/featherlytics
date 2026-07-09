import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ChevronRight, Filter } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { DeleteFunnelButton } from "@/components/dashboard/delete-funnel-button";
import { NewFunnelDialog } from "@/components/dashboard/new-funnel-dialog";
import { getEventNames, NotConnectedError } from "@/lib/ga";
import { listFunnels, type FunnelStep } from "@/lib/funnel-store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Funnels · Featherlytics" };

// Preferred default order for a fresh funnel (kept only for events that exist).
const PREFERRED = [
  "session_start",
  "view_item",
  "add_to_cart",
  "begin_checkout",
  "purchase",
];

export default async function FunnelPage() {
  const { userId } = await auth();

  let events: string[] = [];
  let error: string | null = null;
  try {
    events = await getEventNames();
  } catch (e) {
    if (e instanceof NotConnectedError) redirect("/connect");
    error = e instanceof Error ? e.message : "Failed to load events";
  }

  const defaultEvents = PREFERRED.filter((e) => events.includes(e));
  const initialEvents =
    defaultEvents.length >= 2
      ? defaultEvents
      : events.slice(0, Math.min(3, events.length));
  const initialSteps: FunnelStep[] = initialEvents.map((event) => ({
    event,
    label: "",
  }));

  // List only — no per-funnel GA calls here (data lives on each funnel's page).
  const funnels = userId ? await listFunnels(userId) : [];

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <AppHeader active="/funnel" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              Funnels
            </h1>
            <p className="text-sm text-muted-foreground">
              Your saved conversion funnels. Open one to see its chart.
            </p>
          </div>
          {!error && (
            <NewFunnelDialog
              availableEvents={events}
              initialSteps={initialSteps}
            />
          )}
        </div>

        {error && (
          <p className="rounded-xl border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load events: {error}
          </p>
        )}

        {funnels.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-card/50 px-4 py-10 text-center text-sm text-muted-foreground">
            No funnels yet. Click <span className="font-medium">New funnel</span> to
            build your first one.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {funnels.map((f) => {
              const path = f.steps.map((s) => s.label?.trim() || s.event).join(" → ");
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <Link href={`/funnel/${f.id}`} className="min-w-0 flex-1">
                    <div className="font-semibold">{f.name}</div>
                    <div className="truncate text-xs text-muted-foreground" title={path}>
                      {f.steps.length} steps · {path}
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1">
                    <DeleteFunnelButton id={f.id} name={f.name} />
                    <Link
                      href={`/funnel/${f.id}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Open ${f.name}`}
                    >
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
