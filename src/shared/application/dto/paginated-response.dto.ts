import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  result: T[];

  @ApiProperty({ description: 'Hay más elementos disponibles' })
  hasNext: boolean;

  @ApiProperty({ description: 'Desplazamiento actual', required: true })
  offset: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;

  constructor(result: T[], limit: number, offset: number = 0) {
    const hasMoreItems = result.length > limit;
    
    this.result = hasMoreItems ? result.slice(0, limit) : result;
    this.hasNext = hasMoreItems;
    this.limit = limit;
    this.offset = offset;
    this.timestamp = new Date().toISOString();
  }
}