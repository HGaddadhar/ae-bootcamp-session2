const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo Workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page, request }) => {
    // Clear all todos via API before each test
    const existing = await request.get('/api/todos');
    const todos = await existing.json();
    for (const todo of todos) {
      await request.delete(`/api/todos/${todo.id}`);
    }

    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('1. shows empty state when no tasks exist', async () => {
    await expect(todoPage.emptyState()).toBeVisible();
  });

  test('2. creates a task with name only', async () => {
    await todoPage.addTask({ name: 'Buy milk' });
    await expect(todoPage.taskByName('Buy milk')).toBeVisible();
    await expect(todoPage.snackbar()).toContainText(/task created/i);
  });

  test('3. creates a task with due date and priority', async () => {
    await todoPage.addTask({ name: 'Submit report', priority: 'High' });
    const task = todoPage.taskByName('Submit report');
    await expect(task).toBeVisible();
    await expect(task.getByText('High')).toBeVisible();
  });

  test('4. edits an existing task', async () => {
    await todoPage.addTask({ name: 'Original name' });
    await todoPage.editButton('Original name').click();
    await todoPage.dialogNameInput().clear();
    await todoPage.dialogNameInput().fill('Updated name');
    await todoPage.saveButton().click();

    await expect(todoPage.taskByName('Updated name')).toBeVisible();
    await expect(todoPage.taskByName('Original name')).not.toBeVisible();
    await expect(todoPage.snackbar()).toContainText(/task updated/i);
  });

  test('5. marks a task as complete and shows strikethrough', async () => {
    await todoPage.addTask({ name: 'Complete me' });
    await todoPage.completeCheckbox('Complete me').click();

    const taskText = todoPage.taskByName('Complete me').locator('text=Complete me');
    await expect(taskText).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('6. deletes a task', async () => {
    await todoPage.addTask({ name: 'Delete me' });
    await todoPage.deleteButton('Delete me').click();

    await expect(todoPage.taskByName('Delete me')).not.toBeVisible();
    await expect(todoPage.snackbar()).toContainText(/task deleted/i);
  });

  test('7. filters to show only incomplete tasks', async () => {
    await todoPage.addTask({ name: 'Pending task' });
    await todoPage.addTask({ name: 'Done task' });
    await todoPage.completeCheckbox('Done task').click();

    await todoPage.filterButton('Incomplete').click();

    await expect(todoPage.taskByName('Pending task')).toBeVisible();
    await expect(todoPage.taskByName('Done task')).not.toBeVisible();
  });

  test('8. prevents saving a task with a blank name', async () => {
    await todoPage.addTaskButton().click();
    await todoPage.saveButton().click();

    await expect(todoPage.page.getByText(/task name is required/i)).toBeVisible();
  });
});
