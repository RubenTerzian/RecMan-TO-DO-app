# RecMan To-Do App

RecMan is a Kanban-style task management app built with React, TypeScript, Vite, and Zustand. It supports column-based organization, task filtering, search, selection mode, and drag-and-drop interactions.

## Demo goals

This repository is structured to satisfy typical take-home requirements for:

- a working React application
- clear local setup instructions
- documented architecture and code organization
- a clean, reviewable repository structure

## Tech stack

- React 19
- TypeScript
- Vite
- Zustand
- Atlassian Pragmatic Drag and Drop
- CSS Modules

## Running locally

### Prerequisites

- Node.js 20+ recommended
- Yarn

### Install dependencies

```bash
yarn install
```

### Start the development server

```bash
yarn dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

### Build for production

```bash
yarn build
```

### Preview the production build

```bash
yarn preview
```

### Lint the codebase

```bash
yarn lint
```

## Available scripts

- `yarn dev` — runs the Vite development server
- `yarn build` — runs TypeScript project build and Vite production build
- `yarn preview` — serves the built app locally for verification
- `yarn lint` — runs ESLint

## Project structure

```text
src/
  app/                 App shell and top-level composition
  components/          Reusable atoms and shared presentational components
  features/            Feature-focused UI modules (TopBar, ColumnsGrid, Task flows)
  hooks/               Shared reusable hooks
  store/               Zustand store, selectors, persistence, and types
  styles/              Global tokens and app-wide styles
  utils/               Small shared utilities
```

## Code documentation approach

This project keeps documentation in the places reviewers usually need it most:

- `README.md` explains how to run the app, what it does, and how the codebase is organized.
- Feature folders are named by responsibility so reviewers can navigate quickly without needing heavy inline comments.

The code intentionally prefers self-describing component, hook, and selector names over large amounts of inline commentary. For this repository, the most valuable things to document are:

1. **How the app is run locally**
2. **How the code is organized by feature**
3. **Where state lives and why**
4. **How shared UI components differ from feature orchestration components**
5. **Any non-obvious interaction patterns**, especially drag-and-drop, selection mode, and persisted state

## Architecture notes

The codebase follows a feature-oriented React structure:

- **Presentational components** live mainly in `src/components` and render UI with narrow props.
- **Feature components** in `src/features` compose hooks, selectors, and UI into user-facing flows.
- **Shared hooks** encapsulate reusable behavior such as debounce, editor blur handling, and draft sessions.
- **Zustand** stores persisted/shared app state, while transient UI state stays local when possible.
- **Selectors** in `src/store/selectors.ts` keep store subscriptions narrow to reduce unnecessary rerenders.

## Key product behavior

- Create, edit, and delete columns
- Create and manage tasks within columns
- Search tasks
- Filter tasks by completion state
- Use selection mode for bulk task interactions
- Drag and drop columns and tasks
- Persist app state locally

## Notes for reviewers

- The project uses CSS Modules for component-scoped styling.
- State is kept close to where it is used unless it needs to be shared across features.
- Layout components are intentionally kept narrow in their subscriptions to avoid broad rerenders.
