const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe('server.js', () => {
  describe('auth endpoints', () => {
    describe('[POST] /api/auth/register', () => {
      it('responds with 201 and new user on success', async () => {
        const res = await request(server).post('/api/auth/register')
          .send({ username: 'test', password: 'test' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username', 'test');
      });

      it('responds with 400 if username taken', async () => {
        await request(server).post('/api/auth/register')
          .send({ username: 'taken', password: 'test' });
        const res = await request(server).post('/api/auth/register')
          .send({ username: 'taken', password: 'test' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('username taken');
      });
    });

    describe('[POST] /api/auth/login', () => {
      it('responds with 200 and token on success', async () => {
        await request(server).post('/api/auth/register')
          .send({ username: 'login', password: 'test' });
        const res = await request(server).post('/api/auth/login')
          .send({ username: 'login', password: 'test' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
      });

      it('responds with 401 on invalid credentials', async () => {
        const res = await request(server).post('/api/auth/login')
          .send({ username: 'wrong', password: 'wrong' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('invalid credentials');
      });
    });
  });

  describe('jokes endpoint', () => {
    describe('[GET] /api/jokes', () => {
      it('responds with 401 if no token provided', async () => {
        const res = await request(server).get('/api/jokes');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('token required');
      });

      it('responds with jokes if valid token provided', async () => {
        // First register and login to get a token
        await request(server).post('/api/auth/register')
          .send({ username: 'joker', password: 'test' });
        const login = await request(server).post('/api/auth/login')
          .send({ username: 'joker', password: 'test' });
        const token = login.body.token;

        const res = await request(server).get('/api/jokes')
          .set('Authorization', token);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });
  });
});
