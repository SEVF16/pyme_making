import { Customer } from '../entities/customer.entity';
import { BaseRepositoryInterface, FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

export interface FindCustomersOptions extends FindOptions {
  companyId?: string;
  status?: string;
  customerType?: string;
}

export abstract class CustomerRepositoryAbstract implements BaseRepositoryInterface<Customer> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<Customer | null>;
  abstract findAll(options?: FindOptions): Promise<PaginatedResult<Customer>>;
  abstract create(entity: Partial<Customer>): Promise<Customer>;
  abstract update(id: string, entity: Partial<Customer>): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;

  // Métodos específicos de Customer
  abstract findByRut(rut: string): Promise<Customer | null>;
  abstract findByRutAndCompany(rut: string, companyId: string): Promise<Customer | null>;
  abstract findByCompany(companyId: string): Promise<Customer[]>;
  abstract findByStatus(status: string): Promise<Customer[]>;
  abstract findByStatusAndCompany(status: string, companyId: string): Promise<Customer[]>;
  abstract findByEmail(email: string, companyId: string): Promise<Customer | null>;
  abstract searchByNameOrEmail(query: string, companyId: string): Promise<Customer[]>;
  abstract countByCompany(companyId: string): Promise<number>;
  abstract findActiveByCompany(companyId: string): Promise<Customer[]>;
}
