import { Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';

@Injectable()
export class GetCustomersByCompanyUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryAbstract) {}

  async execute(companyId: string): Promise<Customer[]> {
    return await this.customerRepository.findByCompany(companyId);
  }
}