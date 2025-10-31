// src/modules/product/application/dto/product-summary.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductSummaryDto {
  @ApiProperty({ 
    description: 'ID único del producto',
    example: 'ae7e0c42-32f3-47fb-ab16-9bcabe464fed',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'SKU del producto',
    example: 'PRD-001-XL'
  })
  sku: string;
  
  @ApiProperty({ 
    description: 'Precio del producto',
    example: 850000
  })
  price: number;
  @ApiProperty({ 
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron 15'
  })
  name: string;

  @ApiProperty({ 
    description: 'Estado del producto',
    enum: ['active', 'inactive', 'discontinued'],
    example: 'active'
  })
  status: string;

  @ApiProperty({ 
    description: 'Stock actual del producto',
    example: 25
  })
  stock: number;
}