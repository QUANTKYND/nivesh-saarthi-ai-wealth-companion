# AI Digital Wealth Management MVP

TypeScript monorepo for an AI-powered digital wealth management MVP. This scaffold sets up the application boundaries, shared types package, local development scripts, linting, formatting, and documentation placeholders. Business features are intentionally not implemented yet.

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

## Scripts

- `pnpm dev` - Run web and API development servers.
- `pnpm dev:web` - Run only the Vite frontend.
- `pnpm dev:api` - Run only the NestJS backend.
- `pnpm build` - Build all workspaces.
- `pnpm lint` - Lint all workspaces.
- `pnpm typecheck` - Type-check all workspaces.
- `pnpm format` - Format the repository with Prettier.

## Environment

Copy each `.env.example` file to `.env` in the same directory when local values are needed.
