import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInvoiceDto extends PartialType(
  OmitType(CreateInvoiceDto, ['companyId', 'items'] as const)
) {
  @ApiProperty({
    description: 'Estado de la factura',
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
    required: false
  })
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'])
  @IsOptional()
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
}