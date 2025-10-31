import { Product } from '../entities/product.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { BaseRepositoryInterface, PaginatedResult, PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';


export abstract class ProductRepositoryAbstract implements BaseRepositoryInterface<Product> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<Product | null>;
  abstract create(entity: Partial<Product>): Promise<Product>;
  abstract update(id: string, entity: Partial<Product>): Promise<Product>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;
  abstract findAll(options?: PaginationOptions): Promise<PaginatedResult<Product>>;
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
  abstract getStockMovementsByCompany(companyId: string, options?: PaginationOptions): Promise<PaginatedResult<StockMovement>>;

 abstract getStockMovementsByProduct(
    productId: string, 
    options?: PaginationOptions
  ): Promise<PaginatedResult<StockMovement>>;

  abstract getStockMovementStats(productId: string): Promise<{
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    totalAdjustments: number;
    lastMovementDate: Date | null;
  }>;

  abstract getStockMovementsByDateRange(
    companyId: string,
    dateFrom: Date,
    dateTo: Date,
    options?: PaginationOptions
  ): Promise<PaginatedResult<StockMovement>>;

  abstract getStockMovementsByReference(
    companyId: string,
    reference: string
  ): Promise<StockMovement[]>;


}

