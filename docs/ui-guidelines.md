# UI Guidelines

## Purpose

This document defines the core UI guidelines for the TODO application to ensure a consistent, accessible, and user-friendly experience.

## Component Library

- Use **Material UI (MUI)** components throughout the application.
- Do not use custom-built replacements for components that MUI already provides (buttons, inputs, dialogs, checkboxes, etc.).
- Use MUI's `ThemeProvider` to apply a consistent theme globally.

## Color Palette

| Role             | Color Token         | Hex       |
|------------------|---------------------|-----------|
| Primary          | `primary.main`      | `#1976D2` |
| Primary dark     | `primary.dark`      | `#115293` |
| Secondary        | `secondary.main`    | `#9C27B0` |
| Error            | `error.main`        | `#D32F2F` |
| Success          | `success.main`      | `#2E7D32` |
| Background       | `background.default`| `#F5F5F5` |
| Surface / Paper  | `background.paper`  | `#FFFFFF` |
| Text primary     | `text.primary`      | `#212121` |
| Text secondary   | `text.secondary`    | `#757575` |

Use MUI theme tokens — do not hard-code hex values in component styles.

## Typography

- Font family: **Roboto** (included with MUI by default).
- Page title: `h5` variant, bold.
- Task names: `body1` variant.
- Supporting text (due dates, priority labels): `body2` variant, `text.secondary` color.

## Layout

- Center the application content in a `Container` with `maxWidth="sm"`.
- Use a top `AppBar` with the app name and a theme-toggle icon button.
- Stack task list items vertically using a MUI `List` inside a `Paper` component.
- Use consistent `16px` padding inside cards and panels.

## Task List Items

- Each task shall be rendered as a MUI `ListItem` with a `Checkbox` on the left.
- Completed tasks shall render the task name with a strikethrough style and `text.secondary` color.
- Each task item shall include an edit icon button and a delete icon button on the right side.
- Due date and priority badge shall appear below the task name as secondary text.

## Priority Badges

Display priority using a MUI `Chip` component:

| Priority | Chip color  |
|----------|-------------|
| High     | `error`     |
| Medium   | `warning`   |
| Low      | `success`   |

## Buttons

- Use MUI `Button` with `variant="contained"` for primary actions (e.g., Add Task).
- Use MUI `Button` with `variant="outlined"` for secondary actions (e.g., Cancel).
- Use MUI `IconButton` for inline actions (edit, delete).
- Destructive actions (delete) shall use the `error` color.

## Forms & Inputs

- Use MUI `TextField` with `variant="outlined"` for all text inputs.
- Due date input shall use MUI `DatePicker` from `@mui/x-date-pickers`.
- Priority shall use a MUI `Select` input with the three options: Low, Medium, High.
- Validation errors shall appear as helper text on the relevant field using MUI's built-in `error` and `helperText` props.

## Dialogs

- Task creation and editing shall use a MUI `Dialog` component.
- Dialogs shall include a clear title, the form fields, and Cancel / Save action buttons in the `DialogActions` section.

## Feedback & States

- Loading state shall use a MUI `CircularProgress` centered on the page.
- Empty state shall display a centered MUI `Typography` message and a `AddTask` icon.
- Success and error notifications shall use MUI `Snackbar` with an `Alert` component inside.

## Accessibility

- All interactive elements shall have descriptive `aria-label` attributes.
- Color alone shall not be used to convey meaning — always pair color with text or an icon.
- The application shall be fully keyboard-navigable.
- Minimum contrast ratio of **4.5:1** shall be maintained for all text against its background (WCAG 2.1 AA).
- Focus indicators shall be visible on all focusable elements.

## Responsive Design

- The layout shall be usable on screens from `320px` wide and above.
- Touch targets shall be at least `44x44px` on mobile viewports.

## Dark Mode

- The app shall support a light/dark mode toggle stored in `localStorage`.
- Dark mode background: `#121212`; surface: `#1E1E1E`.
- Use MUI's built-in dark palette — do not create a separate set of color overrides.
