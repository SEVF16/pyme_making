import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Entities
import { Invoice } from './domain/entities/invoice.entity';
import { InvoiceItem } from './domain/entities/invoice-item.entity';

// Interfaces
import { InvoiceRepositoryAbstract } from './domain/interfaces/invoice-repository.interface';

// Infrastructure
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';
import { InvoiceController } from './infrastructure/controllers/invoices.controller';
import { InvoiceExceptionFilter } from './infrastructure/filters/invoice-exception.filter';
import { InvoiceOwnershipGuard } from './infrastructure/guards/invoice-ownership.guard';
import { InvoiceResponseInterceptor } from './infrastructure/interceptors/invoice-response.interceptor';
import { InvoiceValidationMiddleware } from './infrastructure/middleware/invoice-validation.middleware';
import { InvoiceValidationPipe } from './infrastructure/pipes/invoice-validation.pipe';
import { InvoiceSchedulerService } from './infrastructure/schedulers/invoice-scheduler.service';
import { InvoiceEventHandler } from './infrastructure/events/invoice-event.handler';

// Use Cases
import { CreateInvoiceUseCase } from './application/use-cases/create-invoice.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';
import { UpdateInvoiceUseCase } from './application/use-cases/update-invoice.use-case';

import { AddInvoiceItemUseCase } from './application/use-cases/add-invoice-item.use-case';
import { UpdateInvoiceItemUseCase } from './application/use-cases/update-invoice-item.use-case';
import { RemoveInvoiceItemUseCase } from './application/use-cases/remove-invoice-item.use-case';
import { CalculateInvoiceTotalsUseCase } from './application/use-cases/calculate-invoice-totals.use-case';
import { GenerateInvoicePdfUseCase } from './application/use-cases/generate-invoice-pdf.use-case';
import { SendInvoiceEmailUseCase } from './application/use-cases/send-invoice-email.use-case';
import { DuplicateInvoiceUseCase } from './application/use-cases/duplicate-invoice.use-case';

// Services
import { InvoiceService } from './application/services/invoices.service';
import { InvoiceDomainService } from './domain/services/invoice-domain.service';
import { InvoiceCalculationService } from './domain/services/invoice-calculation.service';
import { InvoiceNumberService } from './domain/services/invoice-number.service';
import { PdfGeneratorService } from './domain/services/pdf-generator.service';
import { InvoiceStatusService } from './domain/services/invoice-status.service';
import { InvoiceFactory } from './domain/factories/invoice.factory';

// Import dependencies
import { CompaniesModule } from '../companies/companies.module';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../product/product.module';
import { GetInvoicesUseCase } from './application/use-cases/get-invoices.use-case';


@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CompaniesModule,
    CustomersModule,
    ProductsModule,
  ],
  controllers: [InvoiceController],
  providers: [
    // Application Services
    InvoiceService,
    
    // Domain Services
    InvoiceDomainService,
    InvoiceCalculationService,
    InvoiceNumberService,
    PdfGeneratorService,
    InvoiceStatusService,
    InvoiceFactory,
    
    // Use Cases
    CreateInvoiceUseCase,
    GetInvoiceUseCase,
    UpdateInvoiceUseCase,
    GetInvoicesUseCase,
    AddInvoiceItemUseCase,
    UpdateInvoiceItemUseCase,
    RemoveInvoiceItemUseCase,
    CalculateInvoiceTotalsUseCase,
    GenerateInvoicePdfUseCase,
    SendInvoiceEmailUseCase,
    DuplicateInvoiceUseCase,
    
    // Repository
    {
      provide: InvoiceRepositoryAbstract,
      useClass: InvoiceRepository,
    },

    // Guards
    InvoiceOwnershipGuard,

    // Infrastructure Services
    InvoiceSchedulerService,
    InvoiceEventHandler,

    // Global Providers
    // {
    //   provide: APP_FILTER,
    //   useClass: InvoiceExceptionFilter,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: InvoiceResponseInterceptor,
    // },
    // {
    //   provide: APP_PIPE,
    //   useClass: InvoiceValidationPipe,
    // },
  ],
  exports: [
    InvoiceService,
    InvoiceDomainService,
    InvoiceRepositoryAbstract,
    InvoiceOwnershipGuard,
    InvoiceCalculationService,
    InvoiceNumberService,
    InvoiceFactory,
  ],
})
export class InvoicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InvoiceValidationMiddleware)
      .forRoutes('invoices');
  }
} 