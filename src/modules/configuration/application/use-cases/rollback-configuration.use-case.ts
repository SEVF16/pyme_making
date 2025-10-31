import { Injectable } from '@nestjs/common';
import { ConfigurationVersioningService } from '../../domain/services/configuration-versioning.service';
import { ConfigurationDomainService } from '../../domain/services/configuration-domain.service';
import { RollbackConfigurationDto } from '../dto/rollback-configuration.dto';
import { Configuration } from '../../domain/entities/configuration.entity';
import { ConfigurationRollbackException } from '../../domain/exceptions/configuration.exceptions';

@Injectable()
export class RollbackConfigurationUseCase {
  constructor(
    private readonly versioningService: ConfigurationVersioningService,
    private readonly domainService: ConfigurationDomainService,
  ) {}

  async execute(configurationId: string, dto: RollbackConfigurationDto): Promise<Configuration> {
    const canRollback = await this.domainService.canRollback(configurationId, dto.targetVersion);

    if (!canRollback) {
      throw new ConfigurationRollbackException(
        `No se puede hacer rollback a la versión ${dto.targetVersion}`
      );
    }

    // Obtener configuración actual para extraer scope y scopeId
    const current = await this.versioningService.getLatestVersion(
      configurationId,
      'company', // Default, se debería obtener de la configuración actual
      undefined
    );

    if (!current) {
      throw new ConfigurationRollbackException('No se encontró la configuración actual');
    }

    return await this.versioningService.rollback(
      current.configKey,
      current.scope,
      current.scopeId,
      dto.targetVersion,
      dto.rolledBackBy,
      dto.reason
    );
  }
}
