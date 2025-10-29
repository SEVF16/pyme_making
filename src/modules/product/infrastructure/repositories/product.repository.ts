import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../domain/entities/product.entity';
import { StockMovement } from '../../domain/entities/stock-movement.entity';

import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository'; // *** USANDO SHARED ***
import { PaginationService } from '../../../../shared/application/services/pagination.service'; // *** USANDO SHARED ***
import {  PaginatedResult, PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';

@Injectable()
export class ProductRepository extends BaseRepository<Product> implements ProductRepositoryAbstract {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    paginationService: PaginationService,
  ) {
    super(productRepository, paginationService);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { sku } });
  }

  async findBySkuAndCompany(sku: string, companyId: string): Promise<Product | null> {
    return await this.productRepository.findOne({ 
      where: { sku, companyId } 
    });
  }

  async findByCompany(companyId: string): Promise<Product[]> {
    return await this.productRepository.find({ 
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByCategory(category: string, companyId: string): Promise<Product[]> {
    return await this.productRepository.find({ 
      where: { category, companyId, status: 'active' },
      order: { name: 'ASC' }
    });
  }

  async findByBrand(brand: string, companyId: string): Promise<Product[]> {
    return await this.productRepository.find({ 
      where: { brand, companyId, status: 'active' },
      order: { name: 'ASC' }
    });
  }

  async findByStatus(status: string, companyId: string): Promise<Product[]> {
    return await this.productRepository.find({ 
      where: { status: status as any, companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByBarcode(barcode: string, companyId: string): Promise<Product | null> {
    return await this.productRepository.findOne({ 
      where: { barcode, companyId } 
    });
  }
protected applySearch(queryBuilder: SelectQueryBuilder<Product>, search: string): void {
  queryBuilder.andWhere(
    '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
    { search: `%${search}%` }
  );
}
  async findLowStockProducts(companyId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('product.stock <= product.minStock')
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere('product.productType = :productType', { productType: 'physical' })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async findOutOfStockProducts(companyId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('product.stock <= 0')
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere('product.productType = :productType', { productType: 'physical' })
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async findByPriceRange(minPrice: number, maxPrice: number, companyId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('product.price >= :minPrice', { minPrice })
      .andWhere('product.price <= :maxPrice', { maxPrice })
      .andWhere('product.status = :status', { status: 'active' })
      .orderBy('product.price', 'ASC')
      .getMany();
  }

  async findByTags(tags: string[], companyId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('product.tags && :tags', { tags })
      .andWhere('product.status = :status', { status: 'active' })
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async searchProducts(query: string, companyId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.companyId = :companyId', { companyId })
      .andWhere(`(
        LOWER(product.name) LIKE LOWER(:query) OR 
        LOWER(product.description) LIKE LOWER(:query) OR 
        LOWER(product.sku) LIKE LOWER(:query) OR 
        LOWER(product.barcode) LIKE LOWER(:query) OR
        LOWER(product.category) LIKE LOWER(:query) OR
        LOWER(product.brand) LIKE LOWER(:query)
      )`, { query: `%${query}%` })
      .orderBy('product.name', 'ASC')
      .getMany();
  }

  async countByCompany(companyId: string): Promise<number> {
    return await this.productRepository.count({ where: { companyId } });
  }

  async countByCategory(category: string, companyId: string): Promise<number> {
    return await this.productRepository.count({ 
      where: { category, companyId } 
    });
  }

  async getTotalStockValue(companyId: string): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.stock * COALESCE(product.costPrice, product.price))', 'totalValue')
      .where('product.companyId = :companyId', { companyId })
      .andWhere('product.productType = :productType', { productType: 'physical' })
      .getRawOne();
    
    return parseFloat(result.totalValue) || 0;
  }

  // Métodos para movimientos de stock
  async createStockMovement(movement: Partial<StockMovement>): Promise<StockMovement> {
    const stockMovement = this.stockMovementRepository.create(movement);
    return await this.stockMovementRepository.save(stockMovement);
  }

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' }
    });
  }

  protected getAlias(): string {
    return 'product';
  }

  protected applyFilters(queryBuilder: SelectQueryBuilder<Product>, filters: any): void {
    if (filters.companyId) {
      queryBuilder.andWhere('product.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.status) {
      queryBuilder.andWhere('product.status = :status', { status: filters.status });
    }

    if (filters.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters.brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand: filters.brand });
    }

    if (filters.productType) {
      queryBuilder.andWhere('product.productType = :productType', { productType: filters.productType });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.lowStock) {
      queryBuilder.andWhere('product.stock <= product.minStock');
    }

    if (filters.outOfStock) {
      queryBuilder.andWhere('product.stock <= 0');
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('product.tags && :tags', { tags: filters.tags });
    }

    if (filters.search) {
      queryBuilder.andWhere(`(
        product.name ILIKE :search OR 
        product.description ILIKE :search OR 
        product.sku ILIKE :search OR 
        product.barcode ILIKE :search OR
        product.category ILIKE :search OR
        product.brand ILIKE :search
      )`, { search: `%${filters.search}%` });
    }
  }

/**
 * Obtiene movimientos de stock de un producto con filtros y paginación
 */
async getStockMovementsByProduct(
  productId: string, 
  options?: PaginationOptions
): Promise<PaginatedResult<StockMovement>> {
  const queryBuilder = this.stockMovementRepository
    .createQueryBuilder('movement')
    .where('movement.productId = :productId', { productId });

  // Incluir información del producto si se solicita
  if (options?.filters?.includeProduct) {
    queryBuilder.leftJoinAndSelect('movement.product', 'product');
  }

  // Aplicar filtros
  this.applyStockMovementFilters(queryBuilder, options?.filters || {});

  return await this.paginationService.paginate(queryBuilder, {
    limit: options?.limit,
    offset: options?.offset,
    sortField: options?.sortField || 'createdAt',
    sortDirection: options?.sortDirection || 'DESC',
  });
}

/**
 * Versión extendida que incluye filtros avanzados para movimientos por empresa
 */
async getStockMovementsByCompany(
  companyId: string, 
  options?: PaginationOptions
): Promise<PaginatedResult<StockMovement>> {
  const queryBuilder = this.stockMovementRepository
    .createQueryBuilder('movement')
    .leftJoinAndSelect('movement.product', 'product')
    .where('product.companyId = :companyId', { companyId });

  // Aplicar filtros
  this.applyStockMovementFilters(queryBuilder, options?.filters || {});

  return await this.paginationService.paginate(queryBuilder, {
    limit: options?.limit,
    offset: options?.offset,
    sortField: options?.sortField || 'createdAt',
    sortDirection: options?.sortDirection || 'DESC',
  });
}

/**
 * Obtiene estadísticas de movimientos por producto
 */
async getStockMovementStats(productId: string): Promise<{
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  totalAdjustments: number;
  lastMovementDate: Date | null;
}> {
  const result = await this.stockMovementRepository
    .createQueryBuilder('movement')
    .select([
      'COUNT(*) as totalMovements',
      'SUM(CASE WHEN movement.movementType = \'in\' THEN ABS(movement.quantity) ELSE 0 END) as totalIn',
      'SUM(CASE WHEN movement.movementType = \'out\' THEN ABS(movement.quantity) ELSE 0 END) as totalOut',
      'SUM(CASE WHEN movement.movementType = \'adjustment\' THEN 1 ELSE 0 END) as totalAdjustments',
      'MAX(movement.createdAt) as lastMovementDate'
    ])
    .where('movement.productId = :productId', { productId })
    .getRawOne();

  return {
    totalMovements: parseInt(result.totalMovements) || 0,
    totalIn: parseFloat(result.totalIn) || 0,
    totalOut: parseFloat(result.totalOut) || 0,
    totalAdjustments: parseInt(result.totalAdjustments) || 0,
    lastMovementDate: result.lastMovementDate || null,
  };
}

/**
 * Obtiene movimientos de stock por rango de fechas
 */
async getStockMovementsByDateRange(
  companyId: string,
  dateFrom: Date,
  dateTo: Date,
  options?: PaginationOptions
): Promise<PaginatedResult<StockMovement>> {
  const queryBuilder = this.stockMovementRepository
    .createQueryBuilder('movement')
    .leftJoinAndSelect('movement.product', 'product')
    .where('product.companyId = :companyId', { companyId })
    .andWhere('movement.createdAt >= :dateFrom', { dateFrom })
    .andWhere('movement.createdAt <= :dateTo', { dateTo });

  // Aplicar filtros adicionales
  this.applyStockMovementFilters(queryBuilder, options?.filters || {});

  return await this.paginationService.paginate(queryBuilder, {
    limit: options?.limit,
    offset: options?.offset,
    sortField: options?.sortField || 'createdAt',
    sortDirection: options?.sortDirection || 'DESC',
  });
}

/**
 * Busca movimientos por referencia de documento
 */
async getStockMovementsByReference(
  companyId: string,
  reference: string
): Promise<StockMovement[]> {
  return await this.stockMovementRepository
    .createQueryBuilder('movement')
    .leftJoinAndSelect('movement.product', 'product')
    .where('product.companyId = :companyId', { companyId })
    .andWhere('movement.reference ILIKE :reference', { reference: `%${reference}%` })
    .orderBy('movement.createdAt', 'DESC')
    .getMany();
}

/**
 * Aplica filtros avanzados a las consultas de movimientos de stock
 */
private applyStockMovementFilters(queryBuilder: any, filters: any): void {
  if (filters.movementType) {
    queryBuilder.andWhere('movement.movementType = :movementType', { 
      movementType: filters.movementType 
    });
  }

  if (filters.dateFrom) {
    queryBuilder.andWhere('movement.createdAt >= :dateFrom', { 
      dateFrom: new Date(filters.dateFrom) 
    });
  }

  if (filters.dateTo) {
    queryBuilder.andWhere('movement.createdAt <= :dateTo', { 
      dateTo: new Date(filters.dateTo) 
    });
  }

  if (filters.userId) {
    queryBuilder.andWhere('movement.userId = :userId', { 
      userId: filters.userId 
    });
  }

  if (filters.reference) {
    queryBuilder.andWhere('movement.reference ILIKE :reference', { 
      reference: `%${filters.reference}%` 
    });
  }

  if (filters.minQuantity) {
    queryBuilder.andWhere('ABS(movement.quantity) >= :minQuantity', { 
      minQuantity: filters.minQuantity 
    });
  }

  if (filters.maxQuantity) {
    queryBuilder.andWhere('ABS(movement.quantity) <= :maxQuantity', { 
      maxQuantity: filters.maxQuantity 
    });
  }
}

}