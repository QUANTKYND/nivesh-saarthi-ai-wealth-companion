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
