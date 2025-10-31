import { Injectable } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { ConfigurationHistory } from '../../domain/entities/configuration-history.entity';
import { PaginatedResult, PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class GetConfigurationHistoryUseCase {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async execute(configurationId: string, options?: PaginationOptions): Promise<PaginatedResult<ConfigurationHistory>> {
    return await this.configurationRepository.getHistory(configurationId, options);
  }
}
