import "server-only";
import { OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

function config() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function isOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REDIRECT_URI &&
      !process.env.GOOGLE_OAUTH_CLIENT_ID.startsWith("REPLACE_"),
  );
}

/** Google consent URL — offline access + forced consent so we always get a refresh token. */
export function getAuthUrl(state: string): string {
  const { clientId, clientSecret, redirectUri } = config();
  const client = new OAuth2Client({ clientId, clientSecret, redirectUri });
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  });
}

/** Exchange an auth code for tokens; returns the refresh token (or null). */
export async function exchangeCode(code: string): Promise<string | null> {
  const { clientId, clientSecret, redirectUri } = config();
  const client = new OAuth2Client({ clientId, clientSecret, redirectUri });
  const { tokens } = await client.getToken(code);
  return tokens.refresh_token ?? null;
}

/** An OAuth2 client bound to a stored refresh token (auto-refreshes access tokens). */
export function userAuthClient(refreshToken: string): OAuth2Client {
  const { clientId, clientSecret } = config();
  const client = new OAuth2Client({ clientId, clientSecret });
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
