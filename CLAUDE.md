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

## Generated Files

### Database Schema (`src/db/schema.ts`)

`src/db/schema.ts` is **auto-generated** — never edit it directly.

To modify the schema, update the better-auth plugin/table config in the `makeAuth` method in `src/auth-utils.ts`, then run:
```
pnpm run auth:generate
```

### Database Migrations (`src/db/migrations/`)

Files in `src/db/migrations/` are **auto-generated** — never edit them directly.

To generate new migrations, run:
```
pnpm run db:generate
```
