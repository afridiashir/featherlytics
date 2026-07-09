import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { FunnelView } from "@/components/dashboard/funnel-view";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import { getFunnel, type FunnelStep } from "@/lib/funnel-store";
import { NotConnectedError, runFunnel } from "@/lib/ga";
import { deleteFunnelAction } from "../actions";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const funnel = userId ? await getFunnel(userId, id) : null;
  if (!funnel) notFound();

  let results: { name: string; users: number }[] = [];
  try {
    results = await runFunnel(funnel.steps.map((s) => s.event));
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

        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{funnel.name}</h1>
            <p className="text-sm text-muted-foreground">
              {funnel.steps.length} steps · last 30 days
            </p>
          </div>
          <form action={deleteFunnelAction.bind(null, funnel.id)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${funnel.name}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Delete
            </button>
          </form>
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
