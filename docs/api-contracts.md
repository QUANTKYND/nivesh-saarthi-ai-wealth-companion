# API Contracts

## Wealth Dashboard

### `GET /api/customers/:customerId/wealth-profile`

Returns a calculated wealth dashboard profile for a seeded customer.

Path parameters:

- `customerId` - Customer identifier from `GET /api/customers`.

Response body:

```json
{
  "customerId": "cust-young-001",
  "fullName": "Aarav Mehta",
  "age": 29,
  "occupation": "Product Manager",
  "city": "Mumbai",
  "customerSegment": "MASS_AFFLUENT",
  "currency": "INR",
  "monthlyIncome": 145000,
  "monthlyExpenses": 92878,
  "monthlySurplus": 52122,
  "savingsRatePercent": 35.95,
  "savingsBalance": 420000,
  "fixedDepositBalance": 150000,
  "recurringDepositBalance": 100000,
  "mutualFundBalance": 430000,
  "totalInvestments": 680000,
  "loanOutstanding": 0,
  "creditCardOutstanding": 22000,
  "emiBurdenPercent": 0,
  "idleBalance": 234244,
  "emergencyFundCoverageMonths": 4.52,
  "riskProfile": "GROWTH",
  "wealthReadinessScore": 93,
  "wealthReadinessBand": "EXCELLENT",
  "investmentAllocation": [
    {
      "label": "Fixed Deposits",
      "amount": 150000,
      "percentage": 22.06
    },
    {
      "label": "Recurring Deposits",
      "amount": 100000,
      "percentage": 14.71
    },
    {
      "label": "Mutual Funds",
      "amount": 430000,
      "percentage": 63.24
    }
  ],
  "summaryInsights": [
    "You have a positive monthly surplus of INR 52,122.",
    "Your emergency fund covers around 4.5 months of expenses.",
    "Your EMI burden is within a manageable range.",
    "You may be able to invest part of your monthly surplus after maintaining liquidity."
  ],
  "scoreExplanation": [
    "Savings rate contributed 25 of 25 points.",
    "Emergency fund coverage contributed 18 of 25 points.",
    "EMI burden contributed 20 of 20 points.",
    "Investment diversification contributed 15 of 15 points.",
    "Goal and risk-profile readiness contributed 15 of 15 points."
  ],
  "calculatedAt": "2026-07-02T12:00:00.000Z"
}
```

Error responses:

- `404` when `customerId` does not exist.

Notes:

- Income is averaged from income-category credit transactions across available months.
- Expenses are averaged from debit transactions excluding investment transfers.
- EMI burden uses debit transactions whose descriptions indicate EMI, loan repayment, or credit card payment.
- Readiness scoring is deterministic and split across savings rate, emergency fund, EMI burden, diversification, and planning readiness.

## Spending Insights

### `GET /api/customers/:customerId/spending-insights`

Returns deterministic transaction analytics and dashboard-ready spending insights.

Path parameters:

- `customerId` - Customer identifier from `GET /api/customers`.

Response body:

```json
{
  "customerId": "cust-young-001",
  "period": {
    "label": "Last 3 available months",
    "from": "2026-04-10",
    "to": "2026-06-20"
  },
  "monthlyIncome": 145000,
  "monthlyExpenses": 62294,
  "monthlySurplus": 82706,
  "investableSurplusEstimate": {
    "min": 20677,
    "max": 41353,
    "explanation": "Based on your average surplus and liquidity needs, this range may be available for goal-based investing."
  },
  "categoryBreakdown": [
    {
      "category": "housing",
      "label": "Housing",
      "amount": 38000,
      "percentage": 20.34
    }
  ],
  "topCategories": [
    {
      "category": "housing",
      "label": "Housing",
      "amount": 38000,
      "percentage": 20.34
    }
  ],
  "monthOverMonthChanges": [
    {
      "category": "shopping",
      "label": "Shopping",
      "currentMonthAmount": 6800,
      "previousMonthAmount": 4200,
      "changeAmount": 2600,
      "changePercent": 61.9,
      "direction": "INCREASED"
    }
  ],
  "recurringSubscriptions": [
    {
      "merchant": "Netflix",
      "category": "subscriptions",
      "averageAmount": 649,
      "frequency": "MONTHLY",
      "occurrences": 3
    }
  ],
  "discretionarySpend": {
    "amount": 16076,
    "percentageOfExpenses": 25.81,
    "categories": ["shopping", "dining", "travel", "subscriptions"],
    "status": "MODERATE"
  },
  "emiBurden": {
    "amount": 0,
    "percentageOfIncome": 0,
    "status": "MANAGEABLE",
    "warning": null
  },
  "insights": [
    {
      "type": "SURPLUS",
      "severity": "POSITIVE",
      "title": "Healthy monthly surplus",
      "message": "You have an average monthly surplus of INR 82,706 after regular expenses.",
      "actionLabel": "Plan investment"
    }
  ],
  "calculatedAt": "2026-07-02T12:00:00.000Z"
}
```

Error responses:

- `404` when `customerId` does not exist.

Notes:

- Category breakdown uses debit transactions and excludes investment transfers.
- Month-over-month changes compare the latest available month with the previous available month.
- Recurring subscriptions require the same merchant in at least 2 different months.
- Discretionary spend includes shopping, dining, travel, and subscriptions.
- EMI burden warnings are returned only for elevated or high debt burden.
