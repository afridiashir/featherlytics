import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { DeleteFunnelButton } from "@/components/dashboard/delete-funnel-button";
import { EditFunnelDialog } from "@/components/dashboard/edit-funnel-dialog";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { FunnelView } from "@/components/dashboard/funnel-view";
import { Badge } from "@/components/ui/badge";
import { resolveDateRange } from "@/lib/date-range";
import { formatNumber } from "@/lib/format";
import { getFunnel, type FunnelStep } from "@/lib/funnel-store";
import { getEventNames, NotConnectedError, runFunnel } from "@/lib/ga";

export const dynamic = "force-dynamic";

function withLabels(
  steps: FunnelStep[],
  results: { name: string; users: number }[],
) {
  return results.map((r, i) => ({
    name: steps[i]?.label?.trim() || r.name,
    users: r.users,
  }));
}

export default async function FunnelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const funnel = userId ? await getFunnel(userId, id) : null;
  if (!funnel) notFound();

  const range = resolveDateRange(await searchParams);

  let results: { name: string; users: number }[] = [];
  let events: string[] = [];
  try {
    results = await runFunnel(
      funnel.steps.map((s) => s.event),
      range.startDate,
      range.endDate,
      range.preset,
    );
    events = await getEventNames();
  } catch (e) {
    if (e instanceof NotConnectedError) redirect("/connect");
  }

  const display = withLabels(funnel.steps, results);
  const entered = display[0]?.users ?? 0;
  const converted = display[display.length - 1]?.users ?? 0;
  const rate = entered > 0 ? (converted / entered) * 100 : 0;

  const stats = [
    { label: "Entered", value: formatNumber(entered) },
    { label: "Converted", value: formatNumber(converted) },
    { label: "Conversion", value: `${rate.toFixed(1)}%` },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <AppHeader active="/funnel" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/funnel"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All funnels
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{funnel.name}</h1>
            <p className="text-sm text-muted-foreground">
              {funnel.steps.length} steps · {range.label}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker />
            <EditFunnelDialog
              funnelId={funnel.id}
              name={funnel.name}
              availableEvents={events}
              initialSteps={funnel.steps}
            />
            <DeleteFunnelButton
              id={funnel.id}
              name={funnel.name}
              variant="button"
              redirectTo="/funnel"
            />
          </div>
        </div>

        {/* summary */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <div className="text-xs font-medium text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* chart + breakdown */}
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Funnel</span>
            <Badge variant="outline">users</Badge>
          </div>

          <FunnelChart results={display} />

          <div className="mt-6 border-t pt-6">
            <FunnelView results={display} />
          </div>
        </div>
      </main>
    </div>
  );
}
