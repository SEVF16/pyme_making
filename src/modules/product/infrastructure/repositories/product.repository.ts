import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../domain/entities/product.entity';
import { StockMovement } from '../../domain/entities/stock-movement.entity';

import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository'; // *** USANDO SHARED ***
import { PaginationService } from '../../../../shared/application/services/pagination.service'; // *** USANDO SHARED ***
import { FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';
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

  async getStockMovementsByCompany(companyId: string, options?: FindOptions): Promise<PaginatedResult<StockMovement>> {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .where('product.companyId = :companyId', { companyId });

    return await this.paginationService.paginate(queryBuilder, {
      page: options?.pagination?.page,
      limit: options?.pagination?.limit,
      sortField: options?.sort?.field || 'createdAt',
      sortDirection: options?.sort?.direction || 'DESC',
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
}