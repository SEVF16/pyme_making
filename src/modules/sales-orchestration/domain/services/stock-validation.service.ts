/**
 * StockValidationService - Domain Service
 *
 * This is a domain service that encapsulates complex validation logic
 * that doesn't naturally belong to a single entity or value object.
 *
 * Responsibilities:
 * - Validate stock availability for multiple products
 * - Check product status and saleability
 * - Enforce business rules around stock management
 */

import {
  InsufficientStockException,
  ProductInactiveException,
  ProductNotFoundException,
} from '../exceptions/sale.exceptions';
import { SaleItem } from '../value-objects/sale-item.value-object';

/**
 * Product domain model (from Product module)
 * This represents the minimal interface needed for validation
 */
export interface ProductForValidation {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: string;
  productType: string;
  allowNegativeStock: boolean;
}

export class StockValidationService {
  /**
   * Validates if a single product has sufficient stock
   */
  validateProductStock(product: ProductForValidation, requestedQuantity: number): void {
    // Physical products require stock validation
    if (product.productType === 'physical') {
      const availableStock = product.stock;

      // Check if product allows negative stock
      if (!product.allowNegativeStock && availableStock < requestedQuantity) {
        throw new InsufficientStockException(
          product.id,
          product.name,
          requestedQuantity,
          availableStock,
        );
      }
    }

    // Digital and service products don't require stock validation
    // but we still log for auditing purposes
  }

  /**
   * Validates product status
   */
  validateProductStatus(product: ProductForValidation): void {
    if (product.status !== 'active') {
      throw new ProductInactiveException(product.id, product.name);
    }
  }

  /**
   * Validates product existence
   */
  validateProductExists(
    product: ProductForValidation | null | undefined,
    productId: string,
  ): asserts product is ProductForValidation {
    if (!product) {
      throw new ProductNotFoundException(productId);
    }
  }

  /**
   * Validates stock for multiple sale items
   * This is the main orchestration method for bulk validation
   */
  validateStockForSaleItems(
    saleItems: SaleItem[],
    products: Map<string, ProductForValidation>,
  ): void {
    for (const item of saleItems) {
      const product = products.get(item.productId);

      // Validate product exists
      this.validateProductExists(product, item.productId);

      // Validate product is active
      this.validateProductStatus(product);

      // Validate stock availability
      this.validateProductStock(product, item.quantity);
    }
  }

  /**
   * Calculates total required stock per product
   * Useful when multiple items reference the same product
   */
  aggregateStockRequirements(saleItems: SaleItem[]): Map<string, number> {
    const requirements = new Map<string, number>();

    for (const item of saleItems) {
      const currentQty = requirements.get(item.productId) || 0;
      requirements.set(item.productId, currentQty + item.quantity);
    }

    return requirements;
  }

  /**
   * Validates aggregated stock requirements
   */
  validateAggregatedStock(
    stockRequirements: Map<string, number>,
    products: Map<string, ProductForValidation>,
  ): void {
    for (const [productId, requiredQty] of stockRequirements.entries()) {
      const product = products.get(productId);

      this.validateProductExists(product, productId);
      this.validateProductStatus(product);
      this.validateProductStock(product, requiredQty);
    }
  }

  /**
   * Checks if any products are low on stock (below minimum threshold)
   */
  checkLowStockWarnings(
    products: ProductForValidation[],
  ): Array<{ productId: string; currentStock: number; minStock: number }> {
    const warnings: Array<{ productId: string; currentStock: number; minStock: number }> = [];

    for (const product of products) {
      if ('minStock' in product && product.stock < (product as any).minStock) {
        warnings.push({
          productId: product.id,
          currentStock: product.stock,
          minStock: (product as any).minStock,
        });
      }
    }

    return warnings;
  }
}
