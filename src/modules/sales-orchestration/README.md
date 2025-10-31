# Sales Orchestration Module

## Descripción

El módulo **Sales Orchestration** es la solución de orquestación diseñada para coordinar la creación de facturas con la validación de stock y productos en un sistema ERP basado en NestJS. Este módulo implementa los principios de **Domain-Driven Design (DDD)**, **Clean Architecture** y el patrón **SAGA** para transacciones distribuidas con compensación.

---

## Arquitectura General

### Patrón Arquitectónico: DDD + Clean Architecture + SAGA

```
┌─────────────────────────────────────────────────────────────┐
│                    SALES ORCHESTRATION                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DOMAIN LAYER (Core)                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • SaleAggregate (Aggregate Root)                    │   │
│  │ • Value Objects (SaleItem, SaleStatus)              │   │
│  │ • Domain Services (Stock/Price Validation)          │   │
│  │ • Domain Events (sale.*, stock.*, invoice.*)        │   │
│  │ • Domain Exceptions (Business Rules)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         APPLICATION LAYER (Orchestration)           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • ProcessSaleUseCase (SAGA Orchestrator)            │   │
│  │ • DTOs (Request/Response)                           │   │
│  │ • Transaction Management (TypeORM)                  │   │
│  │ • Compensation Logic (Rollback)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       INFRASTRUCTURE LAYER (Adapters)               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • REST Controller (HTTP Endpoints)                  │   │
│  │ • ProductAdapter → ProductService                   │   │
│  │ • InvoiceAdapter → InvoiceService                   │   │
│  │ • Event Emitter (Domain Events)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
┌─────────────────┐                  ┌─────────────────┐
│  PRODUCT MODULE │                  │  INVOICE MODULE │
└─────────────────┘                  └─────────────────┘
```

---

## Flujo de Procesamiento de Ventas (SAGA Pattern)

### Workflow Completo

```
1. VALIDACIÓN INICIAL
   ├─ Crear SaleAggregate
   ├─ Validar estructura de datos
   └─ Iniciar transacción DB

2. VALIDACIÓN DE PRODUCTOS
   ├─ Consultar productos por IDs
   ├─ Validar existencia (ProductNotFoundException)
   ├─ Validar estado activo (ProductInactiveException)
   └─ Actualizar items con info completa

3. VALIDACIÓN DE STOCK
   ├─ Verificar stock disponible por producto
   ├─ Validar tipo de producto (physical/digital/service)
   ├─ Aplicar regla allowNegativeStock
   └─ Lanzar InsufficientStockException si falla

4. VALIDACIÓN DE PRECIOS
   ├─ Comparar precio de venta vs catálogo
   ├─ Aplicar tolerancia o modo estricto
   └─ Lanzar PriceValidationException si falla

5. CREACIÓN DE FACTURA
   ├─ Preparar datos de invoice + items
   ├─ Invocar InvoiceService.createWithItems()
   ├─ Asociar invoiceId al SaleAggregate
   └─ Cambiar estado → invoice_created

6. DEDUCCIÓN DE STOCK
   ├─ Iterar por cada item físico
   ├─ Invocar ProductService.updateStock() (cantidad negativa)
   ├─ Crear StockMovement con reference a invoice
   ├─ Registrar movimientos ejecutados
   └─ Cambiar estado → stock_deducted

7. COMPLETAR VENTA
   ├─ Marcar SaleAggregate como completed
   ├─ Commit de transacción DB
   └─ Emitir eventos de dominio

8. RESPUESTA
   ├─ Retornar ProcessSaleResponseDto
   ├─ Incluir saleId, invoiceId, totales
   ├─ Listar movimientos de stock creados
   └─ Incluir warnings (ej: low stock)

╔═══════════════════════════════════════╗
║  SI FALLA CUALQUIER PASO → ROLLBACK   ║
╚═══════════════════════════════════════╝
```

### Estrategia de Compensación (Rollback)

```
COMPENSATION FLOW (Orden Inverso)

1. Rollback de transacción DB
   └─ Revertir cambios en BD

2. Revertir movimientos de stock
   ├─ Por cada stock deducido
   ├─ Crear movimiento inverso (+cantidad)
   └─ Reference: compensation:sale:{saleId}

3. Eliminar factura creada
   ├─ Invocar InvoiceRepository.delete()
   └─ Cascada elimina items

4. Actualizar SaleAggregate
   ├─ Estado → compensating
   ├─ Estado → compensated
   └─ Emitir eventos de compensación

5. Lanzar SaleProcessingException
   └─ Incluir mensaje y causa original
```

