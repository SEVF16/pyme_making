import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryAbstract, FindUsersOptions, PaginatedUsers } from '../../domain/interfaces/user-repository.interface';
import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository'; // *** USANDO SHARED ***
import { PaginationService } from '../../../../shared/application/services/pagination.service'; // *** USANDO SHARED ***

@Injectable()
export class UserRepository extends BaseRepository<User> implements UserRepositoryAbstract {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    paginationService: PaginationService,
  ) {
    super(userRepository, paginationService);
  }

  async findByEmail(email: string, companyId: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { email, companyId },
      relations: ['company']
    });
  }

  async findByEmailGlobal(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { email },
      relations: ['company']
    });
  }

  async findByCompanyId(companyId: string): Promise<User[]> {
    return await this.userRepository.find({ 
      where: { companyId },
      relations: ['company'],
      order: { createdAt: 'DESC' }
    });
  }

  async findWithOptions(options: FindUsersOptions): Promise<PaginatedUsers> {
    return await this.findAll(options);
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { emailVerificationToken: token }
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { passwordResetToken: token }
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { 
      lastLoginAt: new Date() 
    });
  }

  protected getAlias(): string {
    return 'user';
  }

  protected applyFilters(queryBuilder: SelectQueryBuilder<User>, filters: any): void {
    if (filters.companyId) {
      queryBuilder.andWhere('user.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}