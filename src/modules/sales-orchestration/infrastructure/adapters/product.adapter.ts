/**
 * ProductAdapter - Infrastructure Layer
 *
 * Adapts the Product module's service to the interface expected by the domain layer.
 * This follows the Dependency Inversion Principle and Hexagonal Architecture.
 */

import { Injectable } from '@nestjs/common';
import { IProductService } from '../../application/use-cases/process-sale.use-case';
import { ProductService } from '../../../product/application/services/product.service';

@Injectable()
export class ProductAdapter implements IProductService {
  constructor(private readonly productService: ProductService) {}

  async findByIds(productIds: string[]): Promise<any[]> {
    // Fetch products by ID
    const products = await Promise.all(
      productIds.map(async (id) => {
        try {
          const product = await this.productService.getProductById(id);
          return product;
        } catch (error) {
          // If product not found, return null
          return null;
        }
      }),
    );

    // Filter out nulls and return valid products
    return products.filter((p) => p !== null);
  }

  async updateStock(
    productId: string,
    quantity: number,
    reason: string,
    reference: string,
  ): Promise<any> {
    // Use the product service's updateStock method
    const result = await this.productService.updateStock(productId, {
      quantity,
      movementType: quantity < 0 ? 'out' : 'in',
      reason,
      reference,
    });

    return result;
  }
}
