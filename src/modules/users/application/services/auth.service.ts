// src/modules/users/application/services/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryAbstract } from '../../domain/interfaces/user-repository.interface';
import { PasswordValueObject } from '../../domain/value-objects/password.value-object';
import { UserSecurityPolicyService } from '../../domain/services/user-security-policy.service';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../../domain/entities/user.entity';

export interface LoginResponse {
  access_token: string;
  user: UserResponseDto;
  tenant_id: string;
  expires_in: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepositoryAbstract,
    private readonly jwtService: JwtService,
    private readonly securityPolicyService: UserSecurityPolicyService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    // 1. Buscar usuario por email y empresa
    const user = await this.userRepository.findByEmail(
      loginDto.email, 
      loginDto.companyId
    );

    if (!user) {
      this.logger.warn(`Login failed: User not found - ${loginDto.email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar que el usuario esté activo
    if (!user.isActive()) {
      this.logger.warn(`Login failed: User inactive - ${user.id}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Verificar contraseña
    const passwordValue = PasswordValueObject.createFromHashed(user.password);
    const isPasswordValid = await passwordValue.compare(loginDto.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password - ${user.id}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // 5. Obtener política de sesiones de la empresa
    const sessionPolicy = await this.securityPolicyService.getSessionPolicy(user.companyId);

    // 6. Generar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: sessionPolicy.sessionTimeout,
    });

    this.logger.log(`Login successful for user: ${user.id}`);

    return {
      access_token: token,
      user: this.toUserResponse(user),
      tenant_id: user.companyId,
      expires_in: sessionPolicy.sessionTimeout,
    };
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      email: user.email,
      phone: user.phone,
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