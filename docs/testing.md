# Estrategia de Testing

## Herramientas

| Herramienta | Propósito |
|-------------|-----------|
| Vitest | Test runner, assertions, mocks |
| Supertest | HTTP testing contra Express (integration tests) |
| @vitest/coverage-v8 | Reporte de cobertura de código |
| Postman | Pruebas funcionales manuales de la API |

---

## Tipos de pruebas

```mermaid
graph LR
    A[Unit Tests] --> B[Integration Tests]
    B --> C[Functional Tests - API]
    C --> D[Functional Tests - Frontend]

    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
```

---

## 1. Pruebas unitarias (Unit Tests)

### ¿Qué se prueba?

Lógica aislada sin dependencias externas (base de datos, HTTP, filesystem). Se mockean las dependencias.

### Ubicación

```
api/src/modules/<module>/__tests__/<module>.<layer>.test.ts
```

### Qué testear

| Capa | Ejemplo | Se mockea |
|------|---------|-----------|
| **Services** | Validación de email duplicado, hash de password, cálculo de totales | Repository |
| **Helpers** | `buildPaginationMeta()`, `parsePaginationParams()` | Nada (funciones puras) |
| **Error classes** | Que `NotFoundError` tenga statusCode 404 | Nada |
| **Middlewares** | Que `authGuard` rechace tokens inválidos | jwt.verify |

### Qué NO testear

- Modelos Sequelize (ya están testeados por la librería)
- Rutas Express (se validan en integration tests)
- Schemas Zod triviales (a menos que tengan lógica custom)

### Ejemplo: Unit test de un service

```typescript
// api/src/modules/product/__tests__/product.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../product.service';
import { NotFoundError } from '../../../common/errors';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    };
    service = new ProductService(mockRepository);
  });

  describe('getById', () => {
    it('debe retornar el producto cuando existe', async () => {
      const mockProduct = { id: 'uuid-123', name: 'Coca Cola', salePrice: 3.50 };
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getById('uuid-123');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('debe lanzar NotFoundError cuando no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('no-existe')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('debe lanzar ConflictError si el código ya existe', async () => {
      mockRepository.findByCode.mockResolvedValue({ id: 'existing' });

      await expect(service.create({ code: '123', name: 'Test', salePrice: 5 }))
        .rejects.toThrow('El código de producto ya existe');
    });
  });
});
```

### Ejemplo: Unit test de un helper

```typescript
// api/src/common/helpers/__tests__/pagination.test.ts
import { describe, it, expect } from 'vitest';
import { parsePaginationParams, buildPaginationMeta } from '../pagination';

describe('parsePaginationParams', () => {
  it('debe usar valores por defecto cuando no se proporcionan', () => {
    const result = parsePaginationParams({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it('debe limitar el máximo a 100', () => {
    const result = parsePaginationParams({ limit: '500' });
    expect(result.limit).toBe(100);
  });

  it('debe forzar página mínima 1', () => {
    const result = parsePaginationParams({ page: '-5' });
    expect(result.page).toBe(1);
  });
});

describe('buildPaginationMeta', () => {
  it('debe calcular totalPages correctamente', () => {
    const meta = buildPaginationMeta(45, { page: 1, limit: 10 });
    expect(meta.totalPages).toBe(5);
  });
});
```

---

## 2. Pruebas de integración (Integration Tests)

### ¿Qué se prueba?

El flujo completo de un endpoint: request HTTP → middleware → controller → service → repository → BD real (de test).

### Ubicación

```
api/src/modules/<module>/__tests__/<module>.routes.test.ts
```

### Ejemplo: Integration test de autenticación

```typescript
// api/src/modules/auth/__tests__/auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { sequelize } from '../../../config/database';

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Seed: crear usuario admin de test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debe retornar access token con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@valhalla.com', password: 'Admin123!' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });

  it('debe retornar 401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@valhalla.com', password: 'wrong' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('debe retornar 400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '123456' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Ejemplo: Integration test de CRUD

```typescript
// api/src/modules/product/__tests__/product.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';

let token: string;
let productId: string;

