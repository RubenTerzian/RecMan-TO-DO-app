# RecMan React architecture skill

When working in this repository, follow these rules by default.

## Component roles

- Separate concerns strictly:
  - Presentational components paint UI only.
  - Orchestration components compose data, wire handlers, and connect state to UI.
- Prefer atoms, shared components, and leaf components to stay presentational and store-agnostic.
- Do not pass a large "state object" to a component when it only needs a few explicit props.
- Keep props narrow and intention-revealing.

## Hooks

- Encapsulate orchestration logic in focused custom hooks.
- A hook should serve one clear purpose; split it before it becomes a grab bag of unrelated state, effects, and handlers.
- Hooks should return the minimum API the component needs.
- Put reusable derived data and handler logic in hooks or pure helpers, not inline in large components.

## State placement

- Keep state as close as possible to the component that owns or changes it.
- If state affects only one child, keep it in that child instead of lifting it to the parent.
- Prefer local component state over Zustand by default.
- Use Zustand only when state is shared by multiple distant components, props would need to be drilled more than 1-2 levels, or the state truly represents board-wide application state.
- Never keep the same source of truth in both local state and store state.

## Store rules

- Store source data, not duplicated UI projections.
- Keep Zustand state minimal and normalized.
- Derive filtered lists, counts, option lists, empty states, selection summaries, and grouped data from the source state instead of storing them separately.
- Board columns are structural and should stay rendered by default; search and filters affect tasks inside columns, not whether columns appear, unless a feature explicitly introduces column visibility.
- Components must subscribe only to the specific store values they actually use.
- Avoid broad store subscriptions that pull unrelated values into a component.

## Rendering and rerender safety

- Always check rerender impact before adding or lifting state.
- Avoid parent state when only one child needs it.
- Do not pass inline functions to memoized or frequently rerendering children when a stable callback is needed; wrap them in `useCallback` where it meaningfully reduces churn.
- Use `useMemo` for non-trivial derived arrays, objects, and expensive computations when reference stability matters.
- Use `React.memo` for components that rerender often with unchanged props.
- Do not memoize everything by default; add memoization intentionally where it prevents real churn.
- Avoid creating new objects and arrays in store selectors used directly in subscriptions unless equality handling is explicit.
- Prefer deriving data from stable inputs in hooks/components over subscribing to freshly-created selector outputs that change identity every render.

## Effects and derived data

- Do not use `useEffect` to mirror props/store data into another piece of state unless synchronization with an external system is required.
- If a value can be derived from props, store state, or local state, derive it instead of storing it again.
- Keep effects focused on external side effects only: DOM integration, network, subscriptions, timers, persistence, and similar boundaries.

## API shape and typing

- Prefer explicit props over nested bags like `topBarState`, `bulkActions`, or other UI wrapper objects unless the nesting maps to a real domain concept.
- Use discriminated unions for mutually exclusive UI modes.
- Keep helper functions and selectors pure and typed.
- Name derived data after what it really does; avoid names like `visibleColumns` when columns are always rendered and only tasks are filtered.
- Avoid generic names like `Board`, `BoardStore`, or `useBoard...` when a more specific name describes the feature better.
- Prefer stable IDs from source data; do not use array indexes as keys when rendering dynamic lists.

## Practical defaults for this repo

- Presentational components should not call Zustand directly unless there is a strong reason.
- Feature/container components may read from store and map data into presentational props.
- Shared view logic that is reused across multiple components should live in a small hook or pure helper.
- Before finishing a change, check whether any state, selector, prop, or memo can be simplified or moved closer to where it is used.

For more detail and examples, see `docs/react-architecture-skill.md`.
