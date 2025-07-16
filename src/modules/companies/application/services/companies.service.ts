import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateSiiConfigurationDto } from '../dto/create-sii-configuration.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CreateCompanyUseCase } from '../use-cases/create-company.use-case';
import { GetCompanyUseCase } from '../use-cases/get-company.use-case';
import { UpdateCompanyUseCase } from '../use-cases/update-company.use-case';
import { ConfigureSiiUseCase } from '../use-cases/configure-sii.use-case';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';

@Injectable()
export class CompanyService {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly configureSiiUseCase: ConfigureSiiUseCase,
    private readonly companyRepository: CompanyRepositoryAbstract,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const company = await this.createCompanyUseCase.execute(createCompanyDto);
    return this.toResponseDto(company);
  }

  async getCompanyById(id: string): Promise<CompanyResponseDto> {
    const company = await this.getCompanyUseCase.execute(id);
    return this.toResponseDto(company);
  }

  async getCompanyByRut(rut: string): Promise<CompanyResponseDto | null> {
    const company = await this.companyRepository.findByRut(rut);
    return company ? this.toResponseDto(company) : null;
  }

  async getAllCompanies(): Promise<CompanyResponseDto[]> {
    const companies = await this.companyRepository.findAll();
    return companies.map(company => this.toResponseDto(company));
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    const company = await this.updateCompanyUseCase.execute(id, updateCompanyDto);
    return this.toResponseDto(company);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.companyRepository.delete(id);
  }

  async configureSii(configDto: CreateSiiConfigurationDto): Promise<any> {
    return await this.configureSiiUseCase.execute(configDto);
  }

  async getCompanyWithConfigurations(id: string): Promise<any> {
    return await this.companyRepository.findWithConfigurations(id);
  }

  private toResponseDto(company: any): CompanyResponseDto {
    return {
      id: company.id,
      rut: company.rut,
      businessName: company.businessName,
      fantasyName: company.fantasyName,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      region: company.region,
      postalCode: company.postalCode,
      companySize: company.companySize,
      status: company.status,
      logoUrl: company.logoUrl,
      website: company.website,
      additionalInfo: company.additionalInfo,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}