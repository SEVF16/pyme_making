export interface ProductBusinessRules {
  canCreateProduct(sku: string, companyId: string): Promise<boolean>;
  canUpdateProduct(productId: string, companyId: string): Promise<boolean>;
  canDeleteProduct(productId: string, companyId: string): Promise<boolean>;
  canSellProduct(productId: string, quantity: number): Promise<boolean>;
  canAdjustStock(productId: string, newStock: number): Promise<boolean>;
  validateProductData(productData: any): Promise<boolean>;
  shouldReorderProduct(productId: string): Promise<boolean>;
}