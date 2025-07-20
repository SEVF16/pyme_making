import { Product } from '../entities/product.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { BaseRepositoryInterface, FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

export interface FindProductsOptions extends FindOptions {
  companyId?: string;
  status?: string;
  category?: string;
  brand?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
  tags?: string[];
}

export abstract class ProductRepositoryAbstract implements BaseRepositoryInterface<Product> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<Product | null>;
  abstract findAll(options?: FindOptions): Promise<PaginatedResult<Product>>;
  abstract create(entity: Partial<Product>): Promise<Product>;
  abstract update(id: string, entity: Partial<Product>): Promise<Product>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;

  // Métodos específicos de Product
  abstract findBySku(sku: string): Promise<Product | null>;
  abstract findBySkuAndCompany(sku: string, companyId: string): Promise<Product | null>;
  abstract findByCompany(companyId: string): Promise<Product[]>;
  abstract findByCategory(category: string, companyId: string): Promise<Product[]>;
  abstract findByBrand(brand: string, companyId: string): Promise<Product[]>;
  abstract findByStatus(status: string, companyId: string): Promise<Product[]>;
  abstract findByBarcode(barcode: string, companyId: string): Promise<Product | null>;
  abstract findLowStockProducts(companyId: string): Promise<Product[]>;
  abstract findOutOfStockProducts(companyId: string): Promise<Product[]>;
  abstract findByPriceRange(minPrice: number, maxPrice: number, companyId: string): Promise<Product[]>;
  abstract findByTags(tags: string[], companyId: string): Promise<Product[]>;
  abstract searchProducts(query: string, companyId: string): Promise<Product[]>;
  abstract countByCompany(companyId: string): Promise<number>;
  abstract countByCategory(category: string, companyId: string): Promise<number>;
  abstract getTotalStockValue(companyId: string): Promise<number>;

  // Métodos para movimientos de stock
  abstract createStockMovement(movement: Partial<StockMovement>): Promise<StockMovement>;
  abstract getStockMovements(productId: string): Promise<StockMovement[]>;
  abstract getStockMovementsByCompany(companyId: string, options?: FindOptions): Promise<PaginatedResult<StockMovement>>;
}