const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  // Task list
  taskItems() {
    return this.page.getByRole('listitem');
  }

  taskByName(name) {
    return this.page.getByRole('listitem').filter({ hasText: name });
  }

  // Controls
  addTaskButton() {
    return this.page.getByRole('button', { name: /add task/i });
  }

  sortSelect() {
    return this.page.getByLabel(/sort by/i);
  }

  filterButton(label) {
    return this.page.getByRole('button', { name: new RegExp(label, 'i') });
  }

  // Dialog
  dialogNameInput() {
    return this.page.getByLabel(/task name/i);
  }

  dialogDueDateInput() {
    return this.page.getByLabel(/due date/i);
  }

  dialogPrioritySelect() {
    // Use data-testid to reliably target MUI v9 Select across DOM structure changes
    return this.page.locator('[data-testid="priority-select"]').locator('[aria-haspopup="listbox"], [role="combobox"], .MuiSelect-select').first();
  }

  saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  cancelButton() {
    return this.page.getByRole('button', { name: /cancel/i });
  }

  // Per-task actions
  editButton(taskName) {
    return this.page.getByRole('button', { name: new RegExp(`edit ${taskName}`, 'i') });
  }

  deleteButton(taskName) {
    return this.page.getByRole('button', { name: new RegExp(`delete ${taskName}`, 'i') });
  }

  completeCheckbox(taskName) {
    // Scope to the task's list item to avoid aria-label MUI version differences
    return this.taskByName(taskName).getByRole('checkbox');
  }

  snackbar() {
    return this.page.locator('[role="alert"]');
  }

  emptyState() {
    return this.page.getByText(/no tasks yet/i);
  }

  // Helper: open add dialog, fill fields, save
  async addTask({ name, dueDate, priority } = {}) {
    await this.addTaskButton().click();
    await this.dialogNameInput().fill(name);
    if (dueDate) await this.dialogDueDateInput().fill(dueDate);
    if (priority) {
      await this.dialogPrioritySelect().click();
      await this.page.getByRole('option', { name: priority }).click();
    }
    await this.saveButton().click();
  }
}

module.exports = { TodoPage };
