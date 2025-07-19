import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';
import { CustomerStatusValueObject } from '../../domain/value-objects/customer-status.value-object';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryAbstract) {}

  async execute(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    
    if (!existingCustomer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Validar estado si se proporciona
    if (updateCustomerDto.status) {
      CustomerStatusValueObject.create(updateCustomerDto.status);
    }

    // Convertir fecha de nacimiento si se proporciona
    const updateData = {
      ...updateCustomerDto,
      birthDate: updateCustomerDto.birthDate ? new Date(updateCustomerDto.birthDate) : undefined,
    };

    return await this.customerRepository.update(id, updateData);
  }
}