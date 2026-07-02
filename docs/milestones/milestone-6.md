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

## In Depth

**Milestone 6** is where the MVP starts producing actual **bank-approved, risk-aware investment recommendations**.

Milestone 5 answered:

> “What risk profile is suitable for this customer?”

Milestone 6 should answer:

> “Given this customer’s goal, surplus, risk profile, EMI burden, emergency fund, and bank-approved products, what plan should we recommend?”

# Milestone 6: Product Catalog and Recommendation Engine

## Objective

Build a deterministic, explainable, rule-based recommendation engine.

This milestone should **not use an LLM** to choose products. The LLM/avatar can explain recommendations later, but the actual recommendation must come from controlled backend rules.

The engine should consider:

```txt
risk profile
goal horizon
monthly surplus
investable surplus
EMI burden
emergency fund coverage
goal target amount
planned monthly contribution
idle balance
approved product catalog
```

## Milestone 6: Product Catalog and Recommendation Engine.

Before implementation:
```
1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 1 to Milestone 5 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not implement frontend screens yet unless the milestone explicitly asks for them.
6. Do not implement avatar chat or LLM logic yet.
7. Keep this milestone focused on deterministic, rule-based, bank-approved recommendations.
```

Goal:
```
Implement a rule-based recommendation engine that generates personalized, explainable, compliant investment recommendations using the existing customer profile, account summary, transactions, wealth profile, spending insights, goals, risk profile, and product catalog.
```
Required endpoint:
```JS
POST /api/customers/:customerId/recommendations
```
Existing endpoint:
```JS
GET /api/customers/:customerId/recommendations
```
The existing GET endpoint may already return seeded recommendations from Milestone 1. Preserve backward compatibility. The POST endpoint should generate a new recommendation using rules.

Request shape:
```JSON
{
  "goalId": "GOAL001",
  "monthlyInvestmentCapacity": 10000
}
```

`monthlyInvestmentCapacity` should be optional. If not provided:
```
1. Use goal plannedMonthlyContribution if available.
2. Else use spendingInsights.investableSurplusEstimate.min.
3. Else use 25% of monthly surplus.
4. Else use 0.
```
Response shape:
```JSON
{
  "recommendationId": "REC001",
  "customerId": "CUST002",
  "goalId": "GOAL001",
  "suitability": "SUITABLE",
  "riskProfile": "MODERATE",
  "recommendedPlan": {
    "name": "Balanced SIP + Emergency Buffer Plan",
    "description": "A balanced plan that combines liquidity protection with moderate growth exposure.",
    "monthlyAmount": 10000,
    "oneTimeAmount": 50000,
    "allocation": [
      {
        "productId": "PROD_RD_001",
        "productName": "Recurring Deposit",
        "productType": "RECURRING_DEPOSIT",
        "percentage": 30,
        "monthlyAmount": 3000,
        "oneTimeAmount": 0,
        "rationale": "Provides disciplined savings and lower risk."
      },
      {
        "productId": "PROD_BALANCED_MF_001",
        "productName": "Balanced Mutual Fund Basket",
        "productType": "BALANCED_MF_BASKET",
        "percentage": 70,
        "monthlyAmount": 7000,
        "oneTimeAmount": 50000,
        "rationale": "Matches moderate risk profile and medium-term goal horizon."
      }
    ]
  },
  "reasoning": [
    "Customer has a MODERATE risk profile.",
    "Goal horizon is 60 months.",
    "Customer has positive monthly surplus and manageable EMI burden.",
    "Emergency fund coverage is partially adequate, so allocation keeps some stable exposure."
  ],
  "riskWarnings": [
    "Market-linked investments can fluctuate and returns are not guaranteed."
  ],
  "disclaimer": "This recommendation is based on available banking data, stated goal, and risk profile. Market-linked investments are subject to risk. Please review product documents or speak to a certified advisor before investing.",
  "nextBestAction": {
    "type": "START_SIP",
    "label": "Start recommended SIP",
    "description": "Proceed to review the recommended monthly investment plan."
  },
  "createdAt": "2026-07-02T..."
}
```

### Shared Types:
Create or extend shared DTOs/types for:
- GenerateRecommendationRequest
- RecommendationResult
- RecommendationSuitability
- RecommendedPlan
- RecommendedAllocationItem
- RecommendationNextBestAction
- RecommendationRiskWarning
- ProductRiskLevel if needed

Suitability values:
- SUITABLE
- PARTIALLY_SUITABLE
- NOT_SUITABLE
- NEEDS_ADVISOR_REVIEW

