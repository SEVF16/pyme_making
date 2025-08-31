// src/modules/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Customer } from './domain/entities/customer.entity';

// Interfaces
import { CustomerRepositoryAbstract } from './domain/interfaces/customer-repository.interface';

// Infrastructure
import { CustomerRepository } from './infrastructure/repositories/customer.repository';

// Use Cases
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { GetCustomersByCompanyUseCase } from './application/use-cases/get-customers-by-company.use-case';

// Services
import { CustomerService } from './application/services/customers.service';
import { CustomerDomainService } from './domain/services/customer-domain.service';

// Controllers
import { CustomerController } from './infrastructure/controllers/customers.controller';

// Filters
import { CustomerExceptionFilter } from './infrastructure/filters/customer-exception.filter';

// Guards
import { CustomerOwnershipGuard } from './infrastructure/guards/customer-ownership.guard';

// Interceptors
import { CustomerResponseInterceptor } from './infrastructure/interceptors/customer-response.interceptor';

// Pipes
import { CustomerValidationPipe } from './infrastructure/pipes/customer-validation.pipe';

// Middlewares


// Import Companies Module for dependencies
import { CompaniesModule } from '../companies/companies.module';

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CustomerValidationMiddleware } from './infrastructure/middleware/customer-validation.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CompaniesModule, // Import companies module for repository dependency
  ],
  controllers: [CustomerController],
  providers: [
    // Services
    CustomerService,
    CustomerDomainService,
    
    // Use Cases
    CreateCustomerUseCase,
    GetCustomerUseCase,
    UpdateCustomerUseCase,
    GetCustomersByCompanyUseCase,
    
    // Repository
    {
      provide: CustomerRepositoryAbstract,
      useClass: CustomerRepository,
    },

    // Guards
    CustomerOwnershipGuard,

    // Global Providers
    // {
    //   provide: APP_FILTER,
    //   useClass: CustomerExceptionFilter,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CustomerResponseInterceptor,
    // },
    // {
    //   provide: APP_PIPE,
    //   useClass: CustomerValidationPipe,
    // },
  ],
  exports: [
    CustomerService,
    CustomerDomainService,
    CustomerRepositoryAbstract,
    CustomerOwnershipGuard,
  ],
})
export class CustomersModule {
  configure(consumer: any) {
    consumer
      .apply(CustomerValidationMiddleware)
      .forRoutes('customers');
  }
}