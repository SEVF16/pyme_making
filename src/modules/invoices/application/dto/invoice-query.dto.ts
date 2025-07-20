import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: 'Filtrar por empresa',
    format: 'uuid'
  })
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por cliente',
    format: 'uuid'
  })
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por tipo de factura',
    enum: ['sale', 'purchase', 'credit_note', 'debit_note', 'proforma']
  })
  @IsOptional()
  @IsEnum(['sale', 'purchase', 'credit_note', 'debit_note', 'proforma'])
  type?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por estado',
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded']
  })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar desde fecha de emisión',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  issueDateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar hasta fecha de emisión',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  issueDateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar desde fecha de vencimiento',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar hasta fecha de vencimiento',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({ 
    description: 'Moneda',
    example: 'CLP'
  })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Solo facturas vencidas',
    example: false
  })
  @IsOptional()
  overdue?: boolean;

  @ApiPropertyOptional({ 
    description: 'Método de pago',
    enum: ['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other']
  })
  @IsOptional()
  @IsEnum(['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other'])
  paymentMethod?: string;
}