---

## Componentes Principales

### 1. SaleAggregate (Aggregate Root)

**Ubicación**: `domain/aggregates/sale.aggregate.ts`

**Responsabilidades**:
- Raíz de agregación que encapsula toda la lógica de una venta
- Mantiene invariantes de negocio
- Coordina items de venta (SaleItem[])
- Gestiona transiciones de estado válidas
- Emite eventos de dominio

**Propiedades**:
```typescript
- id: string
- companyId: string
- customerId: string
- items: SaleItem[]
- status: SaleStatus
- invoiceId?: string
- reservationId?: string
- metadata: Record<string, any>
- domainEvents: DomainEvent[]
```

**Métodos clave**:
- `markAsValidated()`: Marca validación exitosa
- `associateInvoice(invoiceId)`: Asocia factura creada
- `markStockDeducted()`: Confirma descuento de stock
- `complete()`: Finaliza venta exitosamente
- `markAsFailed(reason, error)`: Marca como fallida
- `startCompensation()`: Inicia rollback
- `calculateTotal()`: Calcula total de la venta

---

### 2. Value Objects

#### SaleItem
**Ubicación**: `domain/value-objects/sale-item.value-object.ts`

Representa un item inmutable de venta con validaciones:
- `productId`, `productName`, `productSku`
- `quantity`, `unitPrice`
- `discountPercentage`, `taxPercentage`

**Métodos de cálculo**:
- `calculateSubtotal()`
- `calculateDiscountAmount()`
- `calculateTaxAmount()`
- `calculateTotal()`

#### SaleStatus
**Ubicación**: `domain/value-objects/sale-status.value-object.ts`

Estados del ciclo de vida:
- `pending` → Iniciada
- `validated` → Validaciones pasadas
- `invoice_created` → Factura generada
- `stock_deducted` → Stock descontado
- `completed` → Completada ✓
- `failed` → Falló ✗
- `compensating` → En rollback
- `compensated` → Rollback completado

**Validación de transiciones**: `canTransitionTo(newStatus)`

---

### 3. Domain Services

#### StockValidationService
**Ubicación**: `domain/services/stock-validation.service.ts`

**Métodos**:
- `validateProductStock(product, quantity)`: Valida stock individual
- `validateProductStatus(product)`: Valida estado activo
- `validateProductExists(product, id)`: Valida existencia
- `validateStockForSaleItems(items, products)`: Validación masiva
- `aggregateStockRequirements(items)`: Agrupa cantidades por producto

#### PriceValidationService
**Ubicación**: `domain/services/price-validation.service.ts`

**Opciones de validación**:
```typescript
{
  strictMode: boolean           // Precio exacto
  allowPriceOverride: boolean   // Permitir override
  maxPriceVariancePercentage: number  // Tolerancia
}
```

**Métodos**:
- `validatePrice(saleItem, product, options)`
- `validatePricesForSaleItems(items, products)`
- `calculateExpectedTotal(items, products)`

---

### 4. Application Layer

#### ProcessSaleUseCase
**Ubicación**: `application/use-cases/process-sale.use-case.ts`

**Orquestador principal** que ejecuta el flujo SAGA completo.

**Dependencias inyectadas**:
- `DataSource` (TypeORM) → Transacciones
- `IProductService` → Consulta y actualización de stock
- `IInvoiceService` → Creación y eliminación de facturas
- `StockValidationService` → Validación de dominio
- `PriceValidationService` → Validación de dominio
- `EventEmitter2` → Emisión de eventos

**Método principal**: `execute(dto: ProcessSaleDto)`

---

### 5. Infrastructure Layer

#### SalesOrchestrationController
**Ubicación**: `infrastructure/controllers/sales-orchestration.controller.ts`

**Endpoint principal**:
```typescript
POST /sales/process

Request Body: ProcessSaleDto
Response: ProcessSaleResponseDto (201)
```

**Manejo de errores**:
- `400 Bad Request` → Validación de datos
- `404 Not Found` → Producto no existe
- `409 Conflict` → Stock insuficiente, reglas de negocio
- `500 Internal Error` → Fallo en procesamiento

#### Adapters

**ProductAdapter**: Traduce `ProductService` → `IProductService`
**InvoiceAdapter**: Traduce `InvoiceService` → `IInvoiceService`

**Patrón Hexagonal**: Aísla el dominio de la infraestructura externa.

