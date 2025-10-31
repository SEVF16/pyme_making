import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveConfigurationDto {
  @ApiProperty({
    description: 'ID del usuario que aprueba',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Comentario de aprobación',
    example: 'Configuración revisada y aprobada',
  })
  @IsOptional()
  @IsString()
  approvalComment?: string;
}
