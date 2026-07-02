# Goal Planner

### Goal: Allow users to create and analyze financial goals.

Implement goal planning APIs.

Features:

- create goal
- list goals
- get goal projection
- calculate required monthly investment
- calculate goal shortfall
- suggest step-up contribution if current capacity is insufficient

Endpoints:

```JS
GET /api/customers/:customerId/goals
```

```JS
POST /api/customers/:customerId/goals
```

```JS
GET /api/customers/:customerId/goals/:goalId/projection
```

Use simple financial projection formulas for MVP.

### Acceptance Criteria

- User can create a goal.
- Backend calculates monthly investment required.
- Backend explains whether the goal is achievable.

## In Depth:

Start Milestone 4: Goal Planner.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect existing Milestone 1, 2, and 3 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not implement frontend screens yet unless the milestone explicitly asks for them.
6. Do not implement recommendation rules yet.
7. Do not implement risk questionnaire scoring yet.
8. Keep this milestone focused on goal creation, listing, and projection calculations.

Goal:
Implement goal planning APIs for the Digital Wealth Management MVP.

Required endpoints:
GET /api/customers/:customerId/goals
POST /api/customers/:customerId/goals
GET /api/customers/:customerId/goals/:goalId/projection

Existing GET /api/customers/:customerId/goals may already exist from Milestone 1. Extend it only if needed, but preserve backward compatibility.

Features:

- List customer goals.
- Create a new customer goal.
- Validate goal input.
- Calculate required monthly investment.
- Calculate projected future value based on current savings and planned monthly contribution.
- Calculate goal shortfall or surplus.
- Estimate whether the goal is achievable.
- Suggest a yearly step-up contribution if current monthly capacity is insufficient.
- Return clear explanation strings for the frontend/avatar.

Use simple deterministic MVP financial projection formulas.
Do not hardcode projection outputs.

Shared Types:
Create or extend shared DTOs/types for:

- CreateGoalRequest
- GoalResponse if needed
- GoalProjection
- GoalAchievabilityStatus
- GoalProjectionAssumptions
- StepUpSuggestion

Suggested request for creating a goal:
{
"goalType": "CHILD_EDUCATION",
"name": "Child Education",
"targetAmount": 1000000,
"currentSavings": 100000,
"targetDate": "2031-07-01",
"priority": "HIGH",
"plannedMonthlyContribution": 10000,
"expectedAnnualReturnPercent": 8
}

Rules:

- customerId must exist.
- targetAmount must be greater than 0.
- currentSavings must be >= 0.
- targetDate must be in the future.
- plannedMonthlyContribution must be >= 0 if provided.
- expectedAnnualReturnPercent must be within a safe MVP range, for example 0 to 15.
- goalType must be one of the supported shared GoalType values.
- priority must be LOW, MEDIUM, or HIGH.
- If plannedMonthlyContribution is not provided, use the customer’s investable surplus estimate from the spending insights engine or a conservative fallback from monthly surplus.

Projection endpoint response should include:

```
{
  "goalId": "GOAL001",
  "customerId": "CUST002",
  "goalName": "Child Education",
  "goalType": "CHILD_EDUCATION",
  "targetAmount": 1000000,
  "currentSavings": 100000,
  "targetDate": "2031-07-01",
  "monthsRemaining": 60,
  "plannedMonthlyContribution": 10000,
  "expectedAnnualReturnPercent": 8,
  "requiredMonthlyContribution": 13250,
  "projectedAmount": 792000,
  "shortfallOrSurplus": -208000,
  "achievabilityStatus": "AT_RISK",
  "stepUpSuggestion": {
    "isRequired": true,
    "suggestedAnnualStepUpPercent": 10,
    "estimatedProjectedAmountWithStepUp": 1015000,
    "explanation": "A 10% yearly step-up may help close the projected shortfall."
  },
  "assumptions": {
    "compoundingFrequency": "MONTHLY",
    "inflationAdjusted": false,
    "returnsAreIllustrative": true
  },
  "explanations": [
    "You have 60 months remaining for this goal.",
    "At your planned contribution of ₹10,000 per month, you may fall short by around ₹2,08,000.",
    "Increasing your contribution annually may improve goal achievability."
  ],
  "calculatedAt": "2026-07-02T..."
}
```

