# Demo Script

## 5-Minute Flow

Recommended persona: Nisha Rao, the family-focused mid-career customer.

1. Open the app and select Nisha Rao in the persona switcher.
2. Show the dashboard greeting, wealth readiness score, idle balance, and monthly surplus.
3. Use demo mode to ask: "Can I invest Rs 10,000 per month?"
4. Open the goal planner and show the education or wealth-building goal projection.
5. Open the risk profile panel and show the stored suitability result, or retake the questionnaire if needed.
6. Open recommendations, select the goal, optionally enter `10000`, and generate a backend recommendation.
7. Point out allocation, suitability, reasoning, risk warnings, disclaimer, and next best action.
8. Request an advisor callback from the recommendation result.
9. Scroll to the advisor callback admin panel and show the generated advisor summary.

## Expected Outputs

- Dashboard shows cash flow, readiness, spending insights, goals, risk status, and recommendation state.
- Avatar chat returns deterministic backend guidance and action cards.
- Risk profile shows category, score percent, suitability notes, and disclaimer.
- Recommendation shows bank-approved products only, with reasoning and visible disclaimers.
- Advisor callback creates a request and appears in the admin view with customer, topic, time, risk profile, recommendation suitability, and discussion points.

## Suggested Prompts

- Can I invest Rs 10,000 per month?
- Should I complete my risk profile?
- Explain my recommendation.
- Request advisor callback.
- Can you suggest crypto or stock tips?

## Fallback Plan

No LLM key is required. The advisor chat uses deterministic backend intent handling and still supports affordability, goals, risk profiling, recommendations, unsupported-advice refusal, and callback handoff.
