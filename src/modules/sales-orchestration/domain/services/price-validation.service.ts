/**
 * PriceValidationService - Domain Service
 *
 * Ensures price consistency between sale items and product catalog.
 * Enforces business rules around pricing.
 */

import { PriceValidationException } from '../exceptions/sale.exceptions';
import { SaleItem } from '../value-objects/sale-item.value-object';
import { ProductForValidation } from './stock-validation.service';

export interface PriceValidationOptions {
  allowPriceOverride?: boolean;
  maxPriceVariancePercentage?: number;
  strictMode?: boolean;
}

export class PriceValidationService {
  private readonly defaultOptions: PriceValidationOptions = {
    allowPriceOverride: false,
    maxPriceVariancePercentage: 0,
    strictMode: true,
  };

  /**
   * Validates that the sale item price matches the product catalog price
   */
  validatePrice(
    saleItem: SaleItem,
    product: ProductForValidation & { price: number },
    options?: PriceValidationOptions,
  ): void {
    const opts = { ...this.defaultOptions, ...options };

    if (opts.strictMode && !opts.allowPriceOverride) {
      // Strict mode: prices must match exactly
      const itemPrice = Number(saleItem.unitPrice);
      const catalogPrice = Number(product.price);

      if (itemPrice !== catalogPrice) {
        throw new PriceValidationException(
          product.id,
          saleItem.unitPrice,
          product.price,
        );
      }
    } else if (opts.maxPriceVariancePercentage !== undefined) {
      // Allow variance within percentage
      const itemPrice = Number(saleItem.unitPrice);
      const catalogPrice = Number(product.price);
      const variance = Math.abs(itemPrice - catalogPrice) / catalogPrice;
      const variancePercentage = variance * 100;

      if (variancePercentage > opts.maxPriceVariancePercentage) {
        throw new PriceValidationException(
          product.id,
          saleItem.unitPrice,
          product.price,
        );
      }
    }
  }

  /**
   * Validates prices for multiple sale items
   */
  validatePricesForSaleItems(
    saleItems: SaleItem[],
    products: Map<string, ProductForValidation & { price: number }>,
    options?: PriceValidationOptions,
  ): void {
    for (const item of saleItems) {
      const product = products.get(item.productId);
      if (product) {
        this.validatePrice(item, product, options);
      }
    }
  }

  /**
   * Calculates expected total based on catalog prices
   */
  calculateExpectedTotal(
    saleItems: SaleItem[],
    products: Map<string, ProductForValidation & { price: number }>,
  ): number {
    return saleItems.reduce((total, item) => {
      const product = products.get(item.productId);
      if (!product) return total;

      const subtotal = item.quantity * product.price;
      const discount = subtotal * (item.discountPercentage / 100);
      const taxable = subtotal - discount;
      const tax = taxable * (item.taxPercentage / 100);

      return total + taxable + tax;
    }, 0);
  }

  /**
   * Validates that the sale total matches expected calculations
   */
  validateSaleTotal(
    actualTotal: number,
    expectedTotal: number,
    tolerance: number = 0.01,
  ): boolean {
    return Math.abs(actualTotal - expectedTotal) <= tolerance;
  }
}