---

## Domain Events

### Eventos Emitidos

| Evento | Momento | Payload |
|--------|---------|---------|
| `sale.initiated` | Al crear SaleAggregate | companyId, customerId, items |
| `sale.validated` | Después de validaciones | companyId |
| `sale.invoice.created` | Factura asociada | invoiceId |
| `sale.stock.deducted` | Stock descontado | items (productId, quantity) |
| `sale.completed` | Venta completada | invoiceId, total |
| `sale.failed` | Venta falló | reason, currentStatus |
| `sale.compensation.started` | Inicia rollback | invoiceId |
| `sale.compensation.completed` | Rollback completo | - |

### Event Handlers (Opcional)

Puedes suscribirte a estos eventos para:
- Enviar notificaciones (email, SMS)
- Registrar métricas y analytics
- Actualizar dashboards en tiempo real
- Integrar con sistemas externos

---

## Excepciones de Dominio

Todas extienden `SaleDomainException`:

- `InsufficientStockException`: Stock insuficiente
- `ProductNotFoundException`: Producto no existe
- `ProductInactiveException`: Producto inactivo
- `PriceValidationException`: Precio no coincide
- `InvalidSaleStateException`: Transición de estado inválida
- `StockReservationException`: Error en reserva
- `SaleProcessingException`: Error general de procesamiento

---

## DTOs

### ProcessSaleDto (Request)

```typescript
{
  companyId: string;          // UUID
  customerId: string;         // UUID
  items: ProcessSaleItemDto[]; // Array de items
  invoiceType?: string;       // 'sale' | 'proforma' | ...
  issueDate?: string;         // Fecha de emisión
  dueDate?: string;           // Fecha de vencimiento
  notes?: string;             // Notas adicionales
  strictPriceValidation?: boolean;  // Default: true
  skipStockValidation?: boolean;    // Default: false (¡Usar con precaución!)
}
```

### ProcessSaleResponseDto (Response)

```typescript
{
  saleId: string;
  invoiceId: string;
  status: SaleStatusEnum;
  total: number;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  stockMovements: Array<{
    productId: string;
    productName: string;
    quantity: number;
    movementType: 'out';
  }>;
  processedAt: Date;
  warnings?: string[];  // Ej: "Product X below min stock"
}
```

---

## Integración con App Module

### Paso 1: Agregar al app.module.ts

```typescript
import { SalesOrchestrationModule } from './modules/sales-orchestration/sales-orchestration.module';

@Module({
  imports: [
    // ... otros módulos
    SalesOrchestrationModule,
  ],
})
export class AppModule {}
```

### Paso 2: Verificar exportaciones

Asegúrate de que:
- `ProductsModule` exporta `ProductService`
- `InvoicesModule` exporta `InvoiceService` e `InvoiceRepositoryAbstract`

---

## Ejemplo de Uso

### Request HTTP

```bash
POST http://localhost:3000/sales/process
Content-Type: application/json

{
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "customerId": "987fcdeb-51a2-43b1-9876-543210fedcba",
  "invoiceType": "sale",
  "issueDate": "2025-10-31",
  "dueDate": "2025-11-30",
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 5,
      "unitPrice": 99.99,
      "discountPercentage": 10,
      "taxPercentage": 19
    },
    {
      "productId": "prod-uuid-2",
      "quantity": 2,
      "unitPrice": 49.99,
      "taxPercentage": 19
    }
  ]
}
```

### Response Exitosa (201)

```json
{
  "saleId": "sale_1698768000000_xyz123",
  "invoiceId": "inv-uuid-abc",
  "status": "completed",
  "total": 537.43,
  "subtotal": 549.93,
  "totalDiscount": 49.995,
  "totalTax": 94.989,
  "stockMovements": [
    {
      "productId": "prod-uuid-1",
      "productName": "Producto A",
      "quantity": 5,
      "movementType": "out",
      "movementId": "mov-uuid-1"
    },
    {
      "productId": "prod-uuid-2",
      "productName": "Producto B",
      "quantity": 2,
      "movementType": "out",
      "movementId": "mov-uuid-2"
    }
  ],
  "processedAt": "2025-10-31T15:30:00.000Z",
  "warnings": [
    "Product 'Producto A' is below minimum stock (current: 15, min: 20)"
  ]
}
```

