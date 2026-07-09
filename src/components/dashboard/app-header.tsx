import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Feather } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/funnel", label: "Funnel" },
  { href: "/connect", label: "Your websites" },
];

/** Shared top navigation, used by every signed-in page so the navbar stays consistent. */
export function AppHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Feather className="size-4" aria-hidden />
          </span>
          Featherlytics
        </Link>
        <nav className="flex items-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                active === item.href
                  ? "text-sm font-medium text-foreground"
                  : "text-sm text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
