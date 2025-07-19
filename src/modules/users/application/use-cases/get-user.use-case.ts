import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class GetUserUseCase {
  private readonly logger = new Logger(GetUserUseCase.name);

  constructor(private readonly userRepository: UserRepositoryAbstract) {}

  async execute(id: string): Promise<User> {
    this.logger.log(`Getting user with ID: ${id}`);

    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async getByEmail(email: string, companyId: string): Promise<User> {
    this.logger.log(`Getting user with email: ${email} for company: ${companyId}`);

    const user = await this.userRepository.findByEmail(email, companyId);
    
    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }
}