### Response de Error (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Insufficient stock for product \"Producto A\". Requested: 5, Available: 3",
  "error": "InsufficientStockException"
}
```

---

## Validaciones Implementadas

### 1. Validación de Stock

- ✅ Productos físicos (`physical`) requieren stock disponible
- ✅ Productos digitales (`digital`) y servicios (`service`) no requieren stock
- ✅ Respeta `allowNegativeStock` del producto
- ✅ Agregación de cantidades si el mismo producto aparece múltiples veces

### 2. Validación de Productos

- ✅ Existencia del producto
- ✅ Estado `active` (no inactivo o descontinuado)
- ✅ Precio actual del catálogo

### 3. Validación de Precios

- ✅ Modo estricto: precio exacto
- ✅ Modo flexible: tolerancia de variación
- ✅ Opción de permitir override manual

### 4. Transaccionalidad

- ✅ Transacción DB para todo el proceso
- ✅ Rollback automático en caso de error
- ✅ Compensación de stock si falla después de deducción
- ✅ Eliminación de factura si falla después de creación

---

## Mejores Prácticas

### 1. Consistencia Transaccional

El módulo garantiza **ACID completo** para:
- Creación de factura + items
- Descuento de stock + movimientos
- Estado del SaleAggregate

### 2. Separación de Responsabilidades

- **Domain Layer**: Sin dependencias de frameworks
- **Application Layer**: Orquestación pura
- **Infrastructure Layer**: Adaptadores y controllers

### 3. Eventos de Dominio

Usa eventos para:
- Auditoría completa del proceso
- Integración con otros sistemas
- Análisis y reportes

### 4. Manejo de Errores

- Excepciones de dominio semánticas
- Mensajes claros para el usuario
- Logs detallados para debugging

---

## Testing

### Unit Tests Recomendados

```typescript
// Domain Layer
- SaleAggregate.spec.ts
- SaleItem.spec.ts
- SaleStatus.spec.ts
- StockValidationService.spec.ts
- PriceValidationService.spec.ts

// Application Layer
- ProcessSaleUseCase.spec.ts

// Infrastructure
- ProductAdapter.spec.ts
- InvoiceAdapter.spec.ts
```

### Integration Tests

```typescript
- POST /sales/process (happy path)
- POST /sales/process (stock insuficiente)
- POST /sales/process (producto no existe)
- POST /sales/process (precio inválido)
- Compensación automática
```

---

## Extensiones Futuras

### 1. Reserva de Stock (Stock Reservation)

Implementar una entidad `StockReservation` para:
- Reservar stock al crear un draft de invoice
- Liberar stock si se cancela
- Confirmar reserva al completar venta

### 2. Eventos Asincrónicos (Message Queue)

Migrar de `EventEmitter2` a un broker de mensajes:
- RabbitMQ, Kafka, o Redis Pub/Sub
- Garantizar entrega de eventos
- Procesamiento asíncrono

### 3. Saga Distribuido (Choreography)

En lugar de orquestación centralizada:
- Cada módulo emite eventos
- Otros módulos reaccionan de forma autónoma
- Mayor desacoplamiento

### 4. Event Sourcing

Almacenar todos los eventos de dominio:
- Reconstruir estado del SaleAggregate
- Auditoría completa
- Time travel debugging

---

## Troubleshooting

### Problema: "Product not found"

**Causa**: El producto no existe en la BD
**Solución**: Verificar que el `productId` sea correcto

### Problema: "Insufficient stock"

**Causa**: Stock disponible < cantidad solicitada
**Solución**:
- Reducir cantidad
- Habilitar `allowNegativeStock` en el producto (si aplica)
- Usar `skipStockValidation: true` (solo en casos especiales)

### Problema: "Price validation failed"

**Causa**: El precio de venta no coincide con el catálogo
**Solución**:
- Actualizar el precio del producto
- Usar `strictPriceValidation: false` para permitir variaciones

### Problema: "Transaction rollback"

**Causa**: Error durante el proceso (después de crear invoice o deducir stock)
**Solución**:
- Revisar logs para identificar el paso que falló
- El sistema automáticamente revierte los cambios
- Verificar que las compensaciones se ejecuten correctamente

---

## Conclusión

El **Sales Orchestration Module** es una solución robusta y escalable que:

✅ Garantiza consistencia transaccional entre Invoice y Product
✅ Sigue principios DDD y Clean Architecture
✅ Implementa compensación automática (SAGA pattern)
✅ Mantiene el dominio libre de dependencias de infraestructura
✅ Emite eventos para extensibilidad
✅ Maneja errores de forma semántica y clara

**¡Listo para producción!** 🚀
