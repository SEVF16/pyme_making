import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CompanyQueryDto } from '../dto/company-query.dto';
import { CreateCompanyUseCase } from '../use-cases/create-company.use-case';
import { GetCompanyUseCase } from '../use-cases/get-company.use-case';
import { UpdateCompanyUseCase } from '../use-cases/update-company.use-case';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto'; // *** USANDO SHARED ***
import { FindOptions } from '../../../../shared/domain/interfaces/repository.interface'; // *** USANDO SHARED ***

@Injectable()
export class CompanyService {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
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

  async getAllCompanies(queryDto: CompanyQueryDto): Promise<PaginatedResponseDto<CompanyResponseDto>> {
    const findOptions: FindOptions = {
      pagination: {
        page: queryDto.page,
        limit: queryDto.limit,
      },
      sort: {
        field: queryDto.sortField || 'createdAt',
        direction: queryDto.sortDirection || 'DESC',
      },
      filters: {
        status: queryDto.status,
        companySize: queryDto.companySize,
      },
      search: queryDto.search,
    };

    const result = await this.companyRepository.findAll(findOptions);
    
    const companies = result.data.map(company => this.toResponseDto(company));
    
    return new PaginatedResponseDto(companies, result.total, result.page, result.limit);
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    const company = await this.updateCompanyUseCase.execute(id, updateCompanyDto);
    return this.toResponseDto(company);
  }

  async deleteCompany(id: string): Promise<void> {
    await this.companyRepository.delete(id);
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