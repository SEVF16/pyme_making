// src/modules/users/application/dto/login.dto.ts
import { IsEmail, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email del usuario',
    example: 'admin@empresa.cl'
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario',
    example: 'Admin123!'
  })
  @IsString()
  password: string;

  @ApiProperty({ 
    description: 'ID de la empresa',
    example: '4e3657a9-31be-4af7-b1a8-a6380d3fb107'
  })
  @IsUUID()
  companyId: string;
}