import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ConfigurationHistoryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  configurationId: string;

  @Expose()
  @ApiPropertyOptional()
  companyId: string | null;

  @Expose()
  @ApiProperty({ enum: ['created', 'updated', 'deleted', 'rollback', 'approved', 'deactivated'] })
  action: string;

  @Expose()
  @ApiProperty()
  previousVersion: number;

  @Expose()
  @ApiProperty()
  newVersion: number;

  @Expose()
  @ApiProperty()
  scope: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @ApiProperty()
  configKey: string;

  @Expose()
  @ApiPropertyOptional()
  previousValue: Record<string, any> | null;

  @Expose()
  @ApiPropertyOptional()
  newValue: Record<string, any> | null;

  @Expose()
  @ApiPropertyOptional()
  changes: Record<string, any> | null;

  @Expose()
  @ApiProperty()
  changedBy: string;

  @Expose()
  @ApiPropertyOptional()
  changeReason: string | null;

  @Expose()
  @ApiPropertyOptional()
  ipAddress: string | null;

  @Expose()
  @ApiPropertyOptional()
  userAgent: string | null;

  @Expose()
  @ApiPropertyOptional()
  metadata: Record<string, any> | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
