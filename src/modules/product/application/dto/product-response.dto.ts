import { BaseResponseDto } from '../../../../shared/application/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto extends BaseResponseDto {
  @ApiProperty({ 
    description: 'SKU del producto',
    example: 'PRD-001-XL'
  })
  sku: string;

  @ApiProperty({ 
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron 15'
  })
  name: string;

  @ApiProperty({ 
    description: 'Descripción del producto',
    example: 'Laptop con procesador Intel i7, 16GB RAM, 512GB SSD'
  })
  description: string;

  @ApiProperty({ 
    description: 'Precio del producto',
    example: 850000
  })
  price: number;

  @ApiProperty({ 
    description: 'Precio de costo',
    example: 650000,
    required: false
  })
  costPrice?: number;

  @ApiProperty({ 
    description: 'Margen de ganancia calculado',
    example: 30.77
  })
  profitMargin: number;

  @ApiProperty({ 
    description: 'Categoría del producto',
    example: 'Electrónicos'
  })
  category: string;

  @ApiProperty({ 
    description: 'Marca del producto',
    example: 'Dell',
    required: false
  })
  brand?: string;

  @ApiProperty({ 
    description: 'Tipo de producto',
    enum: ['physical', 'digital', 'service'],
    example: 'physical'
  })
  productType: string;

  @ApiProperty({ 
    description: 'Estado del producto',
    enum: ['active', 'inactive', 'discontinued'],
    example: 'active'
  })
  status: string;

  @ApiProperty({ 
    description: 'Unidad de medida',
    example: 'unidad',
    required: false
  })
  unit?: string;

  @ApiProperty({ 
    description: 'Stock actual',
    example: 25
  })
  stock: number;

  @ApiProperty({ 
    description: 'Stock mínimo',
    example: 5
  })
  minStock: number;

  @ApiProperty({ 
    description: 'Stock máximo',
    example: 100,
    required: false
  })
  maxStock?: number;

  @ApiProperty({ 
    description: 'Indica si el stock está bajo',
    example: false
  })
  isLowStock: boolean;

  @ApiProperty({ 
    description: 'Indica si está sin stock',
    example: false
  })
  isOutOfStock: boolean;

  @ApiProperty({ 
    description: 'Peso del producto en gramos',
    example: 2500,
    required: false
  })
  weight?: number;

  @ApiProperty({ 
    description: 'Dimensiones del producto',
    example: '35x25x2',
    required: false
  })
  dimensions?: string;

  @ApiProperty({ 
    description: 'URLs de imágenes del producto',
    example: ['https://example.com/image1.jpg'],
    required: false
  })
  images?: string[];

  @ApiProperty({ 
    description: 'Código de barras',
    example: '1234567890123',
    required: false
  })
  barcode?: string;

  @ApiProperty({ 
    description: 'Está activo para venta',
    example: true
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Permite venta sin stock',
    example: false
  })
  allowNegativeStock: boolean;

  @ApiProperty({ 
    description: 'ID de la empresa a la que pertenece',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  companyId: string;

  @ApiProperty({ 
    description: 'Etiquetas del producto',
    example: ['nuevo', 'oferta', 'destacado'],
    required: false
  })
  tags?: string[];

  @ApiProperty({ 
    description: 'Información adicional del producto',
    example: { warranty: '1 año', origin: 'USA' },
    required: false
  })
  additionalInfo?: Record<string, any>;
}