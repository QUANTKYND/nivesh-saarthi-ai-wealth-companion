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

## Risk Profiling

### `GET /api/risk-profile/questions`

Returns the deterministic single-choice risk profiling questionnaire.

Response body:

```json
{
  "questions": [
    {
      "id": "investment_horizon",
      "label": "How long can you stay invested for this goal?",
      "description": "Longer investment horizons can usually support more market-linked exposure.",
      "type": "SINGLE_CHOICE",
      "required": true,
      "options": [
        {
          "id": "less_than_1_year",
          "label": "Less than 1 year",
          "score": 0,
          "explanation": "A short horizon requires a conservative suitability stance."
        },
        {
          "id": "more_than_5_years",
          "label": "More than 5 years",
          "score": 3,
          "explanation": "A longer horizon can support higher growth-oriented suitability."
        }
      ]
    }
  ]
}
```

Notes:

- The questionnaire contains 8 required questions: investment horizon, income stability, loss tolerance, emergency fund status, investment experience, liquidity needs, dependence on invested funds, and investment objective.
- Options are scored deterministically. The maximum score is `23`.

### `POST /api/customers/:customerId/risk-profile`

Submits questionnaire answers, applies deterministic scoring and safety overrides, stores the latest result in memory, and returns the updated risk profile.

Request body, abbreviated here; all eight required answers must be present:

```json
{
  "answers": [
    {
      "questionId": "investment_horizon",
      "optionId": "more_than_5_years"
    },
    {
      "questionId": "loss_tolerance",
      "optionId": "moderate_fluctuation"
    }
  ]
}
```

Response body:

