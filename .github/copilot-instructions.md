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
- For create/edit sessions, keep unsaved draft UI state local and commit to Zustand only on save. Store persisted entities in Zustand, not transient form sessions.

## Store rules

- Store source data, not duplicated UI projections.
- Keep Zustand state minimal and normalized.
- Derive filtered lists, counts, option lists, empty states, selection summaries, and grouped data from the source state instead of storing them separately.
- Board columns are structural and should stay rendered by default; search and filters affect tasks inside columns, not whether columns appear, unless a feature explicitly introduces column visibility.
- Components must subscribe only to the specific store values they actually use.
- Avoid broad store subscriptions that pull unrelated values into a component.
- Prefer named selectors in `src/store/selectors.ts` for repeated store reads instead of repeating ad hoc inline selectors across multiple hooks.
- Do not call `useStore()` without a selector in feature hooks or components unless a task explicitly requires a broad subscription.
- Prefer selector factories such as `selectTaskById(taskId)` or `selectTasksByColumnId(columnId)` when a hook needs a parameterized store read. Factories use the same `select*` prefix as plain selectors (no `make` prefix); callers wrap them in `useMemo` to keep selector identity stable across renders.
- When a component needs only a boolean or count derived from shared state, subscribe to that derived value rather than the full backing collection.

## Rendering and rerender safety

- Always check rerender impact before adding or lifting state.
- Avoid parent state when only one child needs it.
- Do not pass inline functions to memoized or frequently rerendering children when a stable callback is needed; wrap them in `useCallback` where it meaningfully reduces churn.
- Use `useMemo` for non-trivial derived arrays, objects, and expensive computations when reference stability matters.
- Use `React.memo` for components that rerender often with unchanged props.
- Do not memoize everything by default; add memoization intentionally where it prevents real churn.
- Avoid creating new objects and arrays in store selectors used directly in subscriptions unless equality handling is explicit.
- Prefer deriving data from stable inputs in hooks/components over subscribing to freshly-created selector outputs that change identity every render.
- Fix rerender problems at the subscription boundary first. Memoizing children does not help if the parent still subscribes to changing state and rerenders the whole subtree.
- When performance matters, move store subscriptions as far down the tree as practical so parent layout components can stay static.
- Prefer passing stable IDs like `taskId` or `columnId` down the tree and letting leaf hooks subscribe to the exact record they need.
- Treat search and filter updates as board-wide by default; optimize selection, counts, and per-item updates first because those are easier to localize.
- When a transient UI flow has multiple fields that usually change together, prefer one cohesive local state object over several parallel `useState` calls if that avoids multi-step resets and redundant rerenders.
- Guard local state setters to return the current state when nothing changes, especially in transient creation/edit hooks that can be re-entered or cancelled repeatedly.

## Effects and derived data

- Do not use `useEffect` to mirror props/store data into another piece of state unless synchronization with an external system is required.
- If a value can be derived from props, store state, or local state, derive it instead of storing it again.
- Keep effects focused on external side effects only: DOM integration, network, subscriptions, timers, persistence, and similar boundaries.
- For debounced inputs, prefer local input state plus a debounced callback that writes to shared state later. Do not mirror store state back into local state on every store update just to support debouncing.
- Do not call local `setState` synchronously inside an effect just to reset transient UI in response to another React state change. Prefer explicit event transitions, reducer/state-machine logic, or explicit reset callbacks/registries; use deliberate remount boundaries keyed by the controlling mode only as a last resort.
- For blur-to-close editors, treat focus changes inside the same editor surface as internal transitions. Only close when focus leaves the editor entirely.
- Disabled controls next to active editors must not steal focus or behave like outside-click targets; prevent pointer/focus transitions when that would collapse the active editor.

## API shape and typing

- Prefer explicit props over nested bags like `topBarState`, `bulkActions`, or other UI wrapper objects unless the nesting maps to a real domain concept.
- Use discriminated unions for mutually exclusive UI modes.
- Keep helper functions and selectors pure and typed.
- Name derived data after what it really does; avoid names like `visibleColumns` when columns are always rendered and only tasks are filtered.
- Avoid generic names like `Board`, `BoardStore`, or `useBoard...` when a more specific name describes the feature better.
- Prefer stable IDs from source data; do not use array indexes as keys when rendering dynamic lists.
- Prefer current React DOM handler types such as `SubmitEventHandler` over deprecated aliases like `FormEvent` or `FormEventHandler`.

