# Plan detallado del ecommerce (tecnología)

Este documento detalla el modelo de datos, flujos, endpoints y automatizaciones acordadas
para el ecommerce de productos tecnológicos (teléfonos, notebooks, parlantes, etc.).

## 1) Modelo de datos (entidades y relaciones)

### 1.1 Entidades principales

**Producto**

- `Id` (PK)
- `Nombre`
- `Descripcion`
- `Marca`
- `CategoriaId`
- `Slug`
- `Activo`
- `CreatedAt`, `UpdatedAt`

**Categoria**

- `Id` (PK)
- `Nombre`
- `Slug`
- `Activo`

**VarianteProducto**

- `Id` (PK)
- `ProductoId` (FK)
- `Color`
- `Ram`
- `Almacenamiento`
- `Sku`
- `Precio`
- `StockActual`
- `StockReservado` (opcional si se prefiere cachear)
- `Activo`
- `CreatedAt`, `UpdatedAt`

**ImagenProducto**

- `Id` (PK)
- `ProductoId` (FK)
- `Url`
- `Orden`
- `AltText` (opcional)
- `PublicId` (opcional si se usa CDN)

**Promocion**

- `Id` (PK)
- `Nombre`
- `Descripcion`
- `Tipo` (Porcentaje)
- `Valor`
- `Codigo` (opcional, si aplica)
- `FechaInicio`, `FechaFin`
- `Activa`
- `CreatedAt`, `UpdatedAt`
- `Combinable` (false por defecto)

**PromocionProducto** (relación)

- `PromocionId` (FK)
- `ProductoId` (FK)

**Usuario**

- `Id` (PK)
- `Email`
- `PasswordHash`
- `Rol` (Admin | Empleado | Cliente)
- `Nombre`, `Apellido`
- `Activo`
- `CreatedAt`, `UpdatedAt`

**ClienteInvitado**

- `Id` (PK)
- `Email` (opcional)
- `Nombre` (opcional)
- `Telefono` (opcional)
- `CreatedAt`

**Pedido**

- `Id` (PK)
- `CodigoSeguimiento` (único, para cliente invitado)
- `UsuarioId` (nullable)
- `ClienteInvitadoId` (nullable)
- `Estado` (PendientePago, Pagado, EnPreparacion, Enviado, Entregado, Cancelado)
- `Total`
- `SubTotal`
- `Iva`
- `MetodoPago` (MercadoPago)
- `CreatedAt`, `UpdatedAt`

**PedidoDetalle**

- `Id` (PK)
- `PedidoId` (FK)
- `VarianteId` (FK)
- `Cantidad`
- `PrecioUnitario`
- `SubTotal`

**ReservaStock**

- `Id` (PK)
- `VarianteId` (FK)
- `PedidoId` (FK, nullable hasta confirmar checkout)
- `Cantidad`
- `ExpiraEn`
- `Estado` (Activa, Consumida, Expirada)
- `CreatedAt`

**Comprobante**

- `Id` (PK)
- `PedidoId` (FK)
- `UrlPdf`
- `CreatedAt`

**WebhookEvento** (opcional, auditoría de pagos)

- `Id` (PK)
- `Proveedor` (MercadoPago)
- `Evento`
- `Payload`
- `CreatedAt`

### 1.2 Relaciones clave

- Producto 1..n VarianteProducto
- Producto 1..n ImagenProducto
- Producto n..m Promocion (via PromocionProducto)
- Pedido 1..n PedidoDetalle
- VarianteProducto 1..n ReservaStock
- Pedido 0..1 Comprobante
- Usuario 1..n Pedido (cuando no es invitado)
- ClienteInvitado 1..n Pedido

---

## 2) Flujos críticos

### 2.1 Compra con pago (checkout estándar)

1. Cliente agrega variante al carrito.
2. Checkout inicia reserva de stock (15 min).
3. Se crea preferencia en Mercado Pago.
4. Cliente paga.
5. Webhook confirma pago.
6. Reserva pasa a `Consumida` y se descuenta stock definitivo.
7. Pedido cambia a `Pagado`.
8. Se genera comprobante PDF interno.
9. Se notifica por email y se habilita botón WhatsApp.

### 2.2 Compra abandonada

1. Se creó reserva de stock.
2. No se confirmó pago.
3. Reserva expira y se libera stock automáticamente.
4. Pedido pasa a `Cancelado` (o se elimina si es pre-pedido).

### 2.3 Seguimiento de pedido (invitado)

1. Cliente obtiene `CodigoSeguimiento`.
2. Consulta `/orders/{codigo}`.
3. Ve estado, items y botón de WhatsApp.

---

## 3) Estados del pedido

```
PendientePago -> Pagado -> EnPreparacion -> Enviado -> Entregado
PendientePago -> Cancelado
Pagado -> Cancelado (solo admin en casos excepcionales)
```

---

## 4) Endpoints API sugeridos

### 4.1 Catálogo

