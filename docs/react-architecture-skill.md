# React architecture skill

This document captures the default architecture rules for this repository. Use it when adding new UI, refactoring existing flows, or reviewing code.

## 1. Separate concerns

There are two main component roles:

- **Presentational components**
  - paint UI
  - receive explicit props
  - do not own unrelated orchestration logic
  - should usually stay store-agnostic
- **Orchestration components**
  - connect state to UI
  - compose hooks, selectors, and helpers
  - wire event handlers
  - pass narrow props into presentational components

### Prefer

- small components with one clear responsibility
- explicit props like `selectionMode`, `searchTerm`, `availableColumns`
- container-to-presentational composition

### Avoid

- passing one large UI state object through the tree
- mixing rendering markup with heavy orchestration in the same component
- making leaf components read global state when a prop is enough

## 2. Encapsulate orchestration in focused hooks

Custom hooks should hold reusable orchestration logic.

### Rules

- A hook should serve one purpose.
- Split hooks before they become catch-all objects for state, handlers, effects, and derived values.
- Return the smallest public API needed by the component.
- Keep hook internals cohesive: one feature, one flow, one concern.

### Good examples

- `useTaskFilter()`
- `useColumnSelection()`
- `useCreateTaskForm()`

### Avoid

- `useBoardEverything()` style hooks
- hooks that return large nested objects that mirror the whole screen
- hooks that both orchestrate data and render JSX

## 3. Keep state close to where it matters

State should live at the lowest level that still allows the feature to work cleanly.

### Prefer local state when

- the value affects only one component
- the value affects one child subtree
- the value is purely temporary UI state, like draft input, open/closed state, hover state, local validation, or inline edit mode

### Lift state only when

- multiple siblings truly need to coordinate through a common parent
- the state must survive remounts in a higher scope
- the parent is the actual owner of the interaction

### Avoid

- lifting state preemptively
- storing local UI draft state in Zustand without a real shared-state need
- mirroring the same value in multiple layers

## 4. Prefer local state over Zustand

Zustand is useful, but it is not the default home for every value.

### Use local state by default

Start local, then move to store only when the state is clearly shared.

### Use Zustand when

- several distant components need the same state
- prop drilling would cross more than 1-2 levels and harms clarity
- the value represents board-wide or app-wide state
- the feature needs a shared source of truth across multiple orchestration components

### Store rules

- Store source data, not duplicated projections.
- Normalize shared state when relationships exist.
- Derive filtered/grouped/presentational views from source state.
- Do not store both `tasks[]` and per-column copied task lists as separate sources of truth.
- Board columns are structural by default: search and task filters should change the tasks shown inside a column, not remove the column from the board, unless column visibility is itself an explicit feature.

## 5. Prevent unnecessary rerenders

Always consider rerender behavior while designing the data flow.

### Core rules

- Do not keep parent state if only one child needs it.
- Subscribe components only to the state they actually use.
- Pass stable values when child rerender frequency matters.
- Memoize intentionally, not mechanically.

### `useCallback`

Use `useCallback` when:

- you pass callbacks to memoized children
- callback identity is part of an effect or memo dependency that would otherwise churn
- a frequently rerendering parent recreates handlers that trigger avoidable child work

Do not add `useCallback` for every handler by default.

### `useMemo`

Use `useMemo` when:

- deriving non-trivial arrays or objects
- a derived reference is passed to memoized children
- the work is expensive enough to justify caching

Do not use `useMemo` for trivial values just to look optimized.

### `React.memo`

Use `React.memo` when:

- a component rerenders often with unchanged props
- the component is relatively expensive or repeated many times
- its props can stay stable enough for memoization to help

### Selector safety

- Avoid subscribing directly to selectors that create fresh objects or arrays every render unless equality behavior is handled deliberately.
- Prefer subscribing to minimal stable slices, then deriving view data in the component or a focused hook when needed.
- If a selector is reused broadly, keep it pure and ensure its output shape does not cause accidental churn.

## 6. Derive data instead of duplicating it

If a value can be calculated from existing state, it usually should not be stored separately.

### Derive instead of store

- counts
- filtered lists
- grouped lists
- empty states
- option lists for selects
- visibility flags that depend on existing state
- mode-dependent labels

### Avoid

- storing derived UI state beside its source data
- keeping both normalized and denormalized copies without a compelling performance reason
- syncing one state object from another through effects

## 7. Effects are for external systems

Use `useEffect` only when you are synchronizing with something outside React.

### Good effect use cases

- subscriptions
- timers
- persistence
- imperative DOM APIs
- network or browser integrations

### Avoid

- using effects just to compute derived state
- copying props into state on every change
- chaining effects to keep internal values in sync when they could be derived directly

## 8. Keep component inputs explicit

Prefer explicit props over nested UI wrapper objects.

### Prefer

- `selectionMode`
- `selectionCount`
- `availableColumns`
- `activeFilter`

### Avoid

- `topBarState`
- `bulkActions`
- generic `data`, `state`, or `config` objects that hide what the component really needs

Use nested objects only when they represent a real domain concept, not just a convenience bundle.

## 9. Keep components and hooks selective

A component or hook should not listen to values it does not use.

### Rules

- Read only the store values needed for rendering or behavior.
- Do not pull extra state "just in case".
- Keep hook dependencies honest and minimal.
- Remove dead selectors, props, and derived values promptly.

## 10. Additional rules for this codebase

- Keep shared/atom components generic and reusable.
- Prefer pure helper functions for reusable mapping/filtering logic.
- Use discriminated unions for mode-based UI instead of boolean-prop explosions.
- Keep naming explicit and domain-oriented.
- Avoid generic names like `Board` when a more specific name is available.
- Name hooks/selectors after actual behavior; for example, if all columns always render, prefer names like `useColumnsGridData` over `useVisibleColumns`.
- Prefer one source of truth for each feature.
- When performance matters, optimize from measured or obvious churn, not guesswork.

## Review checklist

Before finishing a change, check:

- Is orchestration separated from presentational rendering?
- Is state owned by the closest reasonable component?
- Could local state replace store state here?
- Is any derived data being stored unnecessarily?
- Does each component subscribe only to what it uses?
- Are callbacks/memos added only where they actually help?
- Is there any duplicated source of truth?
- Are props explicit instead of wrapped in broad UI objects?
