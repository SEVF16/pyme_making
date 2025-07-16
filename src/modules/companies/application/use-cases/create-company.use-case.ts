import { Injectable, ConflictException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { Company } from '../../domain/entities/company.entity';
import { RutValueObject } from '../../domain/value-objects/rut.value-object';

@Injectable()
export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepositoryAbstract) {}

  async execute(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Validar RUT
    const rutValue = RutValueObject.create(createCompanyDto.rut);
    
    // Verificar si la empresa ya existe
    const existingCompany = await this.companyRepository.findByRut(rutValue.getValue());
    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa con este RUT');
    }

    // Crear empresa
    const companyData = {
      ...createCompanyDto,
      rut: rutValue.getValue(),
      status: 'active' as const,
    };

    return await this.companyRepository.create(companyData);
  }
}
