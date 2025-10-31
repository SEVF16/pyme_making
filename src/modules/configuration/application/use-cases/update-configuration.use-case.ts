import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { ConfigurationValidationService } from '../../domain/services/configuration-validation.service';
import { ConfigurationVersioningService } from '../../domain/services/configuration-versioning.service';
import { UpdateConfigurationDto } from '../dto/update-configuration.dto';
import { Configuration } from '../../domain/entities/configuration.entity';

@Injectable()
export class UpdateConfigurationUseCase {
  constructor(
    private readonly configurationRepository: ConfigurationRepositoryAbstract,
    private readonly validationService: ConfigurationValidationService,
    private readonly versioningService: ConfigurationVersioningService,
  ) {}

  async execute(id: string, dto: UpdateConfigurationDto): Promise<Configuration> {
    const current = await this.configurationRepository.findById(id);

    if (!current) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    // Si se actualiza el valor y hay schema, validar
    if (dto.configValue && (dto.schema || current.schema)) {
      const schemaToUse = dto.schema || current.schema;
      if (schemaToUse) {
        this.validationService.validate(dto.configValue, schemaToUse);
      }
    }

    // Si se cambia el valor, crear nueva versión
    if (dto.configValue && JSON.stringify(dto.configValue) !== JSON.stringify(current.configValue)) {
      return await this.versioningService.createNewVersion(
        current,
        dto.configValue,
        dto.updatedBy || 'system',
        dto.changeReason
      );
    }

    // Actualizar solo metadatos sin crear nueva versión
    const updateData: Partial<Configuration> = {};
    if (dto.schema !== undefined) updateData.schema = dto.schema;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.validFrom !== undefined) updateData.validFrom = new Date(dto.validFrom);
    if (dto.validUntil !== undefined) updateData.validUntil = new Date(dto.validUntil);
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    if (dto.updatedBy) updateData.updatedBy = dto.updatedBy;

    return await this.configurationRepository.update(id, updateData);
  }
}
