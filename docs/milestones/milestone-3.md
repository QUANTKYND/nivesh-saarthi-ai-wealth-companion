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

## In Depth

Start Milestone 3: Spending Insights Engine.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect the existing Milestone 1 and Milestone 2 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not implement frontend screens yet unless the milestone explicitly asks for API validation only.
6. Do not implement recommendation rules yet.
7. Keep this milestone focused on transaction analytics and insight generation.

Goal:
Implement a spending insights engine that analyzes mock categorized transactions and produces deterministic dashboard-ready insights.

Required endpoint:
GET /api/customers/:customerId/spending-insights

The endpoint should return:

- customerId
- analysis period
- monthly income
- monthly expenses
- monthly surplus
- total spend by category
- spending breakdown chart data
- top spending categories
- month-over-month category changes
- recurring subscriptions
- discretionary spend summary
- investable surplus estimate
- EMI burden warning if applicable
- natural-language insight strings
- calculatedAt timestamp

Expected response shape:

{
"customerId": "CUST002",
"period": {
"label": "Last 3 months",
"from": "2026-04-01",
"to": "2026-06-30"
},
"monthlyIncome": 145000,
"monthlyExpenses": 92000,
"monthlySurplus": 53000,
"investableSurplusEstimate": {
"min": 15000,
"max": 25000,
"explanation": "Based on your average surplus and liquidity needs, this range may be available for goal-based investing."
},
"categoryBreakdown": [
{
"category": "GROCERIES",
"label": "Groceries",
"amount": 24000,
"percentage": 26.09
},
{
"category": "FOOD_AND_DINING",
"label": "Food & Dining",
"amount": 16500,
"percentage": 17.93
}
],
"topCategories": [
{
"category": "GROCERIES",
"label": "Groceries",
"amount": 24000,
"changePercent": 8.2
}
],
"monthOverMonthChanges": [
{
"category": "SHOPPING",
"label": "Shopping",
"currentMonthAmount": 28000,
"previousMonthAmount": 22000,
"changeAmount": 6000,
"changePercent": 27.27,
"direction": "INCREASED"
}
],
"recurringSubscriptions": [
{
"merchant": "Netflix",
"category": "SUBSCRIPTIONS",
"averageAmount": 649,
"frequency": "MONTHLY",
"occurrences": 3
}
],
"discretionarySpend": {
"amount": 42000,
"percentageOfExpenses": 45.65,
"categories": ["SHOPPING", "FOOD_AND_DINING", "TRAVEL", "SUBSCRIPTIONS"],
"status": "ELEVATED"
},
"emiBurden": {
"amount": 32000,
"percentageOfIncome": 22.07,
"status": "MANAGEABLE",
"warning": null
},
"insights": [
{
"type": "SURPLUS",
"severity": "POSITIVE",
"title": "Healthy monthly surplus",
"message": "You have an average monthly surplus of ₹53,000 after regular expenses.",
"actionLabel": "Plan investment"
},
{
"type": "CATEGORY_INCREASE",
"severity": "INFO",
"title": "Shopping increased",
"message": "Your shopping spend increased by 27% compared to last month.",
"actionLabel": "Review spending"
}
],
"calculatedAt": "2026-07-02T..."
}

Required implementation:

- Create shared DTOs/types for SpendingInsights.
- Create backend spending-insights module/service/controller or extend an existing transactions/analytics module cleanly.
- Use existing in-memory repositories.
- Reuse existing Milestone 2 calculation logic if appropriate instead of duplicating income/expense logic.
- Keep all insight logic deterministic and testable.
- Do not hardcode insight values in seed data.

Analysis rules:

1. Category breakdown:
   - Use debit transactions.
   - Exclude investment transfers from regular expense breakdown unless separately reported.
   - Group by spending category.
   - Return amount and percentage of total expenses.

2. Top categories:
   - Sort categories by amount descending.
   - Return top 3 or top 5.

3. Month-over-month changes:
   - Compare latest available month with previous available month.
   - Group spending by category for both months.
   - Return change amount, change percent, and direction:
     - INCREASED
     - DECREASED
     - UNCHANGED
     - NEW

