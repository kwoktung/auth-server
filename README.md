# auth-server

A lightweight authentication server built with [Hono](https://hono.dev/) and [better-auth](https://www.better-auth.com/), deployed on Cloudflare Workers with D1 as the database.

## Features

- Google OAuth sign-in via better-auth
- Session management
- Drizzle ORM with Cloudflare D1 (SQLite)

## Setup

Install dependencies:

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in your credentials:

```
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Apply database migrations locally:

```bash
pnpm db:migrate
```

## Development

```bash
pnpm dev
```

To trigger Google OAuth without a UI, visit:

```
http://localhost:5173/login?callbackURL=/me
```

## Deployment

```bash
pnpm deploy
```

Apply migrations to the remote D1 database:

```bash
pnpm db:migrate:remote
```
