/**
 * SalesOrchestrationModule
 *
 * This module orchestrates sales operations across Invoice and Product modules.
 * It implements the SAGA pattern for distributed transactions with compensation.
 *
 * Architecture:
 * - Domain Layer: Aggregates, Entities, Value Objects, Domain Services
 * - Application Layer: Use Cases, DTOs
 * - Infrastructure Layer: Controllers, Repositories, Adapters
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain Services
import { StockValidationService } from './domain/services/stock-validation.service';
import { PriceValidationService } from './domain/services/price-validation.service';

// Application Layer
import { ProcessSaleUseCase } from './application/use-cases/process-sale.use-case';

// Infrastructure Layer
import { SalesOrchestrationController } from './infrastructure/controllers/sales-orchestration.controller';
import { ProductAdapter } from './infrastructure/adapters/product.adapter';
import { InvoiceAdapter } from './infrastructure/adapters/invoice.adapter';

// External Modules (to be imported)
import { ProductsModule } from '../product/product.module';
import { InvoicesModule } from '../invoices/invoices.module';

// Import services from external modules
import { ProductService } from '../product/application/services/product.service';
import { InvoiceService } from '../invoices/application/services/invoices.service';
import { InvoiceRepositoryAbstract } from '../invoices/domain/interfaces/invoice-repository.interface';

@Module({
  imports: [
    // Event system for domain events
    EventEmitterModule.forRoot(),

    // External modules (they export their services)
    ProductsModule,
    InvoicesModule,
  ],
  controllers: [SalesOrchestrationController],
  providers: [
    // Domain Services (pure domain logic, no dependencies)
    StockValidationService,
    PriceValidationService,

    // Application Services (orchestration)
    ProcessSaleUseCase,

    // Adapters (infrastructure to domain translation)
    {
      provide: 'IProductService',
      useFactory: (productService: ProductService) => {
        return new ProductAdapter(productService);
      },
      inject: [ProductService],
    },
    {
      provide: 'IInvoiceService',
      useFactory: (invoiceService: InvoiceService, invoiceRepository: InvoiceRepositoryAbstract) => {
        return new InvoiceAdapter(invoiceService, invoiceRepository);
      },
      inject: [InvoiceService, InvoiceRepositoryAbstract],
    }
  ],
  exports: [
    // Export domain services if other modules need them
    StockValidationService,
    PriceValidationService,
    ProcessSaleUseCase,
  ],
})
export class SalesOrchestrationModule {}
