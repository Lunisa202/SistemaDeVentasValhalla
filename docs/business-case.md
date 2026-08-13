# Business Case — Sistema de Ventas Valhalla

## Descripción general

Sistema de punto de venta (POS) diseñado para pequeñas y medianas tiendas minoristas. Permite gestionar el ciclo completo de operación de una tienda: desde la compra de mercadería a proveedores, el control de inventario, la venta al público, hasta el cierre de caja diario con arqueo financiero.

## Problema que resuelve

El dueño de una tienda necesita:

- Saber qué productos tiene en stock y cuándo reabastecer
- Registrar ventas de forma rápida (con lector QR o búsqueda manual)
- Controlar cuánto dinero entra y sale por cada método de pago
- Ver métricas de su negocio (producto estrella, ganancias del mes, rendimiento por vendedor)
- Delegar la atención al cliente a vendedores sin darles acceso a funciones administrativas

## Usuarios del sistema

| Rol | Qué puede hacer |
|-----|-----------------|
| **Administrador** | Todo: gestionar usuarios, productos, proveedores, compras, ver reportes, configurar caja |
| **Vendedor** | Registrar ventas, consultar productos, gestionar clientes, abrir/cerrar caja |

## Funcionalidades principales

### Gestión de inventario
- Registro de productos con código de barras/QR
- Control de stock automático (sube con compras, baja con ventas)
- Categorías de productos
- Alertas de stock bajo

### Compras a proveedores
- Registro de proveedores y empresas
- Registro de compras con detalle (producto, cantidad, precio unitario)
- Actualización automática de stock al registrar compra
- Historial de compras por proveedor

### Ventas
- Punto de venta con escaneo de código QR/barcode
- Múltiples métodos de pago (efectivo, Yape, Plin, tarjetas)
- Ventas presenciales y online
- Comprobantes: boleta, factura, ticket
- Ventas con o sin cliente registrado

### Caja registradora
- Apertura de caja con monto inicial
- Todas las ventas se vinculan a la caja activa
- Cierre manual (el dueño decide cuándo)
- Arqueo: comparación entre monto esperado (calculado) y monto real (contado)
- Desglose por método de pago
- Historial de cajas con sobrantes/faltantes

### Dashboard y analytics
- Resumen del día (ventas, transacciones, ticket promedio)
- Producto más vendido de la semana/mes
- Ganancias vs gastos (compras)
- Ventas por categoría
- Ventas por método de pago
- Rendimiento por vendedor
- Alertas de stock bajo

### Autenticación y seguridad
- Login con email/contraseña
- Tokens JWT con refresh automático
- Control de acceso por roles
- Rate limiting contra ataques de fuerza bruta

---

## Contexto técnico

- **Backend**: API REST independiente, deployable en Docker
- **Frontend**: Aplicación web (dashboard) consumiendo la API
- **Base de datos**: PostgreSQL en la nube (Supabase)
- **Escalabilidad**: La API puede ser consumida por una futura app móvil sin cambios

---

## Estado actual

> Esta sección se actualizará al finalizar el proyecto.

| Módulo | Estado |
|--------|--------|
| API — Auth | ✅ Implementado |
| API — Catálogos | ✅ Implementado |
| API — Usuarios | ✅ Implementado |
| API — Empresas | ✅ Implementado |
| API — Proveedores | ✅ Implementado |
| API — Clientes | ✅ Implementado |
| API — Productos | ✅ Implementado |
| API — Compras | ✅ Implementado |
| API — Ventas | ✅ Implementado |
| API — Caja registradora | ⏳ Pendiente |
| API — Analytics | ⏳ Pendiente |
| API — Swagger docs | ⏳ Pendiente |
| API — Docker | ⏳ Pendiente |
| Frontend — Login | ⏳ Pendiente |
| Frontend — Dashboard | ⏳ Pendiente |
| Frontend — Módulos CRUD | ⏳ Pendiente |
| Frontend — POS con QR | ⏳ Pendiente |
| Frontend — Caja | ⏳ Pendiente |
| Frontend — Analytics | ⏳ Pendiente |
