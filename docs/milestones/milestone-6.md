# Product Catalog and Recommendation Engine

### Goal: Generate bank-approved investment recommendations

Implement a rule-based recommendation engine.

Use mock bank-approved product catalog:

- Fixed Deposit
- Recurring Deposit
- Conservative Mutual Fund Basket
- Balanced Mutual Fund Basket
- Equity SIP Basket
- Tax Saving Basket
- Insurance Protection Suggestion

Rules must consider:

- risk profile
- goal horizon
- monthly surplus
- EMI burden
- emergency fund coverage
- target goal amount
- idle balance

Endpoint:

```JS
POST /api/customers/:customerId/recommendations
```

Return:

- recommended plan
- allocation
- suitability status
- reasoning
- risk warning
- disclaimer
- next best action

### Acceptance Criteria

- Conservative customers do not receive aggressive recommendations.
- High EMI burden reduces suggested investment amount.
- No recommendation is generated without risk profile.
- Every recommendation has reasoning and disclaimer.
