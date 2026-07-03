Start Milestone 15: Demo Polish and Submission Readiness.

Before implementation:
1. Read AGENTS.md.
2. Read all milestone documents from docs/milestones.
3. Read all milestone status files from docs/milestone-status.
4. Inspect the completed implementation for Milestones 1 through 14.
5. Do not add major new business features.
6. Do not change recommendation logic, risk scoring, or compliance logic unless fixing a bug.
7. Focus on demo quality, UI polish, responsiveness, documentation, and final verification.

Goal:
Polish the Digital Wealth Management MVP so it can be demoed clearly in 5 minutes for the hackathon.

Required work:

1. Mock Bank Mobile Shell
Create or polish a mobile-first bank app shell that makes the wealth advisor feel integrated inside a banking mobile app.

The shell should include:
- bank-style header
- customer greeting
- entry point to Nivesh Saarthi / Digital Wealth Advisor
- bottom navigation or mobile app frame if already present
- clean responsive layout

2. Persona Switcher
Add or polish a customer persona switcher for the 3 seeded personas.

The persona switcher should:
- let demo user switch between seeded customers
- refresh dashboard, insights, goals, risk profile, recommendations, and advisor chat context
- clearly show customer name/persona
- not require manual URL changes

3. Demo Mode
Add a simple demo mode that guides the evaluator through the intended journey.

Demo flow:
- open wealth dashboard
- show avatar insight
- ask “Can I invest ₹10,000 per month?”
- create or view a goal
- complete or view risk profile
- generate recommendation
- request advisor callback
- open admin/advisor callback summary

This can be implemented as:
- guided cards
- a demo checklist panel
- quick action buttons
- seeded suggested prompts

4. Visual Polish
Improve the UI across completed frontend screens.

Focus areas:
- spacing
- typography
- card hierarchy
- mobile responsiveness
- loading states
- empty states
- error states
- disclaimers
- recommendation reasoning visibility
- advisor handoff clarity
- consistent colors

Use an IDBI-inspired but not trademark-dependent theme:
- deep blue / banking blue
- teal or green accent
- white/light background
- subtle gradients only where useful
- clear financial dashboard cards

5. Avatar Advisor Polish
Polish the avatar advisor experience.

Ensure:
- avatar is visible and central to the journey
- suggested prompts are useful
- response cards are easy to understand
- disclaimers are visible for financial guidance
- advisor handoff action is prominent when required
- chat works with deterministic fallback if no LLM key is configured

6. Final State Review
Review all milestone 7 to 14 features and ensure they connect properly:
- AI advisor chat backend
- dashboard frontend
- avatar chat UI
- goal planner UI
- risk profile UI
- recommendation UI
- advisor handoff
- audit and compliance guardrails

Fix broken links, routing gaps, missing API integration, or obvious UX dead ends.

7. Admin / Advisor Demo View
Polish the admin/advisor callback view.

It should show:
- callback requests
- customer summary
- latest recommendation summary
- latest chat summary if available
- preferred time/topic
- status if implemented

8. Documentation
Update:
- README.md
- docs/architecture.md
- docs/api-contracts.md
- docs/mvp-checklist.md
- docs/demo-script.md
- docs/milestone-status/milestone-15-demo-polish-status.md

Create docs/demo-script.md if it does not exist.

The demo script should include:
- 5-minute demo flow
- which persona to use
- suggested advisor chat prompts
- expected output from each step
- fallback plan if LLM key is missing

9. Screenshots
Add a docs/screenshots directory if useful.

Add instructions in README for generating screenshots or manually capturing:
- dashboard
- advisor chat
- goal planner
- risk profile
- recommendation
- advisor callback/admin view

Do not commit large generated screenshots unless the repo convention supports them.

10. Final Verification
Run:
- typecheck
- lint
- tests
- build

Fix any issues introduced during polish.

Update the milestone status document with:
- implementation status
- testing status
- production-readiness status
- completed items
- pending items
- blockers
- known limitations

Acceptance Criteria:
- App can be demoed in 5 minutes.
- Customer journey is clear without developer explanation.
- Persona switcher works.
- Dashboard, insights, goals, risk profile, recommendations, chat, and advisor handoff connect smoothly.
- Loading, empty, and error states are present on API-driven screens.
- Recommendation disclaimers and risk warnings are visible.
- No unsupported financial advice is shown.
- README explains setup and demo flow.
- docs/demo-script.md exists.
- docs/mvp-checklist.md is updated.
- docs/milestone-status/milestone-15-demo-polish-status.md is updated.
- typecheck, lint, tests, and build pass.