import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { AlertTriangle, Feather, Link2 } from "lucide-react";

import { PropertyPicker } from "@/components/dashboard/property-picker";
import { Button } from "@/components/ui/button";
import { listProperties, type GaProperty } from "@/lib/ga-admin";
import { getConnection } from "@/lib/ga-store";
import { isOAuthConfigured, userAuthClient } from "@/lib/ga-oauth";
import { disconnectGa } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connect Google Analytics · Featherlytics" };

const ERRORS: Record<string, string> = {
  not_configured: "Google OAuth isn't configured yet (missing GOOGLE_OAUTH_* env vars).",
  denied: "Access was denied on the Google consent screen.",
  state: "The connection request expired or didn't match. Please try again.",
  exchange: "Couldn't exchange the authorization code with Google.",
  no_refresh: "Google didn't return a refresh token — try again and click Allow.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId } = await auth();
  const { error } = await searchParams;
  const conn = userId ? await getConnection(userId) : null;

  let properties: GaProperty[] = [];
  let listError: string | null = null;
  if (conn?.refreshToken) {
    try {
      properties = await listProperties(userAuthClient(conn.refreshToken));
    } catch (e) {
      listError = e instanceof Error ? e.message : "Failed to list properties";
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" aria-hidden />
            </span>
            Featherlytics
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Connect Google Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your Google account and choose a GA4 property to see its data.
        </p>

        {error && ERRORS[error] && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <span>{ERRORS[error]}</span>
          </div>
        )}

        <div className="mt-6 rounded-xl border bg-card p-6">
          {!conn?.refreshToken ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-muted-foreground">
                You&apos;ll be sent to Google to grant read-only access to your
                Analytics data.
              </p>
              <Button asChild disabled={!isOAuthConfigured()} className="gap-2">
                <a href="/api/ga/connect">
                  <Link2 className="size-4" aria-hidden />
                  Connect Google Analytics
                </a>
              </Button>
              {!isOAuthConfigured() && (
                <p className="text-xs text-muted-foreground">
                  Set the <code>GOOGLE_OAUTH_*</code> env vars to enable this.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {conn.propertyId ? "Choose a property" : "Select a property"}
                </span>
                <form action={disconnectGa}>
                  <button
                    type="submit"
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Disconnect
                  </button>
                </form>
              </div>

              {listError ? (
                <p className="text-sm text-muted-foreground">
                  Couldn&apos;t load properties: {listError}
                </p>
              ) : (
                <PropertyPicker properties={properties} current={conn.propertyId} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
