import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por empresa',
    format: 'uuid'
  })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por estado',
    enum: ['active', 'inactive', 'blocked'] 
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'blocked'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo',
    enum: ['individual', 'business'] 
  })
  @IsOptional()
  @IsEnum(['individual', 'business'])
  customerType?: string;
}