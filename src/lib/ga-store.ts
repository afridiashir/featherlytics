import "server-only";
import { prisma } from "./prisma";

/** A user's Google Analytics connection (Postgres, via Prisma). */
export type GaConnection = {
  refreshToken?: string;
  propertyId?: string;
  propertyName?: string;
};

export async function getConnection(
  userId: string,
): Promise<GaConnection | null> {
  const row = await prisma.gaConnection.findUnique({ where: { userId } });
  if (!row) return null;
  return {
    refreshToken: row.refreshToken,
    propertyId: row.propertyId ?? undefined,
    propertyName: row.propertyName ?? undefined,
  };
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
  await prisma.gaConnection.upsert({
    where: { userId },
    update: { refreshToken },
    create: { userId, refreshToken },
  });
}

export async function saveProperty(
  userId: string,
  propertyId: string,
  propertyName: string,
) {
  await prisma.gaConnection.update({
    where: { userId },
    data: { propertyId, propertyName },
  });
}

export async function disconnect(userId: string) {
  await prisma.gaConnection.deleteMany({ where: { userId } });
}
