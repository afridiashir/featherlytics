"use client";

import { useState } from "react";
import { Globe, Sparkles } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faFacebookF,
  faGithub,
  faGoogle,
  faInstagram,
  faLinkedinIn,
  faPinterestP,
  faReddit,
  faTelegram,
  faTiktok,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

import { brandForDomain } from "@/lib/referrer";

// We import the core CSS ourselves, so stop Font Awesome injecting it at runtime.
config.autoAddCss = false;

const BRANDS: Record<string, { icon: IconDefinition; color: string }> = {
  google: { icon: faGoogle, color: "#4285F4" },
  instagram: { icon: faInstagram, color: "#E4405F" },
  facebook: { icon: faFacebookF, color: "#1877F2" },
  twitter: { icon: faXTwitter, color: "currentColor" },
  reddit: { icon: faReddit, color: "#FF4500" },
  youtube: { icon: faYoutube, color: "#FF0000" },
  linkedin: { icon: faLinkedinIn, color: "#0A66C2" },
  tiktok: { icon: faTiktok, color: "currentColor" },
  pinterest: { icon: faPinterestP, color: "#BD081C" },
  github: { icon: faGithub, color: "currentColor" },
  whatsapp: { icon: faWhatsapp, color: "#25D366" },
  telegram: { icon: faTelegram, color: "#26A5E4" },
};

/**
 * Icon for a referrer, in priority order:
 *   1. Font Awesome brand icon for known social/tech sites.
 *   2. The site's favicon (Google favicon service).
 *   3. A globe icon for direct traffic / unknown or failed lookups.
 */
export function SiteIcon({ domain }: { domain: string | null }) {
  const [failed, setFailed] = useState(false);

  // Seltrax (own store) → spark icon.
  if (domain && (domain === "seltrax.com" || domain.endsWith(".seltrax.com"))) {
    return (
      <Sparkles
        className="size-4 shrink-0 fill-current text-[#2a78d6] dark:text-[#3987e5]"
        aria-hidden
      />
    );
  }

  const brand = BRANDS[brandForDomain(domain) ?? ""];
  if (brand) {
    return (
      <FontAwesomeIcon
        icon={brand.icon}
        className="h-4 w-4 shrink-0"
        style={{ color: brand.color }}
        aria-hidden
      />
    );
  }

  if (!domain || failed) {
    return <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      className="size-4 shrink-0 rounded-[3px]"
      onError={() => setFailed(true)}
    />
  );
}
