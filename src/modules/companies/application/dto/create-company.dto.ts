import { IsString, IsEmail, IsOptional, IsEnum, IsUrl, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ description: 'RUT de la empresa', example: '12.345.678-9' })
  @IsString()
  @Transform(({ value }) => value.trim())
  rut: string;

  @ApiProperty({ description: 'Razón social', example: 'Empresa Ejemplo S.A.' })
  @IsString()
  @Transform(({ value }) => value.trim())
  businessName: string;

  @ApiProperty({ description: 'Nombre de fantasía', example: 'Empresa Ejemplo' })
  @IsString()
  @Transform(({ value }) => value.trim())
  fantasyName: string;

  @ApiProperty({ description: 'Email de contacto', example: 'contacto@empresa.cl' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono de contacto', example: '+56912345678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Dirección', example: 'Av. Providencia 1234' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Ciudad', example: 'Santiago' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Región', example: 'Región Metropolitana' })
  @IsString()
  region: string;

  @ApiProperty({ description: 'Código postal', example: '7500000' })
  @IsString()
  postalCode: string;

  @ApiProperty({ 
    description: 'Tamaño de la empresa',
    enum: ['micro', 'small', 'medium', 'large'],
    required: false 
  })
  @IsEnum(['micro', 'small', 'medium', 'large'])
  @IsOptional()
  companySize?: 'micro' | 'small' | 'medium' | 'large';

  @ApiProperty({ description: 'URL del logo', required: false })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ description: 'Sitio web', required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Información adicional', required: false })
  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}