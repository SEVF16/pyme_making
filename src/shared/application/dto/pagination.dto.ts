// pagination.dto.ts
import { IsOptional, IsNumber, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Elementos por página', 
    minimum: 1, 
    maximum: 100, 
    default: 20 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Desplazamiento para paginación', 
    minimum: 0, 
    default: 0 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ 
    description: 'Campo para ordenar', 
    default: 'createdAt' 
  })
  @IsOptional()
  @IsString()
  sortField?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Dirección del orden', 
    enum: ['ASC', 'DESC'], 
    default: 'DESC' 
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ 
    description: 'Término de búsqueda' 
  })
  @IsOptional()
  @IsString()
  search?: string;
}