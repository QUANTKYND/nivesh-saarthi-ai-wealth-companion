# Repository Setup

### Goal: Create a clean monorepo for frontend and backend

Create a TypeScript monorepo for an AI-powered Digital Wealth Management MVP.

Structure:

- apps/wealth-web: React + Vite + TypeScript + MUI frontend
- apps/wealth-api: NestJS backend
- packages/shared-types: shared DTOs and TypeScript types
- docs: architecture and MVP notes

Set up:

- ESLint
- Prettier
- TypeScript path aliases
- basic README
- .env.example files
- local development scripts

Do not implement business features yet.

Use `pnpm` as the package manager.

Use vite's create command to create React + Vite + TypeScript. Do not manually setup. Then install MUI, Tanstack Query, Tanstack Table, Tanstack Form, and other required libraries

Use Nest.JS cli to create the backend

Use tsdown to create the shared types package

All docs must be in Markdown.

### Acceptance Criteria

- Frontend runs locally.
- Backend runs locally.
- Shared types package is importable.
- README has startup instructions.
