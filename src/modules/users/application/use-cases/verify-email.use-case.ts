import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class VerifyEmailUseCase {
  private readonly logger = new Logger(VerifyEmailUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(token: string): Promise<void> {
    this.logger.log(`Verifying email with token: ${token}`);

    const user = await this.userRepository.findByEmailVerificationToken(token);
    
    if (!user) {
      throw new NotFoundException('Token de verificación inválido o expirado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya ha sido verificado');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      status: 'active',
    });

    this.logger.log(`Email verified successfully for user: ${user.id}`);
  }
}