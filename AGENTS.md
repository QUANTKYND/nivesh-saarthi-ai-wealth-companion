## Project Context

This project is an AI-powered Digital Wealth Management MVP for a banking hackathon.

The product is an avatar-based AI wealth advisor that integrates into a bank mobile app and provides personalized, compliant, bank-approved wealth guidance.

The MVP should demonstrate:

- Customer wealth dashboard
- Spending behaviour analysis
- Goal-based planning
- Risk profiling
- Rule-based recommendations
- Avatar-based advisor chat
- Human advisor handoff
- Audit logs and compliance guardrails

The solution should feel like a bank-grade mobile wealth advisor, not a generic chatbot.

---

## Repository Structure

Expected root-level structure:

```txt
apps/
  wealth-web/
  wealth-api/

docs/
  milestones/
  milestone-status/
  architecture.md
  api-contracts.md
  mvp-checklist.md

packages/
  shared-types/

.gitignore
.prettierignore
.prettierrc
AGENTS.md
eslint.config.mjs
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
tsconfig.base.json
```

---

## Milestone Documents

All implementation milestones are documented in:

```txt
docs/milestones/
```

Before implementing any feature, always inspect the relevant milestone document from `docs/milestones`.

Each milestone document is the source of truth for:

- Feature scope
- Backend requirements
- Frontend requirements
- API expectations
- Acceptance criteria
- Testing expectations
- Demo-readiness expectations

Do not invent major functionality outside the milestone unless it is necessary to satisfy the milestone acceptance criteria.

---

## Milestone Status Tracking

For every milestone implemented, update or create a corresponding status document inside:

```txt
docs/milestone-status/
```

Use the same milestone number/name as the source milestone document.

Example:

```txt
docs/milestones/milestone-03-spending-insights.md
docs/milestone-status/milestone-03-spending-insights-status.md
```

Each milestone status document must track:

```md
# Milestone Status: <Milestone Name>

## Implementation Status

Status: Not Started | In Progress | Completed | Blocked

### Completed

- [ ] Item 1
- [ ] Item 2

### Pending

- [ ] Item 1
- [ ] Item 2

### Blockers

- None

---

## Testing Status

Status: Not Started | In Progress | Passing | Failing | Not Applicable

### Tests Added

- [ ] Unit tests
- [ ] Integration tests
- [ ] Frontend component tests
- [ ] API tests

### Test Notes

Describe what was tested and what still needs coverage.

---

## Production Readiness Status

Status: Not Ready | Partially Ready | Ready for Demo | Production Ready

### Readiness Checklist

- [ ] Handles loading states
- [ ] Handles empty states
- [ ] Handles error states
- [ ] Uses shared DTOs/types
- [ ] No hardcoded business logic in frontend
- [ ] API responses are validated or typed
- [ ] Guardrails/disclaimers applied where required
- [ ] Audit logging added where required
- [ ] Sensitive data is not logged unnecessarily
- [ ] Feature is responsive/mobile-friendly
- [ ] README/docs updated if needed

---

## Notes

Add implementation notes, known limitations, and follow-up work.
```

The milestone is not considered complete until its status document is updated.

---

## Tech Stack

### Frontend

- React
- TypeScript
- MUI
- RTK Query or TanStack Query
- Recharts
- Mobile-first responsive UI

### Backend

- NestJS
- TypeScript
- REST APIs
- In-memory repositories for MVP
- Optional database later

### Shared

- Shared DTOs and domain types must live in:

```txt
packages/shared-types
```

Frontend and backend should import common DTOs from `packages/shared-types` instead of duplicating types.

---

## Implementation Rules

- Follow the milestone documents in `docs/milestones`.
- Update milestone progress in `docs/milestone-status`.
- Do not hardcode business data inside React components.
- All customer, goal, spending, risk, recommendation, and advisor data must come from backend APIs.
- Keep recommendation logic rule-based and deterministic.
- The LLM must not directly recommend unsupported financial products.
- Every recommendation must include reasoning and disclaimer.
- Every advisor chat and recommendation must be auditable.
- Do not generate guaranteed return claims.
- Do not recommend individual stocks, crypto, or unapproved products.
- Use clean, reusable MUI components.
- Create shared frontend components if used in more than one screen.
- Add loading, empty, and error states for all API-driven screens.
- Keep the app responsive and mobile-first.
- Update the MVP checklist after completing each feature.