describe('Products API', () => {
  beforeAll(async () => {
    // Login para obtener token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@valhalla.com', password: 'Admin123!' });
    token = loginRes.body.data.accessToken;
  });

  it('POST /products — debe crear producto', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Product', code: 'TEST001', salePrice: 10, stock: 50, categoryId: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    productId = res.body.data.id;
  });

  it('GET /products — debe listar con paginación', async () => {
    const res = await request(app)
      .get('/api/v1/products?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('GET /products/code/:code — debe encontrar por código', async () => {
    const res = await request(app)
      .get('/api/v1/products/code/TEST001')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.name).toBe('Test Product');
  });

  it('GET /products sin token — debe retornar 401', async () => {
    await request(app)
      .get('/api/v1/products')
      .expect(401);
  });
});
```

---

## 3. Pruebas funcionales — API (Postman)

### ¿Qué se prueba?

Flujos de negocio completos ejecutados manualmente o con el Collection Runner de Postman.

### Archivo

```
api/postman/Valhalla-Sales-API.postman_collection.json
```

### Flujos cubiertos

| # | Flujo | Validaciones |
|---|-------|--------------|
| 1 | Health Check | Servidor arriba, respuesta `{ success: true }` |
| 2 | Login admin | Obtener token, verificar estructura de respuesta |
| 3 | Catálogos públicos | Roles, tipos de documento, métodos de pago sin auth |
| 4 | CRUD usuarios | Crear vendedor, listar, actualizar, soft delete |
| 5 | CRUD empresas | Crear empresa con RUC, verificar unicidad |
| 6 | CRUD proveedores | Crear proveedor vinculado a empresa |
| 7 | CRUD clientes | Crear cliente, búsqueda por nombre |
| 8 | CRUD productos | Crear producto, buscar por código QR |
| 9 | Compra completa | Registrar compra → verificar stock aumenta |
| 10 | Venta completa | Registrar venta → verificar stock disminuye |
| 11 | Casos de error | 401 sin token, 400 datos inválidos, 404 no existe |

### Ejecución

1. Importar colección en Postman
2. Ejecutar en orden (los scripts de test guardan IDs automáticamente)
3. O usar **Collection Runner** para ejecutar toda la suite

### Variables automáticas

La colección usa scripts de test que extraen y guardan:
- `accessToken` → del login
- `userId`, `companyId`, `providerId`, `clientId`, `productId` → de las creaciones
- `purchaseId`, `saleId` → de las transacciones

---

## 4. Pruebas funcionales — Frontend (por implementar)

### Herramientas planificadas

| Herramienta | Propósito |
|-------------|-----------|
| Vitest + React Testing Library | Unit tests de componentes |
| Playwright o Cypress | E2E tests (navegador real) |

### Flujos a cubrir

| # | Flujo | Descripción |
|---|-------|-------------|
| 1 | Login | Llenar formulario → token guardado → redirect a dashboard |
| 2 | Dashboard | Verificar que métricas se rendericen |
| 3 | CRUD Productos | Crear producto desde UI → aparece en tabla |
| 4 | Escaneo QR | Simular scan → producto se agrega al detalle de venta |
| 5 | Venta completa | Abrir caja → agregar productos → confirmar venta |
| 6 | Cierre de caja | Cerrar → verificar resumen por método de pago |
| 7 | Auth flow | Token expira → refresh automático → sesión continúa |
| 8 | Roles | Vendedor no ve opciones de admin |

### Estructura planificada

```
web/src/__tests__/
├── components/          → Unit tests de componentes UI
├── hooks/               → Tests de hooks custom
├── services/            → Tests del API client
└── e2e/                 → Tests end-to-end (Playwright)
    ├── auth.spec.ts
    ├── products.spec.ts
    ├── sales.spec.ts
    └── cash-register.spec.ts
```

---

## Cobertura objetivo

| Capa | Cobertura mínima | Prioridad |
|------|-------------------|-----------|
| Services (backend) | 80% | Alta |
| Helpers/Utils | 90% | Alta |
| Controllers (integration) | 70% | Media |
| Middlewares | 70% | Media |
| Frontend components | 60% | Media |
| E2E flows | Flujos críticos cubiertos | Alta |

---

## Comandos

```bash
# Backend
cd api
pnpm run test           # Ejecutar todos los tests
pnpm run test:coverage  # Con reporte de cobertura
pnpm run test:watch     # Modo watch (desarrollo)

# Frontend (futuro)
cd web
pnpm run test           # Unit tests
pnpm run test:e2e       # E2E con Playwright
```

> Nota: Los scripts de test serán agregados al `package.json` cuando se configure Vitest en la Fase 10.
