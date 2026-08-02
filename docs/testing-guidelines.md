# Testing Guidelines

## Purpose

This document defines the testing principles and conventions for the TODO application.

## Unit Tests

- Use **Jest** to test individual functions and React components in isolation.
- Unit test files shall use the naming convention `*.test.js` or `*.test.ts`.
- Backend unit tests shall be placed in `packages/backend/__tests__/`.
- Frontend unit tests shall be placed in `packages/frontend/src/__tests__/`.
- Name unit test files to match the file under test (e.g., `app.test.js` for `app.js`).

## Integration Tests

- Use **Jest + Supertest** to test backend API endpoints with real HTTP requests.
- Integration tests shall be placed in `packages/backend/__tests__/integration/`.
- Integration test files shall use the naming convention `*.test.js` or `*.test.ts`.
- Name integration test files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints).

## End-to-End (E2E) Tests

- Use **Playwright** (required framework) to test complete UI workflows through browser automation.
- E2E tests shall be placed in `tests/e2e/`.
- E2E test files shall use the naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files based on the user journey they cover (e.g., `todo-workflow.spec.js`).
- Playwright tests must use **one browser only**.
- Playwright tests must use the **Page Object Model (POM) pattern** for maintainability.
- Limit E2E tests to **5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage.

## Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports:

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, overridable with the `PORT` environment variable.

## General Principles

- **All tests must be isolated and independent** — each test shall set up its own data and not rely on other tests.
- **Setup and teardown hooks are required** — tests must pass consistently across multiple runs.
- All new features shall include appropriate unit, integration, or E2E tests depending on scope.
- Tests shall be maintainable and follow best practices for the relevant framework.
