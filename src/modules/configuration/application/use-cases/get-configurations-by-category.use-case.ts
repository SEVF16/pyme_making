import { Injectable } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { Configuration, ConfigurationCategory, ConfigurationScope } from '../../domain/entities/configuration.entity';

@Injectable()
export class GetConfigurationsByCategoryUseCase {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async execute(
    category: ConfigurationCategory,
    scope?: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration[]> {
    return await this.configurationRepository.findByCategory(category, scope, scopeId);
  }
}
