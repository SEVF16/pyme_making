
// src/modules/products/application/dto/product-query.dto.ts
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por empresa',
    format: 'uuid'
  })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por estado',
    enum: ['active', 'inactive', 'discontinued'] 
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'discontinued'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por categoría',
    example: 'Electrónicos'
  })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por marca',
    example: 'Dell'
  })
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo de producto',
    enum: ['physical', 'digital', 'service'] 
  })
  @IsOptional()
  @IsEnum(['physical', 'digital', 'service'])
  productType?: string;

  @ApiPropertyOptional({ 
    description: 'Precio mínimo',
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Precio máximo',
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Solo productos con stock bajo',
    example: false
  })
  @IsOptional()
  lowStock?: boolean;

  @ApiPropertyOptional({ 
    description: 'Solo productos sin stock',
    example: false
  })
  @IsOptional()
  outOfStock?: boolean;
}