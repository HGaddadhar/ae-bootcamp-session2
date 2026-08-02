# Functional Requirements

## Purpose

This document defines the core functional requirements for the TODO application based on the current frontend and backend behavior.

## Core Functional Requirements

1. The application shall display a list of existing TODO items when the app loads.
2. The application shall retrieve TODO items from the backend API.
3. The application shall show a loading state while TODO items are being fetched.
4. The application shall show an error message when TODO items cannot be retrieved.
5. The application shall allow a user to enter a new TODO item name in a text input field.
6. The application shall prevent submission of a blank or whitespace-only TODO item.
7. The application shall allow a user to submit a new TODO item from the UI.
8. The application shall send new TODO items to the backend API for creation.
9. The application shall add a newly created TODO item to the visible list after successful creation.
10. The application shall clear the input field after a TODO item is successfully created.
11. The application shall allow a user to delete an existing TODO item.
12. The application shall send a delete request to the backend API for the selected TODO item.
13. The application shall remove a deleted TODO item from the visible list after successful deletion.
14. The application shall show an error message when a TODO item cannot be created.
15. The application shall show an error message when a TODO item cannot be deleted.
16. The application shall display an empty-state message when no TODO items exist.
17. The backend shall validate that a new TODO item includes a non-empty name.
18. The backend shall reject create requests with missing or invalid item names.
19. The backend shall validate that delete requests include a valid item identifier.
20. The backend shall return a not-found response when a delete request targets a non-existent TODO item.

## Current Scope Notes

- In the current implementation, TODO items are stored as items with a name and an auto-generated ID.
- The current implementation supports create, read, and delete operations.
- The current implementation does not yet support editing items, marking items as complete, due dates, categories, or user accounts.
