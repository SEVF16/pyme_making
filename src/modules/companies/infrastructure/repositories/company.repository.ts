import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';
import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository'; // *** USANDO SHARED ***
import { PaginationService } from '../../../../shared/application/services/pagination.service'; // *** USANDO SHARED ***

@Injectable()
export class CompanyRepository extends BaseRepository<Company> implements CompanyRepositoryAbstract {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    paginationService: PaginationService,
  ) {
    super(companyRepository, paginationService);
  }

  async findByRut(rut: string): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { rut } });
  }

  async findByStatus(status: string): Promise<Company[]> {
    return await this.companyRepository.find({ where: { status: status as any } });
  }

  async findWithConfigurations(id: string): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: { id },
      relations: ['configurations']
    });
  }

  protected applySearch(queryBuilder: SelectQueryBuilder<Company>, search: string): void {
  queryBuilder.andWhere(
    '(company.businessName ILIKE :search OR company.fantasyName ILIKE :search OR company.rut ILIKE :search)',
    { search: `%${search}%` }
  );
}
  protected getAlias(): string {
    return 'company';
  }

  protected applyFilters(queryBuilder: SelectQueryBuilder<Company>, filters: any): void {
    if (filters.status) {
      queryBuilder.andWhere('company.status = :status', { status: filters.status });
    }

    if (filters.companySize) {
      queryBuilder.andWhere('company.companySize = :companySize', { companySize: filters.companySize });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(company.businessName ILIKE :search OR company.fantasyName ILIKE :search OR company.rut ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}