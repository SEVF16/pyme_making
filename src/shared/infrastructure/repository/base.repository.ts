import { BaseRepositoryInterface, FindOptions, PaginatedResult } from 'src/shared/domain/interfaces/repository.interface';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationService } from '../../application/services/pagination.service';


export abstract class BaseRepository<T extends ObjectLiteral> implements BaseRepositoryInterface<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly paginationService: PaginationService,
  ) {}

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findAll(options?: FindOptions): Promise<PaginatedResult<T>> {
    const queryBuilder = this.repository.createQueryBuilder(this.getAlias());
    
    if (options?.filters) {
      this.applyFilters(queryBuilder, options.filters);
    }

    return await this.paginationService.paginate(queryBuilder, {
      page: options?.pagination?.page,
      limit: options?.pagination?.limit,
      sortField: options?.sort?.field,
      sortDirection: options?.sort?.direction,
      search: options?.search,
    });
  }

 async create(entityData: Partial<T>): Promise<T> {
    const entity = this.repository.create(entityData as T);
    return await this.repository.save(entity) as unknown as T;
  }

  async update(id: string, entityData: Partial<T>): Promise<T> {
    await this.repository.update(id, entityData as any);
    const updatedEntity = await this.findById(id);
    
    if (!updatedEntity) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }
    
    return updatedEntity;
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.repository.softDelete(id);
    
    if (result.affected === 0) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }
  }

  protected abstract getAlias(): string;
  protected abstract applyFilters(queryBuilder: SelectQueryBuilder<T>, filters: any): void;
}