import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ description: 'Hay más elementos disponibles' })
  hasNext: boolean;

  @ApiProperty({ description: 'Desplazamiento actual', required: true })
  offset: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;

  constructor(data: T[], limit: number, offset: number = 0) {
    const hasMoreItems = data.length > limit;
    
    this.data = hasMoreItems ? data.slice(0, limit) : data;
    this.hasNext = hasMoreItems;
    this.limit = limit;
    this.offset = offset;
    this.timestamp = new Date().toISOString();
  }
}