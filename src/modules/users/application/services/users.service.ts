import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { GetUserUseCase } from '../use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';
import { UserRepositoryAbstract, FindUsersOptions, PaginatedUsers } from '../../domain/interfaces/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { VerifyEmailUseCase } from '../use-cases/verify-email.use-case';
import { RequestPasswordResetUseCase, ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto'; // *** USANDO SHARED ***
import { PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface'; // *** USANDO SHARED ***

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly userRepository: UserRepositoryAbstract,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return this.toResponseDto(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return this.toResponseDto(user);
  }

  async getUserByEmail(email: string, companyId: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.getByEmail(email, companyId);
    return this.toResponseDto(user);
  }

  async getUsersByCompany(companyId: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findByCompanyId(companyId);
    return users.map(user => this.toResponseDto(user));
  }

async getUsers(queryDto: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
  const options: PaginationOptions = {
    limit: queryDto.limit,
    offset: queryDto.offset, 
    sortField: queryDto.sortField || 'createdAt',
    sortDirection: queryDto.sortDirection || 'DESC',
    search: queryDto.search,
    filters: {
      companyId: queryDto.companyId,
      role: queryDto.role,
      status: queryDto.status,
    },
  };

  const result = await this.userRepository.findAll(options);
  const users = result.result.map(user => this.toResponseDto(user));
  
  return new PaginatedResponseDto(users, options.limit || 20, options.offset);
}

  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto, currentUser);
    return this.toResponseDto(user);
  }

  async deleteUser(id: string): Promise<void> {
    if (this.userRepository.softDelete) {
      await this.userRepository.softDelete(id);
    } else {
      await this.userRepository.delete(id);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    await this.changePasswordUseCase.execute(userId, changePasswordDto);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    await this.verifyEmailUseCase.execute(token);
  }

  async requestPasswordReset(email: string, companyId: string): Promise<void> {
    await this.requestPasswordResetUseCase.execute(email, companyId);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.resetPasswordUseCase.execute(token, newPassword);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      permissions: user.permissions || [],
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}