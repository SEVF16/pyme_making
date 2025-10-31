/**
 * Domain Exceptions for Sales Orchestration
 *
 * These exceptions represent domain-level business rule violations
 * following DDD principles. They are framework-agnostic and belong
 * to the domain layer.
 */

export class SaleDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaleDomainException';
  }
}

export class InsufficientStockException extends SaleDomainException {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(
      `Insufficient stock for product "${productName}". Requested: ${requested}, Available: ${available}`,
    );
    this.name = 'InsufficientStockException';
  }
}

export class ProductNotFoundException extends SaleDomainException {
  constructor(public readonly productId: string) {
    super(`Product with ID "${productId}" not found`);
    this.name = 'ProductNotFoundException';
  }
}

export class ProductInactiveException extends SaleDomainException {
  constructor(public readonly productId: string, public readonly productName: string) {
    super(`Product "${productName}" is not active and cannot be sold`);
    this.name = 'ProductInactiveException';
  }
}

export class PriceValidationException extends SaleDomainException {
  constructor(
    public readonly productId: string,
    public readonly expectedPrice: number,
    public readonly actualPrice: number,
  ) {
    super(
      `Price mismatch for product "${productId}". Expected: ${expectedPrice}, Actual: ${actualPrice}`,
    );
    this.name = 'PriceValidationException';
  }
}

export class InvalidSaleStateException extends SaleDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaleStateException';
  }
}

export class StockReservationException extends SaleDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'StockReservationException';
  }
}

export class SaleProcessingException extends SaleDomainException {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'SaleProcessingException';
  }
}
