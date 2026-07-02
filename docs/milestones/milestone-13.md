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
