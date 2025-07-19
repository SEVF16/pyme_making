import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por estado',
    enum: ['active', 'inactive', 'suspended'] 
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tamaño',
    enum: ['micro', 'small', 'medium', 'large'] 
  })
  @IsOptional()
  @IsEnum(['micro', 'small', 'medium', 'large'])
  companySize?: string;
}