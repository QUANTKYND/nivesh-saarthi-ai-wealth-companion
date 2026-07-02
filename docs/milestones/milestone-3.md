# Spending Insights Engine

### Goal: Generate meaningful transaction-based insights.

Implement the spending insights engine.

Analyze mock transactions to produce:

- category-wise spending
- month-over-month category change
- recurring subscription detection
- high discretionary spend detection
- investable surplus estimate
- warning if EMI burden is high

Create endpoint:

```JS
GET /api/customers/:customerId/spending-insights
```

Return chart data and natural-language insight strings.

Add tests for the insight engine.

### Acceptance Criteria

- Spending chart data is available.
- At least 5 insight types are generated.
- Insight logic is deterministic and testable.
