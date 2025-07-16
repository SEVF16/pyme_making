import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../../domain/entities/company.entity';
import { CompanyStatusValueObject } from '../../domain/value-objects/company-status.value-object';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepositoryAbstract) {}

  async execute(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const existingCompany = await this.companyRepository.findById(id);
    
    if (!existingCompany) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    // Validar estado si se proporciona
    if (updateCompanyDto.status) {
      CompanyStatusValueObject.create(updateCompanyDto.status);
    }

    return await this.companyRepository.update(id, updateCompanyDto);
  }
}