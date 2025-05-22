import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Auth endpoints
  rest.post('/api/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'investor',
      })
    );
  }),

  rest.post('/api/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 2,
        username: 'newuser',
        email: 'new@example.com',
        role: 'investor',
      })
    );
  }),

  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'investor',
      })
    );
  }),

  // Investment endpoints
  rest.get('/api/investments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          propertyId: 1,
          amount: '5000',
          status: 'confirmed',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('/api/investments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 2,
        propertyId: 1,
        amount: '10000',
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Audit logs
  rest.get('/api/admin/audit-logs', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        logs: [
          {
            id: 1,
            userId: 1,
            action: 'user.login',
            timestamp: '2024-01-01T00:00:00Z',
            ipAddress: '127.0.0.1',
            user: {
              username: 'testuser',
              name: 'Test User',
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      })
    );
  }),

  // Consent endpoints
  rest.get('/api/consent/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        needsConsent: false,
        termsAccepted: true,
        privacyAccepted: true,
        currentVersions: {
          terms: '2.0',
          privacy: '2.0',
        },
      })
    );
  }),

  rest.post('/api/consent/accept', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Consent recorded successfully',
      })
    );
  }),
];

export const server = setupServer(...handlers);