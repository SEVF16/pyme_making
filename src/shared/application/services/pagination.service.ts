import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult, FindOptions } from '../../domain/interfaces/repository.interface';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationDto,
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Aplicar ordenamiento
    if (options.sortField) {
      queryBuilder.orderBy(
        `${queryBuilder.alias}.${options.sortField}`,
        options.sortDirection || 'DESC'
      );
    } else {
      queryBuilder.orderBy(`${queryBuilder.alias}.createdAt`, 'DESC');
    }

    // Aplicar búsqueda si se proporciona
    if (options.search) {
      this.applySearch(queryBuilder, options.search);
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

private applySearch<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, search: string): void {
    // Esta implementación debe ser sobrescrita por cada repositorio específico
    // o se puede hacer más genérica usando metadatos de las entidades
  }

  validatePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.min(100, Math.max(1, limit || 10));
    
    return { page: validPage, limit: validLimit };
  }
}