import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { Logger } from '@nestjs/common';

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(email: string, companyId: string): Promise<void> {
    this.logger.log(`Requesting password reset for email: ${email}`);

    const user = await this.userRepository.findByEmail(email, companyId);
    
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      this.logger.warn(`Password reset requested for non-existent user: ${email}`);
      return;
    }

    const resetToken = this.generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Enviar email con el token de reseteo
    this.logger.log(`Password reset token generated for user: ${user.id}`);
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(token: string, newPassword: string): Promise<void> {
    this.logger.log(`Resetting password with token: ${token}`);

    const user = await this.userRepository.findByPasswordResetToken(token);
    
    if (!user) {
      throw new NotFoundException('Token de reseteo inválido o expirado');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token de reseteo expirado');
    }

    const passwordValue = await PasswordValueObject.createFromPlain(newPassword);

    await this.userRepository.update(user.id, {
      password: passwordValue.getHashedValue(),
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    this.logger.log(`Password reset successfully for user: ${user.id}`);
  }
}