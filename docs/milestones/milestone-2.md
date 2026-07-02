# Wealth Dashboard Backend APIs

### Goal: Calculate financial summary and wealth readiness

Build backend services for customer wealth dashboard.

Implement:

- monthly income calculation
- monthly expense calculation
- monthly surplus calculation
- savings rate
- idle balance estimate
- EMI burden percentage
- emergency fund coverage
- wealth readiness score

Create endpoint:

```JS
GET /api/customers/:customerId/wealth-profile
```

Return a clean DTO suitable for frontend cards.

Include unit tests for calculations.

### Acceptance Criteria

- Dashboard API returns complete financial summary.
- Wealth readiness score is explainable.
- Unit tests cover calculations.