## Practical defaults for this repo

- Presentational components should not call Zustand directly unless there is a strong reason.
- Feature/container components may read from store and map data into presentational props.
- Shared view logic that is reused across multiple components should live in a small hook or pure helper.
- `GridHeader` is the current reference implementation for this architecture and should be treated as done unless a task explicitly asks to change it.
- Use the `GridHeader` split across component, hook, and store as the example to follow: UI in the component, orchestration/derived handlers in the hook, and source data mutations in Zustand actions.
- Before finishing a change, check whether any state, selector, prop, or memo can be simplified or moved closer to where it is used.
- Use `ColumnsGrid` + `Column` + `TaskCard` as the main performance reference: parent layout reads should stay narrow, item lookups should happen through focused selectors, and leaf hooks should own task-level subscriptions.
- Use `TopBar` as the input-performance reference: the layout component stays stateless, each control owns only its own subscription, and debounced store writes should not introduce value-mirroring effects.
- Use `useInlineEditor` (in `src/hooks/`) for any transient create / edit flow with a single draft value: it owns the open/closed flag, the draft, normalize-on-save, focus-safe blur-to-cancel, and the start/save/cancel/update handlers. Wrappers like `useColumnEditing`, `useColumnCreation`, `useColumnTaskCreation`, and `useTaskEditing` only adapt names and wire the store action. Do not re-implement this state machine inline.
- For touch-friendly drag-and-drop on the same surface that must also scroll natively, use a dedicated `[data-drag-handle="true"]` element with `touch-action: none` while the surrounding surface keeps `touch-action: auto`. iOS commits `touch-action` at touchstart and cannot switch mid-gesture, so a single surface cannot both pan-scroll and host a long-press drag. Mouse / pen may still drag from anywhere on the surface (`MOUSE_ACTIVATION_PIXELS`); touch must originate on a handle. See `src/features/ColumnsGrid/dnd/createPointerDragSession.ts` and `pointerDragActivation.ts` for the canonical implementation.
- Use the generic `createGhostPointerStore()` factory in `src/features/ColumnsGrid/dnd/ghostPointerStore.ts` whenever a new draggable type needs a ghost overlay; do not roll a fresh listener+snapshot triple inline.

## Dead code & exports

- Run `npx knip` before finishing a meaningful refactor to catch unused files, exports, and exported types. Delete or unexport whatever it flags unless the export is part of a public API used outside `src/`.
- A helper hook used by exactly one consumer should be inlined into that consumer; do not keep one-off internal helpers as their own module. The shared boundary is for code reused in two or more places.
- A selector wrapper that no component reads is just noise — remove it instead of leaving it as "future API".
- A `data-testid` attribute that is not driven by an automated test or production logic should be removed; do not preserve them speculatively.

## Visual design defaults

- The board is minimalist and Airbnb-flat: no gradients (`linear-gradient` / `radial-gradient`) and no `box-shadow` on surfaces. Hierarchy comes from background tone and 1px borders.
- All form controls (`Button`, `Input`, `Select` trigger, `IconButton`, `Checkbox` square hit area) share one `--control-height` and one `--control-radius` token. Match the search input radius (modest rounding, never pill).
- Hover affordance is uniform and subtle: a single `--control-hover-bg` token, no glow/shadow change. Active/focus rings use the accent color from `tokens.css` only.
- Square checkboxes are reserved for selection mode (multi-select). Round checkboxes mean "toggle completion". Tri-state header checkboxes use a filled background for the indeterminate (dash) state so partial selection reads at a glance.
- Prefer one shared `ActionMenu` (3-dot trigger + popover with Edit / Delete) over scattering individual edit/delete icon buttons. Destructive items render in the danger color.
- Bulk destructive actions (delete N tasks, delete column with tasks) must go through `ConfirmationModal`. Single-item destructive actions on already-confirmed UI may skip it.

For more detail and examples, see `docs/react-architecture-skill.md`.
