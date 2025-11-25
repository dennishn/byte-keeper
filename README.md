# Byte Keeper

Internal tool for capturing Slack-shared links, enriching them with AI, and assembling a monthly newsletter. The stack is Next.js 16 (App Router, Cache Components), Neon/Postgres, Vercel AI SDK, Vercel Workflow DevKit, Resend, and Slack.

## Prerequisites

- Node.js 18.18+ (recommended 20.x)
- npm 10+
- Access to a Neon project (or any Postgres-compatible connection string)
- Slack app credentials with `reaction_added` event subscriptions

## Quick Start

```bash
npm install
cp env.example .env.local  # then edit values
npm run dev
```

Visit `http://localhost:3000` to verify the app boots. A health endpoint is provided at `/api/health` and will fail unless the database connection succeeds.

## Environment Variables

Set these in `.env.local` (see `env.example` for a template):

| Name                        | Required  | Description                                                                   | Default                 |
| --------------------------- | --------- | ----------------------------------------------------------------------------- | ----------------------- |
| `DATABASE_URL`              | ✅        | Neon/Postgres connection string used by server-only `lib/db`.                 | —                       |
| `SLACK_SIGNING_SECRET`      | ✅        | Used to verify incoming Slack events.                                         | —                       |
| `SLACK_BOT_TOKEN`           | ✅        | Bot token for calling Slack Web API.                                          | —                       |
| `SLACK_APPROVAL_CHANNEL_ID` | ✅        | Channel ID where approval notifications are sent.                             | —                       |
| `SLACK_CAPTURE_EMOJI`       | defaulted | Emoji (without colons) that triggers ingestion when reacted.                  | `bookmark`              |
| `OPENAI_API_KEY`            | ✅        | Used by the Vercel AI SDK to enrich link metadata.                            | —                       |
| `OPENAI_MODEL`              | defaulted | LLM name (e.g., `gpt-4o-mini`) used for enrichment.                           | `gpt-4o-mini`           |
| `RESEND_API_KEY`            | ✅        | Sends approval emails through Resend.                                         | —                       |
| `ADMIN_API_TOKEN`           | ✅        | Bearer token required for protected admin APIs.                               | —                       |
| `EMAIL_FROM`                | ✅        | Sender email (e.g., `Byte Keeper <newsletter@example.com>`).                  | —                       |
| `EMAIL_RECIPIENT_LIST`      | ✅        | Comma-separated list of approval recipients. Parsed into an array at runtime. | —                       |
| `NEXT_PUBLIC_APP_BASE_URL`  | defaulted | Used for building absolute links in the UI + workflows.                       | `http://localhost:3000` |

`src/lib/env.ts` validates these variables on boot and throws with a helpful error if any are missing or malformed.

## Health Checks & Observability

- `GET /api/health`: verifies DB connectivity through the cached Neon client (`lib/db.ts`). Returns HTTP 200 when healthy, 503/500 otherwise.
- Log statements for failed health checks are emitted via `console.error` to keep things visible both locally and on Vercel.

## Scripts

| Command               | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `npm run dev`         | Next.js dev server (Turbopack).                         |
| `npm run build`       | Production build (Turbopack).                           |
| `npm run lint`        | ESLint with repo rules.                                 |
| `npm run typecheck`   | Type generation + `tsc`.                                |
| `npm run db:generate` | Generate the Prisma client from `prisma/schema.prisma`. |
| `npm run db:migrate`  | Apply SQL migrations to the current database.           |
| `npm run db:seed`     | Insert the default link/newsletter/tag sample data.     |
| `npm run format`      | Prettier for the entire repo.                           |

## Database Workflow

1. Update `DATABASE_URL` in `.env.local` to point at your Neon database or a local Postgres instance.
2. Run `npm run db:generate` any time the Prisma schema changes.
3. Apply migrations locally with `npm run db:migrate` (this executes `prisma migrate deploy`).
4. Seed a sample link + newsletter with `npm run db:seed`. The script is located at `scripts/seed.ts` and is safe to run repeatedly (`upsert` semantics).

Generated SQL lives under `prisma/migrations`, so you can inspect it before deploying to shared environments.

## Admin APIs

All admin endpoints require `Authorization: Bearer ${ADMIN_API_TOKEN}`.

| Route                               | Description                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `POST /api/links`                   | Manually queues a link for ingestion. Payload requires `url`, `slackMessageTs`, `slackChannelId`, and `slackUserId`. |
| `POST /api/newsletters/generate`    | Triggers the monthly newsletter workflow. Optional payload `{ "targetMonth": "2025-01" }` picks a specific window.   |
| `POST /api/newsletters/:id/approve` | Sends the draft via Resend and marks it as published. Include header `x-approver` with your name.                    |

## Architectural Notes

- `next.config.ts` enables `cacheComponents` to opt into Cache Components and wraps the config with `withWorkflow` for Vercel Workflow DevKit integration.
- Database access lives in `src/lib/db.ts`, which exposes a cached Neon client and a `runDatabaseHealthcheck` helper used by API routes/workflows.
- Environment validation is centralized in `src/lib/env.ts` so that workflows, API routes, and server components share the same schema.
- Querystring parsing on the links page uses a lightweight nuqs-compatible helper in `src/lib/nuqs/server.ts`, which can be swapped for the upstream package at any time.

## Testing

Run the lightweight unit tests with:

```bash
npm run test
```

This currently exercises core utilities like the HTML metadata parser; extend the suite as workflows evolve.

For more context on the long-term roadmap, see `highlevel-plan.md` and `/byte.plan.md`.
