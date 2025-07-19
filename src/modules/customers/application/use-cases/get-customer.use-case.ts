import { Injectable, NotFoundException } from '@nestjs/common';

import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';

@Injectable()
export class GetCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryAbstract) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return customer;
  }
}