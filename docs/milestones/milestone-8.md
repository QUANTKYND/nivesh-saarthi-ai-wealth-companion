# Frontend Dashboard

### Goal: Build the main wealth dashboard UI.

Build the Wealth Dashboard frontend using React, TypeScript, MUI, and RTK Query or TanStack Query.

Screen sections:

- header with customer greeting
- avatar advisor card
- wealth readiness score
- income / expense / surplus cards
- savings rate card
- idle balance card
- EMI burden card
- spending breakdown chart
- top insights list
- quick action buttons

Quick actions:

- Ask advisor
- Create goal
- Take risk profile
- View recommendations

### Acceptance Criteria

- Dashboard consumes real backend APIs.
- Loading and error states are handled.
- UI is clean and demo-ready.
- Mock customer switcher exists for 3 personas.

## In Depth

Start Milestone 8: Frontend Dashboard.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 1 through Milestone 7 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Use React, TypeScript, MUI, and TanStack Query.
6. Do not hardcode customer, spending, goal, risk, or recommendation data inside React components.
7. Keep this milestone focused on the main dashboard shell and dashboard data consumption.

Goal:
Build the main bank-grade wealth dashboard frontend as the first screen of the app.

Frontend route:
/

The dashboard should feel like a mobile banking wealth companion, not a landing page or generic chatbot.

Required backend APIs:

- GET /api/customers
- GET /api/customers/:customerId/wealth-profile
- GET /api/customers/:customerId/spending-insights
- GET /api/customers/:customerId/goals
- GET /api/customers/:customerId/risk-profile
- GET /api/customers/:customerId/recommendations

Implementation requirements:

- Create a typed API client with a configurable base URL.
- Create TanStack Query hooks for customer list, wealth profile, spending insights, goals, risk profile, and recommendations.
- Add a mock customer switcher for the three seeded personas.
- Use the selected customerId to drive every dashboard query.
- Add loading, empty, and error states for every API-driven section.
- Use reusable components for metric cards, section headers, status badges, and insight lists.
- Use MUI components and theme consistently.
- Keep layout mobile-first and responsive.
- Do not place UI cards inside other cards.
- Do not implement advisor chat, goal creation, risk wizard, or recommendation generation in this milestone.

Screen sections:

- Bank mobile shell header with customer greeting.
- Avatar advisor entry card.
- Wealth readiness score and band.
- Income, expense, monthly surplus, and savings rate cards.
- Idle balance and emergency fund coverage cards.
- EMI burden card.
- Investment allocation summary.
- Spending breakdown chart or structured list.
- Top spending insights.
- Goals preview.
- Risk profile status.
- Recommendation status or latest recommendation preview.
- Quick actions:
  - Ask advisor
  - Create goal
  - Take risk profile
  - View recommendations

UI state rules:

- If a customer has no goals, show an empty state with Create goal CTA.
- If a risk profile is missing, show Take risk profile CTA.
- If recommendations are empty, show View recommendations or Create goal CTA depending on readiness.
- If an API fails, show section-level error state and retry action.
- The app should still render other sections when one non-critical query fails.

Design direction:

- Use a restrained bank-grade visual style.
- Prioritize dense but readable information.
- Use icons in quick action buttons.
- Avoid marketing hero layouts.
- Keep the avatar as the wealth journey entry point.
- Make all text fit on mobile.

Testing:
Add frontend tests where practical for:

- API client/query hook behavior
- dashboard loading state
- dashboard error state
- customer switcher behavior
- wealth metric rendering
- empty goals state
- missing risk profile state
- quick action buttons rendering

Documentation:
Update or create:
docs/milestone-status/milestone-08-frontend-dashboard-status.md

Also update:

- docs/mvp-checklist.md
- README if frontend setup, environment variables, or demo flow changes

Acceptance Criteria:

- Dashboard consumes real backend APIs.
- User can switch between all three seeded personas.
- Wealth readiness score and key financial metrics render correctly.
- Spending insights render from backend data.
- Loading, empty, and error states are handled.
- Quick actions are visible.
- UI is responsive and demo-ready.
- No business data is hardcoded in React components.

## Milestone 8 Verification

```txt
- [ ] Dashboard is the first app screen.
- [ ] Customer switcher loads seeded customers from API.
- [ ] Wealth profile query is typed.
- [ ] Spending insights query is typed.
- [ ] Goals query is typed.
- [ ] Risk profile query is typed.
- [ ] Recommendations query is typed.
- [ ] Loading states are shown.
- [ ] Empty states are shown.
- [ ] Error states are shown.
- [ ] Avatar advisor card is prominent.
- [ ] Wealth readiness score is visible.
- [ ] Income, expense, surplus, savings rate, idle balance, and EMI burden are visible.
- [ ] Spending breakdown or insights are visible.
- [ ] Quick action buttons are visible.
- [ ] Layout is mobile-friendly.
- [ ] No hardcoded business values in React components.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
