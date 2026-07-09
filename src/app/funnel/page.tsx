import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Feather, Filter } from "lucide-react";

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
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" aria-hidden />
            </span>
            Featherlytics
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link href="/funnel" className="text-sm font-medium text-foreground">
              Funnel
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>

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
