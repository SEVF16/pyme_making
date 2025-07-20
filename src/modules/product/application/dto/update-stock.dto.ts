import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Cantidad a ajustar (puede ser negativa)',
    example: 10
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: ['in', 'out', 'adjustment'],
    example: 'in'
  })
  @IsEnum(['in', 'out', 'adjustment'])
  movementType: 'in' | 'out' | 'adjustment';

  @ApiProperty({
    description: 'Razón del movimiento',
    example: 'Compra de inventario',
    required: false
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Referencia del documento',
    example: 'FAC-001',
    required: false
  })
  @IsString()
  @IsOptional()
  reference?: string;
}