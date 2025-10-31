import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResolveConfigurationDto {
  @ApiProperty({
    description: 'Clave de configuración a resolver',
    example: 'tax.default_rate',
  })
  @IsString()
  @IsNotEmpty()
  configKey: string;

  @ApiPropertyOptional({
    description: 'ID de la empresa para resolver',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'ID de la sucursal para resolver',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario para resolver',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Clave específica dentro del configValue',
    example: 'rate',
  })
  @IsOptional()
  @IsString()
  valueKey?: string;
}
