# Risk Profile UI

### Goal: Create a simple wizard for suitability.

Build Risk Profile wizard UI.

Features:

- fetch questions from backend
- one-question-at-a-time wizard
- progress indicator
- submit answers
- result screen showing Conservative / Moderate / Aggressive
- explanation of assigned profile
- CTA to get recommendation

### Acceptance Criteria

- Risk profile can be completed.
- Result is stored.
- Recommendation uses the latest risk profile.

## In Depth

Start Milestone 11: Risk Profile UI.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 5 risk profiling backend.
4. Inspect Milestone 8 frontend dashboard patterns.
5. Reuse shared DTOs/types from packages/shared-types.
6. Do not implement risk scoring logic in the frontend.
7. Keep this milestone focused on questionnaire UI, submission, and result display.

Goal:
Build a frontend risk profile wizard that fetches the backend questionnaire, collects answers, submits them, and displays the stored suitability result.

Required backend APIs:

- GET /api/risk-profile/questions
- POST /api/customers/:customerId/risk-profile
- GET /api/customers/:customerId/risk-profile

Implementation requirements:

- Create typed query/mutation hooks for questionnaire, submit risk profile, and get risk profile.
- Render one question at a time.
- Show progress indicator.
- Allow one selected option per question.
- Disable next step until an answer is selected.
- Allow back navigation to previous questions.
- Submit all required answers to backend.
- Render result screen after successful submission.
- If a profile already exists, show the existing result and allow retake.
- Handle loading, empty, validation error, and submit error states.
- Do not duplicate scoring logic in the frontend.

Wizard flow:

1. Load questionnaire.
2. Show intro explaining suitability profiling.
3. Collect answers for all required questions.
4. Review answers or submit directly.
5. Submit to POST /api/customers/:customerId/risk-profile.
6. Show result screen.
7. Offer CTA to generate recommendation if goal exists, or create goal if needed.

Result screen:

- risk category: CONSERVATIVE, MODERATE, or AGGRESSIVE
- scorePercent
- explanation
- suitabilityNotes
- scoreBreakdown
- updatedAt
- disclaimer that risk profile is not a product recommendation

UI requirements:

- Use MUI stepper, progress indicator, radio options, or equivalent controls.
- Keep option text readable on mobile.
- Use category badge styling that is clear but not alarming.
- Show suitability notes prominently.
- Do not hide warnings or disclaimers.
- CTA should be contextual:
  - if goals exist, View recommendations
  - if no goals exist, Create goal

Testing:
Add frontend tests where practical for:

- questionnaire loading
- loading error state
- one-question-at-a-time navigation
- option selection
- disabled next state
- back navigation
- submit success
- backend validation error display
- existing result display
- retake flow
- recommendation/create-goal CTA behavior

Documentation:
Update or create:
docs/milestone-status/milestone-11-risk-profile-ui-status.md

Also update:

- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- Customer can complete the risk questionnaire.
- Answers are submitted to backend.
- Risk result is stored and retrievable.
- Result screen shows category, explanations, score breakdown, notes, and disclaimer.
- Recommendation flow can use the latest risk profile.
- Loading, empty, and error states are handled.
- Frontend does not perform scoring.

## Milestone 11 Verification

```txt
- [ ] Questionnaire loads from API.
- [ ] One-question-at-a-time wizard exists.
- [ ] Progress indicator exists.
- [ ] Required answer selection is enforced.
- [ ] Back navigation works.
- [ ] Submit calls backend API.
- [ ] Submit loading state is shown.
- [ ] Backend errors are shown.
- [ ] Result category is displayed.
- [ ] Score percent is displayed.
- [ ] Explanation is displayed.
- [ ] Suitability notes are displayed.
- [ ] Score breakdown is displayed.
- [ ] Risk disclaimer is displayed.
- [ ] Existing profile can be viewed.
- [ ] Retake flow exists.
- [ ] Frontend has no scoring logic.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
