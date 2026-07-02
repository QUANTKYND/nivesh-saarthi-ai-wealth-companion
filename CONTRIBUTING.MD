# Contributing to Nivesh Saarthi AI Wealth Companion

Thank you for contributing to this AI-powered Digital Wealth Management MVP. We welcome code contributions, bug reports, feature requests, test improvements, and documentation updates.

By participating in this project, you agree to follow the repository instructions in `AGENTS.md`, keep the implementation milestone-driven, and maintain the project’s banking-grade safety and compliance expectations.

---

## Project Context

This is a pnpm TypeScript monorepo for a banking hackathon MVP:

- `apps/wealth-web` - React, Vite, TypeScript, MUI frontend.
- `apps/wealth-api` - NestJS backend.
- `packages/shared-types` - shared DTOs and domain types.
- `docs` - architecture, API contracts, milestone docs, and milestone status tracking.

Backend APIs are available under `/api`. When the API is running, Swagger is available at:

```txt
http://localhost:3000/api/docs
```

---

## Git Branch Naming Conventions

All branches must follow this prefix structure:

```txt
<type>/<short-description>
```

### Standard Prefixes

- `feature/` - New features or enhancements.
  - Example: `feature/wealth-dashboard-api`
- `bugfix/` - Fixes for bugs or unexpected behavior.
  - Example: `bugfix/fix-risk-score`
- `hotfix/` - Urgent critical production patches only.
  - Example: `hotfix/swagger-startup`
- `docs/` - Documentation, README, API contract, or milestone-status updates.
  - Example: `docs/update-api-contracts`
- `refactor/` - Internal code restructuring without changing external behavior.
  - Example: `refactor/split-dashboard-service`

### Branch Guidelines

- Use lowercase letters only.
- Use hyphens to separate words.
- Do not use spaces or underscores.
- Keep descriptions short and clear.

---

## Development Workflow

The `master` branch is locked. All changes must go through pull requests.

### 1. Fork and Clone

Fork the repository and clone your fork:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install Dependencies

Use pnpm:

```bash
pnpm install
```

### 3. Create a Branch

Start from the latest `master`:

```bash
git checkout master
git pull origin master
git checkout -b feature/your-feature-name
```

### 4. Run Locally

Start both the frontend and backend:

```bash
pnpm dev
```

Or run each app separately:

```bash
pnpm dev:web
pnpm dev:api
```

### 5. Make Changes

Follow these project rules:

- Read `AGENTS.md` before starting feature work.
- Read the relevant file in `docs/milestones/` before implementing a milestone.
- Update or create the matching status file in `docs/milestone-status/`.
- Update `docs/api-contracts.md` when API behavior changes.
- Update `docs/mvp-checklist.md` when a milestone item is completed.
- Put shared DTOs and domain types in `packages/shared-types`.
- Do not duplicate shared API/domain types inside apps.
- Do not hardcode business data in React components.
- Keep recommendation logic deterministic, auditable, and compliant.

### 6. Validate Before Committing

Run the full verification set before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm --filter @wealth/api test
pnpm --filter @wealth/api test:e2e
pnpm build
pnpm format:check
```

Use `pnpm format` to fix formatting issues.

### 7. Commit Your Changes

Use clear commit messages that explain what changed:

```bash
git commit -m "feat: add wealth dashboard backend api"
```

Recommended prefixes:

- `feat:` for feature work.
- `fix:` for bug fixes.
- `docs:` for documentation-only changes.
- `refactor:` for behavior-preserving restructuring.
- `test:` for test additions or fixes.
- `chore:` for tooling or maintenance.

### 8. Open a Pull Request

Push your branch:

```bash
git push origin feature/your-feature-name
```

Then open a pull request against `master` and include:

- What changed.
- Which milestone or issue it relates to.
- How it was tested.
- Any known limitations or follow-up work.

---

## Code Review and Merging

- Automated checks must pass before review.
- At least one maintainer or administrator must approve the PR.
- Direct pushes to `master` are blocked.
- Keep PRs focused; avoid mixing unrelated frontend, backend, and documentation work unless the milestone requires it.
- Do not merge incomplete milestone work unless the milestone status document clearly marks it as `In Progress` or `Blocked`.

---

## Safety and Compliance Expectations

This project represents a bank-grade wealth advisor MVP. Contributions must not:

- Promise or imply guaranteed returns.
- Recommend individual stocks, crypto, or unapproved products.
- Bypass risk profiling for market-linked recommendations.
- Hide risk warnings or disclaimers.
- Log sensitive customer data unnecessarily.
- Move business logic into frontend components.

When in doubt, keep behavior conservative, explicit, typed, and auditable.
