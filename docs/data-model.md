# Modelo de Datos

## Diagrama Entidad-Relación

```mermaid
erDiagram
    %% ─── Tablas de referencia ───────────────────────────
    role {
        int id PK
        varchar name UK
        varchar display_name
    }

    document_type {
        int id PK
        varchar name UK
        varchar display_name
    }

    payment_method {
        int id PK
        varchar name UK
        varchar display_name
    }

    product_category {
        int id PK
        varchar name
        varchar description
        timestamp created_at
        timestamp updated_at
    }

    %% ─── Entidades principales ──────────────────────────
    company {
        uuid id PK
        varchar name
        varchar tax_id UK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    user {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar identity_document
        varchar phone
        varchar email UK
        varchar password
        int role_id FK
        int document_type_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    provider {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar identity_document
        varchar email
        varchar phone
        int document_type_id FK
        uuid company_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    client {
        uuid id PK
        varchar first_name
        varchar last_name
        varchar phone
        varchar email
        int document_type_id FK
        varchar identity_document
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    product {
        uuid id PK
        varchar name
        varchar code UK
        decimal sale_price
        int stock
        int category_id FK
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    %% ─── Caja registradora ─────────────────────────────
    cash_register {
        int id PK
        uuid opened_by FK
        uuid closed_by FK
        decimal opening_amount
        decimal expected_amount
        decimal actual_amount
        decimal difference
        varchar status
        text notes
        timestamp opened_at
        timestamp closed_at
    }

    cash_register_summary {
        int id PK
        int cash_register_id FK
        int payment_method_id FK
        decimal total_sales
        int transaction_count
    }

    %% ─── Compras (stock entrante) ──────────────────────
    purchase {
        int id PK
        uuid user_id FK
        uuid provider_id FK
        voucher_type voucher_type
        decimal total
        timestamp purchased_at
        timestamp created_at
    }

    purchase_detail {
        int id PK
        int purchase_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal subtotal "GENERATED"
    }

    %% ─── Ventas (stock saliente) ───────────────────────
    sale {
        int id PK
        uuid client_id FK
        uuid seller_id FK
        int cash_register_id FK
        voucher_type voucher_type
        varchar voucher_code
        sale_channel sale_channel
        int payment_method_id FK
        decimal total
        timestamp sold_at
        timestamp created_at
    }

    sale_detail {
        int id PK
        int sale_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
        decimal subtotal "GENERATED"
    }

    %% ─── Auth ──────────────────────────────────────────
    refresh_token {
        uuid id PK
        uuid user_id FK
        varchar token UK
        timestamp expires_at
        timestamp created_at
        timestamp revoked_at
    }

    %% ─── Relaciones ────────────────────────────────────
    role ||--o{ user : "tiene"
    document_type ||--o{ user : "tiene"
    document_type ||--o{ provider : "tiene"
    document_type ||--o{ client : "tiene"
    company ||--o{ provider : "emplea"
    product_category ||--o{ product : "clasifica"
    payment_method ||--o{ sale : "paga"
    payment_method ||--o{ cash_register_summary : "agrupa"

    user ||--o{ purchase : "registra"
    user ||--o{ sale : "vende"
    user ||--o{ cash_register : "abre"
    user ||--o{ refresh_token : "posee"

    provider ||--o{ purchase : "suministra"
    client ||--o{ sale : "compra"

    cash_register ||--o{ sale : "contiene"
    cash_register ||--o{ cash_register_summary : "resume"

    purchase ||--o{ purchase_detail : "detalla"
    sale ||--o{ sale_detail : "detalla"

    product ||--o{ purchase_detail : "abastece"
    product ||--o{ sale_detail : "vende"
```

---

## Tipos ENUM (PostgreSQL)

| Enum | Valores | Display (español) |
|------|---------|-------------------|
| `voucher_type` | `RECEIPT`, `INVOICE`, `TICKET` | Boleta, Factura, Ticket |
| `sale_channel` | `IN_STORE`, `ONLINE` | Presencial, Online |

