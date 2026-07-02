# Risk Profiling Engine

### Goal: Create suitability founation

Implement risk profiling module.

Create:

- risk questionnaire endpoint
- submit answers endpoint
- scoring logic
- output categories: Conservative, Moderate, Aggressive
- explanation for assigned risk profile

Endpoints:

```JS
GET /api/risk-profile/questions
```

```JS
POST /api/customers/:customerId/risk-profile
```

Risk score must consider:

- investment horizon
- income stability
- loss tolerance
- emergency fund status
- investment experience
- liquidity needs

### Acceptance Criteria

- User can complete questionnaire.
- Risk profile is saved.
- Explanation is returned.
- Recommendation engine can consume risk profile.

## In Depth

### Objective
Build a deterministic backend risk profiling engine that asks customer-friendly questions, scores answers, and assigns one of three suitability categories:
- CONSERVATIVE
- MODERATE
- AGGRESSIVE

This milestone should support:

- Risk questionnaire API
- Submit answers API
- Risk score calculation
- Risk profile category assignment
- Explanation of why the customer received that category
- Storage/update of customer risk profile
- Tests for scoring and edge cases

This should remain backend-focused unless your milestone document explicitly includes frontend.

Start Milestone 5: Risk Profiling Engine.

Before implementation:
1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect existing Milestone 1, 2, 3, and 4 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not implement frontend screens yet unless the milestone explicitly asks for them.
6. Do not implement recommendation rules yet.
7. Do not implement LLM advisor chat yet.
8. Keep this milestone focused on risk questionnaire, scoring, profile assignment, and explainability.

Goal:
Implement the risk profiling module for customer investment suitability.

Required endpoints:
```JS
GET /api/risk-profile/questions
POST /api/customers/:customerId/risk-profile
GET /api/customers/:customerId/risk-profile
```
Existing `GET /api/customers/:customerId/risk-profile` may already exist from Milestone 1. Preserve backward compatibility and extend it if needed.

Risk profile output categories:
- CONSERVATIVE
- MODERATE
- AGGRESSIVE

Required scoring inputs:
- investment horizon
- income stability
- loss tolerance
- emergency fund status
- investment experience
- liquidity needs
- dependence on invested funds
- primary investment objective

Shared Types:
Create or extend shared DTOs/types for:
- RiskProfileQuestion
- RiskProfileQuestionOption
- SubmitRiskProfileRequest
- SubmitRiskProfileAnswer
- RiskProfileResult
- RiskProfileScoreBreakdown
- RiskProfileCategory

Questionnaire endpoint should return structured questions:
```JSON
{
  "questions": [
    {
      "id": "investment_horizon",
      "label": "How long can you stay invested for this goal?",
      "description": "Longer investment horizons can usually support more market-linked exposure.",
      "type": "SINGLE_CHOICE",
      "options": [
        {
          "id": "less_than_1_year",
          "label": "Less than 1 year",
          "score": 0
        },
        {
          "id": "1_to_3_years",
          "label": "1 to 3 years",
          "score": 1
        },
        {
          "id": "3_to_5_years",
          "label": "3 to 5 years",
          "score": 2
        },
        {
          "id": "more_than_5_years",
          "label": "More than 5 years",
          "score": 3
        }
      ]
    }
  ]
}
```

Submit request:
```JSON
{
  "answers": [
    {
      "questionId": "investment_horizon",
      "optionId": "more_than_5_years"
    },
    {
      "questionId": "loss_tolerance",
      "optionId": "moderate_loss_tolerance"
    }
  ]
}
```
Submit response:
```JSON
{
  "customerId": "CUST002",
  "category": "MODERATE",
  "score": 14,
  "maxScore": 24,
  "scorePercent": 58.33,
  "investmentHorizonYears": 5,
  "lossTolerance": "MEDIUM",
  "incomeStability": "HIGH",
  "liquidityNeed": "MEDIUM",
  "investmentExperience": "BASIC",
  "scoreBreakdown": [
    {
      "questionId": "investment_horizon",
      "label": "Investment horizon",
      "selectedOptionId": "more_than_5_years",
      "selectedOptionLabel": "More than 5 years",
      "score": 3,
      "maxScore": 3,
      "explanation": "A longer horizon can support moderate market-linked exposure."
    }
  ],
  "explanation": [
    "Your profile is Moderate because you have a medium-to-long investment horizon and stable income.",
    "You can tolerate some short-term fluctuation but may prefer a balanced approach.",
    "Recommendations should balance capital protection with growth potential."
  ],
  "suitabilityNotes": [
    "Avoid aggressive allocations for short-term goals.",
    "Maintain an emergency fund before increasing market-linked investments."
  ],
  "updatedAt": "2026-07-02T..."
}
```
Scoring model: Use deterministic scoring.

