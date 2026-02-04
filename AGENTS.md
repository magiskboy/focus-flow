# AGENTS.md

## Mission

You are an AI coding assistant helping to build **FocusFlow** (tasks-mgr), a privacy-focused, offline-first task management and focus tracking application. Your goal is to write high-quality, maintainable, and strictly typed code that adheres to the project's design principles.

## ⚡ Skills Usage (CRITICAL)

**ALWAYS check for and use available skills** to perform complex tasks, research, or specific workflows.

- Before starting a complex task, check if a relevant skill exists.
- If a skill is available, read its documentation (`SKILL.md`) and follow it precisely.
- Priority: **Use Skills > Manual Implementation**.

## Project Context

- **Name:** FocusFlow
- **Type:** Single-page Application (SPA)
- **Core Philosophy:**
  - **Offline-first:** All logic and data reside on the client. NO backend.
  - **Privacy-by-design:** No external data transmission.
  - **Client-side only:** Uses `localStorage` and `IndexedDB` for persistence.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS 4 (Vanilla CSS for custom needs, but prefer Tailwind utilities)
- **State Management:** Jotai
- **Linter:** ESLint

## Development Workflow & Commands

- **Install Dependencies:** `yarn` (or `npm install`)
- **Start Dev Server:** `yarn dev`
- **Type Check & Build:** `yarn build` (Runs `tsc` then `vite build`)
- **Lint Code:** `yarn lint`
- **Preview Build:** `yarn preview`

## Code Conventions

- **TypeScript:** Strict mode enabled. No `any`. Define interfaces/types for all props and data structures.
- **Components:** Functional components with Hooks. Keep them small and focused.
- **Styling:** Use Tailwind utility classes directly in JSX. Avoid separate `.css` files unless defining global styles or complex animations.
- **State:** Use `jotai` atoms for global state. Avoid prop drilling deep hierarchies.
- **File Structure:**
  - `src/components`: Reusable UI components.
  - `src/features`: Feature-specific logic and views.
  - `src/hooks`: Custom React hooks.
  - `src/types`: Shared TypeScript definitions.

## Testing & Verification

- Don't edit unit test. Always run `yarn test` to verify after do anything, if faild, let's explain for me and stop your work.
- Since there are no explicit unit tests set up yet, **ALWAYS run `yarn build`** after making changes to ensure type safety and build correctness.
- Fix all linting errors reported by `yarn lint`.

## Documentation

- Read `README.md` for quick start.
- Read `ABOUT.md` for deep understanding of the product vision and domain logic.
