import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getAuthUrl, isOAuthConfigured } from "@/lib/ga-oauth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  if (!isOAuthConfigured()) {
    return NextResponse.redirect(new URL("/connect?error=not_configured", req.url));
  }

  const state = randomUUID();
  const res = NextResponse.redirect(getAuthUrl(state));
  // CSRF: bind the callback to this browser via a short-lived cookie.
  res.cookies.set("ga_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
