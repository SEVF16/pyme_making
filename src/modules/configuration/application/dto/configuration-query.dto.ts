import { IsOptional, IsEnum, IsString, IsBoolean, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfigurationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por scope',
    enum: ['system', 'company', 'branch', 'user'],
  })
  @IsOptional()
  @IsEnum(['system', 'company', 'branch', 'user'])
  scope?: 'system' | 'company' | 'branch' | 'user';

  @ApiPropertyOptional({
    description: 'Filtrar por scopeId',
  })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'],
  })
  @IsOptional()
  @IsEnum(['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'])
  category?: 'tax' | 'pricing' | 'workflow' | 'notification' | 'inventory' | 'accounting' | 'general';

  @ApiPropertyOptional({
    description: 'Filtrar por clave de configuración',
  })
  @IsOptional()
  @IsString()
  configKey?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo configuraciones activas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de vigencia',
  })
  @IsOptional()
  @IsDateString()
  validAt?: string;

  @ApiPropertyOptional({
    description: 'Filtrar configuraciones pendientes de aprobación',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  pendingApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en clave o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    enum: ['createdAt', 'updatedAt', 'configKey', 'category', 'version'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Dirección de ordenamiento',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDirection?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'ID de la empresa (asignado automáticamente por tenant)',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
