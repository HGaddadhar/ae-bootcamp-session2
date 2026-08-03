import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const mockTodos = [
  { id: 1, name: 'Buy groceries', due_date: null, priority: null, completed: 0, created_at: '2026-01-01T00:00:00Z' },
  { id: 2, name: 'Walk the dog', due_date: '2026-12-31', priority: 'High', completed: 0, created_at: '2026-01-02T00:00:00Z' },
];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json(mockTodos))),

  rest.post('/api/todos', (req, res, ctx) => {
    const { name } = req.body;
    if (!name || name.trim() === '') return res(ctx.status(400), ctx.json({ error: 'Todo name is required' }));
    return res(ctx.status(201), ctx.json({ id: 3, name, due_date: null, priority: null, completed: 0, created_at: new Date().toISOString() }));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id: parseInt(req.params.id) }))),

  rest.patch('/api/todos/:id/complete', (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ id: parseInt(req.params.id), name: 'Buy groceries', due_date: null, priority: null, completed: 1, created_at: '2026-01-01T00:00:00Z' }))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app title in the AppBar', async () => {
    render(<App />);
    expect(screen.getByText('TODO App')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByLabelText('Loading tasks')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    });
  });

  test('displays priority chip for todos with priority', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos exist', async () => {
    server.use(rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json([]))));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  test('shows error snackbar when API fails', async () => {
    server.use(rest.get('/api/todos', (req, res, ctx) => res(ctx.status(500))));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });

  test('adds a new todo via the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => screen.getByText('Buy groceries'));

    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.type(screen.getByLabelText(/task name/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('prevents saving a task with a blank name', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => screen.getByText('Buy groceries'));

    await user.click(screen.getByRole('button', { name: /add task/i }));
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(screen.getByText(/task name is required/i)).toBeInTheDocument();
  });

  test('deletes a todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => screen.getByText('Buy groceries'));

    await user.click(screen.getByRole('button', { name: /delete buy groceries/i }));

    await waitFor(() => {
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });
  });
});
