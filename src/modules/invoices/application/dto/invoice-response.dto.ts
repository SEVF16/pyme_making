import { BaseResponseDto } from '../../../../shared/application/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  productId?: string;

  @ApiProperty({ required: false })
  productSku?: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  taxPercentage: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discountTotal: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ required: false })
  unit?: string;

  @ApiProperty({ required: false })
  additionalInfo?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InvoiceResponseDto extends BaseResponseDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty({ required: false })
  customerId?: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty({
    enum: ['sale', 'purchase', 'credit_note', 'debit_note', 'proforma']
  })
  type: string;

  @ApiProperty({
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded']
  })
  status: string;

  @ApiProperty()
  issueDate: Date;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  customerData?: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  @ApiProperty()
  currency: string;

  @ApiProperty()
  exchangeRate: number;

  @ApiProperty({ required: false })
  terms?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false, enum: ['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other'] })
  paymentMethod?: string;

  @ApiProperty()
  globalDiscountPercentage: number;

  @ApiProperty()
  globalDiscountAmount: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discountTotal: number;

  @ApiProperty()
  taxTotal: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  isOverdue: boolean;

  @ApiProperty()
  daysPastDue: number;

  @ApiProperty({ required: false })
  additionalInfo?: Record<string, any>;
}