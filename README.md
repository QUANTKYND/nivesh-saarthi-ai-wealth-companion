# AI Digital Wealth Management MVP

TypeScript monorepo for an AI-powered digital wealth management MVP. The app demonstrates a bank-grade avatar wealth advisor with dashboard insights, spending analysis, goals, risk profiling, rule-based recommendations, advisor chat, human handoff, and audit/compliance guardrails.

## Workspace

- `apps/wealth-web` - React, Vite, TypeScript, MUI frontend.
- `apps/wealth-api` - NestJS backend.
- `packages/shared-types` - Shared DTOs and TypeScript types built with `tsdown`.
- `docs` - Markdown architecture and MVP notes.

## Getting Started

```bash
pnpm install
pnpm dev
```

The wealth web dashboard calls the API at `http://localhost:3000/api` by default.
Override this for another backend host with:

```bash
VITE_API_BASE_URL=http://localhost:3000/api pnpm dev:web
```

Frontend: `http://localhost:5173`

Backend Swagger: `http://localhost:3000/api/docs`

## Demo Flow

Use the in-app demo mode panel to walk through the hackathon story in about 5 minutes:

1. Select Nisha Rao from the persona switcher.
2. Review the wealth dashboard and avatar insight.
3. Ask "Can I invest Rs 10,000 per month?"
4. Review or create a goal.
5. Review or retake the risk profile.
6. Generate a recommendation for the selected goal.
7. Request an advisor callback.
8. Open the advisor callback admin summary.

Detailed presenter notes are in `docs/demo-script.md`.

## Screenshots

Manual screenshot capture guidance is in `docs/screenshots/README.md`. Capture dashboard, advisor chat, goal planner, risk profile, recommendation, and advisor callback/admin views for submission materials.

## Scripts

- `pnpm dev` - Run web and API development servers.
- `pnpm dev:web` - Run only the Vite frontend.
- `pnpm dev:api` - Run only the NestJS backend.
- `pnpm build` - Build all workspaces.
- `pnpm lint` - Lint all workspaces.
- `pnpm typecheck` - Type-check all workspaces.
- `pnpm format` - Format the repository with Prettier.

## API Testing

When the API is running, open Swagger UI at:

```txt
http://localhost:3000/api/docs
```

The OpenAPI JSON document is available at:

```txt
http://localhost:3000/api/docs-json
```

## Environment

Copy each `.env.example` file to `.env` in the same directory when local values are needed.
