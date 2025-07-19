import { Company } from '../entities/company.entity';
import { BaseRepositoryInterface, FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

export abstract class CompanyRepositoryAbstract implements BaseRepositoryInterface<Company> {
  // Implement all methods from BaseRepositoryInterface
  abstract findById(id: string): Promise<Company | null>;
  abstract findAll(options?: FindOptions): Promise<PaginatedResult<Company>>;
  abstract create(entity: Partial<Company>): Promise<Company>;
  abstract update(id: string, entity: Partial<Company>): Promise<Company>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;
  
  // Your custom methods
  abstract findByRut(rut: string): Promise<Company | null>;
  abstract findByStatus(status: string): Promise<Company[]>;
  abstract findWithConfigurations(id: string): Promise<Company | null>;
}