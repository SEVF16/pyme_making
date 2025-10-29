import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';
import { CreateProductUseCase } from '../use-case/create-product.use-case';
import { GetProductUseCase } from '../use-case/get-product.use-case';
import { UpdateProductUseCase } from '../use-case/update-product.use-case';
import { UpdateStockUseCase } from '../use-case/update-stock.use-case';
import { GetProductsUseCase } from '../use-case/get-products.use-case';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';
import { ProductSummaryDto } from '../dto/product-summary.dto';
import { StockMovementResponseDto } from '../dto/stock-movement-response.dto';
import { StockHistoryQueryDto } from '../dto/stock-history-query.dto';
import { StockHistoryRequestDto } from '../dto/stock-history-request.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly productRepository: ProductRepositoryAbstract,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute(createProductDto);
    return this.toResponseDto(product);
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.getProductUseCase.execute(id);
    return this.toResponseDto(product);
  }

  async getProductBySku(sku: string, companyId: string): Promise<ProductResponseDto | null> {
    const product = await this.productRepository.findBySkuAndCompany(sku, companyId);
    return product ? this.toResponseDto(product) : null;
  }

  async getProductsByCompany(companyId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findByCompany(companyId);
    return products.map(product => this.toResponseDto(product));
  }

async getProducts(queryDto: ProductQueryDto): Promise<PaginatedResponseDto<ProductResponseDto>> {
  const options: PaginationOptions = {
    limit: queryDto.limit,
    offset: queryDto.offset, 
    sortField: queryDto.sortField || 'createdAt',
    sortDirection: queryDto.sortDirection || 'DESC',
    search: queryDto.search,
    filters: {
      companyId: queryDto.companyId,
      status: queryDto.status,
      category: queryDto.category,
      brand: queryDto.brand,
      productType: queryDto.productType,
      minPrice: queryDto.minPrice,
      maxPrice: queryDto.maxPrice,
      lowStock: queryDto.lowStock,
      outOfStock: queryDto.outOfStock,
    },
  };

  const result = await this.productRepository.findAll(options);
  const products = result.result.map(product => this.toResponseDto(product));
  
  return new PaginatedResponseDto(products, options.limit || 20, options.offset);
}

  async getProductsByCategory(category: string, companyId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findByCategory(category, companyId);
    return products.map(product => this.toResponseDto(product));
  }

  async getLowStockProducts(companyId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findLowStockProducts(companyId);
    return products.map(product => this.toResponseDto(product));
  }

  async getOutOfStockProducts(companyId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findOutOfStockProducts(companyId);
    return products.map(product => this.toResponseDto(product));
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.updateProductUseCase.execute(id, updateProductDto);
    return this.toResponseDto(product);
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<ProductResponseDto> {
    const product = await this.updateStockUseCase.execute(id, updateStockDto);
    return this.toResponseDto(product);
  }

  async deleteProduct(id: string): Promise<void> {
    if (this.productRepository.softDelete) {
      await this.productRepository.softDelete(id);
    } else {
      await this.productRepository.delete(id);
    }
  }

  async searchProducts(query: string, companyId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.searchProducts(query, companyId);
    return products.map(product => this.toResponseDto(product));
  }

  async getProductsByBarcode(barcode: string, companyId: string): Promise<ProductResponseDto | null> {
    const product = await this.productRepository.findByBarcode(barcode, companyId);
    return product ? this.toResponseDto(product) : null;
  }
  /**
   * Obtiene el historial de movimientos de stock de un producto específico
   */
  async getProductStockHistory(
    productId: string, 
    requestDto: StockHistoryRequestDto
  ): Promise<PaginatedResponseDto<StockMovementResponseDto>> {
    // Verificar que el producto existe
    await this.getProductUseCase.execute(productId);

    const options: PaginationOptions = {
      limit: requestDto.limit,
      offset: requestDto.offset,
      sortField: requestDto.sortField || 'createdAt',
      sortDirection: requestDto.sortDirection || 'DESC',
      filters: {
        productId,
        movementType: requestDto.movementType,
        dateFrom: requestDto.dateFrom,
        dateTo: requestDto.dateTo,
        userId: requestDto.userId,
        reference: requestDto.reference,
        includeProduct: requestDto.includeProduct,
      },
    };

    const result = await this.productRepository.getStockMovementsByProduct(productId, options);
    const movements = result.result.map(movement => this.toStockMovementResponseDto(movement));
    
    return new PaginatedResponseDto(
      movements, 
      options.limit || 20, 
      options.offset || 0
    );
  }

  /**
   * Obtiene todos los movimientos de stock de la empresa
   */
  async getCompanyStockMovements(
    companyId: string,
    requestDto: StockHistoryRequestDto
  ): Promise<PaginatedResponseDto<StockMovementResponseDto>> {
    const options: PaginationOptions = {
      limit: requestDto.limit,
      offset: requestDto.offset,
      sortField: requestDto.sortField || 'createdAt',
      sortDirection: requestDto.sortDirection || 'DESC',
      filters: {
        companyId,
        movementType: requestDto.movementType,
        dateFrom: requestDto.dateFrom,
        dateTo: requestDto.dateTo,
        userId: requestDto.userId,
        reference: requestDto.reference,
        includeProduct: requestDto.includeProduct,
      },
    };

    const result = await this.productRepository.getStockMovementsByCompany(companyId, options);
    const movements = result.result.map(movement => this.toStockMovementResponseDto(movement));
    
    return new PaginatedResponseDto(
      movements, 
      options.limit || 20, 
      options.offset || 0
    );
  }

  /**
   * Obtiene un resumen del historial de stock de un producto
   */
  async getProductStockSummary(productId: string): Promise<{
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    totalAdjustments: number;
    lastMovement?: StockMovementResponseDto;
    currentStock: number;
  }> {
    // Verificar que el producto existe
    const product = await this.getProductUseCase.execute(productId);

    const movements = await this.productRepository.getStockMovements(productId);
    
    const summary = {
      totalMovements: movements.length,
      totalIn: movements.filter(m => m.movementType === 'in').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
      totalOut: movements.filter(m => m.movementType === 'out').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
      totalAdjustments: movements.filter(m => m.movementType === 'adjustment').length,
      lastMovement: movements.length > 0 ? this.toStockMovementResponseDto(movements[0]) : undefined,
      currentStock: product.stock,
    };

    return summary;
  }

  /**
   * Obtiene el último movimiento de stock de un producto
   */
  async getLastStockMovement(productId: string): Promise<StockMovementResponseDto | null> {
    const movements = await this.productRepository.getStockMovements(productId);
    return movements.length > 0 ? this.toStockMovementResponseDto(movements[0]) : null;
  }

  /**
   * Convierte StockMovement entity a StockMovementResponseDto
   */
  private toStockMovementResponseDto(movement: any): StockMovementResponseDto {
    return {
      id: movement.id,
      productId: movement.productId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      reason: movement.reason,
      reference: movement.reference,
      userId: movement.userId,
      unitCost: movement.unitCost,
      totalCost: movement.totalCost,
      createdAt: movement.createdAt,
      product: movement.product ? {
        sku: movement.product.sku,
        name: movement.product.name,
        category: movement.product.category,
      } : undefined,
    };
  }
  private toResponseDto(product: any): ProductResponseDto {
    const profitMargin = product.costPrice 
      ? ((product.price - product.costPrice) / product.price) * 100 
      : 0;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      profitMargin: Number(profitMargin.toFixed(2)),
      category: product.category,
      brand: product.brand,
      productType: product.productType,
      status: product.status,
      unit: product.unit,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      isLowStock: product.stock <= product.minStock,
      isOutOfStock: product.stock <= 0,
      weight: product.weight,
      dimensions: product.dimensions,
      images: product.images,
      barcode: product.barcode,
      isActive: product.isActive,
      allowNegativeStock: product.allowNegativeStock,
      companyId: product.companyId,
      tags: product.tags,
      additionalInfo: product.additionalInfo,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

    async getProductsSummary(queryDto: ProductQueryDto): Promise<PaginatedResponseDto<ProductSummaryDto>> {
    const options: PaginationOptions = {
      limit: queryDto.limit,
      offset: queryDto.offset, 
      sortField: queryDto.sortField || 'createdAt',
      sortDirection: queryDto.sortDirection || 'DESC',
      search: queryDto.search,
      filters: {
        companyId: queryDto.companyId,
        status: queryDto.status,
        category: queryDto.category,
        brand: queryDto.brand,
        productType: queryDto.productType,
        minPrice: queryDto.minPrice,
        maxPrice: queryDto.maxPrice,
        lowStock: queryDto.lowStock,
        outOfStock: queryDto.outOfStock,
      },
    };

    const result = await this.productRepository.findAll(options);
    const productsSummary = result.result.map(product => this.toSummaryDto(product));
    
    return new PaginatedResponseDto(
      productsSummary, 
      options.limit || 20, 
      options.offset,

    );
  }

    private toSummaryDto(product: any): ProductSummaryDto {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      status: product.status,
      price: product.price,
      stock: product.stock,
    };
  }
async getStockMovementsByReference(
  companyId: string,
  reference: string
): Promise<StockMovementResponseDto[]> {
  const movements = await this.productRepository.getStockMovementsByReference(companyId, reference);
  return movements.map(movement => this.toStockMovementResponseDto(movement));
}
}