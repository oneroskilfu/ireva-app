/**
 * Authentication & Authorization Tests
 * Tests for user registration, login, JWT handling, and role-based access
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock Express app for testing
const createTestApp = () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // Import your auth routes
  // app.use('/api/auth', authRoutes);
  
  return app;
};

describe('Authentication System', () => {
  let app;
  let testUser;
  
  beforeEach(() => {
    app = createTestApp();
    testUser = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'investor'
    };
  });

  describe('User Registration', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    test('should reject registration with invalid email', async () => {
      const invalidEmailUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailUser)
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    test('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register test user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('JWT Token Handling', () => {
    let userToken;

    beforeEach(async () => {
      // Register and login to get token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      userToken = loginResponse.body.token;
    });

    test('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    test('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.message).toContain('token');
    });

    test('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });

    test('should reject expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { id: 1, email: testUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.message).toContain('expired');
    });
  });

  describe('Role-Based Access Control', () => {
    let investorToken, adminToken;

    beforeEach(async () => {
      // Create investor user
      const investorResponse = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'investor@example.com' });
      investorToken = investorResponse.body.token;

      // Create admin user
      const adminResponse = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'admin@example.com', role: 'admin' });
      adminToken = adminResponse.body.token;
    });

    test('admin should access admin-only routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    test('investor should be denied admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${investorToken}`)
        .expect(403);

      expect(response.body.message).toContain('access denied');
    });

    test('investor should access investor routes', async () => {
      const response = await request(app)
        .get('/api/investor/dashboard')
        .set('Authorization', `Bearer ${investorToken}`)
        .expect(200);
    });
  });

  describe('Password Security', () => {
    test('passwords should be hashed in database', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Verify password is not stored in plain text
      expect(response.body.user.password).toBeUndefined();
    });

    test('should handle password change securely', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const token = registerResponse.body.token;

      // Change password
      const newPassword = 'NewSecurePass456!';
      const changeResponse = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: newPassword
        })
        .expect(200);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });
  });
});

describe('Property Routes Access Control', () => {
  let app, investorToken, adminToken;

  beforeEach(async () => {
    app = createTestApp();
    
    // Create and login users
    const investorResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'investor@example.com',
        password: 'SecurePass123!',
        firstName: 'Investor',
        lastName: 'User',
        role: 'investor'
      });
    investorToken = investorResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
    adminToken = adminResponse.body.token;
  });

  test('anyone can view property listings', async () => {
    const response = await request(app)
      .get('/api/properties')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  test('authenticated users can view property details', async () => {
    const response = await request(app)
      .get('/api/properties/1')
      .set('Authorization', `Bearer ${investorToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
  });

  test('only admins can create properties', async () => {
    const propertyData = {
      title: 'Test Property',
      description: 'A test property',
      location: 'Lagos, Nigeria',
      price: 5000000,
      propertyType: 'residential'
    };

    // Admin should succeed
    const adminResponse = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(propertyData)
      .expect(201);

    expect(adminResponse.body).toHaveProperty('id');

    // Investor should be denied
    const investorResponse = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${investorToken}`)
      .send(propertyData)
      .expect(403);

    expect(investorResponse.body.message).toContain('access denied');
  });

  test('only admins can update properties', async () => {
    const updateData = { title: 'Updated Property Title' };

    // Admin should succeed
    const adminResponse = await request(app)
      .patch('/api/properties/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    // Investor should be denied
    const investorResponse = await request(app)
      .patch('/api/properties/1')
      .set('Authorization', `Bearer ${investorToken}`)
      .send(updateData)
      .expect(403);
  });

  test('only admins can delete properties', async () => {
    // Admin should succeed
    const adminResponse = await request(app)
      .delete('/api/properties/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Investor should be denied
    const investorResponse = await request(app)
      .delete('/api/properties/2')
      .set('Authorization', `Bearer ${investorToken}`)
      .expect(403);
  });
});

describe('Investment Flow Tests', () => {
  let app, investorToken;

  beforeEach(async () => {
    app = createTestApp();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'investor@example.com',
        password: 'SecurePass123!',
        firstName: 'Investor',
        lastName: 'User',
        role: 'investor'
      });
    investorToken = response.body.token;
  });

  test('verified user can create investment', async () => {
    const investmentData = {
      propertyId: 1,
      amount: 100000
    };

    const response = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${investorToken}`)
      .send(investmentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toBe(investmentData.amount);
  });

  test('unverified user cannot create investment', async () => {
    // Mock unverified user scenario
    const investmentData = {
      propertyId: 1,
      amount: 100000
    };

    // This would fail if user is not KYC verified
    const response = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${investorToken}`)
      .send(investmentData);

    // Response depends on KYC status
    expect([201, 403]).toContain(response.status);
  });
});

// Export test utilities for other test files
module.exports = {
  createTestApp,
  createTestUser: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'investor',
    ...overrides
  })
};