import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Teléfono', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Rol del usuario', enum: ['admin', 'manager', 'employee', 'viewer'] })
  @IsEnum(['admin', 'manager', 'employee', 'viewer'])
  role: 'admin' | 'manager' | 'employee' | 'viewer';

  @ApiProperty({ description: 'Permisos específicos', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ description: 'Enviar email de bienvenida', required: false })
  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean = true;
}