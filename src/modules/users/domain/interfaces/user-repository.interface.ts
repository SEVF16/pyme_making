import { User } from '../entities/user.entity';

export interface FindUsersOptions {
  companyId?: string;
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class UserRepositoryAbstract {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string, companyId: string): Promise<User | null>;
  abstract findByEmailGlobal(email: string): Promise<User | null>;
  abstract findByCompanyId(companyId: string): Promise<User[]>;
  abstract findWithOptions(options: FindUsersOptions): Promise<PaginatedUsers>;
  abstract create(user: Partial<User>): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract findByEmailVerificationToken(token: string): Promise<User | null>;
  abstract findByPasswordResetToken(token: string): Promise<User | null>;
  abstract updateLastLogin(id: string): Promise<void>;
}