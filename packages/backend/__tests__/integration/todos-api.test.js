const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) db.close();
});

beforeEach(() => {
  db.exec('DELETE FROM todos');
});

const createTodo = async (fields = {}) => {
  const res = await request(app)
    .post('/api/todos')
    .send({ name: 'Integration Todo', ...fields })
    .set('Accept', 'application/json');
  expect(res.status).toBe(201);
  return res.body;
};

describe('Todos API Integration', () => {
  describe('GET /api/todos', () => {
    it('returns empty array when no todos exist', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns todos sorted by due_date ascending, nulls last', async () => {
      await createTodo({ name: 'No date' });
      await createTodo({ name: 'Later', due_date: '2027-06-01' });
      await createTodo({ name: 'Earlier', due_date: '2026-01-01' });

      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(200);
      const names = res.body.map(t => t.name);
      expect(names.indexOf('Earlier')).toBeLessThan(names.indexOf('Later'));
      expect(names.indexOf('Later')).toBeLessThan(names.indexOf('No date'));
    });
  });

  describe('POST /api/todos — full validation', () => {
    it('creates todo with all fields', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ name: 'Full', due_date: '2026-09-01', priority: 'Medium' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Full',
        due_date: '2026-09-01',
        priority: 'Medium',
        completed: 0,
      });
    });

    it('rejects whitespace-only name', async () => {
      const res = await request(app).post('/api/todos').send({ name: '   ' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid due_date', async () => {
      const res = await request(app).post('/api/todos').send({ name: 'X', due_date: 'tomorrow' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/due_date/);
    });

    it('rejects priority not in allowed values', async () => {
      const res = await request(app).post('/api/todos').send({ name: 'X', priority: 'Urgent' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/priority/);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('edits all fields of an existing todo', async () => {
      const todo = await createTodo();
      const res = await request(app)
        .put(`/api/todos/${todo.id}`)
        .send({ name: 'Renamed', due_date: '2027-03-15', priority: 'Low' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Renamed', due_date: '2027-03-15', priority: 'Low' });
    });

    it('partial update preserves unchanged fields', async () => {
      const todo = await createTodo({ due_date: '2026-12-01', priority: 'High' });
      const res = await request(app).put(`/api/todos/${todo.id}`).send({ name: 'Only Name Changed' });

      expect(res.status).toBe(200);
      expect(res.body.due_date).toBe('2026-12-01');
      expect(res.body.priority).toBe('High');
      expect(res.body.name).toBe('Only Name Changed');
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).put('/api/todos/999999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid priority', async () => {
      const todo = await createTodo();
      const res = await request(app).put(`/api/todos/${todo.id}`).send({ priority: 'ASAP' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('marks incomplete todo as complete', async () => {
      const todo = await createTodo();
      const res = await request(app).patch(`/api/todos/${todo.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(1);
    });

    it('unmarks a completed todo', async () => {
      const todo = await createTodo();
      await request(app).patch(`/api/todos/${todo.id}/complete`);
      const res = await request(app).patch(`/api/todos/${todo.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(0);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).patch('/api/todos/999999/complete');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('deletes a todo and confirms it is gone', async () => {
      const todo = await createTodo();
      const del = await request(app).delete(`/api/todos/${todo.id}`);
      expect(del.status).toBe(200);

      const list = await request(app).get('/api/todos');
      const ids = list.body.map(t => t.id);
      expect(ids).not.toContain(todo.id);
    });

    it('returns 404 when todo does not exist', async () => {
      const res = await request(app).delete('/api/todos/999999');
      expect(res.status).toBe(404);
    });
  });
});
