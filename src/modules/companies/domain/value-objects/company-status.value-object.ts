export class CompanyStatusValueObject {
  private static readonly VALID_STATUSES = ['active', 'inactive', 'suspended'] as const;
  
  private constructor(private readonly value: typeof CompanyStatusValueObject.VALID_STATUSES[number]) {}

  static create(status: string): CompanyStatusValueObject {
    if (!this.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Estado de empresa inválido: ${status}`);
    }
    return new CompanyStatusValueObject(status as any);
  }

  getValue(): string {
    return this.value;
  }

  isActive(): boolean {
    return this.value === 'active';
  }

  canOperate(): boolean {
    return this.value === 'active';
  }
}