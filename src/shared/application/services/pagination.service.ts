// pagination.service.ts
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationOptions, PaginatedResult } from '../../domain/interfaces/repository.interface';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const {
      limit = 20,
      offset = 0,
      sortField = 'createdAt',
      sortDirection = 'DESC',
    } = options;

    // Aplicar ordenamiento
    const orderDirection = sortDirection.toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`${queryBuilder.alias}.${sortField}`, orderDirection);

    // Aplicar OFFSET y LIMIT
    queryBuilder.offset(offset);
    queryBuilder.limit(limit + 1); // Tomamos uno extra para verificar si hay más

    const result = await queryBuilder.getMany();

    // Verificar si hay más registros
    const hasNext = result.length > limit;
    
    // Si hay más, quitamos el registro extra
    if (hasNext) {
      result.pop();
    }

    return {
      result,
      limit,
      offset,
      hasNext,
      timestamp: new Date().toISOString(),
    };
  }
}