Next best action types:
- BUILD_EMERGENCY_FUND
- START_RD
- START_FD
- START_SIP
- REVIEW_WITH_ADVISOR
- REDUCE_DEBT
- COMPLETE_RISK_PROFILE
- CREATE_GOAL

Product catalog:
Use the existing mock product catalog from Milestone 1. Extend if needed, but keep it bank-approved and controlled.

Allowed MVP product types:
- FIXED_DEPOSIT
- RECURRING_DEPOSIT
- CONSERVATIVE_MF_BASKET
- BALANCED_MF_BASKET
- EQUITY_SIP_BASKET
- TAX_SAVING
- INSURANCE_PROTECTION

Recommendation rules:

1. Risk profile required:
- If customer has no risk profile, do not generate market-linked recommendation.
- Return suitability NEEDS_ADVISOR_REVIEW or NOT_SUITABLE with nextBestAction COMPLETE_RISK_PROFILE.
- Explain that risk profiling is required before investment recommendation.

2. Goal required:
- If goalId is missing or invalid, return a validation error or a response asking user to create/select a goal.
- Do not generate vague generic recommendations.

3. Emergency fund rules:
- If emergencyFundCoverageMonths < 1:
  - Primary recommendation should be emergency fund building through FD/RD/sweep-like stable product.
  - Avoid market-linked allocation.
  - nextBestAction BUILD_EMERGENCY_FUND.
- If emergencyFundCoverageMonths is between 1 and 3:
  - Limit market-linked exposure.
  - Conservative: FD/RD only.
  - Moderate: RD + conservative/balanced basket.
  - Aggressive: still cap equity exposure due to weak emergency fund.

4. EMI burden rules:
- If EMI burden > 45%:
  - Suitability should be PARTIALLY_SUITABLE or NEEDS_ADVISOR_REVIEW.
  - Reduce suggested monthly amount.
  - Avoid aggressive allocation.
  - nextBestAction REDUCE_DEBT or REVIEW_WITH_ADVISOR.
- If EMI burden between 30% and 45%:
  - Cap monthly investment to a conservative portion of investable surplus.
  - Avoid high equity allocation.

5. Risk-profile allocation rules:

CONSERVATIVE:
- Short goal horizon under 3 years:
  - FD/RD dominant.
- Medium/long horizon:
  - FD/RD + Conservative MF Basket, if emergency fund is healthy.
- No Equity SIP Basket.

MODERATE:
- Short horizon under 3 years:
  - RD/FD + Conservative MF Basket.
- 3 to 5 years:
  - RD + Balanced MF Basket.
- More than 5 years:
  - Balanced MF Basket dominant, optional small Equity SIP Basket if emergency fund is strong.

AGGRESSIVE:
- Short horizon under 3 years:
  - Do not recommend aggressive allocation despite risk profile.
  - Use balanced/conservative approach.
- 3 to 5 years:
  - Balanced MF Basket + limited Equity SIP Basket.
- More than 5 years:
  - Equity SIP Basket + Balanced MF Basket.
- Still respect emergency fund and EMI constraints.

6. Goal type rules:
- EMERGENCY_FUND:
  - FD/RD/sweep-like stable recommendation only.
- TAX_SAVING:
  - Tax Saving Basket may be included only if risk profile and horizon allow.
- RETIREMENT / CHILD_EDUCATION / WEALTH_CREATION:
  - Can include market-linked baskets depending on risk and horizon.
- VACATION / VEHICLE_PURCHASE:
  - Usually shorter horizon; prefer FD/RD/conservative allocation.
- HOUSE_PURCHASE:
  - Balance safety and growth based on timeline.

7. Monthly amount rules:
- Recommended monthly amount must not exceed:
  - provided monthlyInvestmentCapacity, if given
  - spending insight investableSurplusEstimate.max
  - monthlySurplus * 0.5
- If monthlySurplus <= 0, do not recommend new investment. Suggest expense review or advisor discussion.
- Round monthly allocation amounts to nearest ₹100.

8. One-time amount rules:
- If idleBalance > 0 and emergency fund is adequate:
  - Suggest a conservative one-time amount from idle balance.
  - Do not use full idle balance.
  - For MVP, oneTimeAmount can be min(25% of idleBalance, 100000).
- If emergency fund is weak:
  - Use idle balance to build emergency fund, not market-linked investing.

9. Product filtering:
- Never recommend a product not present in the approved product catalog.
- Never recommend a product with risk level higher than allowed by final suitability constraints.
- Never recommend EQUITY_SIP_BASKET to CONSERVATIVE customers.
- Never recommend market-linked product if risk profile is missing.

10. Compliance:
Every recommendation must include:
- reasoning
- risk warnings where market-linked products are included
- disclaimer
- suitability status
- next best action

