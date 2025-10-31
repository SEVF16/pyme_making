/**
 * DTOs for Process Sale Use Case
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessSaleItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantity to sell',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price (will be validated against catalog)',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Discount percentage',
    example: 10,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({
    description: 'Tax percentage',
    example: 19,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}

export class ProcessSaleDto {
  @ApiProperty({
    description: 'Company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Sale items',
    type: [ProcessSaleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessSaleItemDto)
  items: ProcessSaleItemDto[];

  @ApiProperty({
    description: 'Invoice type',
    example: 'sale',
    enum: ['sale', 'proforma'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['sale', 'proforma', 'purchase', 'credit_note', 'debit_note'])
  invoiceType?: string;

  @ApiProperty({
    description: 'Issue date for the invoice',
    example: '2025-10-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  issueDate?: string;

  @ApiProperty({
    description: 'Due date for the invoice',
    example: '2025-11-30',
    required: false,
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Validate prices strictly against catalog',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  strictPriceValidation?: boolean;

  @ApiProperty({
    description: 'Skip stock validation (use with caution)',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  skipStockValidation?: boolean;
}

export class ProcessSaleResponseDto {
  @ApiProperty({
    description: 'Sale ID',
  })
  saleId: string;

  @ApiProperty({
    description: 'Invoice ID',
  })
  invoiceId: string;

  @ApiProperty({
    description: 'Sale status',
    enum: [
      'pending',
      'validated',
      'invoice_created',
      'stock_deducted',
      'completed',
      'failed',
      'compensating',
      'compensated',
    ],
  })
  status: string;

  @ApiProperty({
    description: 'Total amount',
  })
  total: number;

  @ApiProperty({
    description: 'Subtotal',
  })
  subtotal: number;

  @ApiProperty({
    description: 'Total discount',
  })
  totalDiscount: number;

  @ApiProperty({
    description: 'Total tax',
  })
  totalTax: number;

  @ApiProperty({
    description: 'Stock movements created',
    type: [Object],
  })
  stockMovements: Array<{
    productId: string;
    productName: string;
    quantity: number;
    movementType: string;
  }>;

  @ApiProperty({
    description: 'Processing timestamp',
  })
  processedAt: Date;

  @ApiProperty({
    description: 'Warnings (e.g., low stock)',
    required: false,
  })
  warnings?: string[];
}
