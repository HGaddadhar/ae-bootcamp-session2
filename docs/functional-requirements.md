# Functional Requirements

## Purpose

This document defines the core functional requirements for the TODO application.

## Core Functional Requirements

### Viewing Tasks
1. The application shall display a list of all existing TODO tasks when the app loads.
2. The application shall retrieve TODO tasks from the backend API.
3. The application shall show a loading state while tasks are being fetched.
4. The application shall show an error message when tasks cannot be retrieved.
5. The application shall display an empty-state message when no tasks exist.

### Creating Tasks
6. The application shall allow a user to enter a new task name in a text input field.
7. The application shall prevent submission of a blank or whitespace-only task name.
8. The application shall allow a user to optionally assign a due date when creating a task.
9. The application shall allow a user to optionally assign a priority level (Low, Medium, High) to a task.
10. The application shall send new tasks to the backend API for creation.
11. The application shall add a newly created task to the visible list after successful creation.
12. The application shall clear the input field after a task is successfully created.
13. The application shall show an error message when a task cannot be created.

### Editing Tasks
14. The application shall allow a user to edit the name of an existing task.
15. The application shall allow a user to edit the due date of an existing task.
16. The application shall allow a user to edit the priority level of an existing task.
17. The application shall save edited tasks to the backend API.
18. The application shall reflect updated task details in the visible list after a successful edit.
19. The application shall show an error message when a task cannot be edited.

### Completing Tasks
20. The application shall allow a user to mark a task as complete.
21. The application shall allow a user to unmark a completed task as incomplete.
22. The application shall visually distinguish completed tasks from incomplete tasks.
23. The application shall send completion status changes to the backend API.

### Deleting Tasks
24. The application shall allow a user to delete an existing task.
25. The application shall send a delete request to the backend API for the selected task.
26. The application shall remove a deleted task from the visible list after successful deletion.
27. The application shall show an error message when a task cannot be deleted.

### Sorting & Filtering
28. The application shall sort tasks by due date (earliest first) by default.
29. The application shall allow a user to sort tasks by priority level.
30. The application shall allow a user to filter tasks to show only incomplete tasks.
31. The application shall allow a user to filter tasks to show only completed tasks.

### Backend Validation
32. The backend shall validate that a new task includes a non-empty name.
33. The backend shall reject create requests with missing or invalid task names.
34. The backend shall validate that a due date, if provided, is a valid date.
35. The backend shall validate that a priority level, if provided, is one of: Low, Medium, High.
36. The backend shall validate that edit and delete requests include a valid task identifier.
37. The backend shall return a not-found response when a request targets a non-existent task.
