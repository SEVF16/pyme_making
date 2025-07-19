import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { UserRoleValueObject } from '../../domain/value-objects/user-role.value-object';
import { Logger } from '@nestjs/common';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);

    const existingUser = await this.userRepository.findById(id);
    
    if (!existingUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Validar permisos si se proporciona usuario actual
    if (currentUser && !this.canUpdateUser(currentUser, existingUser)) {
      throw new ForbiddenException('No tienes permisos para actualizar este usuario');
    }

    // Validar rol si se proporciona
    if (updateUserDto.role) {
      UserRoleValueObject.create(updateUserDto.role);
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    
    this.logger.log(`User updated successfully: ${id}`);
    
    return updatedUser;
  }

  private canUpdateUser(currentUser: User, targetUser: User): boolean {
    // Super admin puede actualizar a cualquiera
    if (currentUser.role === 'admin') {
      return true;
    }

    // Manager puede actualizar empleados y viewers de su empresa
    if (currentUser.role === 'manager' && 
        currentUser.companyId === targetUser.companyId &&
        ['employee', 'viewer'].includes(targetUser.role)) {
      return true;
    }

    // Un usuario solo puede actualizarse a sí mismo (campos limitados)
    return currentUser.id === targetUser.id;
  }
}