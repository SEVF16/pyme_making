import { Customer } from '../entities/customer.entity';

export abstract class CustomerRepositoryAbstract {
  abstract findById(id: string): Promise<Customer | null>;
  abstract findByRut(rut: string): Promise<Customer | null>;
  abstract findByRutAndCompany(rut: string, companyId: string): Promise<Customer | null>;
  abstract findByCompany(companyId: string): Promise<Customer[]>;
  abstract findByStatus(status: string): Promise<Customer[]>;
  abstract findByStatusAndCompany(status: string, companyId: string): Promise<Customer[]>;
  abstract findByEmail(email: string, companyId: string): Promise<Customer | null>;
  abstract searchByNameOrEmail(query: string, companyId: string): Promise<Customer[]>;
  abstract findAll(): Promise<Customer[]>;
  abstract create(customer: Partial<Customer>): Promise<Customer>;
  abstract update(id: string, customer: Partial<Customer>): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
  abstract countByCompany(companyId: string): Promise<number>;
  abstract findActiveByCompany(companyId: string): Promise<Customer[]>;
}