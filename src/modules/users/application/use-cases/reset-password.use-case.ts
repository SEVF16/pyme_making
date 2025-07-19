import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { TokenService } from '../../../../shared/application/services/token.service'; // *** USANDO SHARED ***
import { Logger } from '@nestjs/common';

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryAbstract,
    private readonly tokenService: TokenService, // *** USANDO SHARED ***
  ) {}

  async execute(email: string, companyId: string): Promise<void> {
    this.logger.log(`Requesting password reset for email: ${email}`);

    const user = await this.userRepository.findByEmail(email, companyId);
    
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      this.logger.warn(`Password reset requested for non-existent user: ${email}`);
      return;
    }

    // Usar shared token service
    const tokenData = this.tokenService.generatePasswordResetToken(1); // 1 hora

    await this.userRepository.update(user.id, {
      passwordResetToken: tokenData.hashedToken,
      passwordResetExpires: tokenData.expiresAt,
    });

    // TODO: Enviar email con tokenData.token (no hashedToken)
    this.logger.log(`Password reset token generated for user: ${user.id}`);
  }
}

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryAbstract,
    private readonly tokenService: TokenService, // *** USANDO SHARED ***
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    this.logger.log(`Resetting password with token`);

    // Buscar usuario por token hasheado
    const users = await this.userRepository.findAll();
    const user = users.data.find(u => 
      u.passwordResetToken && 
      this.tokenService.verifyToken(token, u.passwordResetToken)
    );
    
    if (!user) {
      throw new NotFoundException('Token de reseteo inválido o expirado');
    }

    if (!user.passwordResetExpires || this.tokenService.isTokenExpired(user.passwordResetExpires)) {
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