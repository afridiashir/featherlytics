"use server";

import { runFunnel, type FunnelStepResult } from "@/lib/ga";

export async function runFunnelAction(
  steps: string[],
): Promise<FunnelStepResult[]> {
  return runFunnel(steps);
}
