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
