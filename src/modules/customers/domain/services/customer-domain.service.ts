import { Injectable } from '@nestjs/common';
import { CustomerBusinessRules } from '../interfaces/customer-business-rules.interface';
import { CustomerRepositoryAbstract } from '../interfaces/customer-repository.interface';


@Injectable()
export class CustomerDomainService implements CustomerBusinessRules {
  constructor(private readonly customerRepository: CustomerRepositoryAbstract) {}

  async canCreateCustomer(rut: string, companyId: string): Promise<boolean> {
    const existingCustomer = await this.customerRepository.findByRutAndCompany(rut, companyId);
    return !existingCustomer;
  }

  async canUpdateCustomer(customerId: string, companyId: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(customerId);
    return customer?.companyId === companyId && customer.canOperate();
  }

  async canDeleteCustomer(customerId: string, companyId: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(customerId);
    return customer?.companyId === companyId;
  }

  async canChangeStatus(customerId: string, newStatus: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) return false;

    // Reglas de negocio para cambio de estado
    switch (newStatus) {
      case 'active':
        return customer.status !== 'blocked';
      case 'inactive':
        return true;
      case 'blocked':
        return customer.status === 'active' || customer.status === 'inactive';
      default:
        return false;
    }
  }

  async validateCustomerData(customerData: any): Promise<boolean> {
    // Validaciones adicionales de negocio
    if (customerData.customerType === 'individual' && !customerData.birthDate) {
      return false;
    }

    if (customerData.customerType === 'business' && !customerData.website) {
      return false;
    }

    return true;
  }

  async isCustomerDuplicate(rut: string, email: string, companyId: string): Promise<boolean> {
    const customerByRut = await this.customerRepository.findByRutAndCompany(rut, companyId);
    const customerByEmail = await this.customerRepository.findByEmail(email, companyId);
    
    return !!(customerByRut || customerByEmail);
  }
}