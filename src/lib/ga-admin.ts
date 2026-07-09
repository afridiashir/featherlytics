import "server-only";
import { AnalyticsAdminServiceClient } from "@google-analytics/admin";
import type { OAuth2Client } from "google-auth-library";

export type GaProperty = { id: string; name: string; account: string };

/** List all GA4 properties the connected Google user can access. */
export async function listProperties(
  authClient: OAuth2Client,
): Promise<GaProperty[]> {
  const client = new AnalyticsAdminServiceClient({
    // OAuth2Client is structurally an AuthClient; gax accepts it.
    authClient: authClient as never,
  });
  const [summaries] = await client.listAccountSummaries();

  const properties: GaProperty[] = [];
  for (const account of summaries) {
    for (const p of account.propertySummaries ?? []) {
      const id = (p.property ?? "").replace("properties/", "");
      if (id) {
        properties.push({
          id,
          name: p.displayName ?? id,
          account: account.displayName ?? "",
        });
      }
    }
  }
  return properties;
}
