import swaggerUi from 'swagger-ui-express';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Nano Link URL Shortener API',
    version: '1.0.0',
    description: 'Production-ready URL Shortener API built with Node.js, Express, PostgreSQL, and Prisma ORM.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Url: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          originalUrl: { type: 'string' },
          shortCode: { type: 'string' },
          customAlias: { type: 'string', nullable: true },
          clickCount: { type: 'integer' },
          expiryDate: { type: 'string', format: 'date-time', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in user and get tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tokens refreshed' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get current user profile',
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/urls': {
      post: {
        summary: 'Shorten a URL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['originalUrl'],
                properties: {
                  originalUrl: { type: 'string', format: 'uri' },
                  customAlias: { type: 'string' },
                  expiryDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Shortened URL created' },
          400: { description: 'Validation failed' },
          409: { description: 'Alias already in use' },
        },
      },
      get: {
        summary: 'Get all user links',
        responses: {
          200: { description: 'Success' },
        },
      },
    },
    '/api/urls/{id}': {
      patch: {
        summary: 'Update link attributes',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  originalUrl: { type: 'string', format: 'uri' },
                  customAlias: { type: 'string' },
                  expiryDate: { type: 'string', format: 'date-time' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated successfully' },
          404: { description: 'Link not found' },
        },
      },
      delete: {
        summary: 'Delete short URL',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Deleted successfully' },
          404: { description: 'Link not found' },
        },
      },
    },
    '/api/urls/import': {
      post: {
        summary: 'Bulk CSV Import',
        requestBody: {
          required: true,
          content: {
            'text/csv': {
              schema: { type: 'string', example: 'originalUrl,customAlias,expiryDate\nhttps://google.com,google-search,\nhttps://github.com,hub-repo,2026-12-31T23:59:59Z' },
            },
          },
        },
        responses: {
          200: { description: 'Bulk CSV import processed' },
        },
      },
    },
    '/api/analytics/dashboard': {
      get: {
        summary: 'Get overall dashboard statistics',
        responses: {
          200: { description: 'Success' },
        },
      },
    },
    '/api/analytics/link/{id}': {
      get: {
        summary: 'Get analytics for a specific link',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Success' },
          404: { description: 'Link not found' },
        },
      },
    },
    '/api/qr/{code}': {
      get: {
        summary: 'Generate QR Code for a short code',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Success' },
          404: { description: 'Link not found' },
        },
      },
    },
  },
};

export const serveSwagger = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openApiSpec);
};

export { swaggerUi };
