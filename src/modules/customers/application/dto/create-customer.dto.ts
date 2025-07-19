import { IsString, IsEmail, IsOptional, IsEnum, IsUrl, IsObject, IsDateString, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'RUT del cliente',
    example: '12.345.678-9'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  rut: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan.perez@email.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+56912345678'
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Av. Providencia 1234'
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Ciudad del cliente',
    example: 'Santiago'
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Región del cliente',
    example: 'Región Metropolitana'
  })
  @IsString()
  region: string;

  @ApiProperty({
    description: 'Código postal',
    example: '7500000'
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Tipo de cliente',
    enum: ['individual', 'business'],
    example: 'individual'
  })
  @IsEnum(['individual', 'business'])
  customerType: 'individual' | 'business';

  @ApiProperty({
    description: 'ID de la empresa a la que pertenece el cliente',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del cliente (ISO string)',
    example: '1990-05-15',
    required: false
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Sitio web del cliente',
    example: 'https://www.example.com',
    required: false
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Información adicional del cliente',
    example: { notes: 'Cliente VIP', preferences: ['email'] },
    required: false
  })
  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}