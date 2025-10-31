/**
 * SaleStatus Value Object
 *
 * Represents the lifecycle status of a sale transaction.
 * Enforces valid state transitions according to business rules.
 */

export enum SaleStatusEnum {
  PENDING = 'pending', // Sale initiated, stock reserved
  VALIDATED = 'validated', // Products and stock validated
  INVOICE_CREATED = 'invoice_created', // Invoice generated
  STOCK_DEDUCTED = 'stock_deducted', // Stock successfully reduced
  COMPLETED = 'completed', // Sale fully processed
  FAILED = 'failed', // Sale processing failed
  COMPENSATING = 'compensating', // Rollback in progress
  COMPENSATED = 'compensated', // Rollback completed
}

export class SaleStatus {
  private constructor(private readonly status: SaleStatusEnum) {}

  static pending(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.PENDING);
  }

  static validated(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.VALIDATED);
  }

  static invoiceCreated(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.INVOICE_CREATED);
  }

  static stockDeducted(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.STOCK_DEDUCTED);
  }

  static completed(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.COMPLETED);
  }

  static failed(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.FAILED);
  }

  static compensating(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.COMPENSATING);
  }

  static compensated(): SaleStatus {
    return new SaleStatus(SaleStatusEnum.COMPENSATED);
  }

  getValue(): SaleStatusEnum {
    return this.status;
  }

  isPending(): boolean {
    return this.status === SaleStatusEnum.PENDING;
  }

  isValidated(): boolean {
    return this.status === SaleStatusEnum.VALIDATED;
  }

  isInvoiceCreated(): boolean {
    return this.status === SaleStatusEnum.INVOICE_CREATED;
  }

  isStockDeducted(): boolean {
    return this.status === SaleStatusEnum.STOCK_DEDUCTED;
  }

  isCompleted(): boolean {
    return this.status === SaleStatusEnum.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === SaleStatusEnum.FAILED;
  }

  isCompensating(): boolean {
    return this.status === SaleStatusEnum.COMPENSATING;
  }

  isCompensated(): boolean {
    return this.status === SaleStatusEnum.COMPENSATED;
  }

  /**
   * Validates if transition to new status is allowed
   */
  canTransitionTo(newStatus: SaleStatus): boolean {
    const validTransitions: Record<SaleStatusEnum, SaleStatusEnum[]> = {
      [SaleStatusEnum.PENDING]: [SaleStatusEnum.VALIDATED, SaleStatusEnum.FAILED],
      [SaleStatusEnum.VALIDATED]: [
        SaleStatusEnum.INVOICE_CREATED,
        SaleStatusEnum.FAILED,
        SaleStatusEnum.COMPENSATING,
      ],
      [SaleStatusEnum.INVOICE_CREATED]: [
        SaleStatusEnum.STOCK_DEDUCTED,
        SaleStatusEnum.FAILED,
        SaleStatusEnum.COMPENSATING,
      ],
      [SaleStatusEnum.STOCK_DEDUCTED]: [
        SaleStatusEnum.COMPLETED,
        SaleStatusEnum.FAILED,
        SaleStatusEnum.COMPENSATING,
      ],
      [SaleStatusEnum.COMPLETED]: [], // Terminal state
      [SaleStatusEnum.FAILED]: [SaleStatusEnum.COMPENSATING],
      [SaleStatusEnum.COMPENSATING]: [SaleStatusEnum.COMPENSATED, SaleStatusEnum.FAILED],
      [SaleStatusEnum.COMPENSATED]: [], // Terminal state
    };

    return validTransitions[this.status]?.includes(newStatus.getValue()) ?? false;
  }

  equals(other: SaleStatus): boolean {
    return this.status === other.status;
  }

  toString(): string {
    return this.status;
  }
}
