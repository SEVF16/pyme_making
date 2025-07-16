import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyConfiguration } from '../../domain/entities/company-configuration.entity';
import { CreateSiiConfigurationDto } from '../dto/create-sii-configuration.dto';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';

@Injectable()
export class ConfigureSiiUseCase {
  constructor(
    private readonly companyRepository: CompanyRepositoryAbstract,
    @InjectRepository(CompanyConfiguration)
    private readonly configRepository: Repository<CompanyConfiguration>,
  ) {}

  async execute(configDto: CreateSiiConfigurationDto): Promise<CompanyConfiguration> {
    // Verificar que la empresa existe
    const company = await this.companyRepository.findById(configDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${configDto.companyId} no encontrada`);
    }

    // Crear configuración SII
    const siiConfig = this.configRepository.create({
      companyId: configDto.companyId,
      configurationType: 'sii',
      siiEnvironment: configDto.environment,
      siiRutRepresentante: configDto.rutRepresentante,
      siiClaveCertificado: configDto.claveCertificado,
      siiCertificadoDigital: configDto.certificadoDigital,
      siiResolucionFecha: new Date(configDto.resolucionFecha),
      siiResolucionNumero: configDto.resolucionNumero,
      siiActivityCodes: configDto.activityCodes,
      siiAuthorizedDocuments: configDto.authorizedDocuments,
    });

    return await this.configRepository.save(siiConfig);
  }
}