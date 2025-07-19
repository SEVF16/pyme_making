export class CustomerTypeValueObject {
  private static readonly VALID_TYPES = ['individual', 'business'] as const;
  
  private constructor(private readonly value: typeof CustomerTypeValueObject.VALID_TYPES[number]) {}

  static create(type: string): CustomerTypeValueObject {
    if (!this.VALID_TYPES.includes(type as any)) {
      throw new Error(`Tipo de cliente inválido: ${type}`);
    }

    return new CustomerTypeValueObject(type as any);
  }

  getValue(): string {
    return this.value;
  }

  isIndividual(): boolean {
    return this.value === 'individual';
  }

  isBusiness(): boolean {
    return this.value === 'business';
  }

  requiresBusinessValidation(): boolean {
    return this.value === 'business';
  }
}