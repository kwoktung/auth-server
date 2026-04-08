import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getServerlessDb } from "./db";

export function makeAuth(env: CloudflareBindings) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: (request?: Request) => {
      const origins = env.BETTER_AUTH_TRUSTED_ORIGINS ? [env.BETTER_AUTH_TRUSTED_ORIGINS] : [];
      const origin = request?.headers.get("origin");
      if (origin) {
        try {
          const { hostname } = new URL(origin);
          if (hostname === "localhost" || hostname === "127.0.0.1") {
            origins.push(origin);
          }
        } catch {
          // ignore malformed origin
        }
      }
      return origins;
    },
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
      },
    },
  });
}

// Used at runtime in Cloudflare Workers — creates a fresh DB + auth per request
export const createAuth = (env: CloudflareBindings) => makeAuth(env);
