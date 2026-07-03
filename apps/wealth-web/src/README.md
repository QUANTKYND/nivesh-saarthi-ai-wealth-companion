# Nivesh Saarthi App refactor

This package replaces the single-file `App.tsx` with a componentized structure while preserving the existing API/query behavior.

## What changed

- Split dashboard, chat, goal, customer switcher, common UI, constants, form helpers, date helpers, and formatter utilities into separate files.
- Replaced every `display: 'grid'` + `gridTemplateColumns` layout with MUI `Grid` components.
- Replaced several custom bordered/card-like boxes with MUI `Paper`.
- Replaced some cramped text actions with `IconButton` + `Tooltip`, especially chat and goal quick actions.
- Kept existing React Query keys, mutations, scroll behavior, dialog flow, advisor chat flow, and all API calls intact.

## File placement

The root of this folder is intended to sit beside your existing `api.ts` file, exactly where your current `App.tsx` lives.
