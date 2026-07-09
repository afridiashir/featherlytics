"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { runFunnel, type FunnelStepResult } from "@/lib/ga";
import {
  createFunnel,
  deleteFunnel,
  type FunnelStep,
  type SavedFunnel,
} from "@/lib/funnel-store";

export async function runFunnelAction(
  events: string[],
): Promise<FunnelStepResult[]> {
  return runFunnel(events);
}

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

export async function deleteFunnelAction(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;
  await deleteFunnel(userId, id);
  revalidatePath("/funnel");
  redirect("/funnel");
}
