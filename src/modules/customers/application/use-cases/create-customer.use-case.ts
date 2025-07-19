import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../../companies/domain/interfaces/company-repository.interface';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';
import { RutValueObject } from '../../domain/value-objects/rut.value-object';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryAbstract,
    private readonly companyRepository: CompanyRepositoryAbstract,
  ) {}

  async execute(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Validar que la empresa existe
    const company = await this.companyRepository.findById(createCustomerDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${createCustomerDto.companyId} no encontrada`);
    }

    // Validar RUT
    const rutValue = RutValueObject.create(createCustomerDto.rut);
    
    // Verificar si el cliente ya existe en la empresa
    const existingCustomer = await this.customerRepository.findByRutAndCompany(
      rutValue.getValue(), 
      createCustomerDto.companyId
    );
    
    if (existingCustomer) {
      throw new ConflictException('Ya existe un cliente con este RUT en la empresa');
    }

    // Crear cliente
    const customerData = {
      ...createCustomerDto,
      rut: rutValue.getValue(),
      status: 'active' as const,
      birthDate: createCustomerDto.birthDate ? new Date(createCustomerDto.birthDate) : undefined,
    };

    return await this.customerRepository.create(customerData);
  }
}