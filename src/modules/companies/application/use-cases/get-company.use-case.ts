import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';
import { Company } from '../../domain/entities/company.entity';

@Injectable()
export class GetCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepositoryAbstract) {}

  async execute(id: string): Promise<Company> {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return company;
  }
}