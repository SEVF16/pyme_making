import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StockHistoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo de movimiento',
    enum: ['in', 'out', 'adjustment'] 
  })
  @IsOptional()
  @IsEnum(['in', 'out', 'adjustment'])
  movementType?: 'in' | 'out' | 'adjustment';

  @ApiPropertyOptional({ 
    description: 'Fecha desde (ISO format)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha hasta (ISO format)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ 
    description: 'ID del usuario que realizó el movimiento'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Referencia del documento',
    example: 'FAC-001'
  })
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ 
    description: 'Incluir información del producto',
    example: false
  })
  @IsOptional()
  @Type(() => Boolean)
  includeProduct?: boolean = false;
}