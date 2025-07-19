import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryAbstract, FindUsersOptions, PaginatedUsers } from '../../domain/interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryAbstract {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { id },
      relations: ['company']
    });
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
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company');

    this.applyFilters(queryBuilder, options);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<User>, options: FindUsersOptions): void {
    if (options.companyId) {
      queryBuilder.andWhere('user.companyId = :companyId', { companyId: options.companyId });
    }

    if (options.role) {
      queryBuilder.andWhere('user.role = :role', { role: options.role });
    }

    if (options.status) {
      queryBuilder.andWhere('user.status = :status', { status: options.status });
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findById(id);
    
    if (!updatedUser) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
    
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
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
}