Suggested questions and scoring:

1. investment_horizon
```
- less_than_1_year: 0
- 1_to_3_years: 1
- 3_to_5_years: 2
- more_than_5_years: 3
```

2. income_stability
```
- unstable: 0
- somewhat_stable: 1
- stable: 2
- very_stable: 3
```

3. loss_tolerance
```
- cannot_tolerate_loss: 0
- small_temporary_loss: 1
- moderate_fluctuation: 2
- high_fluctuation_for_growth: 3
```

4. emergency_fund_status
```
- no_emergency_fund: 0
- less_than_3_months: 1
- 3_to_6_months: 2
- more_than_6_months: 3
```

5. investment_experience
```
- none: 0
- fixed_deposits_only: 1
- mutual_funds_or_sips: 2
- market_linked_experience: 3
```

6. liquidity_needs
```
- need_money_anytime: 0
- may_need_within_1_year: 1
- can_lock_for_3_years: 2
- can_lock_for_5_plus_years: 3
```

7. dependence_on_invested_funds
```
- fully_dependent: 0
- partially_dependent: 1
- not_dependent: 2
```

8. investment_objective
```
- capital_protection: 0
- income_generation: 1
- balanced_growth: 2
- long_term_growth: 3
```

Suggested max score:
```
23
```

Category mapping:
```
- 0 to 8: CONSERVATIVE
- 9 to 16: MODERATE
- 17 to 23: AGGRESSIVE
```

Additional safety overrides:
- If investment horizon is less_than_1_year, category cannot exceed CONSERVATIVE.
- If emergency fund status is no_emergency_fund, category cannot exceed MODERATE.
- If loss tolerance is cannot_tolerate_loss, category must be CONSERVATIVE.
- If liquidity need is need_money_anytime, category cannot exceed CONSERVATIVE.
- If customer is retired/senior and loss tolerance is low, category should remain CONSERVATIVE even if other answers score higher.

Implementation requirements:
- Questionnaire should be centrally defined and reusable.
- Validate that every submitted answer has a valid questionId and optionId.
- Validate required questions are answered.
- Store/update the risk profile in the in-memory repository.
- Return updated risk profile from GET /api/customers/:customerId/risk-profile.
- Do not generate recommendations in this milestone.
- Do not call any LLM.
- Keep the scoring explainable.

Testing:
Add unit tests for:
- questionnaire retrieval
- valid risk profile submission
- conservative scoring
- moderate scoring
- aggressive scoring
- score percent calculation
- score breakdown generation
- invalid questionId
- invalid optionId
- missing required answers
- customer not found
- safety override for short investment horizon
- safety override for no emergency fund
- safety override for zero loss tolerance
- safety override for high liquidity need
- senior conservative override if applicable

API/controller tests:
- GET questionnaire success
- POST risk profile success
- GET customer risk profile after submission
- validation error response
- missing customer response

Documentation:

Update or create: `docs/milestone-status/milestone-05-risk-profiling-engine-status.md`

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
- Risk questionnaire is available through API.
- Customer can submit risk profile answers.
- Risk score is calculated deterministically.
- Risk category is assigned.
- Safety overrides are applied.
- Risk profile is saved and retrievable.
- Result includes explanation and score breakdown.
- Invalid answers are rejected.
- Missing customer is handled cleanly.
- Shared DTOs/types are used.
- Tests cover scoring and safety overrides.
- API contract docs are updated.
- Milestone status document is updated.

### Recommended Shared Types
```
export type RiskProfileQuestionType = 'SINGLE_CHOICE';

export type RiskProfileCategory = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export interface RiskProfileQuestionOption {
  id: string;
  label: string;
  score: number;
  explanation?: string;
}

export interface RiskProfileQuestion {
  id: string;
  label: string;
  description?: string;
  type: RiskProfileQuestionType;
  required: boolean;
  options: RiskProfileQuestionOption[];
}

export interface RiskProfileQuestionnaire {
  questions: RiskProfileQuestion[];
}

export interface SubmitRiskProfileAnswer {
  questionId: string;
  optionId: string;
}

export interface SubmitRiskProfileRequest {
  answers: SubmitRiskProfileAnswer[];
}

export interface RiskProfileScoreBreakdown {
  questionId: string;
  label: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface RiskProfileResult {
  customerId: string;
  category: RiskProfileCategory;
  score: number;
  maxScore: number;
  scorePercent: number;
  investmentHorizonYears: number;
  lossTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  incomeStability: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidityNeed: 'LOW' | 'MEDIUM' | 'HIGH';
  investmentExperience: 'NONE' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  scoreBreakdown: RiskProfileScoreBreakdown[];
  explanation: string[];
  suitabilityNotes: string[];
  updatedAt: string;
}
```

