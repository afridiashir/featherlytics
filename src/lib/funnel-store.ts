import "server-only";
import { prisma } from "./prisma";

/** One funnel step: the GA event to match + a custom display name. */
export type FunnelStep = { event: string; label: string };

export type SavedFunnel = { id: string; name: string; steps: FunnelStep[] };

function zip(events: string[], labels: string[]): FunnelStep[] {
  return events.map((event, i) => ({ event, label: labels[i] ?? "" }));
}

export async function listFunnels(userId: string): Promise<SavedFunnel[]> {
  const rows = await prisma.funnel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    steps: zip(r.steps, r.labels),
  }));
}

export async function createFunnel(
  userId: string,
  name: string,
  steps: FunnelStep[],
): Promise<SavedFunnel> {
  const row = await prisma.funnel.create({
    data: {
      userId,
      name,
      steps: steps.map((s) => s.event),
      labels: steps.map((s) => s.label),
    },
  });
  return { id: row.id, name: row.name, steps: zip(row.steps, row.labels) };
}

export async function getFunnel(
  userId: string,
  id: string,
): Promise<SavedFunnel | null> {
  const row = await prisma.funnel.findFirst({ where: { id, userId } });
  if (!row) return null;
  return { id: row.id, name: row.name, steps: zip(row.steps, row.labels) };
}

export async function deleteFunnel(userId: string, id: string): Promise<void> {
  await prisma.funnel.deleteMany({ where: { id, userId } });
}
