import { User } from '../entities/user.entity';
import { BaseRepositoryInterface, FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

export interface FindUsersOptions extends FindOptions {
  companyId?: string;
  role?: string;
  status?: string;
}

export interface PaginatedUsers extends PaginatedResult<User> {}

export abstract class UserRepositoryAbstract implements BaseRepositoryInterface<User> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<User | null>;
  abstract findAll(options?: FindOptions): Promise<PaginatedResult<User>>;
  abstract create(entity: Partial<User>): Promise<User>;
  abstract update(id: string, entity: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;

  // Métodos específicos de User
  abstract findByEmail(email: string, companyId: string): Promise<User | null>;
  abstract findByEmailGlobal(email: string): Promise<User | null>;
  abstract findByCompanyId(companyId: string): Promise<User[]>;
  abstract findWithOptions(options: FindUsersOptions): Promise<PaginatedUsers>;
  abstract findByEmailVerificationToken(token: string): Promise<User | null>;
  abstract findByPasswordResetToken(token: string): Promise<User | null>;
  abstract updateLastLogin(id: string): Promise<void>;
}