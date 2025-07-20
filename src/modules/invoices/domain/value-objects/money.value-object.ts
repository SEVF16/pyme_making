export class MoneyValueObject {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'CLP'): MoneyValueObject {
    if (amount < 0) {
      throw new Error('El monto no puede ser negativo');
    }

    if (!currency || currency.length !== 3) {
      throw new Error('Código de moneda debe tener 3 caracteres');
    }

    return new MoneyValueObject(amount, currency.toUpperCase());
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: MoneyValueObject): MoneyValueObject {
    if (this.currency !== other.currency) {
      throw new Error('No se pueden sumar montos de diferentes monedas');
    }

    return new MoneyValueObject(this.amount + other.amount, this.currency);
  }

  subtract(other: MoneyValueObject): MoneyValueObject {
    if (this.currency !== other.currency) {
      throw new Error('No se pueden restar montos de diferentes monedas');
    }

    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('El resultado no puede ser negativo');
    }

    return new MoneyValueObject(result, this.currency);
  }

  multiply(factor: number): MoneyValueObject {
    if (factor < 0) {
      throw new Error('El factor no puede ser negativo');
    }

    return new MoneyValueObject(this.amount * factor, this.currency);
  }

  applyPercentage(percentage: number): MoneyValueObject {
    return this.multiply(percentage / 100);
  }

  convertTo(exchangeRate: number, targetCurrency: string): MoneyValueObject {
    return new MoneyValueObject(this.amount * exchangeRate, targetCurrency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isGreaterThan(other: MoneyValueObject): boolean {
    if (this.currency !== other.currency) {
      throw new Error('No se pueden comparar montos de diferentes monedas');
    }

    return this.amount > other.amount;
  }

  equals(other: MoneyValueObject): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  format(): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}