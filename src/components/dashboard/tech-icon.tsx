"use client";

import { Globe, Monitor, Smartphone, Tablet, Tv } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faAndroid,
  faApple,
  faChrome,
  faEdge,
  faFirefoxBrowser,
  faInternetExplorer,
  faLinux,
  faOpera,
  faSafari,
  faUbuntu,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";

config.autoAddCss = false;

export type TechKind = "browser" | "os" | "device";

// Ordered [substring-to-match, icon, color]. First match wins (lowercased).
const BROWSERS: [string, IconDefinition, string][] = [
  ["edge", faEdge, "#0C88DA"],
  ["chrome", faChrome, "#4285F4"],
  ["safari", faSafari, "#1B88F4"],
  ["firefox", faFirefoxBrowser, "#FF7139"],
  ["opera", faOpera, "#FF1B2D"],
  ["internet explorer", faInternetExplorer, "#0076D6"],
];

const OSES: [string, IconDefinition, string][] = [
  ["windows", faWindows, "#0078D6"],
  ["android", faAndroid, "#3DDC84"],
  ["ubuntu", faUbuntu, "#E95420"],
  ["linux", faLinux, "currentColor"],
  ["macintosh", faApple, "currentColor"],
  ["mac os", faApple, "currentColor"],
  ["ios", faApple, "currentColor"],
  ["ipados", faApple, "currentColor"],
];

function match(label: string, table: [string, IconDefinition, string][]) {
  const low = label.toLowerCase();
  return table.find(([key]) => low.includes(key));
}

export function TechIcon({ kind, label }: { kind: TechKind; label: string }) {
  if (kind === "device") {
    const low = label.toLowerCase();
    const cls = "size-4 shrink-0 text-muted-foreground";
    if (low.includes("mobile") || low.includes("phone"))
      return <Smartphone className={cls} aria-hidden />;
    if (low.includes("tablet"))
      return <Tablet className={cls} aria-hidden />;
    if (low.includes("tv")) return <Tv className={cls} aria-hidden />;
    return <Monitor className={cls} aria-hidden />; // desktop / default
  }

  const hit = match(label, kind === "browser" ? BROWSERS : OSES);
  if (hit) {
    const [, icon, color] = hit;
    return (
      <FontAwesomeIcon
        icon={icon}
        className="h-4 w-4 shrink-0"
        style={{ color }}
        aria-hidden
      />
    );
  }

  // Unknown browser/OS → neutral fallback.
  return <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
}
