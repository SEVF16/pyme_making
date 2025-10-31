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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { UserQueryDto } from '../../application/dto/user-query.dto';
import { UsersService } from '../../application/services/users.service';
import { User } from '../../domain/entities/user.entity';
import { RequestPasswordResetDto, ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { VerifyEmailDto } from '../../application/dto/verify-email.dto';
import { RoleGuard, Roles } from '../guards/role.guard';
import { JwtService } from '@nestjs/jwt';
// *** USANDO SHARED ***
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../../shared/infrastructure/decorators/current-user.decorator';
import { ResponseInterceptor } from '../../../../shared/infrastructure/interceptors/response.interceptor';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { UserSummaryDto } from '../../application/dto/users-summary.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(TenantGuard)
@ApiBearerAuth('JWT-auth')
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService, 
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener usuarios con paginación' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async getUsers(@Query() queryDto: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return await this.usersService.getUsers(queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener usuarios detalle con paginación' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async getUsersSummary(@Query() queryDto: UserQueryDto): Promise<PaginatedResponseDto<UserSummaryDto>> {
    return await this.usersService.getUsersSummary(queryDto);
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
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    return await this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TenantGuard, RoleGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (id === currentUser.id) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }
    
    await this.usersService.deleteUser(id);
  }

  // ========== AUTH ENDPOINTS ==========

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email de usuario' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.usersService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verificado exitosamente' };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar reseteo de contraseña' })
  async requestPasswordReset(
    @Body() requestDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.usersService.requestPasswordReset(requestDto.email, requestDto.companyId);
    return { message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.usersService.resetPassword(resetDto.token, resetDto.newPassword);
    return { message: 'Contraseña reseteada exitosamente' };
  }

  @Post('bootstrap')
  @ApiOperation({ summary: 'Crear usuario inicial - SOLO DESARROLLO' })
  @ApiResponse({ status: 201, description: 'Usuario admin creado', type: UserResponseDto })
  async bootstrapAdmin(@Body() createUserDto: CreateUserDto): Promise<{ 
    user: UserResponseDto, 
    token: string 
  }> {
    const existingAdmins = await this.usersService.getUsers({
      role: 'admin',
      companyId: createUserDto.companyId
    });

    if (existingAdmins.result.length > 0) {
      throw new Error('Ya existe un administrador');
    }

    const user = await this.usersService.createUser(createUserDto);
    
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant: user.companyId
    });

    return { user, token };
  }
}