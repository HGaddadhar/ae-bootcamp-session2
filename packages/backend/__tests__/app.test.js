const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

const createTodo = async (fields = {}) => {
  const res = await request(app)
    .post('/api/todos')
    .send({ name: 'Test Todo', ...fields })
    .set('Accept', 'application/json');
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  return res.body;
};

describe('API Endpoints', () => {
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const todo = res.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('name');
      expect(todo).toHaveProperty('created_at');
      expect(todo).toHaveProperty('due_date');
      expect(todo).toHaveProperty('priority');
      expect(todo).toHaveProperty('completed');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a todo with name only', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Simple Todo' })
        .set('Accept', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Simple Todo');
      expect(res.body.due_date).toBeNull();
      expect(res.body.priority).toBeNull();
      expect(res.body.completed).toBe(0);
    });

    it('should create a todo with due_date and priority', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Full Todo', due_date: '2026-12-31', priority: 'High' })
        .set('Accept', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.due_date).toBe('2026-12-31');
      expect(res.body.priority).toBe('High');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app).post('/api/todos').send({}).set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if name is empty', async () => {
      const res = await request(app).post('/api/todos').send({ name: '' }).set('Accept', 'application/json');
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid due_date', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Bad Date', due_date: 'not-a-date' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/due_date/);
    });

    it('should return 400 for invalid priority', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Bad Priority', priority: 'Critical' })
        .set('Accept', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/priority/);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo name', async () => {
      const todo = await createTodo();
      const res = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ name: 'Updated Name' })
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('should update due_date and priority', async () => {
      const todo = await createTodo();
      const res = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ due_date: '2027-01-01', priority: 'Low' });

      expect(res.status).toBe(200);
      expect(res.body.due_date).toBe('2027-01-01');
      expect(res.body.priority).toBe('Low');
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).put('/api/todos/999999').send({ name: 'X' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid priority on update', async () => {
      const todo = await createTodo();
      const res = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ priority: 'Urgent' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('should toggle completed from false to true', async () => {
      const todo = await createTodo();
      expect(todo.completed).toBe(0);

      const res = await request(app).patch(`/api/todos/${todo.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(1);
    });

    it('should toggle completed from true to false', async () => {
      const todo = await createTodo();
      await request(app).patch(`/api/todos/${todo.id}/complete`);
      const res = await request(app).patch(`/api/todos/${todo.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(0);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).patch('/api/todos/999999/complete');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = await createTodo({ name: 'Todo To Delete' });
      const res = await request(app).delete(`/api/todos/${todo.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

      const again = await request(app).delete(`/api/todos/${todo.id}`);
      expect(again.status).toBe(404);
    });

    it('should return 404 when todo does not exist', async () => {
      const res = await request(app).delete('/api/todos/999999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Todo not found');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request(app).delete('/api/todos/abc');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Valid todo ID is required');
    });
  });
});
