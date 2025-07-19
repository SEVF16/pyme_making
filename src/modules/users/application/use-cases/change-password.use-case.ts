import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { Logger } from '@nestjs/common';

@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    this.logger.log(`Changing password for user: ${userId}`);

    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar contraseña actual
    const currentPassword = PasswordValueObject.createFromHashed(user.password);
    const isCurrentPasswordValid = await currentPassword.compare(changePasswordDto.currentPassword);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Crear nueva contraseña
    const newPassword = await PasswordValueObject.createFromPlain(changePasswordDto.newPassword);

    // Actualizar contraseña
    await this.userRepository.update(userId, {
      password: newPassword.getHashedValue(),
    });

    this.logger.log(`Password changed successfully for user: ${userId}`);
  }
}