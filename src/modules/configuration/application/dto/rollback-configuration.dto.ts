import { IsInt, Min, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RollbackConfigurationDto {
  @ApiProperty({
    description: 'Versión objetivo para el rollback',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  targetVersion: number;

  @ApiProperty({
    description: 'ID del usuario que realiza el rollback',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  rolledBackBy: string;

  @ApiPropertyOptional({
    description: 'Motivo del rollback',
    example: 'Revertir cambios por error en configuración',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
