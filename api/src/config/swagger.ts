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
        // ─── Shared Response Schemas ────────────────────────────────
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
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
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Los datos proporcionados no son válidos' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'email' },
                      message: { type: 'string', example: 'Email inválido' },
                    },
                  },
                },
              },
            },
          },
        },
        // ─── Catalog Schemas ────────────────────────────────────────
        Role: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'admin' },
            displayName: { type: 'string', example: 'Administrador' },
          },
        },
        DocumentType: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'DNI' },
            displayName: { type: 'string', example: 'DNI' },
          },
        },
        PaymentMethod: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'cash' },
            displayName: { type: 'string', example: 'Efectivo' },
          },
        },
        ProductCategory: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Gaseosas' },
            description: { type: 'string', example: 'Bebidas carbonatadas', nullable: true },
          },
        },
        // ─── Auth Schemas ───────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@valhalla.com' },
            password: { type: 'string', example: 'Admin123!' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                firstName: { type: 'string', example: 'Admin' },
                lastName: { type: 'string', example: 'Valhalla' },
                email: { type: 'string', example: 'admin@valhalla.com' },
                role: { type: 'string', example: 'admin' },
                roleDisplayName: { type: 'string', example: 'Administrador' },
              },
            },
          },
        },
        // ─── User Schemas ───────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            identityDocument: { type: 'string', example: '12345678' },
            phone: { type: 'string', example: '999888777', nullable: true },
            email: { type: 'string', example: 'juan@email.com' },
            roleId: { type: 'integer', example: 2 },
            documentTypeId: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            role: { $ref: '#/components/schemas/Role' },
            documentType: { $ref: '#/components/schemas/DocumentType' },
          },
        },
        CreateUser: {
          type: 'object',
          required: ['firstName', 'lastName', 'identityDocument', 'email', 'password', 'roleId', 'documentTypeId'],
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45, example: 'Juan' },
            lastName: { type: 'string', minLength: 2, maxLength: 45, example: 'Pérez' },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20, example: '12345678' },
            phone: { type: 'string', maxLength: 15, example: '999888777' },
            email: { type: 'string', format: 'email', example: 'juan@email.com' },
            password: { type: 'string', minLength: 6, example: 'SecurePass123' },
            roleId: { type: 'integer', example: 2 },
            documentTypeId: { type: 'integer', example: 1 },
          },
        },
        UpdateUser: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45 },
            lastName: { type: 'string', minLength: 2, maxLength: 45 },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20 },
            phone: { type: 'string', maxLength: 15, nullable: true },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            roleId: { type: 'integer' },
            documentTypeId: { type: 'integer' },
            isActive: { type: 'boolean' },
          },
        },
        // ─── Company Schemas ────────────────────────────────────────
        Company: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Distribuidora ABC' },
            taxId: { type: 'string', example: '20123456789' },
            isActive: { type: 'boolean', example: true },
          },
        },
        CreateCompany: {
          type: 'object',
          required: ['name', 'taxId'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Distribuidora ABC' },
            taxId: { type: 'string', minLength: 8, maxLength: 25, example: '20123456789' },
          },
        },
        UpdateCompany: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            taxId: { type: 'string', minLength: 8, maxLength: 25 },
            isActive: { type: 'boolean' },
          },
        },
        // ─── Provider Schemas ───────────────────────────────────────
        Provider: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string', example: 'Carlos' },
            lastName: { type: 'string', example: 'López' },
            identityDocument: { type: 'string', example: '87654321' },
            email: { type: 'string', example: 'carlos@empresa.com' },
            phone: { type: 'string', example: '987654321' },
            documentTypeId: { type: 'integer', example: 1 },
            companyId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean', example: true },
            documentType: { $ref: '#/components/schemas/DocumentType' },
            company: { $ref: '#/components/schemas/Company' },
          },
        },
        CreateProvider: {
          type: 'object',
          required: ['firstName', 'lastName', 'identityDocument', 'email', 'phone', 'documentTypeId', 'companyId'],
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45, example: 'Carlos' },
            lastName: { type: 'string', minLength: 2, maxLength: 45, example: 'López' },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20, example: '87654321' },
            email: { type: 'string', format: 'email', example: 'carlos@empresa.com' },
            phone: { type: 'string', minLength: 7, maxLength: 15, example: '987654321' },
            documentTypeId: { type: 'integer', example: 1 },
            companyId: { type: 'string', format: 'uuid' },
          },
        },
        UpdateProvider: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45 },
            lastName: { type: 'string', minLength: 2, maxLength: 45 },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', minLength: 7, maxLength: 15 },
            documentTypeId: { type: 'integer' },
            companyId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' },
          },
        },
        // ─── Client Schemas ─────────────────────────────────────────
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string', example: 'María' },
            lastName: { type: 'string', example: 'García' },
            phone: { type: 'string', example: '912345678', nullable: true },
            email: { type: 'string', example: 'maria@email.com', nullable: true },
            documentTypeId: { type: 'integer', example: 1 },
            identityDocument: { type: 'string', example: '45678912' },
            isActive: { type: 'boolean', example: true },
            documentType: { $ref: '#/components/schemas/DocumentType' },
          },
        },
        CreateClient: {
          type: 'object',
          required: ['firstName', 'lastName', 'documentTypeId', 'identityDocument'],
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45, example: 'María' },
            lastName: { type: 'string', minLength: 2, maxLength: 45, example: 'García' },
            phone: { type: 'string', maxLength: 15, example: '912345678' },
            email: { type: 'string', format: 'email', example: 'maria@email.com' },
            documentTypeId: { type: 'integer', example: 1 },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20, example: '45678912' },
          },
        },
        UpdateClient: {
          type: 'object',
          properties: {
            firstName: { type: 'string', minLength: 2, maxLength: 45 },
            lastName: { type: 'string', minLength: 2, maxLength: 45 },
            phone: { type: 'string', maxLength: 15, nullable: true },
            email: { type: 'string', format: 'email', nullable: true },
            documentTypeId: { type: 'integer' },
            identityDocument: { type: 'string', minLength: 8, maxLength: 20 },
            isActive: { type: 'boolean' },
          },
        },
        // ─── Product Schemas ────────────────────────────────────────
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Coca Cola 500ml' },
            code: { type: 'string', example: '7750236000125' },
            salePrice: { type: 'number', example: 3.50 },
            stock: { type: 'integer', example: 48 },
            categoryId: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            category: { $ref: '#/components/schemas/ProductCategory' },
          },
        },
        CreateProduct: {
          type: 'object',
          required: ['name', 'code', 'salePrice', 'categoryId'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Coca Cola 500ml' },
            code: { type: 'string', minLength: 3, maxLength: 13, example: '7750236000125' },
            salePrice: { type: 'number', minimum: 0.01, example: 3.50 },
            stock: { type: 'integer', minimum: 0, default: 0, example: 24 },
            categoryId: { type: 'integer', example: 1 },
          },
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            code: { type: 'string', minLength: 3, maxLength: 13 },
            salePrice: { type: 'number', minimum: 0.01 },
            stock: { type: 'integer', minimum: 0 },
            categoryId: { type: 'integer' },
            isActive: { type: 'boolean' },
          },
        },
        // ─── Purchase Schemas ───────────────────────────────────────
        CreatePurchase: {
          type: 'object',
          required: ['providerId', 'voucherType', 'products'],
          properties: {
            providerId: { type: 'string', format: 'uuid' },
            voucherType: { type: 'string', enum: ['RECEIPT', 'INVOICE', 'TICKET'] },
            products: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity', 'unitPrice'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1, example: 10 },
                  unitPrice: { type: 'number', minimum: 0.01, example: 2.50 },
                },
              },
            },
          },
        },
        // ─── Sale Schemas ───────────────────────────────────────────
        CreateSale: {
          type: 'object',
          required: ['voucherType', 'voucherCode', 'saleChannel', 'paymentMethodId', 'products'],
          properties: {
            clientId: { type: 'string', format: 'uuid', nullable: true },
            voucherType: { type: 'string', enum: ['RECEIPT', 'INVOICE', 'TICKET'] },
            voucherCode: { type: 'string', minLength: 1, maxLength: 30, example: 'B001-00000047' },
            saleChannel: { type: 'string', enum: ['IN_STORE', 'ONLINE'] },
            paymentMethodId: { type: 'integer', example: 1 },
            discountAmount: { type: 'number', minimum: 0, default: 0, example: 5.00 },
            products: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1, example: 2 },
                  discountPercent: { type: 'number', minimum: 0, maximum: 100, default: 0, example: 10 },
                },
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
