const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    due_date TEXT,
    priority TEXT CHECK(priority IN ('Low','Medium','High')),
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const initialTodos = ['Buy groceries', 'Walk the dog', 'Read a book'];
const insertStmt = db.prepare('INSERT INTO todos (name) VALUES (?)');
initialTodos.forEach(name => insertStmt.run(name));

console.log('In-memory database initialized with sample data');

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, created_at ASC').all();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { name, due_date, priority } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Todo name is required' });
    }

    if (due_date !== undefined && due_date !== null && due_date !== '') {
      if (isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due_date format' });
      }
    }

    if (priority !== undefined && priority !== null && priority !== '') {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'priority must be Low, Medium, or High' });
      }
    }

    const stmt = db.prepare('INSERT INTO todos (name, due_date, priority) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), due_date || null, priority || null);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { name, due_date, priority } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Todo name cannot be empty' });
      }
    }

    if (due_date !== undefined && due_date !== null && due_date !== '') {
      if (isNaN(Date.parse(due_date))) {
        return res.status(400).json({ error: 'Invalid due_date format' });
      }
    }

    if (priority !== undefined && priority !== null && priority !== '') {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'priority must be Low, Medium, or High' });
      }
    }

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedDueDate = due_date !== undefined ? (due_date || null) : existing.due_date;
    const updatedPriority = priority !== undefined ? (priority || null) : existing.priority;

    db.prepare('UPDATE todos SET name = ?, due_date = ?, priority = ? WHERE id = ?')
      .run(updatedName, updatedDueDate, updatedPriority, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const newCompleted = existing.completed ? 0 : 1;
    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newCompleted, id);

    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling todo completion:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db, insertStmt };