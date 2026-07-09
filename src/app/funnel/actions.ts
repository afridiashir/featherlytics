"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import {
  createFunnel,
  deleteFunnel,
  updateFunnel,
  type FunnelStep,
  type SavedFunnel,
} from "@/lib/funnel-store";

export async function saveFunnelAction(
  name: string,
  steps: FunnelStep[],
): Promise<SavedFunnel | null> {
  const { userId } = await auth();
  if (!userId) return null;
  if (steps.filter((s) => s.event).length < 2) return null;

  const funnel = await createFunnel(
    userId,
    name.trim() || "Untitled funnel",
    steps,
  );
  revalidatePath("/funnel");
  return funnel;
}

export async function updateFunnelAction(
  id: string,
  name: string,
  steps: FunnelStep[],
): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  if (steps.filter((s) => s.event).length < 2) return;

  await updateFunnel(userId, id, name.trim() || "Untitled funnel", steps);
  revalidatePath("/funnel");
  revalidatePath(`/funnel/${id}`);
}

export async function deleteFunnelAction(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await deleteFunnel(userId, id);
  revalidatePath("/funnel");
}
