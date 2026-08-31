# Analytics / Dashboard

Endpoints de reportes agregados para el dashboard. Todos son de solo lectura (SELECT con agregaciones) y requieren rol **admin**.

## Diseño

- Los reportes usan **SQL crudo parametrizado** (vía `sequelize.query` con `replacements`), no el ORM. Las agregaciones (GROUP BY, SUM, COUNT, date_trunc) son más claras y directas en SQL. Los valores siempre van parametrizados para evitar SQL injection.
- Todos los endpoints con rango temporal aceptan `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Si se omiten, aplican un rango por defecto (últimos 30 días).
- Los montos se redondean a 2 decimales con `roundTo2`.

## Endpoints

### GET /analytics/overview
Totales de ventas y número de transacciones para tres ventanas: hoy, esta semana, este mes (usando `date_trunc` sobre `NOW()`).

```json
{ "success": true, "data": {
  "today": { "totalSales": 320.00, "transactionCount": 12 },
  "week":  { "totalSales": 1450.50, "transactionCount": 48 },
  "month": { "totalSales": 6200.00, "transactionCount": 210 }
} }
```

### GET /analytics/sales-by-period
Serie temporal de ventas agrupada por `day` | `week` | `month` (param `groupBy`, default `day`) dentro del rango.

### GET /analytics/top-products
Top-N productos por unidades vendidas (param `limit`, default 10, máx 50). Join `sale_detail → sale → product`.

### GET /analytics/sales-by-payment-method
Ventas agrupadas por método de pago. Usa LEFT JOIN desde `payment_method` para incluir métodos sin ventas (total 0).

### GET /analytics/sales-by-category
Ventas y unidades agrupadas por categoría de producto.

### GET /analytics/profit-loss
Compara ingresos por ventas vs gasto en compras dentro del rango (vista de **flujo de caja** del período).

```json
{ "success": true, "data": {
  "range": { "from": "2026-08-01", "to": "2026-08-28" },
  "salesTotal": 6200.00, "purchasesTotal": 3800.00, "balance": 2400.00
} }
```

> **Limitación conocida:** `profit-loss` NO calcula el margen real por producto (ingreso de venta menos costo del producto vendido). Eso requeriría costo promedio ponderado por producto, que no se modela actualmente (el producto solo tiene `sale_price`, el costo se conoce en `purchase_detail.unit_price`). El endpoint responde a la pregunta "¿cuánto entró vs cuánto salió este período?", no "¿cuál fue el margen de ganancia?". Para margen real se agregaría un campo `cost_price` o un cálculo de costo promedio en una fase futura.

### GET /analytics/low-stock
Productos activos con `stock <= threshold` (param `threshold`, default 10), ordenados por stock ascendente.

### GET /analytics/sales-by-seller
Total vendido y número de transacciones por vendedor dentro del rango. Es la fuente de verdad para el rendimiento individual (la caja es compartida, ver `docs` de caja).
