import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ConfigurationResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @Expose()
  @ApiProperty({ enum: ['system', 'company', 'branch', 'user'], example: 'company' })
  scope: string;

  @Expose()
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  scopeId: string | null;

  @Expose()
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  companyId: string | null;

  @Expose()
  @ApiProperty({ enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'] })
  category: string;

  @Expose()
  @ApiProperty({ example: 'tax.default_rate' })
  configKey: string;

  @Expose()
  @ApiProperty({ example: { rate: 19, type: 'IVA' } })
  configValue: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  schema: Record<string, any> | null;

  @Expose()
  @ApiProperty({ example: 1 })
  version: number;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional()
  validFrom: Date | null;

  @Expose()
  @ApiPropertyOptional()
  validUntil: Date | null;

  @Expose()
  @ApiPropertyOptional()
  createdBy: string | null;

  @Expose()
  @ApiPropertyOptional()
  updatedBy: string | null;

  @Expose()
  @ApiPropertyOptional()
  approvedBy: string | null;

  @Expose()
  @ApiPropertyOptional()
  approvedAt: Date | null;

  @Expose()
  @ApiPropertyOptional()
  metadata: Record<string, any> | null;

  @Expose()
  @ApiPropertyOptional()
  description: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
