"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { disconnect, saveProperty } from "@/lib/ga-store";

export async function selectProperty(propertyId: string, propertyName: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  await saveProperty(userId, propertyId, propertyName);
  redirect("/dashboard");
}

export async function disconnectGa() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  await disconnect(userId);
  redirect("/connect");
}
