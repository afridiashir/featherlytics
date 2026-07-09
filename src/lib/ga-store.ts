import "server-only";
import { clerkClient } from "@clerk/nextjs/server";

/** A user's Google Analytics connection, stored in Clerk privateMetadata. */
export type GaConnection = {
  refreshToken?: string;
  propertyId?: string;
  propertyName?: string;
};

export async function getConnection(
  userId: string,
): Promise<GaConnection | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const ga = user.privateMetadata?.ga as GaConnection | undefined;
  return ga ?? null;
}

async function write(userId: string, ga: GaConnection | null) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { privateMetadata: { ga } });
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
  const existing = (await getConnection(userId)) ?? {};
  await write(userId, { ...existing, refreshToken });
}

export async function saveProperty(
  userId: string,
  propertyId: string,
  propertyName: string,
) {
  const existing = (await getConnection(userId)) ?? {};
  await write(userId, { ...existing, propertyId, propertyName });
}

export async function disconnect(userId: string) {
  await write(userId, null);
}