4. Subscription detection:
   - Detect repeated transactions in SUBSCRIPTIONS category by merchant or normalized description.
   - If the same merchant appears in at least 2 different months with similar amount, mark as recurring.
   - Return average amount, frequency, and occurrence count.

5. Discretionary spend:
   - Include categories:
     - SHOPPING
     - FOOD_AND_DINING
     - TRAVEL
     - SUBSCRIPTIONS
   - Calculate total discretionary spend.
   - Calculate percentage of monthly expenses.
   - Status:
     - LOW: below 20%
     - MODERATE: 20% to 35%
     - ELEVATED: 35% to 50%
     - HIGH: above 50%

6. Investable surplus estimate:
   - Use monthly surplus from Milestone 2-style calculation.
   - Preserve emergency buffer and regular liquidity.
   - Suggested simple formula:
     - if monthlySurplus <= 0: min = 0, max = 0
     - else min = 25% of monthlySurplus
     - max = 50% of monthlySurplus
   - Reduce max if EMI burden is elevated or high.
   - Return rounded numbers and explanation.

7. EMI burden warning:
   - Use EMI categories:
     - HOME_LOAN_EMI
     - PERSONAL_LOAN_EMI
     - CREDIT_CARD_PAYMENT
   - Status:
     - MANAGEABLE: below 30%
     - ELEVATED: 30% to 45%
     - HIGH: above 45%
   - Add warning message for ELEVATED and HIGH.

8. Natural-language insights:
   Generate at least 5 insight types where applicable:
   - monthly surplus insight
   - top spending category insight
   - category increase insight
   - recurring subscription insight
   - discretionary spend insight
   - EMI burden insight
   - investable surplus insight
   - low or negative surplus warning

Insight severity:

- POSITIVE
- INFO
- WARNING
- CRITICAL

Testing:
Add unit tests for:

- category grouping
- top categories
- month-over-month changes
- subscription detection
- discretionary spend calculation
- investable surplus estimate
- EMI burden status and warning
- natural-language insight generation
- no transactions
- one-month-only transaction data
- customer not found

API/controller tests:

- successful response
- missing customer response
- response includes required sections

Documentation:
Update or create:
docs/milestone-status/milestone-03-spending-insights-status.md

The status document must track:

- implementation status
- testing status
- production-readiness status
- completed items
- pending items
- blockers
- known limitations

Also update:

- docs/api-contracts.md with the new endpoint
- docs/mvp-checklist.md if applicable

Acceptance Criteria:

- GET /api/customers/:customerId/spending-insights returns complete spending insights.
- Transactions are grouped by category.
- Month-over-month changes are calculated.
- Recurring subscriptions are detected.
- Discretionary spend is calculated.
- Investable surplus estimate is returned.
- At least 5 insight types are generated where applicable.
- Logic is deterministic and testable.
- Edge cases are handled cleanly.
- Shared DTOs are used.
- API contract docs are updated.
- Milestone status document is updated.

### Suggested Shared Types

