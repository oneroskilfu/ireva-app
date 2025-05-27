import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'iREVA Real Estate Investment Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the iREVA real estate investment platform serving Nigerian investors',
      contact: {
        name: 'iREVA Support',
        email: 'support@ireva.ng'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.ireva.ng',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User unique identifier' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            firstName: { type: 'string', description: 'User first name' },
            lastName: { type: 'string', description: 'User last name' },
            role: { type: 'string', enum: ['investor', 'admin'], description: 'User role' },
            isActive: { type: 'boolean', description: 'User account status' },
            isVerified: { type: 'boolean', description: 'Email verification status' },
            createdAt: { type: 'string', format: 'date-time', description: 'Account creation date' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Property unique identifier' },
            title: { type: 'string', description: 'Property title' },
            description: { type: 'string', description: 'Property description' },
            location: { type: 'string', description: 'Property location' },
            price: { type: 'number', description: 'Minimum investment amount' },
            propertyType: { type: 'string', enum: ['residential', 'commercial', 'mixed-use', 'land'], description: 'Property type' },
            status: { type: 'string', enum: ['active', 'funding', 'completed'], description: 'Property status' },
            targetAmount: { type: 'number', description: 'Total funding target' },
            raisedAmount: { type: 'number', description: 'Amount raised so far' },
            expectedROI: { type: 'number', description: 'Expected return on investment percentage' },
            images: { type: 'array', items: { type: 'string' }, description: 'Property images' },
            createdAt: { type: 'string', format: 'date-time', description: 'Property listing date' }
          }
        },
        Investment: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Investment unique identifier' },
            userId: { type: 'string', description: 'Investor user ID' },
            propertyId: { type: 'string', description: 'Property ID' },
            amount: { type: 'number', description: 'Investment amount' },
            status: { type: 'string', enum: ['active', 'completed', 'pending'], description: 'Investment status' },
            expectedROI: { type: 'number', description: 'Expected ROI percentage' },
            investmentDate: { type: 'string', format: 'date-time', description: 'Investment date' }
          }
        },
        KYCDocument: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Document unique identifier' },
            type: { type: 'string', enum: ['identity', 'address', 'income', 'bank'], description: 'Document type' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: 'Document status' },
            uploadedAt: { type: 'string', format: 'date-time', description: 'Upload date' },
            rejectionReason: { type: 'string', description: 'Reason for rejection if applicable' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', minLength: 6, description: 'User password' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', minLength: 6, description: 'User password' },
            firstName: { type: 'string', description: 'User first name' },
            lastName: { type: 'string', description: 'User last name' },
            role: { type: 'string', enum: ['investor'], default: 'investor', description: 'User role' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT access token' },
            refreshToken: { type: 'string', description: 'JWT refresh token' },
            user: { $ref: '#/components/schemas/User' },
            expiresAt: { type: 'number', description: 'Token expiration timestamp' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
            code: { type: 'string', description: 'Error code' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management'
      },
      {
        name: 'Email Verification',
        description: 'Email verification and password reset'
      },
      {
        name: 'Properties',
        description: 'Property listings and management'
      },
      {
        name: 'Investments',
        description: 'Investment operations and tracking'
      },
      {
        name: 'Investor',
        description: 'Investor dashboard and portfolio management'
      },
      {
        name: 'Admin',
        description: 'Administrative functions and platform management'
      },
      {
        name: 'KYC',
        description: 'Know Your Customer verification process'
      }
    ]
  },
  apis: ['./server/routes/*.ts', './server/swagger-docs.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1F6FEB; }
      .swagger-ui .scheme-container { background: #f8f9fa; border: 1px solid #dee2e6; }
    `,
    customSiteTitle: 'iREVA API Documentation',
    customfavIcon: '/favicon.ico'
  }));

  // Serve swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;