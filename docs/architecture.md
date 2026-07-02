# Architecture

## Overview

The MVP is organized as a pnpm TypeScript monorepo with separate deployable frontend and backend apps plus a shared package for DTOs and cross-boundary types.

## Projects

- `apps/wealth-web` renders the customer and advisor web experience with React, Vite, TypeScript, MUI, TanStack Query, TanStack Table, and TanStack Form.
- `apps/wealth-api` exposes backend APIs with NestJS.
- `packages/shared-types` publishes shared DTOs and TypeScript contracts using `tsdown`.

## Local Boundaries

- Frontend code imports shared contracts through `@wealth/shared-types`.
- Backend code imports shared contracts through `@wealth/shared-types`.
- App-specific implementation details should stay inside their app package.
- Shared code should remain limited to serializable DTOs, enums, and type helpers.

## Path Aliases

Aliases are defined in the root `tsconfig.base.json`:

- `@wealth/web/*`
- `@wealth/api/*`
- `@wealth/shared-types`
- `@wealth/shared-types/*`
