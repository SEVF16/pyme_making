import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { ConfigurationDomainService } from '../../domain/services/configuration-domain.service';
import { ConfigurationValidationService } from '../../domain/services/configuration-validation.service';
import { ConfigurationVersioningService } from '../../domain/services/configuration-versioning.service';
import { CreateConfigurationDto } from '../dto/create-configuration.dto';
import { Configuration } from '../../domain/entities/configuration.entity';
import { ConfigurationKey } from '../../domain/value-objects/configuration-key.vo';
import { ConfigurationScope } from '../../domain/value-objects/configuration-scope.vo';
import { ConfigurationCategory } from '../../domain/value-objects/configuration-category.vo';
import { ConfigurationValue } from '../../domain/value-objects/configuration-value.vo';

@Injectable()
export class CreateConfigurationUseCase {
  constructor(
    private readonly configurationRepository: ConfigurationRepositoryAbstract,
    private readonly domainService: ConfigurationDomainService,
    private readonly validationService: ConfigurationValidationService,
    private readonly versioningService: ConfigurationVersioningService,
  ) {}

  async execute(dto: CreateConfigurationDto): Promise<Configuration> {
    // Validar Value Objects
    const configKey = ConfigurationKey.create(dto.configKey);
    const scope = ConfigurationScope.create(dto.scope);
    const category = ConfigurationCategory.create(dto.category);
    const configValue = ConfigurationValue.create(dto.configValue);

    // Validar consistencia de scope
    if (!this.domainService.validateScopeConsistency(dto.scope, dto.scopeId || null)) {
      throw new BadRequestException(
        `Inconsistencia de scope: el scope '${dto.scope}' ${
          dto.scope === 'system' ? 'no debe' : 'debe'
        } tener scopeId`
      );
    }

    // Validar que se pueda crear
    const canCreate = await this.domainService.canCreateConfiguration(
      dto.configKey,
      dto.scope,
      dto.scopeId || null
    );

    if (!canCreate) {
      throw new ConflictException(
        `Ya existe una configuración activa con clave '${dto.configKey}' en el scope especificado`
      );
    }

    // Validar contra schema si existe
    if (dto.schema) {
      this.validationService.validate(dto.configValue, dto.schema);
    }

    // Validar rango de vigencia
    if (dto.validFrom || dto.validUntil) {
      const validFrom = dto.validFrom ? new Date(dto.validFrom) : null;
      const validUntil = dto.validUntil ? new Date(dto.validUntil) : null;
      this.validationService.validateValidityRange(validFrom, validUntil);
    }

    // Determinar companyId según scope
    let companyId: string | null = null;
    if (dto.scope === 'company') {
      companyId = dto.scopeId || null;
    }

    // Crear configuración
    const configurationData: Partial<Configuration> = {
      scope: dto.scope,
      scopeId: dto.scopeId || null,
      companyId,
      category: dto.category,
      configKey: dto.configKey,
      configValue: dto.configValue,
      schema: dto.schema || null,
      version: 1,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      createdBy: dto.createdBy || null,
      updatedBy: dto.createdBy || null,
      metadata: dto.metadata || null,
      description: dto.description || null,
    };

    // Verificar si requiere aprobación
    if (this.domainService.requiresApproval(dto.category, dto.scope)) {
      configurationData.metadata = {
        ...configurationData.metadata,
        requiresApproval: true,
      };
    }

    const configuration = await this.configurationRepository.create(configurationData);

    // Registrar en historial
    await this.versioningService.recordChange(
      configuration,
      'created',
      dto.createdBy || 'system',
      undefined,
      dto.configValue,
      'Configuración creada'
    );

    return configuration;
  }
}
