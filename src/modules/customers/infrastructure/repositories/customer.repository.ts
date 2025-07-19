import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';
import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository'; // *** USANDO SHARED ***
import { PaginationService } from '../../../../shared/application/services/pagination.service'; // *** USANDO SHARED ***

@Injectable()
export class CustomerRepository extends BaseRepository<Customer> implements CustomerRepositoryAbstract {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    paginationService: PaginationService,
  ) {
    super(customerRepository, paginationService);
  }

  async findByRut(rut: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { rut } });
  }

  async findByRutAndCompany(rut: string, companyId: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ 
      where: { rut, companyId } 
    });
  }

  async findByCompany(companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { status: status as any } 
    });
  }

  async findByStatusAndCompany(status: string, companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { status: status as any, companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByEmail(email: string, companyId: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ 
      where: { email, companyId } 
    });
  }

  async searchByNameOrEmail(query: string, companyId: string): Promise<Customer[]> {
    return await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere(
        '(LOWER(customer.firstName) LIKE LOWER(:query) OR LOWER(customer.lastName) LIKE LOWER(:query) OR LOWER(customer.email) LIKE LOWER(:query))',
        { query: `%${query}%` }
      )
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }

  async countByCompany(companyId: string): Promise<number> {
    return await this.customerRepository.count({ where: { companyId } });
  }

  async findActiveByCompany(companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { companyId, status: 'active' },
      order: { createdAt: 'DESC' }
    });
  }

  protected getAlias(): string {
    return 'customer';
  }

  protected applyFilters(queryBuilder: SelectQueryBuilder<Customer>, filters: any): void {
    if (filters.companyId) {
      queryBuilder.andWhere('customer.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.status) {
      queryBuilder.andWhere('customer.status = :status', { status: filters.status });
    }

    if (filters.customerType) {
      queryBuilder.andWhere('customer.customerType = :customerType', { customerType: filters.customerType });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.rut ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}