export class ProductSkuValueObject {
  private constructor(private readonly value: string) {}

  static create(sku: string): ProductSkuValueObject {
    const cleanSku = sku.trim().toUpperCase();
    
    if (!this.isValidSku(cleanSku)) {
      throw new Error(`SKU inválido: ${sku}`);
    }

    return new ProductSkuValueObject(cleanSku);
  }

  private static isValidSku(sku: string): boolean {
    // SKU debe tener entre 3 y 50 caracteres
    if (sku.length < 3 || sku.length > 50) return false;
    
    // Solo letras, números, guiones y guiones bajos
    const skuRegex = /^[A-Z0-9_-]+$/;
    return skuRegex.test(sku);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductSkuValueObject): boolean {
    return this.value === other.value;
  }
}