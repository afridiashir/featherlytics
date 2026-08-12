"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

function agoLabel(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ago`;
}

/**
 * Keeps the realtime dashboard current: re-renders the server component on an
 * interval and shows how stale the snapshot on screen is. Uses plain
 * next/navigation's router (not the toploader one) so the background poll
 * doesn't flash the global progress bar every minute.
 */
export function LiveRefresher({
  fetchedAt,
  intervalMs = 60_000,
}: {
  /** epoch ms the snapshot was fetched, from the server */
  fetchedAt: number;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Starts at fetchedAt so the first client paint matches the server's
  // ("just now") instead of tripping a hydration mismatch on clock skew.
  const [now, setNow] = useState(fetchedAt);

  // Tick the "updated …" label.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll for a fresh snapshot. Skipping hidden tabs keeps background tabs off
  // the property's realtime quota.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => router.refresh());
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  const seconds = Math.max(0, Math.round((now - fetchedAt) / 1000));

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      Updated {pending ? "…" : agoLabel(seconds)}
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label="Refresh now"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        <RefreshCw
          className={`size-3 ${pending ? "animate-spin" : ""}`}
          aria-hidden
        />
      </Button>
    </span>
  );
}
