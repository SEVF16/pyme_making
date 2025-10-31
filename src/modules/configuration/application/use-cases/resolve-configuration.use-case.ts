import { Injectable } from '@nestjs/common';
import { ConfigurationResolutionService } from '../../domain/services/configuration-resolution.service';
import { ResolveConfigurationDto } from '../dto/resolve-configuration.dto';
import { Configuration } from '../../domain/entities/configuration.entity';

@Injectable()
export class ResolveConfigurationUseCase {
  constructor(private readonly resolutionService: ConfigurationResolutionService) {}

  async execute(dto: ResolveConfigurationDto): Promise<Configuration> {
    return await this.resolutionService.resolve(
      dto.configKey,
      dto.companyId,
      dto.branchId,
      dto.userId
    );
  }

  async resolveValue(dto: ResolveConfigurationDto): Promise<any> {
    return await this.resolutionService.resolveValue(
      dto.configKey,
      dto.companyId,
      dto.branchId,
      dto.userId,
      dto.valueKey
    );
  }
}
