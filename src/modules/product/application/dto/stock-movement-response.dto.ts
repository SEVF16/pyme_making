import { ApiProperty } from '@nestjs/swagger';

export class StockMovementResponseDto {
  @ApiProperty({ 
    description: 'ID único del movimiento',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({ 
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  productId: string;

  @ApiProperty({ 
    description: 'Tipo de movimiento',
    enum: ['in', 'out', 'adjustment'],
    example: 'in'
  })
  movementType: 'in' | 'out' | 'adjustment';

  @ApiProperty({ 
    description: 'Cantidad del movimiento (puede ser negativa)',
    example: 10
  })
  quantity: number;

  @ApiProperty({ 
    description: 'Stock anterior al movimiento',
    example: 15
  })
  previousStock: number;

  @ApiProperty({ 
    description: 'Stock después del movimiento',
    example: 25
  })
  newStock: number;

  @ApiProperty({ 
    description: 'Razón del movimiento',
    example: 'Compra de inventario',
    required: false
  })
  reason?: string;

  @ApiProperty({ 
    description: 'Referencia del documento',
    example: 'FAC-001',
    required: false
  })
  reference?: string;

  @ApiProperty({ 
    description: 'ID del usuario que realizó el movimiento',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false
  })
  userId?: string;

  @ApiProperty({ 
    description: 'Costo unitario en el momento del movimiento',
    example: 1500.00,
    required: false
  })
  unitCost?: number;

  @ApiProperty({ 
    description: 'Costo total del movimiento',
    example: 15000.00,
    required: false
  })
  totalCost?: number;

  @ApiProperty({ 
    description: 'Fecha del movimiento',
    example: '2024-03-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Información del producto (si se incluye)',
    required: false
  })
  product?: {
    sku: string;
    name: string;
    category: string;
  };
}