- `GET /products` (listado con filtros)
- `GET /products/{slug}` (detalle)
- `GET /products/{id}/variants` (variantes disponibles)
- `GET /promotions` (catálogo de promos activas)
- `GET /promotions/{id}` (detalle de promo)

### 4.2 Carrito y checkout

- `POST /cart` (agregar)
- `PUT /cart` (actualizar cantidades)
- `DELETE /cart/{itemId}`
- `POST /checkout` (crea reserva + preferencia MP)

### 4.3 Pedidos

- `POST /orders` (creación vinculada al checkout)
- `GET /orders/{codigo}` (seguimiento invitado)
- `GET /admin/orders` (panel admin)
- `PUT /admin/orders/{id}/status` (cambio de estado)

### 4.4 Pagos

- `POST /payments/mercadopago/create-preference`
- `POST /payments/mercadopago/webhook`

### 4.5 Auth/Usuarios

- `POST /auth/login`
- `POST /auth/register` (solo cliente)
- `GET /me`

### 4.6 Promociones (reglas MVP)

- Promos solo **por producto**.
- Solo **porcentajes**.
- **No combinables**.

---

## 5) Payloads de ejemplo

### 5.1 Crear checkout

**Request**

```json
{
  "items": [
    {
      "variantId": "VAR-123",
      "quantity": 1
    }
  ],
  "customer": {
    "isGuest": true,
    "email": "cliente@email.com",
    "name": "Juan Perez",
    "phone": "+54911..."
  }
}
```

**Response**

```json
{
  "orderId": "ORD-987",
  "trackingCode": "TRK-456",
  "paymentPreferenceId": "MP-123",
  "expiresAt": "2025-01-01T10:20:00Z"
}
```

### 5.2 Webhook Mercado Pago

**Request (simplificado)**

```json
{
  "type": "payment",
  "data": {
    "id": "PAY-123"
  }
}
```

**Response**

```json
{
  "status": "ok"
}
```

---

## 6) Reserva de stock (detalle)

### Reglas

- Crear reserva al iniciar checkout.
- Expiración automática si no se confirma pago (15 min).
- Confirmar reserva al recibir webhook de pago y convertir a consumo definitivo.

### Pseudoflujo

1. `POST /checkout` crea reservas por variante.
2. Se registra `ExpiraEn` (ahora + 15 min).
3. Webhook `payment.success` consume reserva.
4. Se descuenta `StockActual` y se marca reserva como `Consumida`.
5. Si expira, se marca como `Expirada` y se libera.
6. Registrar movimiento de stock tipo `SALE` al consumir reserva.

---

## 7) Comprobante PDF interno

- Se genera luego de confirmar el pago.
- Contenido mínimo:
  - Datos del pedido
  - Items y cantidades
  - Subtotal, IVA, total
  - Fecha y código de seguimiento

---

## 8) Automatizaciones e integraciones

### 8.1 WhatsApp

- Botón directo con texto prearmado:

```
https://wa.me/54XXXXXXXXXX?text=Hola,%20quiero%20coordinar%20mi%20pedido%20#TRK-456
```

### 8.2 Google Analytics (GA4)

- Eventos: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.

### 8.3 HubSpot

- Evento post-compra con email y monto total.

---

## 9) Almacenamiento de imágenes (recomendación)

### Opciones comunes

1. **Objeto en CDN (recomendado)**
   - Guardar archivos en un bucket (Cloudinary).
   - En la base de datos solo se guarda la `Url` y opcionalmente `PublicId`.
   - Ventajas: escalabilidad, caching, reducción de carga del servidor.

2. **Disco local (no recomendado para producción)**
   - Guardar en el servidor (ej: `/uploads`).
   - Requiere backup, y puede romperse en despliegues escalados.

### Recomendación para tu stack (Vercel + Render)

- **Cloudinary o S3 compatible**.
- Flujo:
  1. Backend genera un `signed upload` (URL segura).
  2. Frontend sube la imagen directo al proveedor.
  3. Se guarda la `Url` en `ImagenProducto`.

---

## 9.1 Datos mínimos de envío (MVP)

- Nombre y apellido
- DNI
- Teléfono
- Dirección
- Localidad
- Código postal

---

## 10) Seguridad y buenas prácticas

- JWT con refresh tokens.
- Validaciones server-side.
- Rate limiting en login y checkout.
- Webhooks firmados y verificados.
- Logs estructurados (Serilog + sink).
- Auditoría básica para cambios de stock y precio.

---

## 11) Siguientes pasos recomendados

1. Definir catálogo base y categorías.
2. Implementar reservas de stock.
3. Integrar Mercado Pago + webhook.
4. Implementar generación de PDF.
5. Panel admin/empleado.
6. Integración con HubSpot y GA4.

## 12) Stack frontend recomendado (profesional y actualizado)

