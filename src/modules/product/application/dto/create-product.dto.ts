import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, IsUUID, IsUrl, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'SKU del producto',
    example: 'PRD-001-XL'
  })
  @IsString()
  @Transform(({ value }) => value.trim().toUpperCase())
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron 15'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Laptop con procesador Intel i7, 16GB RAM, 512GB SSD'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 850000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Precio de costo',
    example: 650000,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Electrónicos'
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  category: string;

  @ApiProperty({
    description: 'Marca del producto',
    example: 'Dell',
    required: false
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsOptional()
  brand?: string;

  @ApiProperty({
    description: 'Tipo de producto',
    enum: ['physical', 'digital', 'service'],
    example: 'physical'
  })
  @IsEnum(['physical', 'digital', 'service'])
  productType: 'physical' | 'digital' | 'service';

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'unidad',
    required: false
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({
    description: 'Stock actual',
    example: 25,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number = 0;

  @ApiProperty({
    description: 'Stock mínimo',
    example: 5,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number = 0;

  @ApiProperty({
    description: 'Stock máximo',
    example: 100,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStock?: number;

  @ApiProperty({
    description: 'Peso del producto en gramos',
    example: 2500,
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Dimensiones del producto (largo x ancho x alto en cm)',
    example: '35x25x2',
    required: false
  })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({
    description: 'URLs de imágenes del producto',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: 'Código de barras',
    example: '1234567890123',
    required: false
  })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({
    description: 'Está activo para venta',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Permite venta sin stock',
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  allowNegativeStock?: boolean = false;

  @ApiProperty({
    description: 'ID de la empresa a la que pertenece',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Etiquetas del producto',
    example: ['nuevo', 'oferta', 'destacado'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Información adicional del producto',
    example: { warranty: '1 año', origin: 'USA' },
    required: false
  })
  @IsOptional()
  additionalInfo?: Record<string, any>;
}