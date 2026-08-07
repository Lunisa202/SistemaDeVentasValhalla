import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Valhalla Sales System API',
      version: '1.0.0',
      description: 'REST API para el sistema de ventas Valhalla. Gestión de productos, ventas, compras, caja y analytics.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT. Obtener via POST /auth/login',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 150 },
                totalPages: { type: 'number', example: 8 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Recurso no encontrado' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Register Swagger UI and JSON spec endpoint.
 */
export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Valhalla API Docs',
  }));

  // JSON spec (useful for frontend type generation)
  app.get('/api/v1/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
}
