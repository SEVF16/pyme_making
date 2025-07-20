import { Injectable } from '@nestjs/common';
import { ProductBusinessRules } from '../interface/product-business-rules.interface';
import { ProductRepositoryAbstract } from '../interface/product-repository.interface';


@Injectable()
export class ProductDomainService implements ProductBusinessRules {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async canCreateProduct(sku: string, companyId: string): Promise<boolean> {
    const existingProduct = await this.productRepository.findBySkuAndCompany(sku, companyId);
    return !existingProduct;
  }

  async canUpdateProduct(productId: string, companyId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    return product?.companyId === companyId && !product.isDiscontinued();
  }

  async canDeleteProduct(productId: string, companyId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    return product?.companyId === companyId;
  }

  async canSellProduct(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;
    
    return product.canSell(quantity);
  }

  async canAdjustStock(productId: string, newStock: number): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;

    // No permitir stock negativo si no está habilitado
    if (newStock < 0 && !product.allowNegativeStock) return false;

    // Verificar stock máximo
    if (product.maxStock && newStock > product.maxStock) return false;

    return true;
  }

  async validateProductData(productData: any): Promise<boolean> {
    // Validaciones de negocio específicas
    if (productData.costPrice && productData.price && productData.costPrice > productData.price) {
      return false;
    }

    if (productData.minStock && productData.maxStock && productData.minStock > productData.maxStock) {
      return false;
    }

    if (productData.stock && productData.maxStock && productData.stock > productData.maxStock) {
      return false;
    }

    return true;
  }

  async shouldReorderProduct(productId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;

    return product.isLowStock() && product.needsInventoryTracking();
  }

  async calculateProductMetrics(companyId: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
  }> {
    const totalProducts = await this.productRepository.countByCompany(companyId);
    const activeProducts = (await this.productRepository.findByStatus('active', companyId)).length;
    const lowStockProducts = (await this.productRepository.findLowStockProducts(companyId)).length;
    const outOfStockProducts = (await this.productRepository.findOutOfStockProducts(companyId)).length;
    const totalStockValue = await this.productRepository.getTotalStockValue(companyId);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
    };
  }
}