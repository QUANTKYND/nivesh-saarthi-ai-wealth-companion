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
