# Coding Guidelines

## Purpose

This document defines the coding style and quality principles for the TODO application to ensure consistency, readability, and maintainability across the codebase.

## General Formatting

- Use **2 spaces** for indentation — no tabs.
- Maximum line length is **100 characters**.
- Always use **single quotes** for strings in JavaScript, except when the string contains a single quote.
- Use **trailing commas** in multi-line arrays, objects, and function parameters.
- End every file with a **newline character**.
- Remove all trailing whitespace before committing.

## Naming Conventions

- **Variables and functions**: `camelCase` (e.g., `fetchTodos`, `taskList`)
- **React components**: `PascalCase` (e.g., `TaskItem`, `AddTaskDialog`)
- **Constants**: `UPPER_SNAKE_CASE` for module-level constants (e.g., `MAX_TASK_NAME_LENGTH`)
- **Files**: match the primary export — `PascalCase` for components (e.g., `TaskItem.js`), `camelCase` for utilities (e.g., `apiClient.js`)
- **Test files**: mirror the file under test with a `.test.js` or `.spec.js` suffix

## Import Organization

Organize imports in the following order, with a blank line between each group:

1. Node.js built-in modules (e.g., `path`, `fs`)
2. Third-party packages (e.g., `express`, `react`, `@mui/material`)
3. Internal application modules (relative imports, e.g., `./routes/todos`)

Within each group, sort imports alphabetically.

```js
// 1. Node built-ins
const path = require('path');

// 2. Third-party
const express = require('express');
const { Button } = require('@mui/material');

// 3. Internal
const todoRoutes = require('./routes/todos');
```

## Linting

- **ESLint** is the required linter for both frontend and backend code.
- The ESLint configuration must be committed to the repository and applied consistently.
- All linting errors must be resolved before a pull request can be merged.
- Linting warnings should be treated as errors in CI.
- Do not use `eslint-disable` comments unless absolutely necessary; document the reason inline when used.

## DRY Principle

- Do not duplicate logic — extract repeated code into shared utility functions or hooks.
- Shared backend utilities belong in `packages/backend/src/utils/`.
- Shared frontend utilities belong in `packages/frontend/src/utils/`.
- Shared React logic should be extracted into custom hooks in `packages/frontend/src/hooks/`.

## Functions and Modules

- Keep functions small and focused — a function should do one thing.
- Prefer pure functions where possible (no side effects, deterministic output).
- Avoid deeply nested logic; use early returns to reduce indentation.
- Export only what is needed — keep internal helpers unexported.

## Error Handling

- All async functions must handle errors explicitly — do not swallow exceptions.
- Backend route handlers must pass errors to Express's `next(err)` for centralised handling.
- Frontend async calls must catch errors and update UI state accordingly (see [Functional Requirements](./functional-requirements.md)).

## Comments

- Write comments only to explain *why*, not *what* — the code should be self-documenting.
- Keep inline comments to a single short line.
- Do not leave commented-out code in the repository.

## Environment Variables

- Never hard-code secrets, API URLs, or port numbers — use environment variables.
- Provide a `.env.example` file documenting all required variables without real values.
- Never commit `.env` files containing real secrets.

## Git Hygiene

- Commit messages shall be written in the imperative mood (e.g., `Add due date field to task form`).
- Each commit should represent a single logical change.
- Do not commit directly to `main` — all changes must go through a pull request.
- Pull requests must pass all tests and linting checks before merging.