```json
{
  "customerId": "cust-family-001",
  "category": "MODERATE",
  "score": 15,
  "maxScore": 23,
  "scorePercent": 65.22,
  "investmentHorizonYears": 5,
  "lossTolerance": "MEDIUM",
  "incomeStability": "MEDIUM",
  "liquidityNeed": "LOW",
  "investmentExperience": "INTERMEDIATE",
  "scoreBreakdown": [
    {
      "questionId": "investment_horizon",
      "label": "How long can you stay invested for this goal?",
      "selectedOptionId": "3_to_5_years",
      "selectedOptionLabel": "3 to 5 years",
      "score": 2,
      "maxScore": 3,
      "explanation": "A medium horizon can support balanced market-linked exposure."
    }
  ],
  "explanation": [
    "Your profile is Moderate because you can tolerate some fluctuation and have a reasonable investment horizon."
  ],
  "suitabilityNotes": [
    "Risk profile does not create a product recommendation by itself.",
    "Recommendations must use only bank-approved products and include required disclaimers."
  ],
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

Validation:

- `customerId` must exist.
- All 8 required questions must be answered.
- Each `questionId` must be part of the central questionnaire.
- Each `optionId` must belong to the submitted question.
- Duplicate answers for the same question are rejected.

Scoring:

- `0-8` maps to `CONSERVATIVE`.
- `9-16` maps to `MODERATE`.
- `17-23` maps to `AGGRESSIVE`.
- `less_than_1_year` investment horizon caps the result at `CONSERVATIVE`.
- `no_emergency_fund` caps the result at `MODERATE`.
- `cannot_tolerate_loss` forces `CONSERVATIVE`.
- `need_money_anytime` liquidity need caps the result at `CONSERVATIVE`.
- Age 60+ or retired customers with low loss tolerance remain `CONSERVATIVE`.

Error responses:

- `400` for invalid, duplicate, or missing answers.
- `404` when `customerId` does not exist.

### `GET /api/customers/:customerId/risk-profile`

Returns the stored risk profile result for a customer. Seeded legacy risk profiles are adapted into the Milestone 5 result shape until the customer submits the questionnaire.

Error responses:

- `404` when `customerId` does not exist or no risk profile is available.

## Recommendations

### `GET /api/customers/:customerId/recommendations`

Lists seeded and generated recommendations for a customer.

Path parameters:

- `customerId` - Customer identifier from `GET /api/customers`.

Response body:

```json
[
  {
    "id": "rec-f-001",
    "customerId": "cust-family-001",
    "productId": "prod-ins-001",
    "title": "Review family protection coverage",
    "reasoning": "Dependents and education goals make protection planning important before higher risk allocation.",
    "disclaimer": "This is a mock bank-approved suggestion for demo purposes, not personalized financial advice.",
    "status": "shown",
    "createdAt": "2026-06-24T10:15:00.000Z"
  }
]
```

## Advisor Handoff

### `GET /api/customers/:customerId/advisor-callbacks`

Lists callback requests for a customer.

### `POST /api/customers/:customerId/advisor-callbacks`

Creates an advisor callback request and returns the stored callback with a deterministic advisor summary.

Request body:

```json
{
  "preferredDate": "2026-07-05",
  "preferredTimeWindow": "16:00-18:00",
  "topic": "Education goal and recommendation review",
  "source": "RECOMMENDATION"
}
```

### `GET /api/admin/advisor-callbacks`

Lists all advisor callback requests across customers for the admin/advisor view.

Generated recommendations use the `RecommendationResult` shape returned by the POST endpoint and are appended to the same list.

### `POST /api/customers/:customerId/recommendations`

Generates a deterministic, rule-based recommendation using customer data, selected goal, spending insights, emergency fund coverage, EMI burden, risk profile, idle balance, and approved product catalog.

Request body:

```json
{
  "goalId": "goal-f-001",
  "monthlyInvestmentCapacity": 10000
}
```

`monthlyInvestmentCapacity` is optional. When omitted, the engine uses goal planned contribution, then minimum investable surplus, then 25% of monthly surplus.

Response body:

```json
{
  "recommendationId": "rec-cust-family-001-1782993600000",
  "customerId": "cust-family-001",
  "goalId": "goal-f-001",
  "suitability": "SUITABLE",
  "riskProfile": "MODERATE",
  "recommendedPlan": {
    "name": "Balanced SIP + Safety Plan",
    "description": "A rule-based plan using bank-approved products aligned to goal, affordability, and risk profile.",
    "monthlyAmount": 10000,
    "oneTimeAmount": 100000,
    "allocation": [
      {
        "productId": "prod-rd-001",
        "productName": "IDBI Goal Builder Recurring Deposit",
        "productType": "RECURRING_DEPOSIT",
        "percentage": 20,
        "monthlyAmount": 2000,
        "oneTimeAmount": 100000,
        "rationale": "Maintains a stable base for the plan."
      },
      {
        "productId": "prod-mf-balanced-001",
        "productName": "IDBI Balanced Mutual Fund Basket",
        "productType": "BALANCED_MF_BASKET",
        "percentage": 70,
        "monthlyAmount": 7000,
        "oneTimeAmount": 0,
        "rationale": "Dominant balanced exposure fits a long-term goal."
      }
    ]
  },
  "reasoning": [
    "Customer has a MODERATE risk profile.",
    "Goal horizon is 69 months.",
    "Recommended monthly amount is capped at INR 10,000 based on affordability rules."
  ],
  "riskWarnings": ["Market-linked investments can fluctuate and returns are not guaranteed."],
  "disclaimer": "This recommendation is based on available banking data, stated goal, and risk profile. Market-linked investments are subject to risk. Returns are not guaranteed. Please review product documents or speak to a certified advisor before investing.",
  "nextBestAction": {
    "type": "START_SIP",
    "label": "Start recommended SIP",
    "description": "Proceed to review the recommended monthly investment plan."
  },
  "createdAt": "2026-07-02T12:00:00.000Z"
}
```

Validation and guardrails:

- `customerId` must exist.
- `goalId` is required and must belong to the customer.
- `monthlyInvestmentCapacity`, when provided, must be greater than or equal to `0`.
- A risk profile is required before any market-linked recommendation is generated.
- Monthly amount is capped by provided capacity, investable surplus maximum, and 50% of monthly surplus.
- Negative or zero surplus returns `NOT_SUITABLE` with advisor review.
- Weak emergency funds prioritize FD/RD-style stable products.
- High EMI burden reduces the monthly amount and avoids aggressive allocation.
- Conservative customers never receive `EQUITY_SIP_BASKET`.
- Every response includes reasoning, suitability, next best action, disclaimer, and market risk warning when market-linked products are included.

Error responses:

- `400` for missing `goalId` or invalid monthly capacity.
- `404` when `customerId` or `goalId` does not exist.

## Advisor Chat

### `GET /api/customers/:customerId/advisor-chat/messages`

Lists persisted advisor chat messages for a customer.

Path parameters:

- `customerId` - Customer identifier from `GET /api/customers`.

Response body:

```json
[
  {
    "id": "chat-y-001",
    "customerId": "cust-young-001",
    "role": "customer",
    "message": "Can I save faster for my emergency fund?",
    "createdAt": "2026-06-25T09:00:00.000Z",
    "isAuditable": true
  }
]
```

### `POST /api/advisor-chat/message`

Accepts a customer chat message, classifies intent deterministically, generates a controlled response from backend data, returns UI action cards, persists both messages, and writes audit logs.

Request body:

```json
{
  "customerId": "cust-family-001",
  "message": "Can I invest INR 10000 per month?"
}
```

Response body:

```json
{
  "conversationId": "chat-cust-family-001",
  "customerId": "cust-family-001",
  "intent": "investment_capacity",
  "response": "INR 10,000 appears within your current investable surplus estimate. Your monthly surplus is INR 69,000, EMI burden is 0.0%, and emergency fund coverage is 5.2 months. A final recommendation still requires a selected goal and completed risk profile.",
  "actionCards": [
    {
      "type": "OPEN_RECOMMENDATIONS",
      "label": "View recommendations",
      "description": "Generate or review a bank-approved recommendation.",
      "payload": {
        "customerId": "cust-family-001"
      }
    }
  ],
  "disclaimer": "This is affordability guidance based on available banking data, not a product recommendation or guaranteed return claim.",
  "createdAt": "2026-07-02T12:00:00.000Z"
}
```

Supported intents:

- `spending_summary`
- `investment_capacity`
- `create_goal_help`
- `risk_profile_help`
- `recommendation_explanation`
- `emergency_fund_check`
- `advisor_callback`
- `unsupported_advice`
- `unknown`

Supported action card types:

- `OPEN_SPENDING_INSIGHTS`
- `OPEN_GOAL_PLANNER`
- `OPEN_RISK_PROFILE`
- `OPEN_RECOMMENDATIONS`
- `REQUEST_ADVISOR_CALLBACK`

Guardrails:

- Crypto recommendations are blocked.
- Individual stock tips are blocked.
- Guaranteed return claims are blocked.
- Tax/legal advice requests are redirected to advisor support.
- Chat does not choose products or allocations.
- Market-linked recommendations must come from the recommendation engine.

Error responses:

- `400` when `customerId` or `message` is missing or blank.
- `404` when `customerId` does not exist.

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

## Goal Planner

### `GET /api/customers/:customerId/goals`

Lists goals for a customer.

Path parameters:

- `customerId` - Customer identifier from `GET /api/customers`.

Response body:

```json
[
  {
    "id": "goal-f-001",
    "customerId": "cust-family-001",
    "name": "Children's Higher Education",
    "type": "education",
    "targetAmount": 3500000,
    "currentAmount": 1250000,
    "currency": "INR",
    "targetDate": "2032-04-01",
    "status": "active",
    "priority": "high",
    "plannedMonthlyContribution": 35000,
    "expectedAnnualReturnPercent": 8
  }
]
```

### `POST /api/customers/:customerId/goals`

Creates a new goal for a customer.

Request body:

```json
{
  "goalType": "education",
  "name": "Child Education",
  "targetAmount": 1000000,
  "currentSavings": 100000,
  "targetDate": "2031-07-01",
  "priority": "HIGH",
  "plannedMonthlyContribution": 10000,
  "expectedAnnualReturnPercent": 8
}
```

Validation:

- `customerId` must exist.
- `targetAmount` must be greater than `0`.
- `currentSavings` must be greater than or equal to `0`.
- `targetDate` must be in the future.
- `plannedMonthlyContribution`, when provided, must be greater than or equal to `0`.
- `expectedAnnualReturnPercent`, when provided, must be between `0` and `15`.
- `goalType` must be one of the shared goal types.
- `priority` must be `LOW`, `MEDIUM`, or `HIGH`.

### `GET /api/customers/:customerId/goals/:goalId/projection`

Returns deterministic goal projection calculations.

Response body:

```json
{
  "goalId": "goal-f-001",
  "customerId": "cust-family-001",
  "goalName": "Children's Higher Education",
  "goalType": "education",
  "targetAmount": 3500000,
  "currentSavings": 1250000,
  "targetDate": "2032-04-01",
  "monthsRemaining": 68,
  "plannedMonthlyContribution": 35000,
  "expectedAnnualReturnPercent": 8,
  "requiredMonthlyContribution": 30175,
  "projectedAmount": 3820000,
  "shortfallOrSurplus": 320000,
  "achievabilityStatus": "ACHIEVABLE",
  "stepUpSuggestion": {
    "isRequired": false,
    "suggestedAnnualStepUpPercent": null,
    "estimatedProjectedAmountWithStepUp": null,
    "explanation": "Your current plan is projected to meet this goal."
  },
  "assumptions": {
    "compoundingFrequency": "MONTHLY",
    "inflationAdjusted": false,
    "returnsAreIllustrative": true
  },
  "explanations": [
    "You have 68 months remaining for this goal.",
    "At your planned contribution of INR 35,000 per month, you may exceed the target by around INR 3,20,000.",
    "Your current plan is projected to meet this goal."
  ],
  "calculatedAt": "2026-07-02T12:00:00.000Z"
}
```

Error responses:

- `400` when create-goal validation fails.
- `404` when `customerId` or `goalId` does not exist.

Notes:

- Projections use monthly compounding.
- Returns are illustrative and not guaranteed.
- When planned monthly contribution is omitted, the API uses a conservative fallback from spending insights.
