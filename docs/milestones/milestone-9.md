# Avatar Chat UI

### Goal: Create the signature MVP experience.

Build the Avatar Advisor chat UI.

Features:

- avatar panel
- chat message list
- user input box
- suggested prompt chips
- response cards
- disclaimer banner
- action buttons from backend response
- optional browser speech-to-text
- optional browser text-to-speech

Supported actions:

- open spending insights
- open goal planner
- open risk profile
- open recommendation details
- request advisor callback

### Acceptance Criteria

- User can chat with advisor.
- Suggested prompts work.
- Backend action cards render correctly.
- Avatar feels like the central advisor experience.

## In Depth

Start Milestone 9: Avatar Chat UI.

Before implementation:

1. Read AGENTS.md.
2. Read the relevant milestone document from docs/milestones.
3. Inspect Milestone 7 advisor chat backend.
4. Inspect Milestone 8 frontend dashboard patterns.
5. Reuse shared DTOs/types from packages/shared-types.
6. Do not implement financial reasoning in the frontend.
7. Keep this milestone focused on the avatar advisor chat experience.

Goal:
Build the signature Avatar Advisor chat UI that connects to the controlled advisor chat backend.

Frontend route or view:
Avatar chat may be a dashboard panel, drawer, or route, but it must be reachable from the dashboard avatar card and quick action.

Required backend APIs:

- POST /api/advisor-chat/message
- GET /api/customers/:customerId/advisor-chat/messages

Implementation requirements:

- Create typed query/mutation hooks for chat history and sending messages.
- Render existing chat history for the selected customer.
- Allow user message submission.
- Render backend response text, disclaimers, and action cards.
- Add suggested prompt chips.
- Add loading state while sending.
- Add retry/error state for failed send.
- Persist selected customer context from the dashboard.
- Do not add product, risk, or recommendation logic in the frontend.
- Browser speech-to-text and text-to-speech are optional and should not block completion.

Suggested prompt chips:

- Can I invest INR 10,000 per month?
- How is my spending this month?
- Help me create a goal.
- Explain my recommendation.
- Should I complete my risk profile?
- Request an advisor callback.

Action card mapping:

- OPEN_SPENDING_INSIGHTS opens or scrolls to spending insights.
- OPEN_GOAL_PLANNER opens the goal planner flow.
- OPEN_RISK_PROFILE opens the risk profile wizard.
- OPEN_RECOMMENDATIONS opens recommendation details.
- REQUEST_ADVISOR_CALLBACK opens advisor callback request flow.

UI requirements:

- Avatar panel should be visually prominent and feel like the central advisor experience.
- Chat list must distinguish customer, advisor, and system messages.
- Disclaimers must be visible and not hidden behind collapsed UI.
- Unsupported advice responses should be visibly safe and redirect to approved actions.
- Empty state should show suggested prompts.
- Input should be disabled while a message is being sent.
- Long messages should wrap correctly on mobile.

Safety rules:

- Frontend must display backend-provided disclaimers.
- Frontend must not suppress risk warnings.
- Frontend must not create unsupported action cards.
- Frontend must not call recommendation APIs directly from arbitrary chat text.

Testing:
Add frontend tests where practical for:

- chat history loading
- empty state prompt rendering
- sending a prompt
- send loading state
- send error state
- advisor response rendering
- disclaimer rendering
- backend action card rendering
- action card navigation behavior
- unsupported advice response rendering

Documentation:
Update or create:
docs/milestone-status/milestone-09-avatar-chat-ui-status.md

Also update:

- docs/mvp-checklist.md
- README only if setup or demo flow changes

Acceptance Criteria:

- User can open avatar chat from dashboard.
- User can send a message.
- Suggested prompts submit correct text.
- Backend responses render with disclaimers.
- Backend action cards render and route to supported flows.
- Loading and error states are handled.
- UI is responsive and demo-ready.
- Frontend does not invent advice or products.

## Milestone 9 Verification

```txt
- [ ] Avatar chat is reachable from dashboard.
- [ ] Chat history is loaded from API.
- [ ] User can send a message.
- [ ] Suggested prompts work.
- [ ] Loading state is shown while sending.
- [ ] Error state is shown when send fails.
- [ ] Advisor messages render clearly.
- [ ] Disclaimers render visibly.
- [ ] Action cards render correctly.
- [ ] Supported action cards navigate to the correct flow.
- [ ] Unsupported advice responses are displayed safely.
- [ ] Frontend contains no product recommendation logic.
- [ ] Layout is mobile-friendly.
- [ ] MVP checklist updated.
- [ ] Milestone status updated.
```
