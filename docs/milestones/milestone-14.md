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