### Suggested Backend Structure
```
apps/wealth-api/src/risk-profiles/
  risk-profiles.module.ts
  risk-profiles.controller.ts
  risk-profiles.service.ts
  risk-questionnaire.service.ts
  risk-profile-scoring.service.ts
  risk-profiles.repository.ts
  risk-profile-scoring.service.spec.ts
  risk-profiles.controller.spec.ts
```
Alternative structure is fine if it matches your current repo conventions.

### Suggested Questionnaire

#### 1. Investment Horizon
```
How long can you stay invested for this goal?
```
Options:
```
* Less than 1 year
* 1 to 3 years
* 3 to 5 years
* More than 5 years
```

#### 2. Income Stability
```
How stable is your monthly income?
```
Options:
```
* Irregular or uncertain
* Somewhat stable
* Stable
* Very stable
```

#### 3. Loss Tolerance
```
How would you react if your investment value fell temporarily?
```
Options:
```
* I would not be comfortable with any loss
* I can tolerate a small temporary decline
* I can tolerate moderate fluctuation
* I can tolerate high fluctuation for higher long-term growth
```

#### 4. Emergency Fund
```
How many months of expenses do you have as emergency savings?
```
Options:
```
* No emergency fund
* Less than 3 months
* 3 to 6 months
* More than 6 months
```

#### 5. Investment Experience
```
5. Investment Experience
```
Options:
```
* I have not invested before
* I mainly use fixed deposits or recurring deposits
* I have used mutual funds or SIPs
* I have experience with market-linked investments
```

#### 6. Liquidity Needs
```
How soon might you need this money?
```
Options:
```
* I may need it anytime
* Within 1 year
* I can keep it invested for around 3 years
* I can keep it invested for 5 years or more
```

#### 7. Dependence on Invested Funds
```
How dependent are you on this money for regular expenses?
```
Options:
```
* Fully dependent
* Partially dependent
* Not dependent
```

#### 8. Investment Objective
```
What is your main investment objective?
```
Options:
```
* Capital protection
* Regular income
* Balanced growth
* Long-term growth
```

### Risk Profile Explanation Examples
#### Conservative
```
Your profile is Conservative because your answers indicate lower loss tolerance, shorter investment horizon, or higher liquidity needs.
```

#### Moderate
```
Your profile is Moderate because you can tolerate some fluctuation and have a reasonable investment horizon.
```

#### Aggresive
```
Your profile is Aggressive because you have a longer investment horizon, stronger loss tolerance, and lower short-term liquidity needs.
```

```
Recommendations may include higher growth-oriented exposure, subject to goal suitability and bank-approved product rules.
```

### Important Guardrails for Milestone 5

Risk profile does not mean product recommendation yet.

Do not generate:

- Mutual fund recommendation
- FD/RD allocation
- SIP plan
- Insurance recommendation
- Product basket selection

That belongs to Milestone 6.

Milestone 5 only returns suitability category and explanation.


## Milestone 5 Verification
```
- [ ] `GET /api/risk-profile/questions` exists.
- [ ] `POST /api/customers/:customerId/risk-profile` exists.
- [ ] `GET /api/customers/:customerId/risk-profile` still works.
- [ ] Questionnaire returns structured questions and options.
- [ ] All required questions are validated.
- [ ] Invalid question IDs are rejected.
- [ ] Invalid option IDs are rejected.
- [ ] Score is deterministic.
- [ ] Score percent is calculated.
- [ ] Score breakdown is returned.
- [ ] Conservative profile can be generated.
- [ ] Moderate profile can be generated.
- [ ] Aggressive profile can be generated.
- [ ] Short-horizon safety override works.
- [ ] No-emergency-fund safety override works.
- [ ] Zero-loss-tolerance safety override works.
- [ ] High-liquidity-need safety override works.
- [ ] Result includes explanation.
- [ ] Result includes suitability notes.
- [ ] Risk profile is saved and retrievable.
- [ ] Customer not found is handled.
- [ ] Shared DTOs are used.
- [ ] API contract docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```