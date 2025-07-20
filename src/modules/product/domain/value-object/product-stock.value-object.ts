export class ProductStockValueObject {
  private constructor(
    private readonly stock: number,
    private readonly minStock: number,
    private readonly maxStock?: number,
    private readonly allowNegative: boolean = false
  ) {}

  static create(
    stock: number, 
    minStock: number, 
    maxStock?: number, 
    allowNegative: boolean = false
  ): ProductStockValueObject {
    if (!allowNegative && stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    if (minStock < 0) {
      throw new Error('El stock mínimo no puede ser negativo');
    }

    if (maxStock !== undefined && maxStock < 0) {
      throw new Error('El stock máximo no puede ser negativo');
    }

    if (maxStock !== undefined && minStock > maxStock) {
      throw new Error('El stock mínimo no puede ser mayor al stock máximo');
    }

    if (maxStock !== undefined && stock > maxStock) {
      throw new Error('El stock actual no puede exceder el stock máximo');
    }

    return new ProductStockValueObject(stock, minStock, maxStock, allowNegative);
  }

  getStock(): number {
    return this.stock;
  }

  getMinStock(): number {
    return this.minStock;
  }

  getMaxStock(): number | undefined {
    return this.maxStock;
  }

  isAllowNegative(): boolean {
    return this.allowNegative;
  }

  isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  isOutOfStock(): boolean {
    return this.stock <= 0;
  }

  canReduce(quantity: number): boolean {
    if (this.allowNegative) return true;
    return this.stock >= quantity;
  }

  canIncrease(quantity: number): boolean {
    if (!this.maxStock) return true;
    return (this.stock + quantity) <= this.maxStock;
  }

  getAvailableSpace(): number | null {
    if (!this.maxStock) return null;
    return this.maxStock - this.stock;
  }

  getStockStatus(): 'critical' | 'low' | 'normal' | 'high' {
    if (this.isOutOfStock()) return 'critical';
    if (this.isLowStock()) return 'low';
    if (this.maxStock && this.stock > (this.maxStock * 0.8)) return 'high';
    return 'normal';
  }
}