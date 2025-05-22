import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { setupTestApp } from '../utils/test-app';
import { db } from '../../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('Authentication Flow', () => {
  let app: any;
  let testUser: any;

  beforeEach(async () => {
    app = await setupTestApp();
    
    // Create a test user
    [testUser] = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword123',
      name: 'Test User',
      role: 'investor',
    }).returning();
  });

  describe('POST /api/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    test('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/register', () => {
    test('should register a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('newuser');
      expect(response.body.email).toBe('new@example.com');

      // Verify user was created in database
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.username, 'newuser'))
        .limit(1);

      expect(dbUser).toHaveLength(1);
      expect(dbUser[0].email).toBe('new@example.com');
    });

    test('should reject duplicate username', async () => {
      const userData = {
        username: 'testuser', // Already exists
        email: 'another@example.com',
        password: 'password123',
        name: 'Another User',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should validate email format', async () => {
      const userData = {
        username: 'validuser',
        email: 'invalid-email',
        password: 'password123',
        name: 'Valid User',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('should enforce password strength', async () => {
      const userData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: '123', // Too weak
        name: 'Valid User',
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/user', () => {
    test('should return user data when authenticated', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then get user data
      const response = await request(app)
        .get('/api/user')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('testuser');
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/logout', () => {
    test('should logout authenticated user', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then logout
      const logoutResponse = await request(app)
        .post('/api/logout')
        .set('Cookie', cookies);

      expect(logoutResponse.status).toBe(200);

      // Verify session is invalidated
      const userResponse = await request(app)
        .get('/api/user')
        .set('Cookie', cookies);

      expect(userResponse.status).toBe(401);
    });
  });
});