---

## Tablas de referencia

### role

| id | name | display_name |
|----|------|--------------|
| 1 | admin | Administrador |
| 2 | seller | Vendedor |

### document_type

| id | name | display_name |
|----|------|--------------|
| 1 | DNI | DNI |
| 2 | PASSPORT | Pasaporte |
| 3 | FOREIGNER_ID | Carnet de Extranjería |
| 4 | OTHER | Otro |

### payment_method

| id | name | display_name |
|----|------|--------------|
| 1 | cash | Efectivo |
| 2 | yape | Yape |
| 3 | plin | Plin |
| 4 | debit_card | Tarjeta débito |
| 5 | credit_card | Tarjeta de crédito |

---

## Descripción de las entidades

### Catálogos

Tablas de datos que rara vez cambian. Cada una tiene `name` (código interno en inglés) y `display_name` (etiqueta en español para la UI).

### company

Empresas proveedoras identificadas por RUC (`tax_id` UNIQUE). Tiene muchos proveedores.

### user

Operadores del sistema. Se autentican con email/password. Su rol determina los permisos de acceso. Soft delete con `is_active`.

### provider

Personas de contacto en empresas proveedoras. Vinculados a una `company` y a un `document_type`.

### client

Clientes que compran productos. Opcionales en ventas (ventas anónimas permitidas). Requeridos para facturas.

### product

Artículos en inventario. El campo `code` es el valor del código de barras/QR (UNIQUE). Stock controlado por compras (+) y ventas (-).

### cash_register

Sesión de trabajo (apertura → ventas → cierre). Solo puede haber UNA abierta a la vez. Al cerrar se genera un `cash_register_summary` por método de pago.

### purchase / purchase_detail

Compras a proveedores. Cada compra tiene líneas de detalle con `subtotal` calculado automáticamente. Al crear, el stock del producto AUMENTA.

### sale / sale_detail

Ventas a clientes. Vinculadas a la caja abierta. `subtotal` generado automáticamente. Al crear, el stock DISMINUYE. Se valida que haya stock suficiente.

### refresh_token

Tokens de refresco para la autenticación JWT. Multi-dispositivo. Se revocan al hacer logout.

---

## Reglas de integridad

| Regla | Implementación |
|-------|----------------|
| No borrar productos con ventas | `ON DELETE RESTRICT` en FK de `sale_detail` |
| No borrar proveedores con compras | `ON DELETE RESTRICT` en FK de `purchase` |
| Precio siempre positivo | `CHECK (sale_price > 0)` en `product` |
| Stock nunca negativo | `CHECK (stock >= 0)` en `product` |
| Cantidad siempre positiva | `CHECK (quantity > 0)` en detalles |
| Subtotal calculado automático | `GENERATED ALWAYS AS (quantity * unit_price) STORED` |
| `updated_at` automático | Trigger PostgreSQL `update_updated_at_column()` |
| Email único por usuario | `UNIQUE` constraint en `user.email` |
| RUC único por empresa | `UNIQUE` constraint en `company.tax_id` |
| Código único por producto | `UNIQUE` constraint en `product.code` |
| Detalles se eliminan con su padre | `ON DELETE CASCADE` en detalles → purchase/sale |

---

## Migraciones

Las migraciones se encuentran en `api/src/database/migrations/` y se ejecutan con:

```bash
cd api
pnpm run migrate        # Aplicar pendientes
pnpm run migrate down   # Revertir última
pnpm run migrate pending # Ver cuáles faltan
```

Orden de ejecución:

1. ENUMs (`voucher_type`, `sale_channel`)
2. Tablas de referencia
3. `company`
4. `user`
5. `provider`
6. `client`
7. `product`
8. `cash_register` + `cash_register_summary`
9. `purchase` + `purchase_detail`
10. `sale` + `sale_detail`
11. `refresh_token`
12. Trigger `updated_at`
