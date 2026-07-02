# Recommendation UI

### Goal: Show personalized investment plan.

Build Recommendation screen.

Features:

- select goal
- enter or confirm monthly investment capacity
- fetch recommendation
- show recommended plan
- show allocation chart
- show reasoning
- show suitability status
- show risk warnings
- show disclaimer
- CTA: Request advisor callback

### Acceptance Criteria

- Recommendations are generated from backend.
- Reasoning and disclaimers are visible.
- UI makes clear that this is bank-approved guidance.

## In Depth

Start Milestone 12: Recommendation UI.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 6 recommendation backend.
4. Inspect Milestone 8, 10, and 11 frontend patterns.
5. Reuse shared DTOs/types from packages/shared-types.
6. Do not implement product allocation logic in the frontend.
7. Keep this milestone focused on recommendation generation, display, warnings, and advisor callback CTA.

Goal:
Build the frontend recommendation screen where customers select a goal, confirm monthly investment capacity, generate a backend recommendation, and review the bank-approved plan.

Required backend APIs:

- GET /api/customers/:customerId/goals
- GET /api/customers/:customerId/risk-profile
- POST /api/customers/:customerId/recommendations
- GET /api/customers/:customerId/recommendations

Implementation requirements:

- Create typed query/mutation hooks for goals, risk profile, recommendation generation, and recommendation history.
- Require a selected goal before generating a recommendation.
- Allow optional monthly investment capacity input.
- Validate monthly investment capacity is greater than or equal to 0.
- Submit selected goalId and optional monthlyInvestmentCapacity to backend.
- Render the backend RecommendationResult exactly as returned.
- Do not alter product allocation or suitability in frontend.
- Add loading, empty, validation error, and backend error states.
- Add CTA to advisor callback flow.

Preconditions and empty states:

- If no goals exist, show Create goal CTA.
- If risk profile is missing, show Take risk profile CTA.
- If a recommendation returns NEEDS_ADVISOR_REVIEW, emphasize advisor callback.
- If a recommendation returns NOT_SUITABLE, do not show investment-start CTA.

Recommendation display:

- suitability status
- risk profile used
- recommended plan name and description
- monthly amount
- one-time amount
- allocation chart or allocation table
- product names and product types
- allocation percentages
- monthly amount per product
- one-time amount per product
- rationale per allocation item
- reasoning list
- riskWarnings
- disclaimer
- nextBestAction

UI requirements:

- Market-linked products must be visually marked.
- Risk warnings must be visible and not collapsed by default.
- Disclaimer must be visible near the recommendation.
- The screen must clearly state this is bank-approved guidance based on available data.
- Use charting only if it improves clarity; a responsive allocation table is acceptable.
- Keep layout mobile-friendly.

Testing:
Add frontend tests where practical for:

- no goals empty state
- missing risk profile state
- goal selection
- capacity validation
- generate recommendation success
- recommendation loading state
- backend error state
- allocation rendering
- suitability status rendering
- risk warning visibility
- disclaimer visibility
- NEEDS_ADVISOR_REVIEW rendering
- NOT_SUITABLE rendering
- advisor callback CTA

Documentation:
Update or create:
docs/milestone-status/milestone-12-recommendation-ui-status.md

Also update:

- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- User can select a goal.
- User can enter or confirm monthly investment capacity.
- Recommendation is generated from backend.
- Recommended plan and allocation are shown.
- Reasoning, warnings, disclaimer, suitability, and next action are visible.
- Missing goal and missing risk profile states are handled.
- Advisor callback CTA is available.
- Frontend does not choose products or allocations.

## Milestone 12 Verification

```txt
- [ ] Goals load from API.
- [ ] Risk profile readiness is checked.
- [ ] Missing goals show Create goal CTA.
- [ ] Missing risk profile shows Take risk profile CTA.
- [ ] Goal can be selected.
- [ ] Monthly capacity can be entered.
- [ ] Invalid monthly capacity is rejected.
- [ ] POST recommendation is called.
- [ ] Recommendation loading state is shown.
- [ ] Recommendation errors are shown.
- [ ] Suitability status is displayed.
- [ ] Plan name and description are displayed.
- [ ] Allocation items are displayed.
- [ ] Product types are displayed.
- [ ] Reasoning is displayed.
- [ ] Risk warnings are visible.
- [ ] Disclaimer is visible.
- [ ] Next best action is displayed.
- [ ] Advisor callback CTA exists.
- [ ] Frontend has no allocation logic.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
