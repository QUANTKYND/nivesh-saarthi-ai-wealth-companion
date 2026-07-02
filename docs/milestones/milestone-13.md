# Advisor Handoff

### Goal: Handle high-value or complex cases.

Implement advisor callback request flow.

Backend:
POST /api/customers/:customerId/advisor-callbacks
GET /api/admin/advisor-callbacks

Frontend:

- callback request form
- preferred date/time
- topic
- generated AI summary for advisor
- confirmation screen

Admin view:

- list callback requests
- customer summary
- recommendation summary
- latest chat summary

### Acceptance Criteria

- Customer can request advisor callback.
- Advisor summary is generated.
- Admin can view requests.

## In Depth

Start Milestone 13: Advisor Handoff.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect existing advisor-callbacks module.
4. Inspect Milestone 7 advisor chat backend and Milestone 12 recommendation UI.
5. Reuse shared DTOs/types from packages/shared-types.
6. Do not implement live scheduling integrations.
7. Keep this milestone focused on callback request creation, deterministic advisor summary, customer confirmation, and admin view.

Goal:
Implement a human advisor handoff flow for complex, high-value, sensitive, or customer-requested cases.

Backend endpoints:

- GET /api/customers/:customerId/advisor-callbacks
- POST /api/customers/:customerId/advisor-callbacks
- GET /api/admin/advisor-callbacks

Preserve the existing customer callback list endpoint and extend it with create and admin list support.

Create request shape:

```JSON
{
  "preferredDate": "2026-07-05",
  "preferredTimeWindow": "16:00-18:00",
  "topic": "Education goal and recommendation review",
  "source": "RECOMMENDATION"
}
```

Response shape:

```JSON
{
  "id": "callback-cust-family-001-1782993600000",
  "customerId": "cust-family-001",
  "preferredDate": "2026-07-05",
  "preferredTimeWindow": "16:00-18:00",
  "topic": "Education goal and recommendation review",
  "status": "requested",
  "advisorSummary": {
    "customerName": "Nisha Rao",
    "riskProfile": "MODERATE",
    "primaryGoal": "Children's Higher Education",
    "latestRecommendationSuitability": "SUITABLE",
    "summary": "Customer is reviewing an education goal and has a moderate risk profile. Review affordability, goal timeline, and recommendation warnings before proceeding.",
    "keyDiscussionPoints": [
      "Confirm goal amount and target date.",
      "Review market-linked risk warnings.",
      "Confirm monthly contribution affordability."
    ]
  },
  "createdAt": "2026-07-02T..."
}
```

Shared Types:
Create or extend shared DTOs/types for:

- CreateAdvisorCallbackRequest
- AdvisorCallbackResponse
- AdvisorCallbackSource
- AdvisorCallbackAdvisorSummary
- AdminAdvisorCallbackListItem

Backend implementation requirements:

- Validate customerId exists.
- Validate preferredDate is not in the past.
- Validate preferredTimeWindow is present.
- Validate topic is present.
- Create callback request in the in-memory repository.
- Generate advisor summary deterministically from available data:
  - customer profile
  - wealth profile
  - goals
  - risk profile
  - latest recommendation
  - latest chat messages
- Add audit log for advisor callback request.
- Admin endpoint should return all callback requests across customers with customer summary and advisor summary.
- Do not call an LLM for advisor summary in this milestone.

Frontend implementation requirements:

- Add callback request form reachable from recommendation UI and avatar chat action card.
- Fields:
  - preferred date
  - preferred time window
  - topic
  - optional source context
- Show confirmation after successful request.
- Add admin/advisor view for callback requests.
- Admin list should show:
  - customer name
  - topic
  - preferred date/time
  - status
  - risk profile
  - latest recommendation suitability if available
- Admin detail should show advisor summary and key discussion points.

Testing:
Add backend tests for:

- create callback success
- missing customer
- invalid preferred date
- missing time window
- missing topic
- advisor summary generation
- callback persistence
- customer callback list includes created request
- admin list includes created request
- audit log creation

Add frontend tests where practical for:

- callback form validation
- successful submission
- confirmation state
- backend error state
- admin list rendering
- admin summary rendering

Documentation:
Update or create:
docs/milestone-status/milestone-13-advisor-handoff-status.md

Also update:

- docs/api-contracts.md
- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- Customer can request an advisor callback.
- Callback request is saved.
- Advisor summary is generated deterministically.
- Admin can view all callback requests.
- Customer callback list still works.
- Advisor handoff can be launched from recommendation or chat.
- Audit log records callback request.
- Loading, success, empty, and error states are handled in frontend.

## Milestone 13 Verification

```txt
- [ ] POST /api/customers/:customerId/advisor-callbacks exists.
- [ ] GET /api/customers/:customerId/advisor-callbacks still works.
- [ ] GET /api/admin/advisor-callbacks exists.
- [ ] Missing customer is handled.
- [ ] Invalid preferred date is rejected.
- [ ] Missing time window is rejected.
- [ ] Missing topic is rejected.
- [ ] Callback request is persisted.
- [ ] Advisor summary is generated.
- [ ] Admin list includes callback requests.
- [ ] Audit log is written.
- [ ] Callback form exists in frontend.
- [ ] Confirmation screen exists.
- [ ] Admin callback dashboard exists.
- [ ] Loading and error states are handled.
- [ ] API contract docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
