export class ProductTypeValueObject {
  private static readonly VALID_TYPES = ['physical', 'digital', 'service'] as const;
  
  private constructor(private readonly value: typeof ProductTypeValueObject.VALID_TYPES[number]) {}

  static create(type: string): ProductTypeValueObject {
    if (!this.VALID_TYPES.includes(type as any)) {
      throw new Error(`Tipo de producto inválido: ${type}`);
    }

    return new ProductTypeValueObject(type as any);
  }

  getValue(): string {
    return this.value;
  }

  isPhysical(): boolean {
    return this.value === 'physical';
  }

  isDigital(): boolean {
    return this.value === 'digital';
  }

  isService(): boolean {
    return this.value === 'service';
  }

  needsInventoryTracking(): boolean {
    return this.value === 'physical';
  }

  needsShipping(): boolean {
    return this.value === 'physical';
  }

  isInstantDelivery(): boolean {
    return this.value === 'digital';
  }

  allowsStockManagement(): boolean {
    return this.value === 'physical';
  }
}