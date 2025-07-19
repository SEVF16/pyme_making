// src/modules/users/infrastructure/controllers/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// DTOs
import { LoginDto } from '../../application/dto/login.dto';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';

// Services
import { AuthService, LoginResponse } from '../../application/services/auth.service';
import { UsersService } from '../../application/services/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: { $ref: '#/components/schemas/UserResponseDto' },
        tenant_id: { type: 'string', example: '4e3657a9-31be-4af7-b1a8-a6380d3fb107' },
        expires_in: { type: 'string', example: '24h' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(loginDto);
  }

  @Post('bootstrap')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario inicial - SOLO DESARROLLO' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario admin creado exitosamente',
    schema: {
      properties: {
        user: { $ref: '#/components/schemas/UserResponseDto' },
        access_token: { type: 'string' },
        tenant_id: { type: 'string' }
      }
    }
  })
  async bootstrap(@Body() createUserDto: CreateUserDto): Promise<LoginResponse> {
    // Solo permitir si no hay usuarios admin
    const existingAdmins = await this.usersService.getUsers({
      role: 'admin',
      companyId: createUserDto.companyId
    });

    if (existingAdmins.total > 0) {
      throw new Error('Ya existe un administrador');
    }

    // Crear usuario
    const user = await this.usersService.createUser(createUserDto);
    
    // Hacer login automático
    const loginResult = await this.authService.login({
      email: user.email,
      password: createUserDto.password,
      companyId: user.companyId,
    });

    return loginResult;
  }
}