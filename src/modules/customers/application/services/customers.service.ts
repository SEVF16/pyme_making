import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { CreateCustomerUseCase } from '../use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '../use-cases/get-customer.use-case';
import { UpdateCustomerUseCase } from '../use-cases/update-customer.use-case';
import { GetCustomersByCompanyUseCase } from '../use-cases/get-customers-by-company.use-case';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';


@Injectable()
export class CustomerService {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly getCustomersByCompanyUseCase: GetCustomersByCompanyUseCase,
    private readonly customerRepository: CustomerRepositoryAbstract,
  ) {}

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.createCustomerUseCase.execute(createCustomerDto);
    return this.toResponseDto(customer);
  }

  async getCustomerById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.getCustomerUseCase.execute(id);
    return this.toResponseDto(customer);
  }

  async getCustomerByRut(rut: string, companyId: string): Promise<CustomerResponseDto | null> {
    const customer = await this.customerRepository.findByRutAndCompany(rut, companyId);
    return customer ? this.toResponseDto(customer) : null;
  }

  async getCustomersByCompany(companyId: string): Promise<CustomerResponseDto[]> {
    const customers = await this.getCustomersByCompanyUseCase.execute(companyId);
    return customers.map(customer => this.toResponseDto(customer));
  }

  async getCustomersByStatus(status: string, companyId: string): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.findByStatusAndCompany(status, companyId);
    return customers.map(customer => this.toResponseDto(customer));
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomerUseCase.execute(id, updateCustomerDto);
    return this.toResponseDto(customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async searchCustomers(query: string, companyId: string): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.searchByNameOrEmail(query, companyId);
    return customers.map(customer => this.toResponseDto(customer));
  }

  private toResponseDto(customer: any): CustomerResponseDto {
    return {
      id: customer.id,
      rut: customer.rut,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      region: customer.region,
      postalCode: customer.postalCode,
      customerType: customer.customerType,
      status: customer.status,
      companyId: customer.companyId,
      birthDate: customer.birthDate,
      website: customer.website,
      additionalInfo: customer.additionalInfo,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}