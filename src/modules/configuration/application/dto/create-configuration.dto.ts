import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
  ValidateNested,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigurationDto {
  @ApiProperty({
    description: 'Nivel de alcance de la configuración',
    enum: ['system', 'company', 'branch', 'user'],
    example: 'company',
  })
  @IsEnum(['system', 'company', 'branch', 'user'])
  scope: 'system' | 'company' | 'branch' | 'user';

  @ApiPropertyOptional({
    description: 'ID del scope (companyId, branchId, userId). Requerido excepto para scope=system',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiProperty({
    description: 'Categoría funcional de la configuración',
    enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'],
    example: 'tax',
  })
  @IsEnum(['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'])
  category: 'tax' | 'pricing' | 'workflow' | 'notification' | 'inventory' | 'accounting' | 'general';

  @ApiProperty({
    description: 'Clave única de configuración (formato: categoria.subcategoria.nombre)',
    example: 'tax.default_rate',
    pattern: '^[a-z0-9]+(\\.[a-z0-9_]+)*$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(\.[a-z0-9_]+)*$/, {
    message: 'La clave debe tener formato: categoria.subcategoria.nombre (solo minúsculas, números, guiones bajos y puntos)',
  })
  configKey: string;

  @ApiProperty({
    description: 'Valor de configuración en formato JSON',
    example: { rate: 19, type: 'IVA', description: 'Impuesto general' },
  })
  @IsObject()
  @IsNotEmpty()
  configValue: Record<string, any>;

  @ApiPropertyOptional({
    description: 'JSON Schema para validación del configValue',
    example: {
      type: 'object',
      properties: {
        rate: { type: 'number', minimum: 0, maximum: 100 },
        type: { type: 'string' },
      },
      required: ['rate', 'type'],
    },
  })
  @IsOptional()
  @IsObject()
  schema?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Descripción de la configuración',
    example: 'Tasa de impuesto por defecto para facturación',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde la cual la configuración es válida (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta la cual la configuración es válida (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea la configuración',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales de la configuración',
    example: { requiresApproval: true, source: 'manual' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Si la configuración está activa al crearla',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
