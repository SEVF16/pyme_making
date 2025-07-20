import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({
    description: 'ID del producto (opcional si es producto personalizado)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    description: 'SKU del producto (opcional)',
    example: 'LAP-DEL-001',
    required: false
  })
  @IsString()
  @IsOptional()
  productSku?: string;

  @ApiProperty({
    description: 'Nombre/descripción del producto o servicio',
    example: 'Laptop Dell Inspiron 15'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del ítem',
    example: 'Laptop con procesador Intel i7, 16GB RAM, 512GB SSD',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Cantidad del producto/servicio',
    example: 2,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 850000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({
    description: 'Porcentaje de descuento aplicado (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountPercentage?: number = 0;

  @ApiProperty({
    description: 'Monto fijo de descuento',
    example: 50000,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountAmount?: number = 0;

  @ApiProperty({
    description: 'Porcentaje de impuesto aplicado (ej: 19 para IVA)',
    example: 19,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  taxPercentage?: number = 0;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'unidad',
    required: false
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({
    description: 'Información adicional del ítem',
    example: { warranty: '1 año', color: 'Negro' },
    required: false
  })
  @IsOptional()
  additionalInfo?: Record<string, any>;
}