// Maps GA4 `sessionSource` values to a favicon-able domain + a pretty label.

const SOURCE_ALIASES: Record<string, string> = {
  google: "google.com",
  bing: "bing.com",
  yahoo: "yahoo.com",
  duckduckgo: "duckduckgo.com",
  baidu: "baidu.com",
  yandex: "yandex.com",
  ecosia: "ecosia.org",
  brave: "brave.com",
  reddit: "reddit.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  twitter: "x.com",
  x: "x.com",
  linkedin: "linkedin.com",
  youtube: "youtube.com",
  tiktok: "tiktok.com",
  pinterest: "pinterest.com",
  github: "github.com",
  "chatgpt.com": "chatgpt.com",
  "google play": "play.google.com",
};

const DIRECT = new Set(["", "(direct)", "(none)", "(not set)", "direct"]);

/** Returns a domain usable for a favicon lookup, or null for direct/unknown. */
export function referrerToDomain(source: string): string | null {
  const s = source.trim().toLowerCase();
  if (DIRECT.has(s)) return null;
  if (SOURCE_ALIASES[s]) return SOURCE_ALIASES[s];
  if (s.includes(".")) {
    return s
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
  return null;
}

// Domains (registrable) that have a dedicated Font Awesome brand icon.
// Keyed by the brand slug used in [site-icon.tsx].
const BRAND_DOMAINS: Record<string, string> = {
  "google.com": "google",
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "x.com": "twitter",
  "twitter.com": "twitter",
  "t.co": "twitter",
  "reddit.com": "reddit",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "tiktok.com": "tiktok",
  "pinterest.com": "pinterest",
  "github.com": "github",
  "whatsapp.com": "whatsapp",
  "t.me": "telegram",
  "telegram.org": "telegram",
};

/**
 * Returns a brand slug (matching a Font Awesome brand icon) for a domain,
 * or null when there's no known brand — matches subdomains too, e.g.
 * "l.instagram.com" → "instagram", "m.facebook.com" → "facebook".
 */
export function brandForDomain(domain: string | null): string | null {
  if (!domain) return null;
  for (const bd in BRAND_DOMAINS) {
    if (domain === bd || domain.endsWith("." + bd)) return BRAND_DOMAINS[bd];
  }
  return null;
}

/** Human-friendly label for a referrer source. */
export function prettifyReferrer(source: string): string {
  const s = source.trim();
  const low = s.toLowerCase();
  if (DIRECT.has(low)) return low === "(not set)" ? "Other" : "Direct";
  return s.replace(/^www\./, "");
}