Stack final (mezcla recomendada) para un ecommerce moderno/tecnológico/fluido (Frontend)
Base
Next.js (App Router) + TypeScript
Tailwind CSS
shadcn/ui + Radix UI (UI moderna y accesible)
TanStack Query (cache, sync, reintentos, paginación)

Estado
Zustand (carrito + sesión + UI state)
(TanStack Query para estado remoto; Zustand solo para local/global)

Formularios / Validación
React Hook Form + Zod (forms robustos y consistentes)
zodResolver

Imágenes
next/image + Cloudinary (optimizás por URL + sizes correctos)

Animación / Fluidez
Framer Motion (micro-interacciones, transiciones de páginas, drawers)
Lenis (smooth scroll opcional, en landing)
Tailwind animation + Radix para lo básico (sin sobrecargar)

Calidad / Observabilidad
Sentry (errores)
@vercel/analytics (métricas)
Playwright (E2E checkout/login)

SEO
Metadata API de Next (y si querés extra: next-seo, pero con App Router normalmente alcanza)

Organización recomendada (para que se sienta “pro”)
App Router con:
app/(store)/ catálogo público
app/(checkout)/ checkout
app/(account)/ cuenta
app/(admin)/ panel (si lo hacés en el mismo front)
src/components/ui/ (shadcn)
src/components/blocks/ (secciones: Hero, ProductGrid)
src/lib/ (api client, zod schemas, utils)
src/stores/ (zustand)
src/services/ (requests: products, cart, orders)
src/hooks/ (hooks propios)

---

## 13) Arquitectura recomendada (MVP y escalable)

### 13.1 Enfoque inicial (MVP)

- **Monolito modular** con límites claros por dominio (DDD ligero + Clean Architecture).
- Capas:
  - **API** (Controllers/Endpoints)
  - **Application** (casos de uso)
  - **Domain** (entidades, reglas)
  - **Infrastructure** (EF Core, integraciones)
- Beneficios: rápida entrega, bajo costo operativo, fácil de escalar horizontalmente.

### 13.2 Evolución (fase 2)

- Separar módulos críticos si crece la operación:
  - **Payments** y **Orders** como servicios aislables.
  - **Catálogo** con cache y búsqueda dedicada.
- Mantener contratos mediante eventos (outbox + colas).

---

## 14) Stack backend recomendado (alineado a tu .NET 8)

### 14.1 Stack base

- **.NET 8 + ASP.NET Core Web API**
- **EF Core 8** (PostgreSQL en prod, SQLite en dev)
- **JWT + Refresh Tokens**
- **Serilog** (logs estructurados)
- **HealthChecks UI**

### 14.2 Integraciones

- **Mercado Pago** (API + webhooks firmados)
- **MailKit** (emails transaccionales)
- **HubSpot** (post-compra)
- **GA4** (eventos frontend)

---

## 15) Estructura lógica y funcional (MVP)

### 15.1 Módulos

1. **Catálogo**
   - productos, categorías, variantes, imágenes
2. **Carrito**
   - agregar, actualizar, eliminar
3. **Checkout**
   - reserva stock + preferencia MP
4. **Pagos**
   - webhook MP + confirmación
5. **Pedidos**
   - estados + tracking
6. **Usuarios y roles**
   - admin / empleado / cliente
7. **Notificaciones**
   - email + WhatsApp
8. **Admin**
   - gestión catálogo, stock, pedidos
9. **Promociones**
   - catálogo de promos, reglas y vigencia

### 15.2 Permisos sugeridos

- **Admin**: todo.
- **Empleado**: catálogo + stock + pedidos (sin costos/ganancias ni reportes de ventas).
- **Cliente**: compras y tracking.

---

## 16) Buenas prácticas de seguridad y compliance

- Validaciones server-side + sanitización.
- Rate limiting en login y checkout.
- Webhooks firmados y verificados.
- Encriptar secretos con Secret Manager.
- Auditoría de cambios de stock y precios.
- Rotación de tokens y revocación.

---

## 17) Testing recomendado

- **Unit tests** (dominio y casos de uso).
- **Integration tests** (API + DB).
- **E2E** para checkout (Playwright).
- **Contract tests** básicos para webhooks.

---

## 18) DevOps y despliegue

- **CI/CD**: GitHub Actions
  - build + tests
  - lint + format
  - deploy automático (staging/prod)
- **Infra**:
  - Backend en Render (demo) y Hostinger + AlmaLinux (prod)
  - DB PostgreSQL administrado
  - Storage imágenes: Cloudinary/S3

---

## 19) Roadmap sugerido

### Fase 1 (MVP operativo)

1. Catálogo + variantes + stock
2. Checkout + reservas
3. Mercado Pago + webhook
4. Pedidos + tracking
5. Admin básico
6. Email + WhatsApp
7. GA4

### Fase 2 (escalado)

1. Integración logística (Andreani)
2. Facturación AFIP + PDF
3. Carrito abandonado (HubSpot)
4. Importación masiva
5. RMA / devoluciones
