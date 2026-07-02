# AI Advisor Chat Backend

### Goal: Build controlled avatar chat.

Implement advisor chat backend.

Create endpoint:
POST /api/advisor-chat/message

The chat service should:

- accept customerId and user message
- classify intent
- call internal services/tools
- generate safe response
- attach UI action cards
- add disclaimer when needed
- write audit log

Supported intents:

- spending_summary
- investment_capacity
- create_goal_help
- risk_profile_help
- recommendation_explanation
- emergency_fund_check
- advisor_callback

For MVP, use a pluggable LLM adapter. Also provide a deterministic fallback response generator so the demo works without an API key.

### Acceptance Criteria

- Chat works even without LLM.
- Chat can answer financial questions using customer data.
- Chat does not invent unsupported products.
- Chat logs all interactions.

## In Depth

Start Milestone 7: AI Advisor Chat Backend.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 1 through Milestone 6 implementations.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not implement frontend chat UI yet.
6. Do not allow an LLM to choose products, allocations, or bypass backend rules.
7. Keep this milestone focused on controlled chat orchestration, deterministic fallback responses, internal service calls, guardrails, and audit logging.

Goal:
Implement a backend advisor chat service that accepts customer messages, classifies intent, reads existing banking and wealth data, returns safe advisor-style responses, attaches UI action cards, and logs the interaction for audit.

Required endpoint:
POST /api/advisor-chat/message

Existing endpoint:
GET /api/customers/:customerId/advisor-chat/messages

Preserve the existing message history endpoint and extend repository support only as needed to persist new chat messages.

Request shape:

```JSON
{
  "customerId": "cust-family-001",
  "message": "Can I invest INR 10,000 per month?"
}
```

Response shape:

```JSON
{
  "conversationId": "chat-cust-family-001",
  "customerId": "cust-family-001",
  "intent": "investment_capacity",
  "response": "Based on your current income, expenses, surplus, and EMI burden, INR 10,000 per month appears affordable for goal-based planning. A final product recommendation still requires a selected goal and active risk profile.",
  "actionCards": [
    {
      "type": "OPEN_GOAL_PLANNER",
      "label": "Create or review goal",
      "description": "Choose a goal before generating a recommendation.",
      "payload": {
        "customerId": "cust-family-001"
      }
    }
  ],
  "disclaimer": "This is educational guidance based on available banking data. It is not a guaranteed return claim or a product recommendation.",
  "createdAt": "2026-07-02T..."
}
```

Shared Types:
Create or extend shared DTOs/types for:

- AdvisorChatRequest
- AdvisorChatResponse
- AdvisorChatIntent
- AdvisorChatActionCard
- AdvisorChatActionType
- AdvisorChatActionPayload

Supported intents:

- spending_summary
- investment_capacity
- create_goal_help
- risk_profile_help
- recommendation_explanation
- emergency_fund_check
- advisor_callback
- unsupported_advice
- unknown

Allowed internal capabilities:

- Fetch customer wealth profile.
- Fetch spending insights.
- Fetch goals and projections.
- Fetch risk profile.
- Fetch generated recommendations.
- Request advisor callback handoff.
- Write chat messages and audit logs.

Implementation requirements:

- Create an advisor chat request handler in the existing advisor-chat module.
- Validate customerId exists.
- Reject empty or whitespace-only messages.
- Classify intent deterministically using keyword and phrase matching.
- Provide a deterministic fallback response generator that works without an LLM API key.
- Add a pluggable LLM adapter interface only for optional wording enhancement.
- The LLM adapter must not choose products, allocations, suitability, or next actions.
- Persist both customer message and advisor/system response in the in-memory repository.
- Add audit log entries for submitted messages and generated advisor responses.
- Return action cards for supported next steps.
- Include disclaimers for affordability, recommendation, market-linked, or sensitive guidance.

Intent routing rules:

