# Project Plan: Byte Keeper

Always do one step at a time - and allow for the user to verify and QA the implementation before moving on to the next step.

Use Next.js Cache Components.

## 0. High-Level Goal

Build an internal tool that:

- Ingests Slack links (emoji reaction → webhook).
- Scrapes + summarizes via AI.
- Stores everything in Neon.
- Generates a monthly AI newsletter draft (workflow SDK & "cron" type job).
- Notifies via Slack for approval.
- Provides UI for newsletter previews + approval, and a searchable link index.

Tech constraints: Next.js 16, Vercel AI SDK, Vercel Workflow DevKit, Neon, Slack App, Hosted on Vercel.

## 1. Project Setup & Infra

### Tasks

- Configure environment vars:
    - SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN
    - SLACK_APPROVAL_CHANNEL_ID
    - EMAIL_FROM, EMAIL_RECIPIENT_LIST
    - NEXT_PUBLIC_APP_BASE_URL

### Acceptance Criteria

- App boots.
- DB connection test succeeds.

## 2. Database Schema (Neon)

### links

- id (UUID)
- created_at
- shared_at
- slack_message_ts
- slack_channel_id
- shared_by_slack_user_id
- shared_by_display_name
- headline
- summary
- url
- tags (join table)

### newsletters

- id
- month (year + month)
- created_at
- published_at | null
- is_published
- subject
- html_body
- text_body
- link_ids (join table)

### tags

- id
- tag

### Tasks

- Implement schema + migrations.
- Seed DB with test link + newsletter.

### Acceptance Criteria

- Migrations run.
- Insert/select works.

## 3. Slack App & Ingestion Endpoint

Refer to the Slack Web API SDK documentation: https://docs.slack.dev/tools/node-slack-sdk/web-api/

### Tasks

#### Slack App Setup

- Create Slack App.
- Enable Events API.
- Subscribe to reaction_added.
- Set Request URL → /api/slack/events.
- Add bot token + signing secret.

#### Implement /api/slack/events

- Verify Slack request signature.
- Handle URL challenge.
- On reaction_added:
    - If emoji matches → fetch message → extract URL(s).
    - Trigger LinkIngestionWorkflow (via Vercel Workflow DevKit).
- Use slack_message_ts as idempotency key.

#### Idempotency

- Check DB for URL+message TS before processing.

### Acceptance Criteria

- Slack challenge works.
- Test events trigger workflow.

## 4. Link Ingestion Workflow (Scrape → AI → DB)

### Steps inside LinkIngestionWorkflow

- Validate URL.
- Check if exists in DB (idempotency).
- Fetch URL HTML (timeout + size limits).
- Extract:
    - Title (<title>, og:title)
    - Meta description
- AI enrichment (Vercel AI SDK):
    - Produce refined headline
    - 2–3 sentence summary
    - Tags from predefined list
    - Use zod to parse structured output
- Insert into links table.
- Optionally send Slack confirmation thread reply.

### Acceptance Criteria

- Running workflow with a real URL creates a fully enriched Link entry.

## 5. Monthly Newsletter Workflow (Cron → Draft → Slack Notify)

Refer to the Workflow DevKit SDK documentation: https://useworkflow.dev/docs

### Steps inside MonthlyNewsletterWorkflow

- Calculate date range for previous month.
- Fetch all links in that range.
- If none: optional placeholder.
- AI generation:
    - Subject
    - Intro
    - Sections grouped by tag/theme
    - Blurbs per link
- Render HTML + text (shared email template).
- Insert newsletters row (is_published = false).
- Notify me via Slack with preview URL.

### Acceptance Criteria

- Workflow produces DB entry + Slack notification.

## 6. Newsletter Approval & Sending

Refer to the Resend SDK documentation: https://resend.com/docs
Refer to the React Email documentation: https://react.email/components

### Tasks

- Integrate resend email provider
- POST /api/newsletters/[id]/approve:
    - Auth required
    - Load newsletter
    - Send email → update is_published + published_at
- Reuse shared email template.

### Acceptance Criteria

Approving a newsletter sends email + updates DB.

## 7. Web App (RSC, Cache Components, Suspense)

UI comes last.

Use Next.js cahce components.
Use the Next.js MCP server.

### 7.1 Shared Foundations

#### Tasks

- Layout in app/layout.tsx.
- No internal auth - app will be protected by Vercel Deployment Protection for now.
- Data access helpers in lib/db using cache():
    - getNewsletters()
    - getNewsletterById(id)
    - getLinks(filters)

#### Acceptance Criteria

- Server-only DB functions cached correctly.

### 7.2 Newsletter Pages

#### Pages

- app/newsletters/page.tsx
    - Lists published + draft newsletters.
- app/newsletters/[id]/page.tsx
    - Preview using shared email template
    - “Approve & send” button (server action or API call)

#### Acceptance Criteria

- Preview loads.
- Approval works via UI.

### 7.3 Links Index Page

#### Tasks

- app/links/page.tsx:
    - Server component
    - Read URL params: q, tag, shared_by, from, to - use the nuqs library
    - Query Neon via getLinks
- Use <Suspense> for result list.
- Filters update via search params.
- Optional:
    - Top tags
    - Slack deep link to original message

#### Acceptance Criteria

- Sorting/filtering/search works.
- Large lists remain fast via caching.

## 8. Manual API Routes

### Tasks

- POST /api/links
    - Add link manually (auth required).
    - Either call ingestion workflow or reuse internal helpers.
- POST /api/newsletters/generate
    - Manually trigger monthly newsletter workflow.

## 9. Security & Robustness

### Requirements

- Verify Slack signatures.
- All public API inputs validated with zod.
- Idempotency using slack_message_ts + url.
- Proper error handling in workflows.
- Fail gracefully if env vars missing.

## 10. Future Enhancements

- Tag management UI
- Better content extraction (readability)
- Per-user content preferences
- Multi-team support
- Use better-auth and protect web app via Github login
