import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { CompanyRepositoryAbstract } from '../../../companies/domain/interfaces/company-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { EmailValueObject } from '../../../../shared/domain/value-objects/email.value-object'; // *** USANDO SHARED ***
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { UserRoleValueObject } from '../../domain/value-objects/user-role.value-object';
import { TokenService } from '../../../../shared/application/services/token.service'; // *** USANDO SHARED ***
import { Logger } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryAbstract,
    private readonly companyRepository: CompanyRepositoryAbstract,
    private readonly tokenService: TokenService, // *** USANDO SHARED ***
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email} for company: ${createUserDto.companyId}`);

    // Validar que la empresa existe
    const company = await this.companyRepository.findById(createUserDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${createUserDto.companyId} no encontrada`);
    }

    // Validar value objects usando shared
    const emailValue = EmailValueObject.create(createUserDto.email);
    const passwordValue = await PasswordValueObject.createFromPlain(createUserDto.password);
    const roleValue = UserRoleValueObject.create(createUserDto.role);

    // Verificar si el usuario ya existe en esa empresa
    const existingUser = await this.userRepository.findByEmail(
      emailValue.getValue(),
      createUserDto.companyId
    );

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este email en la empresa');
    }

    // Generar token de verificación usando shared service
    const tokenData = this.tokenService.generateVerificationToken(24);

    // Crear usuario
    const userData = {
      ...createUserDto,
      email: emailValue.getValue(),
      password: passwordValue.getHashedValue(),
      role: roleValue.getValue() as User['role'],
      emailVerificationToken: tokenData.hashedToken,
    };

    const user = await this.userRepository.create(userData);
    
    this.logger.log(`User created successfully: ${user.id}`);
    
    // TODO: Enviar email de verificación si sendWelcomeEmail es true
    // Usar tokenData.token (no hashedToken) en el email
    
    return user;
  }
}