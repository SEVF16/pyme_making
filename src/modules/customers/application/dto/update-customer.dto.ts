import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Estado del cliente',
    enum: ['active', 'inactive', 'blocked'],
    example: 'active',
    required: false
  })
  @IsEnum(['active', 'inactive', 'blocked'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'blocked';
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
    description: 'Sitio web del cliente',
    example: 'https://www.example.com',
    required: false
  })
  @IsUrl()
  @IsOptional()
  website?: string;

}