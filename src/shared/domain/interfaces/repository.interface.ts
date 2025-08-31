// AGREGAR estas interfaces al inicio del archivo:
export interface PaginationOptions {
  limit?: number;
  offset?: number; 
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  hasNext: boolean;
  offset?: number; 
  limit: number;
  currentCursor?: string;
  timestamp: string;
}

// CAMBIAR la interface BaseRepositoryInterface:
export interface BaseRepositoryInterface<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>; // ← CAMBIO AQUÍ
  create(entity: Partial<T>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete?(id: string): Promise<void>;
}
