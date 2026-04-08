import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getServerlessDb } from "./db";

// Returns the shared cookie domain for 3-level hostnames (e.g. auth.example.com → .example.com)
// so session cookies are accessible across all subdomains.
// Returns undefined for localhost or non-3-level hostnames — no domain attribute will be set.
function getCookieDomain(baseURL: string): string | undefined {
  try {
    const { hostname } = new URL(baseURL);
    if (hostname === "localhost" || hostname === "127.0.0.1") return undefined;
    const parts = hostname.split(".");
    if (parts.length === 3) return `.${parts[1]}.${parts[2]}`;
  } catch {
    // ignore malformed URL
  }
  return undefined;
}

// Trusts any subdomain of the shared cookie domain (e.g. *.example.com)
// when BETTER_AUTH_URL is a 3-level hostname like auth.example.com.
function getTrustedOrigins(cookieDomain: string | undefined, request?: Request): string[] {
  const origins: string[] = [];
  const origin = request?.headers.get("origin");
  if (origin) {
    try {
      const { hostname } = new URL(origin);
      if (cookieDomain && hostname.endsWith(cookieDomain)) {
        origins.push(origin);
      }
    } catch {
      // ignore malformed origin
    }
  }
  return origins;
}

export function makeAuth(env: CloudflareBindings) {
  const cookieDomain = getCookieDomain(env.BETTER_AUTH_URL);

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: (request?: Request) => getTrustedOrigins(cookieDomain, request),
    database: drizzleAdapter(getServerlessDb(env), {
      provider: "sqlite",
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    advanced: {
      cookies: {
        state: {
          attributes: {
            sameSite: "none",
            secure: true,
          },
        },
        ...(cookieDomain && {
          session_token: { attributes: { domain: cookieDomain } },
        }),
      },
    },
  });
}

// Used at runtime in Cloudflare Workers — creates a fresh DB + auth per request
export const createAuth = (env: CloudflareBindings) => makeAuth(env);
