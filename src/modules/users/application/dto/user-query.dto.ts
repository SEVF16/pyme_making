import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'ID de la empresa para filtrar' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por rol', enum: ['admin', 'manager', 'employee', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'employee', 'viewer'])
  role?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: ['active', 'inactive', 'suspended', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'pending'])
  status?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por nombre, apellido o email' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Número de página', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}