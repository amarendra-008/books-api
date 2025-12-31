import request from 'supertest';
import app from '../index';

// Mock the database pool
jest.mock('../db', () => ({
  query: jest.fn(),
}));

import pool from '../db';

const mockedPool = pool as jest.Mocked<typeof pool>;

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Username, email, and password are required'
      );
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password1',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email format');
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Password must be at least 8 characters');
    });

    it('should return 409 if user already exists', async () => {
      (mockedPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password1',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(
        'User with this email or username already exists'
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email and password are required');
    });

    it('should return 401 for non-existent user', async () => {
      (mockedPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'Password1',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
