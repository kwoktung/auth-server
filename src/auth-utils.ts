import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getServerlessDb } from "./db";

export function makeAuth(env: CloudflareBindings) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS ? [env.BETTER_AUTH_TRUSTED_ORIGINS] : undefined,
    database: drizzleAdapter(getServerlessDb(env), {
      provider: "sqlite",
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}

// Used at runtime in Cloudflare Workers — creates a fresh DB + auth per request
export const createAuth = (env: CloudflareBindings) => makeAuth(env);
