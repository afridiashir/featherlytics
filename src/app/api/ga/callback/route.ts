import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { exchangeCode } from "@/lib/ga-oauth";
import { saveRefreshToken } from "@/lib/ga-store";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("ga_oauth_state")?.value;

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/connect?error=denied", req.url));
  }
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/connect?error=state", req.url));
  }

  let refreshToken: string | null = null;
  try {
    refreshToken = await exchangeCode(code);
  } catch {
    return NextResponse.redirect(new URL("/connect?error=exchange", req.url));
  }
  if (!refreshToken) {
    // Happens if the user had already granted access without a fresh consent.
    return NextResponse.redirect(new URL("/connect?error=no_refresh", req.url));
  }

  await saveRefreshToken(userId, refreshToken);

  const res = NextResponse.redirect(new URL("/connect", req.url));
  res.cookies.delete("ga_oauth_state");
  return res;
}
