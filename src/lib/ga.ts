import "server-only";
import { cache } from "react";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { formatDuration, formatNumber, formatPercent } from "./format";
import { prettifyReferrer, referrerToDomain } from "./referrer";

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
  /** optional domain for a favicon (referrers); null = direct/unknown */
  domain?: string | null;
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
  entryPages: BarItem[];
  exitLinks: BarItem[];
  hostnames: BarItem[];
  referrers: BarItem[];
  campaigns: BarItem[];
  keywords: BarItem[];
  countries: BarItem[];
  regions: BarItem[];
  cities: BarItem[];
  browsers: BarItem[];
  operatingSystems: BarItem[];
  devices: BarItem[];
  events: BarItem[];
  eventSeries: EventSeries;
};

export type EventSeries = {
  /** short date labels, chronologically ordered */
  labels: string[];
  /** one entry per event (top events only), sorted by total desc */
  series: { name: string; values: number[]; total: number }[];
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

/** "desktop" → "Desktop", "smart tv" → "Smart Tv" (device categories). */
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Strip the protocol and decode a URL for display (used by exit links). */
function prettifyUrl(url: string): string {
  try {
    return decodeURIComponent(url).replace(/^https?:\/\//, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

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
  rows: {
    label: string;
    value: number;
    display?: string;
    domain?: string | null;
  }[],
): BarItem[] {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return rows.map((r) => ({
    label: r.label,
    value: r.value,
    display: r.display ?? formatNumber(r.value),
    pct: Math.round((r.value / max) * 100),
    domain: r.domain,
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
    [entryRes],
    [exitRes],
    [hostRes],
    [referrersRes],
    [campaignsRes],
    [keywordsRes],
    [countriesRes],
    [regionsRes],
    [citiesRes],
    [browsersRes],
    [osRes],
    [devicesRes],
    [eventsRes],
    [eventTsRes],
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
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "linkUrl" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "click" },
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "hostName" }],
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
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionManualTerm" }],
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
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "region" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "operatingSystem" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 8,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 12,
    }),
    client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 2000,
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

  const entryPages = toBarList(
    (entryRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const exitLinks = toBarList(
    (exitRes.rows ?? []).map((row) => ({
      label: prettifyUrl(row.dimensionValues?.[0]?.value || "(not set)"),
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const hostnames = toBarList(
    (hostRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const referrers = toBarList(
    (referrersRes.rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value || "(direct)";
      return {
        label: prettifyReferrer(raw),
        value: Number(row.metricValues?.[0]?.value ?? 0),
        domain: referrerToDomain(raw),
      };
    }),
  );

  const campaigns = toBarList(
    (campaignsRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const keywords = toBarList(
    (keywordsRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const countries = toBarList(
    (countriesRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const regions = toBarList(
    (regionsRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const cities = toBarList(
    (citiesRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const browsers = toBarList(
    (browsersRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const operatingSystems = toBarList(
    (osRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const devices = toBarList(
    (devicesRes.rows ?? []).map((row) => ({
      label: titleCase(row.dimensionValues?.[0]?.value || "(unknown)"),
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  const events = toBarList(
    (eventsRes.rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(unknown)",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })),
  );

  // --- per-event daily time series (top 8 events → colored lines) ---
  const TOP_SERIES = 8;
  const topEventNames = events.slice(0, TOP_SERIES).map((e) => e.label);
  const topSet = new Set(topEventNames);
  const dateMeta = new Map<string, { label: string; sort: number }>();
  const perEvent = new Map<string, Map<string, number>>();
  for (const row of eventTsRes.rows ?? []) {
    const rawDate = row.dimensionValues?.[0]?.value ?? "";
    const name = row.dimensionValues?.[1]?.value ?? "";
    if (!topSet.has(name)) continue;
    if (!dateMeta.has(rawDate)) {
      const p = parseGaDate(rawDate);
      dateMeta.set(rawDate, { label: p.label, sort: p.sort });
    }
    if (!perEvent.has(name)) perEvent.set(name, new Map());
    perEvent
      .get(name)!
      .set(rawDate, Number(row.metricValues?.[0]?.value ?? 0));
  }
  const orderedDates = [...dateMeta.entries()].sort(
    (a, b) => a[1].sort - b[1].sort,
  );
  const eventSeries: EventSeries = {
    labels: orderedDates.map(([, v]) => v.label),
    series: topEventNames
      .filter((name) => perEvent.has(name))
      .map((name) => {
        const counts = perEvent.get(name)!;
        const values = orderedDates.map(([raw]) => counts.get(raw) ?? 0);
        return {
          name,
          values,
          total: values.reduce((a, b) => a + b, 0),
        };
      }),
  };

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
    entryPages,
    exitLinks,
    hostnames,
    referrers,
    campaigns,
    keywords,
    countries,
    regions,
    cities,
    browsers,
    operatingSystems,
    devices,
    events,
    eventSeries,
  };
});