The engine must not:
- promise guaranteed returns
- recommend individual stocks
- recommend crypto
- recommend products outside the catalog
- bypass risk profile
- hide market risk warnings

Persistence:
- Save generated recommendations in the in-memory recommendation repository.
- GET `/api/customers/:customerId/recommendations` should return both seeded and generated recommendations.

Testing:
Add unit tests for:
- missing customer
- missing goal
- missing risk profile
- no monthly surplus
- weak emergency fund
- high EMI burden
- conservative risk profile
- moderate risk profile
- aggressive risk profile
- short goal horizon overriding aggressive profile
- emergency fund goal recommending only stable products
- conservative customer never receiving equity SIP
- market-linked products always include risk warning
- product catalog filtering
- monthly amount capped by surplus/investable surplus
- idle balance one-time suggestion
- recommendation persistence
- disclaimer always present

API/controller tests:
- successful recommendation generation
- generated recommendation appears in GET list
- missing customer response
- missing goal response
- missing risk profile response
- invalid monthly amount validation

Documentation:
Update or create:
docs/milestone-status/milestone-06-product-catalog-and-recommendation-engine-status.md

The status document must track:
- implementation status
- testing status
- production-readiness status
- completed items
- pending items
- blockers
- known limitations

Also update:
- `docs/api-contracts.md` with POST `/api/customers/:customerId/recommendations`
- `docs/mvp-checklist.md` if applicable

Acceptance Criteria:
- `POST /api/customers/:customerId/recommendations` generates a deterministic recommendation.
- Recommendation uses risk profile, goal, wealth profile, spending insights, and product catalog.
- No unsupported product can be recommended.
- No market-linked recommendation is generated without risk profile.
- Conservative customers never receive aggressive products.
- Emergency fund and EMI burden constraints affect allocation.
- Every recommendation includes reasoning, risk warnings, disclaimer, suitability, and next best action.
- Generated recommendations are saved and retrievable.
- Shared DTOs/types are used.
- Tests cover recommendation rules and guardrails.
- API contract docs are updated.
- Milestone status document is updated.

# Recommended Shared Types

Codex can adapt this to the current project conventions.

```ts
export type RecommendationSuitability =
  | 'SUITABLE'
  | 'PARTIALLY_SUITABLE'
  | 'NOT_SUITABLE'
  | 'NEEDS_ADVISOR_REVIEW';

export type RecommendationNextBestActionType =
  | 'BUILD_EMERGENCY_FUND'
  | 'START_RD'
  | 'START_FD'
  | 'START_SIP'
  | 'REVIEW_WITH_ADVISOR'
  | 'REDUCE_DEBT'
  | 'COMPLETE_RISK_PROFILE'
  | 'CREATE_GOAL';

export interface GenerateRecommendationRequest {
  goalId: string;
  monthlyInvestmentCapacity?: number;
}

export interface RecommendedAllocationItem {
  productId: string;
  productName: string;
  productType: ProductCatalogItem['productType'];
  percentage: number;
  monthlyAmount: number;
  oneTimeAmount: number;
  rationale: string;
}

export interface RecommendedPlan {
  name: string;
  description: string;
  monthlyAmount: number;
  oneTimeAmount: number;
  allocation: RecommendedAllocationItem[];
}

export interface RecommendationNextBestAction {
  type: RecommendationNextBestActionType;
  label: string;
  description: string;
}

export interface RecommendationResult {
  recommendationId: string;
  customerId: string;
  goalId: string;
  suitability: RecommendationSuitability;
  riskProfile: RiskProfileCategory | null;
  recommendedPlan: RecommendedPlan | null;
  reasoning: string[];
  riskWarnings: string[];
  disclaimer: string;
  nextBestAction: RecommendationNextBestAction;
  createdAt: string;
}
```

---

# Suggested Backend Structure

If `recommendations` already exists from Milestone 1, extend it instead of creating duplicates.

Recommended structure:

```txt
apps/wealth-api/src/recommendations/
  recommendations.module.ts
  recommendations.controller.ts
  recommendations.service.ts
  recommendation-engine.service.ts
  recommendation-policy.service.ts
  recommendation-amount.service.ts
  recommendation-compliance.service.ts
  recommendations.repository.ts
  recommendation-engine.service.spec.ts
  recommendations.controller.spec.ts
```

A simpler version is also fine:

```txt
apps/wealth-api/src/recommendations/
  recommendations.controller.ts
  recommendations.service.ts
  recommendation-engine.service.ts
```

But avoid putting all rules directly in the controller.

---

# Suggested Allocation Rules

