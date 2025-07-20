export class ProductPriceValueObject {
  private constructor(
    private readonly price: number,
    private readonly costPrice?: number
  ) {}

  static create(price: number, costPrice?: number): ProductPriceValueObject {
    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (costPrice !== undefined && costPrice < 0) {
      throw new Error('El precio de costo no puede ser negativo');
    }

    if (costPrice !== undefined && costPrice > price) {
      throw new Error('El precio de costo no puede ser mayor al precio de venta');
    }

    return new ProductPriceValueObject(price, costPrice);
  }

  getPrice(): number {
    return this.price;
  }

  getCostPrice(): number | undefined {
    return this.costPrice;
  }

  getProfitMargin(): number {
    if (!this.costPrice || this.costPrice === 0) return 0;
    return ((this.price - this.costPrice) / this.price) * 100;
  }

  getProfitAmount(): number {
    if (!this.costPrice) return 0;
    return this.price - this.costPrice;
  }

  hasCostPrice(): boolean {
    return this.costPrice !== undefined && this.costPrice > 0;
  }

  isProfitable(): boolean {
    return this.hasCostPrice() && this.price > this.costPrice!;
  }
}