import { Company } from '../entities/company.entity';

export abstract class CompanyRepositoryAbstract {
  abstract findById(id: string): Promise<Company | null>;
  abstract findByRut(rut: string): Promise<Company | null>;
  abstract findAll(): Promise<Company[]>;
  abstract findByStatus(status: string): Promise<Company[]>;
  abstract create(company: Partial<Company>): Promise<Company>;
  abstract update(id: string, company: Partial<Company>): Promise<Company>;
  abstract delete(id: string): Promise<void>;
  abstract findWithConfigurations(id: string): Promise<Company | null>;
}