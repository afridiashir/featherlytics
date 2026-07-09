import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import {
  AlertTriangle,
  Clock,
  Eye,
  Feather,
  MousePointerClick,
  Users,
} from "lucide-react";

import { GoalsCard } from "@/components/dashboard/goals-card";
import { TabbedBarCard } from "@/components/dashboard/tabbed-bar-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { VisitorsChart } from "@/components/dashboard/visitors-chart";
import { Badge } from "@/components/ui/badge";
import { getAnalytics, NotConnectedError, type Analytics } from "@/lib/ga";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Featherlytics" };

export default async function DashboardPage() {
  const user = await currentUser();

  let data: Analytics | null = null;
  let error: string | null = null;
  try {
    data = await getAnalytics();
  } catch (e) {
    if (e instanceof NotConnectedError) redirect("/connect");
    error = e instanceof Error ? e.message : "Failed to load analytics";
  }

  const greetingName =
    user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" aria-hidden />
            </span>
            Featherlytics
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link
              href="/funnel"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Funnel
            </Link>
            <Link
              href="/connect"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Your websites
            </Link>
            <Badge variant="secondary" className="hidden gap-1.5 sm:inline-flex">
              <span className="relative flex size-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greetingName ? `Welcome back, ${greetingName}` : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Live analytics for your website
              {data ? ` · ${data.range.start} – ${data.range.end}` : ""}
            </p>
          </div>
          <Badge variant="outline">Last {data?.range.days ?? 30} days</Badge>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <AlertTriangle className="size-8 text-destructive" aria-hidden />
            <div>
              <p className="font-medium">Couldn&apos;t load analytics</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-4">
            {/* stat tiles */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                icon={Users}
                label={data.summary.totalVisits.label}
                value={data.summary.totalVisits.value}
              />
              <StatTile
                icon={Eye}
                label={data.summary.viewsPerVisit.label}
                value={data.summary.viewsPerVisit.value}
              />
              <StatTile
                icon={Clock}
                label={data.summary.avgDuration.label}
                value={data.summary.avgDuration.value}
              />
              <StatTile
                icon={MousePointerClick}
                label={data.summary.bounceRate.label}
                value={data.summary.bounceRate.value}
              />
            </div>

            {/* visitors chart — full width */}
            <VisitorsChart
              data={data.visitors}
              rangeLabel={`Last ${data.range.days} days`}
            />

            {/* traffic sources + geography */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TabbedBarCard
                valueLabel="Sessions"
                tabs={[
                  { key: "referrers", label: "Referrers", items: data.referrers, iconKind: "referrer", empty: "No referrers yet" },
                  { key: "campaigns", label: "Campaigns", items: data.campaigns, empty: "No campaign data yet" },
                  { key: "keywords", label: "Keywords", items: data.keywords, empty: "No keyword data yet" },
                ]}
              />
              <TabbedBarCard
                valueLabel="Users"
                tabs={[
                  { key: "countries", label: "Countries", items: data.countries, empty: "No country data yet" },
                  { key: "regions", label: "Region", items: data.regions, empty: "No region data yet" },
                  { key: "cities", label: "City", items: data.cities, empty: "No city data yet" },
                ]}
              />
            </div>

            {/* pages + tech */}
            <div className="grid gap-4 lg:grid-cols-2">
              <TabbedBarCard
                tabs={[
                  { key: "pages", label: "Pages", items: data.topPages, valueLabel: "Views" },
                  { key: "entry", label: "Entry", items: data.entryPages, valueLabel: "Sessions", empty: "No entry pages yet" },
                  { key: "exit", label: "Exit", items: data.exitLinks, valueLabel: "Clicks", empty: "No outbound link clicks yet" },
                  { key: "hostname", label: "Hostname", items: data.hostnames, valueLabel: "Views", empty: "No hostname data yet" },
                ]}
              />
              <TabbedBarCard
                valueLabel="Users"
                tabs={[
                  { key: "browser", label: "Browser", items: data.browsers, iconKind: "browser", empty: "No browser data yet" },
                  { key: "os", label: "OS", items: data.operatingSystems, iconKind: "os", empty: "No OS data yet" },
                  { key: "device", label: "Device", items: data.devices, iconKind: "device", empty: "No device data yet" },
                ]}
              />
            </div>

            {/* goals — per-event line chart + how many times each fired */}
            <GoalsCard events={data.events} eventSeries={data.eventSeries} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
