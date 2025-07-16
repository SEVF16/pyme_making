// src/modules/companies/infrastructure/repositories/company.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';

@Injectable()
export class CompanyRepository implements CompanyRepositoryAbstract {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findById(id: string): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { id } });
  }

  async findByRut(rut: string): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { rut } });
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findByStatus(status: string): Promise<Company[]> {
    return await this.companyRepository.find({ where: { status: status as any } });
  }

  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(companyData);
    return await this.companyRepository.save(company);
  }

  async update(id: string, companyData: Partial<Company>): Promise<Company> {
    await this.companyRepository.update(id, companyData);
    const updatedCompany = await this.findById(id);
    
    if (!updatedCompany) {
      throw new Error(`Empresa con ID ${id} no encontrada`);
    }
    
    return updatedCompany;
  }

  async delete(id: string): Promise<void> {
    const result = await this.companyRepository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`Empresa con ID ${id} no encontrada`);
    }
  }

  async findWithConfigurations(id: string): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { id },
      relations: ['configurations']
    });
  }
}