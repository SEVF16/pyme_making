import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Estado del cliente',
    enum: ['active', 'inactive', 'blocked'],
    example: 'active',
    required: false
  })
  @IsEnum(['active', 'inactive', 'blocked'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'blocked';
}