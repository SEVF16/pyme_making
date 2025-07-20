import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Estado del producto',
    enum: ['active', 'inactive', 'discontinued'],
    required: false
  })
  @IsEnum(['active', 'inactive', 'discontinued'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'discontinued';
}
