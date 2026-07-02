# Audit, Guardrails, and Compliance Layer

### Goal: Make the MVP enterprise-ready.

Implement audit and compliance guardrails.

Audit:

- log every chat message
- log every recommendation
- log risk profile result
- log advisor callback request

Guardrails:

- block unsupported product recommendations
- add disclaimer to market-linked suggestions
- detect prohibited queries such as crypto, stock tips, guaranteed returns
- redirect complex advice to human advisor

Create service: `ComplianceGuardrailService`

Add tests for prohibited responses.

### Acceptance Criteria

- Every recommendation is auditable.
- Unsupported advice is blocked.
- Disclaimers are consistently applied.

## In Depth

Start Milestone 14: Audit, Guardrails, and Compliance Layer.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 5 risk profile, Milestone 6 recommendations, Milestone 7 advisor chat, and Milestone 13 advisor handoff.
4. Reuse shared DTOs/types from packages/shared-types.
5. Do not add unsupported products or external compliance services.
6. Keep this milestone focused on centralized guardrails, audit completeness, and consistent disclaimers.

Goal:
Make the MVP enterprise-ready for demo by centralizing compliance guardrails and ensuring key advice-related workflows are auditable.

Create service:
ComplianceGuardrailService

Shared Types:
Create or extend shared DTOs/types for:

- ComplianceGuardrailResult
- ComplianceViolationCode
- ComplianceSeverity
- ComplianceReviewAction
- AuditLogAction extensions as needed

Guardrail result shape:

```JSON
{
  "allowed": false,
  "severity": "BLOCKED",
  "violations": ["PROHIBITED_CRYPTO_ADVICE"],
  "message": "Crypto recommendations are not supported in this bank-approved wealth advisor.",
  "requiredDisclaimer": "This platform only supports bank-approved wealth guidance. Please speak to a certified advisor for complex needs.",
  "requiresHumanAdvisor": true
}
```

Audit requirements:

Audit these workflows:

- customer profile viewed where already supported
- advisor chat customer message submitted
- advisor chat response generated
- risk profile submitted
- recommendation generated
- recommendation viewed if frontend supports a view event
- advisor callback requested
- compliance guardrail blocked response

Guardrail capabilities:

- Detect requests for crypto.
- Detect individual stock tips.
- Detect guaranteed return claims.
- Detect unsupported products.
- Detect attempts to bypass risk profiling.
- Detect market-linked recommendation without disclaimer.
- Detect recommendation payloads containing products outside approved catalog.
- Detect high-value or complex advice that should trigger advisor handoff.

Compliance rules:

1. Unsupported products:
   - Any product not present in approved catalog must be blocked.

2. Crypto:
   - Do not recommend crypto.
   - Return safe refusal and advisor handoff option.

3. Individual stocks:
   - Do not give buy/sell/hold advice.
   - Redirect to goal-based planning and advisor review.

4. Guaranteed returns:
   - Block any response claiming or implying guaranteed returns for market-linked products.
   - Require explicit no-guarantee disclaimer.

5. Risk profile bypass:
   - Market-linked recommendations require completed risk profile and selected goal.

6. Market-linked disclaimers:
   - Any market-linked recommendation must include market risk and no-guarantee wording.

7. Human handoff:
   - Trigger for complex, high-value, unclear, tax/legal, or sensitive advice.

Backend integration points:

- Advisor chat:
  - Run guardrail checks before response generation and before returning response.
  - Log blocked queries.

- Recommendation engine:
  - Validate final product list against approved catalog.
  - Validate disclaimers for market-linked products.
  - Log generated recommendation.

- Risk profile:
  - Log submitted result without unnecessary sensitive answer details.

- Advisor callback:
  - Log request and source context.

- Audit logs:
  - Add repository create support if missing.
  - Avoid logging full free-form sensitive text unless necessary for demo traceability.

Frontend compliance requirements:

- Display disclaimers returned by backend.
- Display guardrail refusal messages visibly.
- Do not hide risk warnings.
- Do not expose unsupported product actions.
- Admin/audit view should show key audit trail entries if included in scope.

Testing:
Add unit tests for:

- crypto query blocked
- stock tip query blocked
- guaranteed return claim blocked
- unsupported product blocked
- market-linked recommendation without disclaimer blocked
- approved recommendation passes
- risk profile bypass detected
- human advisor handoff required for complex advice
- audit log creation for recommendation generation
- audit log creation for chat message
- audit log creation for risk profile submission
- audit log creation for advisor callback request
- sensitive data minimization in audit metadata

API/controller tests:

- audit log endpoint still works
- guardrail-blocked chat response returns safe message
- recommendation generation writes audit log
- advisor callback creation writes audit log

Documentation:
Update or create:
docs/milestone-status/milestone-14-audit-guardrails-and-compliance-layer-status.md

Also update:

- docs/api-contracts.md if response shapes or audit actions change
- docs/architecture.md with compliance layer overview
- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- ComplianceGuardrailService exists.
- Unsupported advice is blocked.
- Unsupported products cannot be recommended.
- Market-linked recommendations include disclaimers.
- Guaranteed return claims are blocked.
- Chat, risk profile, recommendations, and advisor callbacks are auditable.
- Audit logs avoid unnecessary sensitive data.
- Tests cover guardrails and audit logging.

## Milestone 14 Verification

```txt
- [ ] ComplianceGuardrailService exists.
- [ ] Crypto advice is blocked.
- [ ] Individual stock tips are blocked.
- [ ] Guaranteed return claims are blocked.
- [ ] Unsupported products are blocked.
- [ ] Risk profile bypass is blocked.
- [ ] Market-linked disclaimer enforcement exists.
- [ ] Human advisor handoff is recommended for complex advice.
- [ ] Chat message audit logs are written.
- [ ] Advisor response audit logs are written.
- [ ] Risk profile submission audit logs are written.
- [ ] Recommendation generation audit logs are written.
- [ ] Advisor callback audit logs are written.
- [ ] Sensitive data is not unnecessarily logged.
- [ ] Existing audit log endpoint still works.
- [ ] Tests cover prohibited responses.
- [ ] API contract docs updated if needed.
- [ ] Architecture docs updated.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
