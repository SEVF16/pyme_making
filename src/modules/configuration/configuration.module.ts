import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Configuration } from './domain/entities/configuration.entity';
import { ConfigurationHistory } from './domain/entities/configuration-history.entity';

// Interfaces
import { ConfigurationRepositoryAbstract } from './domain/interfaces/configuration-repository.interface';

// Infrastructure
import { ConfigurationRepository } from './infrastructure/repositories/configuration.repository';
import { ConfigurationController } from './infrastructure/controllers/configuration.controller';
import { ConfigurationExceptionFilter } from './infrastructure/filters/configuration-exception.filter';
import { ConfigurationOwnershipGuard } from './infrastructure/guards/configuration-ownership.guard';
import { ConfigurationResponseInterceptor } from './infrastructure/interceptors/configuration-response.interceptor';

// Use Cases
import { CreateConfigurationUseCase } from './application/use-cases/create-configuration.use-case';
import { GetConfigurationUseCase } from './application/use-cases/get-configuration.use-case';
import { UpdateConfigurationUseCase } from './application/use-cases/update-configuration.use-case';
import { DeleteConfigurationUseCase } from './application/use-cases/delete-configuration.use-case';
import { GetConfigurationHistoryUseCase } from './application/use-cases/get-configuration-history.use-case';
import { RollbackConfigurationUseCase } from './application/use-cases/rollback-configuration.use-case';
import { ValidateConfigurationUseCase } from './application/use-cases/validate-configuration.use-case';
import { ResolveConfigurationUseCase } from './application/use-cases/resolve-configuration.use-case';
import { GetConfigurationsByCategoryUseCase } from './application/use-cases/get-configurations-by-category.use-case';
import { GetActiveConfigurationsUseCase } from './application/use-cases/get-active-configurations.use-case';

// Domain Services
import { ConfigurationDomainService } from './domain/services/configuration-domain.service';
import { ConfigurationResolutionService } from './domain/services/configuration-resolution.service';
import { ConfigurationValidationService } from './domain/services/configuration-validation.service';
import { ConfigurationVersioningService } from './domain/services/configuration-versioning.service';

// Import SharedModule for common services
import { SharedModule } from '../../shared/shared.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration, ConfigurationHistory]),
    SharedModule,
    CompaniesModule,
  ],
  controllers: [ConfigurationController],
  providers: [
    // Domain Services
    ConfigurationDomainService,
    ConfigurationResolutionService,
    ConfigurationValidationService,
    ConfigurationVersioningService,

    // Use Cases
    CreateConfigurationUseCase,
    GetConfigurationUseCase,
    UpdateConfigurationUseCase,
    DeleteConfigurationUseCase,
    GetConfigurationHistoryUseCase,
    RollbackConfigurationUseCase,
    ValidateConfigurationUseCase,
    ResolveConfigurationUseCase,
    GetConfigurationsByCategoryUseCase,
    GetActiveConfigurationsUseCase,

    // Repository
    {
      provide: ConfigurationRepositoryAbstract,
      useClass: ConfigurationRepository,
    },

    // Guards
    ConfigurationOwnershipGuard,

    // Filters and Interceptors
    ConfigurationExceptionFilter,
    ConfigurationResponseInterceptor,
  ],
  exports: [
    // Exportar servicios para uso en otros módulos
    ConfigurationDomainService,
    ConfigurationResolutionService,
    ConfigurationValidationService,
    ConfigurationVersioningService,
    ConfigurationRepositoryAbstract,
    ConfigurationOwnershipGuard,

    // Exportar use cases para integración externa
    ResolveConfigurationUseCase,
    GetConfigurationUseCase,
  ],
})
export class ConfigurationModule {}
