import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';

@Injectable()
export class DeleteConfigurationUseCase {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async execute(id: string): Promise<void> {
    const configuration = await this.configurationRepository.findById(id);

    if (!configuration) {
      throw new NotFoundException(`Configuración con ID ${id} no encontrada`);
    }

    // Soft delete
    if (this.configurationRepository.softDelete) {
      await this.configurationRepository.softDelete(id);
    } else {
      await this.configurationRepository.delete(id);
    }
  }
}
