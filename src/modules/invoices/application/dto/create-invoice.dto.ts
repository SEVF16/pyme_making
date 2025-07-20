import { IsString, IsEnum, IsOptional, IsUUID, IsEmail, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'ID de la empresa',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'ID del cliente (opcional para facturas sin cliente específico)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Tipo de factura',
    enum: ['sale', 'purchase', 'credit_note', 'debit_note', 'proforma'],
    example: 'sale'
  })
  @IsEnum(['sale', 'purchase', 'credit_note', 'debit_note', 'proforma'])
  type: 'sale' | 'purchase' | 'credit_note' | 'debit_note' | 'proforma';

  @ApiProperty({
    description: 'Número de factura (se auto-genera si no se proporciona)',
    example: 'FAC-2024-001',
    required: false
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  invoiceNumber?: string;

  @ApiProperty({
    description: 'Fecha de emisión de la factura',
    example: '2024-01-15',
    required: false
  })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiProperty({
    description: 'Fecha de vencimiento de la factura',
    example: '2024-02-15',
    required: false
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'Datos del cliente (si no está registrado)',
    required: false
  })
  @IsOptional()
  customerData?: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  @ApiProperty({
    description: 'Moneda de la factura',
    example: 'CLP',
    required: false
  })
  @IsString()
  @IsOptional()
  currency?: string = 'CLP';

  @ApiProperty({
    description: 'Tasa de cambio (si es diferente a la moneda base)',
    example: 1,
    required: false
  })
  @IsOptional()
  exchangeRate?: number = 1;

  @ApiProperty({
    description: 'Términos y condiciones',
    example: 'Pago a 30 días. Recargo por mora 2% mensual.',
    required: false
  })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Gracias por su compra',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Método de pago',
    example: 'transfer',
    enum: ['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other'],
    required: false
  })
  @IsEnum(['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other'])
  @IsOptional()
  paymentMethod?: 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'check' | 'other';

  @ApiProperty({
    description: 'Porcentaje de descuento global',
    example: 5,
    required: false
  })
  @IsOptional()
  globalDiscountPercentage?: number = 0;

  @ApiProperty({
    description: 'Monto de descuento global',
    example: 25000,
    required: false
  })
  @IsOptional()
  globalDiscountAmount?: number = 0;

  @ApiProperty({
    description: 'Ítems de la factura',
    type: [CreateInvoiceItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiProperty({
    description: 'Información adicional de la factura',
    example: { project: 'Proyecto ABC', po_number: 'PO-123' },
    required: false
  })
  @IsOptional()
  additionalInfo?: Record<string, any>;
}