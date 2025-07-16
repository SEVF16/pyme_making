// src/modules/companies/companies.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Company } from './domain/entities/company.entity';
import { CompanyConfiguration } from './domain/entities/company-configuration.entity';

import {CompanyRepositoryAbstract} from './domain/interfaces/company-repository.interface'

// Infrastructure
import { CompanyRepository } from './infrastructure/repositories/company.repository';

import { TenantContextService } from './infrastructure/context/tenant-context.service';



// Use Cases
import { CreateCompanyUseCase } from './application/use-cases/create-company.use-case';
import { GetCompanyUseCase } from './application/use-cases/get-company.use-case';
import { UpdateCompanyUseCase } from './application/use-cases/update-company.use-case';
import { ConfigureSiiUseCase } from './application/use-cases/configure-sii.use-case';
import { CompanyController } from './infrastructure/controllers/companies.controller';
import { CompanyService } from './application/services/companies.service';
import { APP_FILTER } from '@nestjs/core';
import { CompanyExceptionFilter } from './infrastructure/filters/company-exception.filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyConfiguration]),
  ],
  controllers: [CompanyController],
  providers: [
    // Services
    CompanyService,
    TenantContextService,
    
    // Use Cases
    CreateCompanyUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
    ConfigureSiiUseCase,
    
    // Repository
    {
      provide: CompanyRepositoryAbstract,
      useClass: CompanyRepository,
    },

     {
      provide: APP_FILTER,
      useClass: CompanyExceptionFilter,
    },
  ],
  exports: [
    CompanyService,
    TenantContextService,
CompanyRepositoryAbstract
  ],
})
export class CompaniesModule {}