# auth-server

A centralized authentication server built with Hono and better-auth, deployed on Cloudflare Workers. It handles social login (Google OAuth), session management, and exposes auth APIs for downstream services.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Auth**: better-auth
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Package manager**: pnpm

## Adding New Environment Variables

`worker-configuration.d.ts` is **auto-generated** — never edit it directly.

To add a new env variable:
1. Add it to `.env`
2. Run `pnpm cf-typegen` to regenerate `worker-configuration.d.ts`