Use this as a baseline. Codex can implement equivalent deterministic rules.

## Conservative

| Condition                                | Allocation                         |
| ---------------------------------------- | ---------------------------------- |
| Emergency fund weak                      | 100% RD/FD                         |
| Horizon < 3 years                        | 60% FD, 40% RD                     |
| Horizon 3+ years, emergency fund healthy | 50% RD, 50% Conservative MF Basket |

## Moderate

| Condition                                    | Allocation                                            |
| -------------------------------------------- | ----------------------------------------------------- |
| Emergency fund weak                          | 70% RD, 30% Conservative MF Basket                    |
| Horizon < 3 years                            | 50% RD, 50% Conservative MF Basket                    |
| Horizon 3–5 years                            | 30% RD, 70% Balanced MF Basket                        |
| Horizon > 5 years and healthy emergency fund | 20% RD, 70% Balanced MF Basket, 10% Equity SIP Basket |

## Aggressive

| Condition                                    | Allocation                                    |
| -------------------------------------------- | --------------------------------------------- |
| Emergency fund weak                          | 50% RD, 50% Balanced MF Basket                |
| Horizon < 3 years                            | 40% RD, 60% Balanced MF Basket                |
| Horizon 3–5 years                            | 30% Balanced MF Basket, 70% Equity SIP Basket |
| Horizon > 5 years and healthy emergency fund | 20% Balanced MF Basket, 80% Equity SIP Basket |

Important: these are MVP rules for demo. They are not real investment advice.

---

# Recommendation Examples

## Example 1: Conservative Retired Customer

```txt
Risk profile: CONSERVATIVE
Goal: Monthly income stability
Emergency fund: healthy
EMI burden: low
Recommendation: FD + RD
Suitability: SUITABLE
Next action: START_FD
```

No equity SIP.

---

## Example 2: Family-Focused Moderate Customer

```txt
Risk profile: MODERATE
Goal: Child education in 8 years
Emergency fund: 3–6 months
EMI burden: manageable
Recommendation: RD + Balanced MF Basket
Suitability: SUITABLE
Next action: START_SIP
```

Include market-linked warning.

---

## Example 3: Aggressive Customer but Weak Emergency Fund

```txt
Risk profile: AGGRESSIVE
Goal: Wealth creation
Emergency fund: less than 1 month
EMI burden: manageable
Recommendation: Build emergency fund first through RD/FD
Suitability: PARTIALLY_SUITABLE
Next action: BUILD_EMERGENCY_FUND
```

Do not recommend high equity allocation yet.

---

## Example 4: High EMI Burden

```txt
Risk profile: MODERATE
Goal: House purchase
EMI burden: 48%
Recommendation: Reduced monthly amount, stable allocation, advisor review
Suitability: NEEDS_ADVISOR_REVIEW
Next action: REDUCE_DEBT
```

---

# Compliance Text

Use a consistent disclaimer like:

```txt
This recommendation is based on available banking data, stated goal, and risk profile. Market-linked investments are subject to risk. Returns are not guaranteed. Please review product documents or speak to a certified advisor before investing.
```

For FD/RD-only plans, use a softer version:

```txt
This recommendation is based on available banking data, stated goal, and risk profile. Please review applicable product terms, liquidity conditions, and charges before investing.
```

## Milestone 6 Verification
```
- [ ] `POST /api/customers/:customerId/recommendations` exists.
- [ ] `GET /api/customers/:customerId/recommendations` still works.
- [ ] Recommendation uses shared DTOs.
- [ ] Recommendation requires valid customer.
- [ ] Recommendation requires valid goal.
- [ ] Market-linked recommendation requires risk profile.
- [ ] Recommendation consumes wealth profile values.
- [ ] Recommendation consumes spending insights values.
- [ ] Recommendation consumes goal horizon.
- [ ] Recommendation consumes product catalog.
- [ ] Conservative customers never receive Equity SIP Basket.
- [ ] Weak emergency fund reduces or blocks market-linked exposure.
- [ ] High EMI burden reduces monthly amount or triggers advisor review.
- [ ] Short goal horizon overrides aggressive allocation.
- [ ] Emergency fund goal recommends only stable products.
- [ ] Monthly amount is capped by capacity/surplus.
- [ ] One-time idle balance recommendation is conservative.
- [ ] All products come from approved product catalog.
- [ ] Market-linked products include risk warning.
- [ ] Disclaimer is always present.
- [ ] Recommendation reasoning is returned.
- [ ] Next best action is returned.
- [ ] Generated recommendation is saved.
- [ ] Tests cover rules and guardrails.
- [ ] API contract docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
