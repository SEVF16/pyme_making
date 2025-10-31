import {
  IsObject,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigurationDto {
  @ApiPropertyOptional({
    description: 'Nuevo valor de configuración en formato JSON',
    example: { rate: 21, type: 'IVA', description: 'Impuesto actualizado' },
  })
  @IsOptional()
  @IsObject()
  configValue?: Record<string, any>;

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
    example: 'Tasa de impuesto actualizada',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Si la configuración está activa',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
    description: 'ID del usuario que actualiza la configuración',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiPropertyOptional({
    description: 'Motivo del cambio',
    example: 'Actualización de tasa por nueva regulación fiscal',
  })
  @IsOptional()
  @IsString()
  changeReason?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales de la configuración',
    example: { requiresApproval: true, source: 'manual' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