1. spending_summary:
   - Use spending insights.
   - Mention monthly income, expenses, surplus, top spend categories, and key insight.
   - Attach action card OPEN_SPENDING_INSIGHTS.

2. investment_capacity:
   - Use spending insights and wealth profile.
   - Explain affordability using surplus, investable surplus estimate, EMI burden, and emergency fund coverage.
   - Do not recommend products.
   - Attach action card OPEN_GOAL_PLANNER or OPEN_RECOMMENDATIONS if goals and risk profile are ready.

3. create_goal_help:
   - Explain goal creation inputs.
   - Attach action card OPEN_GOAL_PLANNER.

4. risk_profile_help:
   - Explain why suitability profiling is required.
   - Attach action card OPEN_RISK_PROFILE.

5. recommendation_explanation:
   - Fetch latest generated recommendation.
   - Explain suitability, allocation, reasoning, warnings, and disclaimer.
   - Do not invent products if no recommendation exists.
   - Attach action card OPEN_RECOMMENDATIONS.

6. emergency_fund_check:
   - Use wealth profile and spending insights.
   - Explain emergency fund coverage in months.
   - Attach action card OPEN_SPENDING_INSIGHTS or OPEN_GOAL_PLANNER.

7. advisor_callback:
   - Explain handoff and attach REQUEST_ADVISOR_CALLBACK action.

8. unsupported_advice:
   - Trigger for individual stocks, crypto, guaranteed returns, tax/legal advice, unsupported products, or bypassing suitability.
   - Refuse safely and redirect to approved planning or advisor handoff.

Guardrails:

- Do not recommend individual stocks.
- Do not recommend crypto.
- Do not promise or imply guaranteed returns.
- Do not recommend products outside the approved catalog.
- Do not generate a market-linked recommendation without risk profile and goal.
- Do not provide legal or tax advice beyond generic guidance.
- Do not hide risk warnings or disclaimers.
- For complex, high-value, unclear, or sensitive advice, recommend advisor handoff.

Testing:
Add unit tests for:

- intent classification for all supported intents
- deterministic fallback response without LLM API key
- spending summary response
- investment capacity response
- recommendation explanation response
- missing customer
- empty message
- unsupported stock/crypto/guaranteed-return queries
- action card generation
- disclaimer generation
- chat message persistence
- audit log creation

API/controller tests:

- POST advisor chat message success
- validation error response
- missing customer response
- unsupported advice response
- GET message history includes new messages

Documentation:
Update or create:
docs/milestone-status/milestone-07-ai-advisor-chat-backend-status.md

Also update:

- docs/api-contracts.md with POST /api/advisor-chat/message
- docs/mvp-checklist.md if applicable
- README only if setup, environment variables, or demo flow changes

Acceptance Criteria:

- Advisor chat works without an LLM API key.
- User messages are classified into supported intents.
- Responses use backend customer data where applicable.
- Unsupported advice is blocked with a safe response.
- Action cards are returned for supported flows.
- Disclaimers are included where required.
- Customer and advisor messages are persisted.
- Chat interactions are auditable.
- Tests cover intent handling, guardrails, and persistence.

## Milestone 7 Verification

```txt
- [ ] POST /api/advisor-chat/message exists.
- [ ] Existing chat history endpoint still works.
- [ ] Empty messages are rejected.
- [ ] Missing customer is handled.
- [ ] Intent classification is deterministic.
- [ ] Chat works without LLM configuration.
- [ ] Spending summary intent uses spending insights.
- [ ] Investment capacity intent uses surplus, EMI burden, and emergency fund data.
- [ ] Recommendation explanation uses stored recommendation data.
- [ ] Unsupported advice is blocked.
- [ ] No individual stocks, crypto, guaranteed returns, or unsupported products are recommended.
- [ ] Action cards are returned.
- [ ] Disclaimers are returned.
- [ ] Chat messages are persisted.
- [ ] Audit logs are written.
- [ ] Shared DTOs are used.
- [ ] API contract docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
