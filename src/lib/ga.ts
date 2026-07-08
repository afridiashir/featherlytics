import "server-only";
import { cache } from "react";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { formatDuration, formatNumber, formatPercent } from "./format";

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (cachedClient) return cachedClient;

  const raw = process.env.GA4_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("GA4_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  const credentials = JSON.parse(raw);
  // Some env loaders keep the literal "\n"; normalize to real newlines.
  if (typeof credentials.private_key === "string") {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  cachedClient = new BetaAnalyticsDataClient({ credentials });
  return cachedClient;
}

function propertyPath(): string {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) throw new Error("GA4_PROPERTY_ID environment variable is not set");
  return `properties/${id}`;
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Metric = {
  label: string;
  value: string;
};

export type TimePoint = {
  /** ISO-ish date string, e.g. "2026-07-08" */
  date: string;
  /** Short label for the axis, e.g. "Jul 8" */
  label: string;
  value: number;
};

export type BarItem = {
  label: string;
  value: number;
  display: string;
  /** width percentage relative to the largest item in the list */
  pct: number;
};

export type Analytics = {
  range: { start: string; end: string; days: number };
  summary: {
    totalVisits: Metric;
    viewsPerVisit: Metric;
    avgDuration: Metric;
    bounceRate: Metric;
    activeUsers: Metric;
  };
  visitors: TimePoint[];
  topPages: BarItem[];
  referrers: BarItem[];
  countries: BarItem[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const RANGE_DAYS = 30;
const START = `${RANGE_DAYS - 1}daysAgo`;
const END = "today";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** GA4 returns dates as "YYYYMMDD" — turn them into iso + short label. */
function parseGaDate(raw: string): { date: string; label: string; sort: number } {
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const monthIdx = Number(m) - 1;
  return {
    date: `${y}-${m}-${d}`,
    label: `${MONTHS[monthIdx] ?? m} ${Number(d)}`,
    sort: Number(raw),
  };
}

function toBarList(
  rows: { label: string; value: number; display?: string }[],
): BarItem[] {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return rows.map((r) => ({
    label: r.label,
    value: r.value,
    display: r.display ?? formatNumber(r.value),
    pct: Math.round((r.value / max) * 100),
  }));
}

/* ------------------------------------------------------------------ */
/* The report                                                          */
/* ------------------------------------------------------------------ */

/**
 * Fetch the full dashboard dataset from GA4. Deduped per-request with
 * React `cache`. Throws on credential/permission errors — callers should
 * handle it and render a fallback.
 */
export const getAnalytics = cache(async (): Promise<Analytics> => {
  const client = getClient();
  const property = propertyPath();
  const dateRanges = [{ startDate: START, endDate: END }];

  const [
    [summaryRes],
    [seriesRes],
    [pagesRes],
    [referrersRes],
    [countriesRes],
  ] = await Promise.all([
    client.runReport({
      property,
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "screenPageViewsPerSession" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "activeUsers" },
      ],
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
  ]);

  // --- summary ---
  const m = (i: number) => Number(summaryRes.rows?.[0]?.metricValues?.[i]?.value ?? 0);
  const sessions = m(0);
  const viewsPerVisit = m(1);
  const avgDuration = m(2);
  const bounceRate = m(3);
  const activeUsers = m(4);

  // --- time series ---
  const visitors: TimePoint[] = (seriesRes.rows ?? [])
    .map((row) => {
      const parsed = parseGaDate(row.dimensionValues?.[0]?.value ?? "");
      return {
        date: parsed.date,
        label: parsed.label,
        value: Number(row.metricValues?.[0]?.value ?? 0),
        sort: parsed.sort,
      };
    })
    .sort((a, b) => a.sort - b.sort)
    .map(({ date, label, value }) => ({ date, label, value }));

  // --- breakdown lists ---
  const topPages = toBarList(
    (pagesRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const referrers = toBarList(
    (referrersRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(direct)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const countries = toBarList(
    (countriesRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  return {
    range: {
      start: visitors[0]?.label ?? "",
      end: visitors[visitors.length - 1]?.label ?? "",
      days: RANGE_DAYS,
    },
    summary: {
      totalVisits: { label: "Total visits", value: formatNumber(sessions) },
      viewsPerVisit: {
        label: "Views per visit",
        value: viewsPerVisit.toFixed(1),
      },
      avgDuration: { label: "Avg. duration", value: formatDuration(avgDuration) },
      bounceRate: { label: "Bounce rate", value: formatPercent(bounceRate) },
      activeUsers: { label: "Active users", value: formatNumber(activeUsers) },
    },
    visitors,
    topPages,
    referrers,
    countries,
  };
});
