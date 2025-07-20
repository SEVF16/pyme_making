export class ProductStatusValueObject {
  private static readonly VALID_STATUSES = ['active', 'inactive', 'discontinued'] as const;
  
  private constructor(private readonly value: typeof ProductStatusValueObject.VALID_STATUSES[number]) {}

  static create(status: string): ProductStatusValueObject {
    if (!this.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Estado de producto inválido: ${status}`);
    }

    return new ProductStatusValueObject(status as any);
  }

  getValue(): string {
    return this.value;
  }

  isActive(): boolean {
    return this.value === 'active';
  }

  isInactive(): boolean {
    return this.value === 'inactive';
  }

  isDiscontinued(): boolean {
    return this.value === 'discontinued';
  }

  canSell(): boolean {
    return this.value === 'active';
  }

  canEdit(): boolean {
    return this.value !== 'discontinued';
  }

  canReactivate(): boolean {
    return this.value === 'inactive';
  }
}