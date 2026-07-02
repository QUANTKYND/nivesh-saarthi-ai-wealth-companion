# Goal Planner UI

### Goal: Allow goal creation and projection.

Build Goal Planner UI.

Features:

- list existing goals
- create new goal modal/wizard
- goal type selector
- target amount input
- target year input
- current savings input
- projection result card
- monthly investment required
- shortfall explanation
- CTA to get recommendation

### Acceptance Criteria

- Goals can be created.
- Projection is shown.
- Recommendation flow can start from a goal.

## In Depth

Start Milestone 10: Goal Planner UI.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 4 goal planner backend.
4. Inspect Milestone 8 frontend dashboard patterns.
5. Reuse shared DTOs/types from packages/shared-types.
6. Do not implement recommendation rules in the frontend.
7. Keep this milestone focused on goal listing, goal creation, and projection display.

Goal:
Build the frontend goal planner experience so customers can list goals, create a new goal, view projections, and start the recommendation flow for a selected goal.

Required backend APIs:

- GET /api/customers/:customerId/goals
- POST /api/customers/:customerId/goals
- GET /api/customers/:customerId/goals/:goalId/projection

Implementation requirements:

- Create typed query/mutation hooks for goals and projections.
- Render existing goals for the selected customer.
- Add create goal modal, drawer, or wizard.
- Validate form input client-side for better UX.
- Keep backend validation as source of truth.
- Fetch and render projection after selecting or creating a goal.
- Add CTA to start recommendation flow with selected goalId.
- Add loading, empty, success, and error states.
- Do not hardcode projection outputs.

Create goal form fields:

- goalType
- name
- targetAmount
- currentSavings
- targetDate or target year/month
- priority
- plannedMonthlyContribution
- expectedAnnualReturnPercent

Client validation:

- name is required.
- targetAmount must be greater than 0.
- currentSavings must be greater than or equal to 0.
- targetDate must be in the future.
- plannedMonthlyContribution must be greater than or equal to 0 if provided.
- expectedAnnualReturnPercent must be between 0 and 15 if provided.
- priority must be LOW, MEDIUM, or HIGH.
- goalType must use supported shared GoalType values.

Projection display:

- target amount
- current savings
- months remaining
- planned monthly contribution
- required monthly contribution
- projected amount
- shortfall or surplus
- achievability status
- step-up suggestion
- projection assumptions
- illustrative return disclaimer
- explanation strings from backend

UI requirements:

- Existing goals should be scannable.
- Projection result should clearly show ACHIEVABLE, AT_RISK, or OFF_TRACK.
- Shortfall should be visible but not alarming.
- CTA to recommendation should be disabled until a valid goal exists.
- Use MUI inputs and controls consistently.
- Keep layout mobile-friendly.

Testing:
Add frontend tests where practical for:

- goal list loading
- empty goals state
- create goal form validation
- successful goal creation
- backend validation error display
- projection loading
- projection result rendering
- achievability status rendering
- step-up suggestion rendering
- recommendation CTA carries selected goalId

Documentation:
Update or create:
docs/milestone-status/milestone-10-goal-planner-ui-status.md

Also update:

- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- Customer can view existing goals.
- Customer can create a new goal.
- Projection is fetched from backend and displayed.
- Required monthly investment is visible.
- Shortfall/surplus is visible.
- Step-up suggestion is visible when applicable.
- Recommendation flow can start from a selected goal.
- Loading, empty, and error states are handled.
- No projection math is duplicated in frontend.

## Milestone 10 Verification

```txt
- [ ] Existing goals load from API.
- [ ] Empty goals state is handled.
- [ ] Create goal UI exists.
- [ ] Create goal validation exists.
- [ ] Goal creation uses backend API.
- [ ] Projection endpoint is called for selected goal.
- [ ] Required monthly contribution is displayed.
- [ ] Projected amount is displayed.
- [ ] Shortfall or surplus is displayed.
- [ ] Achievability status is displayed.
- [ ] Step-up suggestion is displayed.
- [ ] Assumptions and disclaimer are displayed.
- [ ] Recommendation CTA includes selected goalId.
- [ ] Loading and error states are handled.
- [ ] Layout is mobile-friendly.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