Financial formula guidance:
Use monthly compounding for MVP.

Future value of current savings:

```
FV_current = currentSavings * (1 + monthlyRate) ^ months
```

Future value of monthly contribution:

```
FV_sip = monthlyContribution * (((1 + monthlyRate) ^ months - 1) / monthlyRate)
```

Projected amount:

```
projectedAmount = FV_current + FV_sip
```

Required monthly contribution:

```
remainingTargetAfterCurrentSavingsGrowth = targetAmount - FV_current
requiredMonthlyContribution = remainingTargetAfterCurrentSavingsGrowth / annuityFactor
```

Where:

```
monthlyRate = expectedAnnualReturnPercent / 12 / 100
annuityFactor = (((1 + monthlyRate) ^ months - 1) / monthlyRate)
```

Handle 0% return safely:

```
FV_current = currentSavings
FV_sip = monthlyContribution * months
requiredMonthlyContribution = (targetAmount - currentSavings) / months
```

Achievability status:

```
- ACHIEVABLE: projectedAmount >= targetAmount
- AT_RISK: projectedAmount is between 75% and 99.99% of targetAmount
- OFF_TRACK: projectedAmount < 75% of targetAmount
```

Step-up suggestion:
If goal is not achievable, test annual step-up percentages:

- 5%
- 10%
- 15%

Use the lowest step-up percentage that gets projectedAmount >= targetAmount.
If none achieves the goal, return the best tested step-up and explain that the user may need a higher starting amount, longer timeline, or advisor support.

Testing:
Add unit tests for:

- create goal validation
- listing goals
- projection with positive annual return
- projection with zero annual return
- required monthly contribution
- shortfall and surplus
- achievability status
- step-up suggestion
- target date in the past
- customer not found
- goal not found
- missing planned contribution fallback

API/controller tests:

- successful goal creation
- successful goal listing
- successful projection response
- validation error response
- missing customer response
- missing goal response

Documentation:
Update or create:
docs/milestone-status/milestone-04-goal-planner-status.md

The status document must track:

- implementation status
- testing status
- production-readiness status
- completed items
- pending items
- blockers
- known limitations

Also update:

- docs/api-contracts.md with new/updated endpoints
- docs/mvp-checklist.md if applicable

Acceptance Criteria:

- Goals can be listed for a customer.
- New goals can be created with validation.
- Goal projection endpoint returns deterministic calculations.
- Required monthly investment is calculated.
- Shortfall or surplus is calculated.
- Step-up suggestion is returned when needed.
- Edge cases are handled cleanly.
- Shared DTOs/types are used.
- Tests cover goal planning calculations.
- API contract docs are updated.
- Milestone status document is updated.

### Recommended shared types

```
export type GoalAchievabilityStatus = 'ACHIEVABLE' | 'AT_RISK' | 'OFF_TRACK';

export interface CreateGoalRequest {
  goalType: GoalType;
  name: string;
  targetAmount: number;
  currentSavings: number;
  targetDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  plannedMonthlyContribution?: number;
  expectedAnnualReturnPercent?: number;
}

export interface GoalProjectionAssumptions {
  compoundingFrequency: 'MONTHLY';
  inflationAdjusted: boolean;
  returnsAreIllustrative: boolean;
}

export interface StepUpSuggestion {
  isRequired: boolean;
  suggestedAnnualStepUpPercent: number | null;
  estimatedProjectedAmountWithStepUp: number | null;
  explanation: string;
}

export interface GoalProjection {
  goalId: string;
  customerId: string;
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentSavings: number;
  targetDate: string;
  monthsRemaining: number;
  plannedMonthlyContribution: number;
  expectedAnnualReturnPercent: number;
  requiredMonthlyContribution: number;
  projectedAmount: number;
  shortfallOrSurplus: number;
  achievabilityStatus: GoalAchievabilityStatus;
  stepUpSuggestion: StepUpSuggestion;
  assumptions: GoalProjectionAssumptions;
  explanations: string[];
  calculatedAt: string;
}
```
