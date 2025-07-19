import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { GetUserUseCase } from '../use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';
import { UserRepositoryAbstract, FindUsersOptions, PaginatedUsers } from '../../domain/interfaces/user-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly userRepository: UserRepositoryAbstract,
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

  async getUsers(options: FindUsersOptions): Promise<PaginatedUsers> {
    const result = await this.userRepository.findWithOptions(options);
    
    return {
      ...result,
      users: result.users.map(user => this.toResponseDto(user)) as any,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto, currentUser);
    return this.toResponseDto(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    await this.changePasswordUseCase.execute(userId, changePasswordDto);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
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