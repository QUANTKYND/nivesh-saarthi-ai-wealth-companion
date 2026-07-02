# Mock Data and Domain Models

### Goal: Create the core data foundation

Implement the core domain models and mock seed data for the Digital Wealth Management MVP.

Entities:

- Customer
- AccountSummary
- Transaction
- SpendingCategory
- Goal
- RiskProfile
- ProductCatalogItem
- Recommendation
- AdvisorChatMessage
- AuditLog
- AdvisorCallbackRequest

Use in-memory repositories first for MVP speed.

Create realistic mock data for 3 customer personas:

1. Young salaried professional
2. Family-focused mid-career customer
3. Retired conservative customer

Expose backend endpoints to fetch customer profile, transactions, and product catalog.

Acceptance Criteria

- API returns seeded customer profiles.
- Transactions are categorized.
- Product catalog exists.
- Shared DTOs are used.
