import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { UsersService } from '../../application/services/users.service';
import { FindUsersOptions } from '../../domain/interfaces/user-repository.interface';
import { TenantGuard } from '../../../companies/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../companies/infrastructure/decorators/tenant.decorator';
import { User } from '../../domain/entities/user.entity';
import { RequestPasswordResetDto, ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { VerifyEmailDto } from '../../application/dto/verify-email.dto';
import { RoleGuard, Roles } from '../guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';

@ApiTags('users')
@Controller('users')
@UseGuards(TenantGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService,) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get('profile')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario', type: UserResponseDto })
  async getCurrentUserProfile(
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    return await this.usersService.getUserById(currentUser.id);
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Validar acceso al usuario
    const targetUser = await this.usersService.getUserById(id);
    
    if (targetUser.companyId !== currentUser.companyId && currentUser.role !== 'admin') {
      throw new Error('No tienes acceso a este usuario');
    }
    
    return targetUser;
  }

  @Put('profile')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Actualizar perfil propio' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado', type: UserResponseDto })
  async updateOwnProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    // Los usuarios solo pueden actualizar ciertos campos de su propio perfil
    const allowedFields: Partial<UpdateUserDto> = {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phone: updateUserDto.phone,
      preferences: updateUserDto.preferences,
    };
    
    return await this.usersService.updateUser(currentUser.id, allowedFields, currentUser);
  }

  @Put(':id')
  @UseGuards(TenantGuard, RoleGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Actualizar usuario (solo admin/manager)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    return await this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Put(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Cambiar contraseña de usuario' })
  @ApiResponse({ status: 204, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Validar que solo pueda cambiar su propia contraseña o admin/manager
    if (id !== currentUser.id && !['admin', 'manager'].includes(currentUser.role)) {
      throw new Error('Solo puedes cambiar tu propia contraseña');
    }
    
    await this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TenantGuard, RoleGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // No permitir auto-eliminación
    if (id === currentUser.id) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }
    
    await this.usersService.deleteUser(id);
  }

  // ========== AUTH ENDPOINTS ==========

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email de usuario' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.usersService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verificado exitosamente' };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reseteo de contraseña' })
  @ApiResponse({ status: 200, description: 'Email de reseteo enviado' })
  async requestPasswordReset(
    @Body() requestDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.usersService.requestPasswordReset(requestDto.email, requestDto.companyId);
    return { message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña reseteada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.usersService.resetPassword(resetDto.token, resetDto.newPassword);
    return { message: 'Contraseña reseteada exitosamente' };
  }

  @Put(':id/update-last-login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Actualizar último login (interno)' })
  @ApiResponse({ status: 204, description: 'Último login actualizado' })
  async updateLastLogin(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.updateLastLogin(id);
  }

@Post('bootstrap')
// NO usar @UseGuards() aquí para que aparezca en Swagger
@ApiOperation({ summary: 'Crear usuario inicial - SOLO DESARROLLO' })
@ApiResponse({ status: 201, description: 'Usuario admin creado', type: UserResponseDto })
async bootstrapAdmin(@Body() createUserDto: CreateUserDto): Promise<{ 
  user: UserResponseDto, 
  token: string 
}> {
  // Solo permitir si no hay usuarios admin
  const existingAdmins = await this.usersService.getUsers({
    role: 'admin',
    companyId: createUserDto.companyId
  });

  if (existingAdmins.total > 0) {
    throw new Error('Ya existe un administrador');
  }

  const user = await this.usersService.createUser(createUserDto);
  
  // Generar token inicial
  const token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenant: user.companyId
  });

  return { user, token };
}
}