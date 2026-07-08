import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Feather,
  FileText,
  Globe,
  Link2,
  MousePointerClick,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/* Mock dashboard data (decorative, deterministic)                     */
/* ------------------------------------------------------------------ */

const VISITORS = [
  420, 380, 445, 460, 510, 480, 530, 590, 560, 610, 650, 620, 700, 680, 740,
  790, 760, 820, 880, 850, 910, 980, 940, 1020, 1080, 1050, 1140, 1210, 1180,
  1260,
];

const CHART = { w: 640, h: 200, px: 8, pt: 12, pb: 24 };

function chartPoints(values: number[]) {
  const max = Math.max(...values);
  const innerW = CHART.w - CHART.px * 2;
  const innerH = CHART.h - CHART.pt - CHART.pb;
  return values.map((v, i) => ({
    x: CHART.px + (i / (values.length - 1)) * innerW,
    y: CHART.pt + innerH - (v / max) * innerH,
  }));
}

const pts = chartPoints(VISITORS);
const linePath = pts
  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
  .join(" ");
const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${
  CHART.h - CHART.pb
} L${pts[0].x.toFixed(1)},${CHART.h - CHART.pb} Z`;

const TOP_PAGES = [
  { path: "/blog/launch-week", views: "4.2k", pct: 100 },
  { path: "/", views: "3.1k", pct: 74 },
  { path: "/pricing", views: "1.8k", pct: 43 },
  { path: "/docs/quickstart", views: "1.2k", pct: 29 },
  { path: "/changelog", views: "640", pct: 15 },
];

const REFERRERS = [
  { name: "google.com", visits: "2.8k", pct: 100 },
  { name: "news.ycombinator.com", visits: "1.9k", pct: 68 },
  { name: "reddit.com", visits: "1.1k", pct: 39 },
  { name: "x.com", visits: "720", pct: 26 },
];

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States", visits: "3.4k", pct: 100 },
  { flag: "🇬🇧", name: "United Kingdom", visits: "1.6k", pct: 47 },
  { flag: "🇩🇪", name: "Germany", visits: "980", pct: 29 },
  { flag: "🇮🇳", name: "India", visits: "870", pct: 26 },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function BarRow({
  label,
  value,
  pct,
  prefix,
}: {
  label: string;
  value: string;
  pct: number;
  prefix?: string;
}) {
  return (
    <div className="relative flex items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-sm">
      <div
        className="absolute inset-y-0 left-0 rounded-md bg-[#2a78d6]/10 dark:bg-[#3987e5]/15"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2 truncate font-medium">
        {prefix && <span aria-hidden>{prefix}</span>}
        {label}
      </span>
      <span className="relative z-10 tabular-nums text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </span>
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
        {delta}
      </span>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="w-full rounded-2xl border bg-background p-3 shadow-2xl shadow-black/10 sm:p-5">
      {/* window chrome */}
      <div className="mb-4 flex items-center gap-2 px-1">
        <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden />
        <span className="ml-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Feather className="size-3" aria-hidden />
          featherlytics.io / dashboard
        </span>
        <Badge variant="secondary" className="ml-auto gap-1.5 text-xs">
          <span className="relative flex size-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          42 online now
        </Badge>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Users} label="Total visits" value="12.4k" delta="+18% vs last month" />
        <StatTile icon={Eye} label="Views per visit" value="2.3" delta="+0.2" />
        <StatTile icon={Clock} label="Avg. duration" value="1m 42s" delta="+11s" />
        <StatTile icon={MousePointerClick} label="Bounce rate" value="38%" delta="-4%" />
      </div>

      {/* main chart + top pages */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-medium">Unique visitors</span>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <svg
            viewBox={`0 0 ${CHART.w} ${CHART.h}`}
            className="h-auto w-full"
            role="img"
            aria-label="Unique visitors over the last 30 days, trending upward from about 400 to 1,260 per day"
          >
            <defs>
              <linearGradient id="fill-visitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a78d6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2a78d6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* recessive grid */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={CHART.px}
                x2={CHART.w - CHART.px}
                y1={CHART.pt + (CHART.h - CHART.pt - CHART.pb) * t}
                y2={CHART.pt + (CHART.h - CHART.pt - CHART.pb) * t}
                className="stroke-border"
                strokeDasharray="2 4"
              />
            ))}
            <path d={areaPath} fill="url(#fill-visitors)" />
            <path
              d={linePath}
              fill="none"
              stroke="#2a78d6"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="dark:stroke-[#3987e5]"
            />
            {/* end marker + direct label */}
            <circle
              cx={pts[pts.length - 1].x}
              cy={pts[pts.length - 1].y}
              r="4"
              fill="#2a78d6"
              className="stroke-background dark:fill-[#3987e5]"
              strokeWidth="2"
            />
            <text
              x={pts[pts.length - 1].x - 10}
              y={pts[pts.length - 1].y - 10}
              textAnchor="end"
              className="fill-foreground text-[11px] font-medium"
            >
              1,260
            </text>
            {/* x-axis labels */}
            <text x={CHART.px} y={CHART.h - 6} className="fill-muted-foreground text-[10px]">
              Jun 8
            </text>
            <text
              x={CHART.w - CHART.px}
              y={CHART.h - 6}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              Jul 8
            </text>
          </svg>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-medium">Top pages</span>
            <span className="text-xs text-muted-foreground">Views</span>
          </div>
          <div className="flex flex-col gap-1">
            {TOP_PAGES.map((p) => (
              <BarRow key={p.path} label={p.path} value={p.views} pct={p.pct} />
            ))}
          </div>
        </div>
      </div>

      {/* referrers + countries */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-medium">Referrers</span>
            <span className="text-xs text-muted-foreground">Visits</span>
          </div>
          <div className="flex flex-col gap-1">
            {REFERRERS.map((r) => (
              <BarRow key={r.name} label={r.name} value={r.visits} pct={r.pct} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm font-medium">Countries</span>
            <span className="text-xs text-muted-foreground">Visits</span>
          </div>
          <div className="flex flex-col gap-1">
            {COUNTRIES.map((c) => (
              <BarRow
                key={c.name}
                label={c.name}
                value={c.visits}
                pct={c.pct}
                prefix={c.flag}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page sections                                                       */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: TrendingUp,
    emoji: "📈",
    title: "Unique visitors & page views, over time",
    body: "Two clean charts, side by side. Watch traffic trend day by day, spot spikes the moment they happen, and know instantly whether yesterday's post moved the needle.",
  },
  {
    icon: FileText,
    emoji: "📄",
    title: "Per-page performance",
    body: "See exactly which pages people are reading — ranked, simple, sortable. No more guessing what's working.",
  },
  {
    icon: Link2,
    emoji: "🔗",
    title: "Know where they came from",
    body: "Reddit thread blew up? A newsletter mentioned you? See every referrer broken down clearly — not buried under six clicks of “acquisition reports.”",
  },
  {
    icon: Globe,
    emoji: "🌍",
    title: "Country and city breakdown",
    body: "See your traffic on the map, country by country. Click any country to drill straight into which cities your visitors are browsing from.",
  },
];

const COMPARISON = [
  { label: "Setup", ga: "Complex, multiple steps", fl: "One line of code" },
  { label: "Dashboard", ga: "40+ reports, deep menus", fl: "One clean screen" },
  { label: "Learning curve", ga: "Hours", fl: "Minutes" },
  { label: "Daily use", ga: "Rare", fl: "Effortless" },
];

const OVERVIEW = [
  { icon: Users, title: "Total visits", body: "how many sessions, at a glance" },
  { icon: Eye, title: "Views per visit", body: "are people exploring or bouncing" },
  { icon: Clock, title: "Average visit duration", body: "how long they actually stay" },
  { icon: MousePointerClick, title: "Bounce rate", body: "how many leave without a second look" },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* ---------------------------------------------------------- */}
      {/* Nav                                                         */}
      {/* ---------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" aria-hidden />
            </span>
            Featherlytics
          </a>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#compare" className="transition-colors hover:text-foreground">
              Compare
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started Free</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </Show>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* -------------------------------------------------------- */}
        {/* Hero                                                      */}
        {/* -------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(42,120,214,0.10),transparent)]"
            aria-hidden
          />
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Feather className="size-3" aria-hidden />
              Privacy-friendly analytics, a few KB
            </Badge>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Light as a feather.{" "}
              <span className="text-[#2a78d6] dark:text-[#3987e5]">
                Clear as day.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Featherlytics is a simple, clean dashboard for the numbers that
              actually matter — visitors, pages, sources, and where
              they&apos;re coming from. No clutter, no learning curve, no
              bloated script slowing down your site.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </Show>
              <Button size="lg" variant="ghost" className="gap-1 text-muted-foreground" asChild>
                <Link href="/dashboard">
                  See a live demo <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required
            </p>

            <div className="mt-16 w-full">
              <MockDashboard />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Problem                                                   */}
        {/* -------------------------------------------------------- */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Google Analytics buries the answer under ten questions you
              didn&apos;t ask.
            </h2>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              You just want to know: how many people visited today, which pages
              they read, and where they found you. Instead you get funnels,
              segments, custom reports, and a menu three levels deep.
            </p>
            <p className="mt-4 text-lg">
              <strong>Featherlytics skips all of that.</strong>{" "}
              One screen. The
              numbers you check every day, laid out the way you&apos;d sketch
              them on a napkin.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Product overview                                          */}
        {/* -------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything on one screen
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No digging. No report-builder. Just open the dashboard.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OVERVIEW.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#2a78d6]/10 text-[#2a78d6] dark:bg-[#3987e5]/15 dark:text-[#3987e5]">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Feature breakdown                                         */}
        {/* -------------------------------------------------------- */}
        <section id="features" className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the questions you actually ask
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <Card key={f.title} className="bg-background">
                  <CardHeader>
                    <span className="mb-1 text-2xl" aria-hidden>
                      {f.emoji}
                    </span>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {f.body}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Comparison                                                */}
        {/* -------------------------------------------------------- */}
        <section id="compare" className="mx-auto w-full max-w-4xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Featherlytics
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Featherlytics isn&apos;t trying to replace every feature of GA.
              It&apos;s built for the 90% of questions you actually ask,
              answered instantly.
            </p>
          </div>
          <div className="mt-12 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-4 font-medium text-muted-foreground" />
                  <th className="p-4 font-semibold">Google Analytics</th>
                  <th className="p-4 font-semibold">
                    <span className="flex items-center gap-1.5 text-[#2a78d6] dark:text-[#3987e5]">
                      <Feather className="size-4" aria-hidden />
                      Featherlytics
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b last:border-b-0">
                    <td className="p-4 font-medium">{row.label}</td>
                    <td className="p-4 text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <X className="size-4 shrink-0 text-red-500/70" aria-hidden />
                        {row.ga}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 font-medium">
                        <Check
                          className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500"
                          aria-hidden
                        />
                        {row.fl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Setup                                                     */}
        {/* -------------------------------------------------------- */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Live in under 2 minutes
                </h2>
                <ol className="mt-8 flex flex-col gap-6">
                  {[
                    "Copy one tiny snippet (a few KB — you won't even notice it's there)",
                    "Paste it into your site",
                    "Watch your dashboard fill up in real time",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="pt-1 text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 text-sm text-muted-foreground">
                  No config files. No goals to define. No cookie banners to
                  write.
                </p>
              </div>
              <div className="rounded-2xl border bg-zinc-950 p-6 font-mono text-sm shadow-xl">
                <div className="mb-4 flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
                  <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
                  <span className="size-2.5 rounded-full bg-emerald-400/80" aria-hidden />
                  <span className="ml-2 text-xs text-zinc-500">index.html</span>
                </div>
                <pre className="overflow-x-auto text-zinc-300">
                  <code>
                    <span className="text-zinc-500">&lt;!-- that&apos;s it. really. --&gt;</span>
                    {"\n"}
                    <span className="text-sky-400">&lt;script</span>{" "}
                    <span className="text-emerald-400">defer</span>{" "}
                    <span className="text-emerald-400">src</span>=
                    <span className="text-amber-300">
                      &quot;https://featherlytics.io/f.js&quot;
                    </span>
                    {"\n  "}
                    <span className="text-emerald-400">data-site</span>=
                    <span className="text-amber-300">&quot;your-site.com&quot;</span>
                    <span className="text-sky-400">&gt;&lt;/script&gt;</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Social proof                                              */}
        {/* -------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-4xl px-4 py-24 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              "I actually check my stats every day now. I never once opened GA.",
              "Everything I need, nothing I don't.",
            ].map((quote) => (
              <figure
                key={quote}
                className="rounded-2xl border bg-card p-8"
              >
                <blockquote className="text-lg font-medium">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="size-9 rounded-full bg-gradient-to-br from-[#2a78d6]/60 to-[#2a78d6]/20" aria-hidden />
                  <span className="text-sm text-muted-foreground">
                    Early user
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Pricing teaser                                            */}
        {/* -------------------------------------------------------- */}
        <section id="pricing" className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple pricing, just like the product.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you outgrow it.
            </p>
            <Button size="lg" variant="outline" className="mt-8 gap-2">
              View Pricing <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/* Final CTA                                                 */}
        {/* -------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center text-primary-foreground sm:px-12">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(42,120,214,0.35),transparent)]"
              aria-hidden
            />
            <h2 className="relative text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Stop digging through reports. Start seeing your traffic.
            </h2>
            <div className="relative mt-8 flex flex-col items-center gap-3">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started Free <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </Show>
              <span className="text-sm text-primary-foreground/70">
                No credit card required
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <Feather className="size-4" aria-hidden />
            Featherlytics — light as a feather, clear as day.
          </span>
          <div className="flex gap-6">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
