import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsString()
  companyId: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de reseteo de contraseña' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Nueva contraseña' })
  @IsString()
  newPassword: string;
}