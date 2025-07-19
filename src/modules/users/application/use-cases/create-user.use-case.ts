import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { CompanyRepositoryAbstract } from '../../../companies/domain/interfaces/company-repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { EmailValueObject } from '../../domain/value-objects/email.value-object';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { UserRoleValueObject } from '../../domain/value-objects/user-role.value-object';
import { Logger } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryAbstract,
    private readonly companyRepository: CompanyRepositoryAbstract,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email} for company: ${createUserDto.companyId}`);

    // Validar que la empresa existe
    const company = await this.companyRepository.findById(createUserDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${createUserDto.companyId} no encontrada`);
    }

    // Validar value objects
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

    // Crear usuario
    const userData = {
    ...createUserDto,
    email: emailValue.getValue(),
    password: passwordValue.getHashedValue(),
    role: roleValue.getValue() as User['role'],
    emailVerificationToken: this.generateVerificationToken(),
    };

    const user = await this.userRepository.create(userData);
    
    this.logger.log(`User created successfully: ${user.id}`);
    
    // TODO: Enviar email de verificación si sendWelcomeEmail es true
    
    return user;
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}