---

## AI and Recommendation Safety Rules

The AI advisor must operate through controlled backend services.

Allowed internal capabilities:

- Fetch customer wealth profile
- Fetch spending summary
- Fetch goals
- Create goal
- Run risk profile
- Generate recommendation
- Explain recommendation
- Request advisor callback

The AI must not:

- Recommend products outside the approved catalog
- Promise or imply guaranteed returns
- Give individual stock tips
- Recommend crypto
- Provide legal or tax advice beyond generic guidance
- Bypass risk profiling for market-linked recommendations
- Hide risk warnings or disclaimers

For complex, high-value, unclear, or sensitive advice, the system should recommend human advisor handoff.

---

## UX Direction

The app should feel like a bank-grade mobile wealth advisor.

Important UI sections:

- Avatar advisor card
- Wealth readiness score
- Income, expense, and surplus cards
- Spending insights
- Goal planner
- Risk profile wizard
- Recommendation card
- Advisor callback flow
- Admin/advisor handoff dashboard

The avatar should be the primary entry point into the wealth journey.

---

## Testing Requirements

Add tests wherever business logic exists.

Required test areas:

- Financial calculations
- Spending insight generation
- Goal projection calculations
- Risk profile scoring
- Recommendation rules
- Compliance guardrails
- Advisor chat intent handling
- API response shape where practical

Backend business logic should be deterministic and testable without requiring an LLM API key.

---

## Documentation Requirements

Maintain these documents:

```txt
README.md
docs/architecture.md
docs/api-contracts.md
docs/mvp-checklist.md
docs/milestones/
docs/milestone-status/
```

When completing a milestone, update:

1. The matching file in `docs/milestone-status`
2. `docs/mvp-checklist.md`
3. API docs if endpoints were added or changed
4. README if setup, scripts, env vars, or demo flow changed

---

## Development Workflow

For each milestone:

1. Read the milestone document from `docs/milestones`.
2. Inspect existing code before making changes.
3. Implement the smallest complete vertical slice.
4. Add or update shared types.
5. Add backend tests for business logic.
6. Add frontend loading, empty, and error states.
7. Run lint, typecheck, and tests.
8. Update the milestone status document in `docs/milestone-status`.
9. Update the MVP checklist.
10. Summarize what changed and what remains.

---

## Production-Readiness Expectations

A feature is only demo-ready when:

- It works through real backend APIs
- It has typed DTOs
- It handles errors gracefully
- It has clear UI feedback
- It has no obvious placeholder logic visible to users
- It includes disclaimers where financial guidance is shown
- It is auditable if it involves advisor chat or recommendations
- It is documented in milestone status

For MVP, “production-ready” means suitable for a controlled demo and hackathon evaluation, not fully bank-production certified.

---

## Naming Conventions

Use clear enterprise-style names.

Examples:

- `WealthDashboard`
- `AdvisorChat`
- `GoalPlanner`
- `RiskProfileWizard`
- `RecommendationEngine`
- `ComplianceGuardrailService`
- `AdvisorCallbackService`
- `AuditLogService`

Avoid vague names like:

- `Helper`
- `CommonService`
- `DataThing`
- `TempComponent`

---

## Demo Goal

The final MVP should support this demo flow:

1. Open mock bank mobile shell.
2. Enter the Digital Wealth Advisor.
3. Show wealth dashboard.
4. Avatar identifies idle balance and investable surplus.
5. User asks: “Can I invest ₹10,000 per month?”
6. Avatar explains affordability using income, expense, surplus, and EMI burden.
7. User creates a child education or wealth creation goal.
8. User completes risk profile.
9. System generates recommendation.
10. Recommendation shows allocation, reasoning, suitability, and disclaimer.
11. User requests advisor callback.
12. Admin/advisor sees summarized callback request.

The core story is:

```txt
customer data → insight → goal → suitability → recommendation → human handoff
```
