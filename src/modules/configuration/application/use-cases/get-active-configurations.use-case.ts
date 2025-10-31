import { Injectable } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { Configuration, ConfigurationScope } from '../../domain/entities/configuration.entity';

@Injectable()
export class GetActiveConfigurationsUseCase {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async execute(scope?: ConfigurationScope, scopeId?: string): Promise<Configuration[]> {
    if (!scope) {
      // Si no se proporciona scope, usar findActiveAndValid sin filtro de scope
      return await this.configurationRepository.findActiveAndValid();
    }
    return await this.configurationRepository.findActiveByScope(scope, scopeId);
  }
}
