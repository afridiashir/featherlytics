import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AlertTriangle, Clock, Eye, MousePointerClick, Users, Zap } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { LiveRefresher } from "@/components/dashboard/live-refresher";
import { TabbedBarCard } from "@/components/dashboard/tabbed-bar-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { VisitorsChart } from "@/components/dashboard/visitors-chart";
import { resolveDateRange } from "@/lib/date-range";
import {
  getAnalytics,
  getRealtime,
  NotConnectedError,
  type Analytics,
  type Realtime,
} from "@/lib/ga";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · Featherlytics" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const user = await currentUser();
  const params = await searchParams;
  const range = resolveDateRange(params);
  const isLive = range.preset === "live";

  let data: Analytics | null = null;
  let live: Realtime | null = null;
  let error: string | null = null;
  try {
    if (isLive) {
      live = await getRealtime();
    } else {
      data = await getAnalytics(range.startDate, range.endDate, range.days, range.preset);
    }
  } catch (e) {
    if (e instanceof NotConnectedError) redirect("/connect");
    error = e instanceof Error ? e.message : "Failed to load analytics";
  }

  const greetingName =
    user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <AppHeader active="/dashboard" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greetingName ? `Welcome back, ${greetingName}` : "Dashboard"}
            </h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLive ? (
                <>
                  Realtime · last 30 minutes
                  {live && <LiveRefresher fetchedAt={live.fetchedAt} />}
                </>
              ) : (
                <>
                  Live analytics for your website
                  {data ? ` · ${data.range.start} – ${data.range.end}` : ""}
                </>
              )}
            </p>
          </div>
          <DateRangePicker includeLive />
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
        ) : live ? (
          <div className="flex flex-col gap-4">
            {/* stat tiles — realtime totals for the trailing 30 minutes */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              <StatTile
                icon={Users}
                label={live.summary.activeUsers.label}
                value={live.summary.activeUsers.value}
              />
              <StatTile
                icon={Eye}
                label={live.summary.screenPageViews.label}
                value={live.summary.screenPageViews.value}
              />
              <StatTile
                icon={Zap}
                label={live.summary.eventCount.label}
                value={live.summary.eventCount.value}
              />
            </div>

            {/* per-minute activity */}
            <VisitorsChart
              data={live.perMinute}
              title="Active users"
              rangeLabel="Last 30 minutes"
              xUnit="minute"
              valueNoun="active users"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TabbedBarCard
                tabs={[
                  { key: "pages", label: "Pages", items: live.topPages, valueLabel: "Views", empty: "No page views right now" },
                ]}
              />
              <TabbedBarCard
                valueLabel="Users"
                tabs={[
                  { key: "countries", label: "Countries", items: live.countries, empty: "No country data right now" },
                  { key: "cities", label: "City", items: live.cities, empty: "No city data right now" },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TabbedBarCard
                valueLabel="Users"
                tabs={[
                  { key: "device", label: "Device", items: live.devices, iconKind: "device", empty: "No device data right now" },
                ]}
              />
              <TabbedBarCard
                tabs={[
                  { key: "events", label: "Events", items: live.events, valueLabel: "Count", empty: "No events right now" },
                ]}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Realtime reporting covers a smaller set of dimensions than the
              dated reports — bounce rate, visit duration, referrers and
              entry/exit pages aren&apos;t available live, and pages are
              reported by title rather than path. Pick a date range above for
              the full breakdown.
            </p>
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
              rangeLabel={range.label}
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
            <GoalsCard
              events={data.events}
              eventSeries={data.eventSeries}
              rangeLabel={range.label}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
