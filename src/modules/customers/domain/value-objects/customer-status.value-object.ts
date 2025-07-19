export class CustomerStatusValueObject {
  private static readonly VALID_STATUSES = ['active', 'inactive', 'blocked'] as const;
  
  private constructor(private readonly value: typeof CustomerStatusValueObject.VALID_STATUSES[number]) {}

  static create(status: string): CustomerStatusValueObject {
    if (!this.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Estado de cliente inválido: ${status}`);
    }

    return new CustomerStatusValueObject(status as any);
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

  isBlocked(): boolean {
    return this.value === 'blocked';
  }

  canBeActivated(): boolean {
    return this.value !== 'blocked';
  }
}