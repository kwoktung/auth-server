import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getServerlessDb } from "./db";

// Derives the shared parent domain from the auth server's base URL so that session cookies
// are readable by all sibling subdomains (e.g. auth.example.com → .example.com).
// For localhost / 127.0.0.1 the hostname itself is returned so local dev works without a
// domain attribute that browsers would reject.
// Returns undefined for anything else (e.g. bare apex or deeper hostnames) so no domain
// attribute is set and the cookie is scoped to the exact origin.
function deriveSharedParentDomain(baseURL: string): string | undefined {
  let hostname: string;
  try {
    hostname = new URL(baseURL).hostname;
  } catch {
    return undefined; // malformed URL — omit domain attribute
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return hostname; // local dev: return as-is so cookies are still scoped correctly
  }

  const hostnameParts = hostname.split(".");
  const isSubdomainOfApex = hostnameParts.length === 3; // e.g. auth.example.com
  if (isSubdomainOfApex) {
    const [, apexDomain, tld] = hostnameParts;
    return `.${apexDomain}.${tld}`; // e.g. .example.com — shared across all subdomains
  }

  return undefined;
}

// Trusts any subdomain of the shared cookie domain (e.g. *.example.com)
// when BETTER_AUTH_URL is a 3-level hostname like auth.example.com.
function getTrustedOrigins(sharedParentDomain: string | undefined, request?: Request): string[] {
  const origins: string[] = [];
  const origin = request?.headers.get("origin");
  if (origin) {
    try {
      const { hostname } = new URL(origin);
      if (sharedParentDomain && hostname.endsWith(sharedParentDomain)) {
        origins.push(origin);
      }
    } catch {
      // ignore malformed origin
    }
  }
  return origins;
}

export function makeAuth(env: CloudflareBindings) {
  const sharedParentDomain = deriveSharedParentDomain(env.BETTER_AUTH_URL);

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: (request?: Request) => getTrustedOrigins(sharedParentDomain, request),
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
      crossSubDomainCookies: {
        enabled: true,
        domain: sharedParentDomain,
      }, // ensure cookies are set with the correct domain attribute for cross-subdomain usage
    },
  });
}

// Used at runtime in Cloudflare Workers — creates a fresh DB + auth per request
export const createAuth = (env: CloudflareBindings) => makeAuth(env);
