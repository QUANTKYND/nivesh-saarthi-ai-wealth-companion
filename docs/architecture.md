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

## Demo Experience

The frontend presents the advisor inside a mobile-first bank shell. The dashboard is the primary workspace, with a persona switcher for the three seeded customers and a guided demo panel that routes evaluators through avatar chat, goals, risk profiling, recommendations, advisor callback, and the admin handoff summary.

All demo journey data is loaded from backend APIs. The frontend does not calculate financial recommendations, risk categories, or compliance outcomes.

# Compliance Layer

The MVP centralizes safety checks in `ComplianceGuardrailService` so chat, recommendation, and handoff flows can share a single policy surface.

Key behaviors:

- Blocks crypto, stock-tip, and guaranteed-return queries.
- Requires risk profile and goal context before market-linked recommendations.
- Enforces bank-approved disclaimers on recommendation responses.
- Emits audit logs for customer-facing advisor workflows.

The compliance layer is intentionally deterministic and does not rely on an LLM. It is used to keep supportable advice inside the approved product set and to route complex cases to a human advisor.