```TypeScript
export type InsightSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';

export type SpendingInsightType =
  | 'SURPLUS'
  | 'LOW_SURPLUS'
  | 'NEGATIVE_SURPLUS'
  | 'TOP_CATEGORY'
  | 'CATEGORY_INCREASE'
  | 'CATEGORY_DECREASE'
  | 'RECURRING_SUBSCRIPTION'
  | 'DISCRETIONARY_SPEND'
  | 'EMI_BURDEN'
  | 'INVESTABLE_SURPLUS';

export type SpendingChangeDirection =
  | 'INCREASED'
  | 'DECREASED'
  | 'UNCHANGED'
  | 'NEW';

export type DiscretionarySpendStatus =
  | 'LOW'
  | 'MODERATE'
  | 'ELEVATED'
  | 'HIGH';

export type EmiBurdenStatus =
  | 'MANAGEABLE'
  | 'ELEVATED'
  | 'HIGH';

export interface SpendingInsightsPeriod {
  label: string;
  from: string;
  to: string;
}

export interface CategorySpendBreakdownItem {
  category: SpendingCategory;
  label: string;
  amount: number;
  percentage: number;
}

export interface CategoryMonthOverMonthChange {
  category: SpendingCategory;
  label: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  changeAmount: number;
  changePercent: number | null;
  direction: SpendingChangeDirection;
}

export interface RecurringSubscriptionInsight {
  merchant: string;
  category: SpendingCategory;
  averageAmount: number;
  frequency: 'MONTHLY';
  occurrences: number;
}

export interface DiscretionarySpendSummary {
  amount: number;
  percentageOfExpenses: number;
  categories: SpendingCategory[];
  status: DiscretionarySpendStatus;
}

export interface EmiBurdenSummary {
  amount: number;
  percentageOfIncome: number;
  status: EmiBurdenStatus;
  warning: string | null;
}

export interface InvestableSurplusEstimate {
  min: number;
  max: number;
  explanation: string;
}

export interface SpendingInsightMessage {
  type: SpendingInsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  actionLabel?: string;
}

export interface SpendingInsights {
  customerId: string;
  period: SpendingInsightsPeriod;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  investableSurplusEstimate: InvestableSurplusEstimate;
  categoryBreakdown: CategorySpendBreakdownItem[];
  topCategories: CategorySpendBreakdownItem[];
  monthOverMonthChanges: CategoryMonthOverMonthChange[];
  recurringSubscriptions: RecurringSubscriptionInsight[];
  discretionarySpend: DiscretionarySpendSummary;
  emiBurden: EmiBurdenSummary;
  insights: SpendingInsightMessage[];
  calculatedAt: string;
}
```

### Suggested Backend Structure

```
apps/wealth-api/src/spending-insights/
  spending-insights.module.ts
  spending-insights.controller.ts
  spending-insights.service.ts
  spending-insights-calculator.service.ts
  spending-insights-message.service.ts
  spending-insights.service.spec.ts
```

Alternative acceptable structure:

```
apps/wealth-api/src/analytics/
  analytics.module.ts
  spending-insights.controller.ts
  spending-insights.service.ts
```

For clarity, I would prefer a dedicated `spending-insights` module.

### Important Design Guidance

Milestone 3 should remain backend-only.

The endpoint should be designed so the frontend can later render:

- Pie/donut chart for category breakdown
- Bar chart for month-over-month changes
- Cards for subscriptions
- Insight cards for avatar/dashboard nudges
- Investable surplus card
- EMI burden warning card

So the API should not just return strings. It should return structured data and strings.

### Insight Message Examples:

- Surplus Insight: `You have an average monthly surplus of ₹53,000 after regular expenses.`
- Top Category Insight: `Your highest spending category is Groceries at ₹24,000 this month.`
- Category Increase Insight: `Shopping increased by 27% compared to last month.`
- Recurring Subscription Insight: `We found 3 recurring subscriptions with an estimated monthly cost of ₹3,200.`
- Discretionary Spend Insight: `Discretionary spending is 46% of your monthly expenses, which is elevated.`
- Investable Surplus Insight: `Based on your surplus and liquidity needs, you may be able to invest ₹15,000–₹25,000 per month.`
- EMI Burden Warning: `Your EMI burden is 38% of income. Consider keeping new investments conservative until debt obligations reduce.`

## Milestone 3 Verification

- [ ] `GET /api/customers/:customerId/spending-insights` exists.
- [ ] Response uses shared DTO/type.
- [ ] Category breakdown is calculated from debit transactions.
- [ ] Investment transfers are excluded from normal expense breakdown.
- [ ] Top categories are sorted by amount.
- [ ] Latest month is compared with previous month.
- [ ] Month-over-month changes include amount, percent, and direction.
- [ ] Recurring subscriptions are detected.
- [ ] Discretionary spend is calculated.
- [ ] EMI burden status is calculated.
- [ ] Investable surplus estimate is calculated.
- [ ] At least 5 insight types are generated where applicable.
- [ ] No transaction edge case is handled.
- [ ] One-month-only edge case is handled.
- [ ] Missing customer returns clean error.
- [ ] Tests cover the insight engine.
- [ ] API contract docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
