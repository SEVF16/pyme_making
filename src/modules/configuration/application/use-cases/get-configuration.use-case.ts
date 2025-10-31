import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { Configuration } from '../../domain/entities/configuration.entity';

@Injectable()
export class GetConfigurationUseCase {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async execute(id: string): Promise<Configuration> {
    const configuration = await this.configurationRepository.findById(id);

    if (!configuration) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    return configuration;
  }
}
