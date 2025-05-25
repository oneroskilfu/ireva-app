import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'iREVA - Nigerian Real Estate Investment Platform API',
      version: '1.0.0',
      description: `
        ## About iREVA
        
        iREVA is Nigeria's premier real estate investment platform, connecting investors with verified property opportunities across Lagos, Abuja, Port Harcourt, and other major cities.
        
        ## Key Features
        - **Secure Authentication**: JWT-based authentication with refresh tokens
        - **Property Investment**: Browse and invest in verified real estate projects
        - **Portfolio Management**: Track your investments and returns
        - **Multi-tenant Support**: Property management companies can onboard their projects
        - **KYC Compliance**: Regulatory-compliant investor verification
        - **Real-time Updates**: Live property performance and ROI tracking
        
        ## Getting Started
        
        1. **Register** as an investor or property manager
        2. **Complete KYC** verification process
        3. **Browse Properties** and investment opportunities
        4. **Invest** in properties with secure payment processing
        5. **Track Performance** through your investor dashboard
        
        ## Authentication
        
        This API uses JWT (JSON Web Tokens) for authentication:
        - **Access Token**: Short-lived (15 minutes) for API requests
        - **Refresh Token**: Long-lived (7 days) for seamless session management
        
        Include the access token in the Authorization header:
        \`Authorization: Bearer <your-access-token>\`
        
        ## Rate Limiting
        
        API requests are rate-limited to ensure fair usage:
        - **Authentication endpoints**: 5 requests per minute
        - **General API**: 100 requests per minute
        - **Property data**: 50 requests per minute
        
        ## Support
        
        For integration support or partnership inquiries:
        - Email: api@ireva.ng
        - Documentation: https://docs.ireva.ng
        - Developer Portal: https://developers.ireva.ng
      `,
      contact: {
        name: 'iREVA API Support',
        email: 'api@ireva.ng',
        url: 'https://ireva.ng/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://ireva.ng/terms'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://api.ireva.ng' : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        },
        RefreshToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Refresh-Token',
          description: 'Refresh token for generating new access tokens'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Adebayo Johnson' },
            email: { type: 'string', format: 'email', example: 'adebayo@example.com' },
            role: { 
              type: 'string', 
              enum: ['investor', 'admin', 'manager'], 
              example: 'investor' 
            },
            isVerified: { type: 'boolean', example: true },
            kycStatus: { 
              type: 'string', 
              enum: ['pending', 'approved', 'rejected'], 
              example: 'approved' 
            },
            phone: { type: 'string', example: '+234 801 234 5678' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Lagos Luxury Apartments' },
            description: { type: 'string', example: 'Premium 3-bedroom apartments in Victoria Island' },
            location: { type: 'string', example: 'Victoria Island, Lagos' },
            totalValue: { type: 'number', example: 500000000 },
            availableShares: { type: 'integer', example: 1000 },
            pricePerShare: { type: 'number', example: 500000 },
            expectedROI: { type: 'number', example: 15.5 },
            status: { 
              type: 'string', 
              enum: ['active', 'closed', 'upcoming'], 
              example: 'active' 
            },
            images: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['https://ireva.ng/images/property1.jpg'] 
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Investment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            propertyId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            shares: { type: 'integer', example: 10 },
            totalAmount: { type: 'number', example: 5000000 },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'cancelled'], 
              example: 'confirmed' 
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'abc123def456...' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            errors: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Properties',
        description: 'Real estate property listings and management'
      },
      {
        name: 'Investments',
        description: 'Investment tracking and portfolio management'
      },
      {
        name: 'Users',
        description: 'User profile and account management'
      },
      {
        name: 'KYC',
        description: 'Know Your Customer verification process'
      },
      {
        name: 'Transactions',
        description: 'Payment and transaction history'
      },
      {
        name: 'Admin',
        description: 'Administrative functions (admin/manager only)'
      }
    ]
  },
  apis: [
    './server/routes/*.ts',
    './server/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);