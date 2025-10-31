/**
 * SaleAggregate - Aggregate Root
 *
 * This aggregate is the CORE of the sales orchestration module.
 * It coordinates the creation of invoices with stock management and product validation.
 *
 * Following DDD principles:
 * - Enforces business invariants
 * - Maintains transactional consistency boundaries
 * - Encapsulates domain logic
 * - Emits domain events for side effects
 *
 * Orchestrates:
 * - Invoice creation
 * - Stock validation and deduction
 * - Product existence and price validation
 * - Transaction compensation (rollback)
 */

import { SaleItem } from '../value-objects/sale-item.value-object';
import { SaleStatus, SaleStatusEnum } from '../value-objects/sale-status.value-object';
import {
  InvalidSaleStateException,
  SaleDomainException,
} from '../exceptions/sale.exceptions';

export interface SaleAggregateProps {
  id?: string;
  companyId: string;
  customerId: string;
  items: SaleItem[];
  status?: SaleStatus;
  invoiceId?: string;
  reservationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export class SaleAggregate {
  private readonly id: string;
  private readonly companyId: string;
  private readonly customerId: string;
  private items: SaleItem[];
  private status: SaleStatus;
  private invoiceId?: string;
  private reservationId?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private metadata: Record<string, any>;
  private domainEvents: any[] = [];

  private constructor(props: SaleAggregateProps) {
    this.id = props.id || this.generateId();
    this.companyId = props.companyId;
    this.customerId = props.customerId;
    this.items = props.items;
    this.status = props.status || SaleStatus.pending();
    this.invoiceId = props.invoiceId;
    this.reservationId = props.reservationId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.metadata = props.metadata || {};

    this.validate();
  }

  /**
   * Factory method to create a new sale
   */
  static create(props: SaleAggregateProps): SaleAggregate {
    const sale = new SaleAggregate(props);
    sale.addDomainEvent({
      eventName: 'sale.initiated',
      aggregateId: sale.id,
      companyId: sale.companyId,
      customerId: sale.customerId,
      items: sale.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      timestamp: new Date(),
    });
    return sale;
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(props: SaleAggregateProps): SaleAggregate {
    return new SaleAggregate(props);
  }

  private validate(): void {
    if (!this.companyId) {
      throw new SaleDomainException('Company ID is required');
    }

    if (!this.customerId) {
      throw new SaleDomainException('Customer ID is required');
    }

    if (!this.items || this.items.length === 0) {
      throw new SaleDomainException('At least one sale item is required');
    }
  }

  private generateId(): string {
    return `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Business Operations
  // ========================================

  /**
   * Mark sale as validated after stock and product checks
   */
  markAsValidated(): void {
    this.transitionTo(SaleStatus.validated());
    this.addDomainEvent({
      eventName: 'sale.validated',
      aggregateId: this.id,
      companyId: this.companyId,
      timestamp: new Date(),
    });
  }

  /**
   * Associate created invoice with this sale
   */
  associateInvoice(invoiceId: string): void {
    if (!this.status.isValidated()) {
      throw new InvalidSaleStateException(
        'Sale must be validated before associating invoice',
      );
    }

    this.invoiceId = invoiceId;
    this.transitionTo(SaleStatus.invoiceCreated());
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.invoice.created',
      aggregateId: this.id,
      invoiceId,
      companyId: this.companyId,
      timestamp: new Date(),
    });
  }

  /**
   * Mark stock as deducted
   */
  markStockDeducted(): void {
    if (!this.status.isInvoiceCreated()) {
      throw new InvalidSaleStateException('Invoice must be created before deducting stock');
    }

    this.transitionTo(SaleStatus.stockDeducted());
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.stock.deducted',
      aggregateId: this.id,
      invoiceId: this.invoiceId,
      companyId: this.companyId,
      items: this.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      timestamp: new Date(),
    });
  }

  /**
   * Complete the sale
   */
  complete(): void {
    if (!this.status.isStockDeducted()) {
      throw new InvalidSaleStateException('Stock must be deducted before completing sale');
    }

    this.transitionTo(SaleStatus.completed());
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.completed',
      aggregateId: this.id,
      invoiceId: this.invoiceId,
      companyId: this.companyId,
      customerId: this.customerId,
      total: this.calculateTotal(),
      timestamp: new Date(),
    });
  }

  /**
   * Mark sale as failed
   */
  markAsFailed(reason: string, error?: Error): void {
    this.transitionTo(SaleStatus.failed());
    this.metadata.failureReason = reason;
    this.metadata.failureError = error?.message;
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.failed',
      aggregateId: this.id,
      companyId: this.companyId,
      reason,
      currentStatus: this.status.getValue(),
      timestamp: new Date(),
    });
  }

  /**
   * Start compensation (rollback)
   */
  startCompensation(): void {
    if (
      !this.status.isFailed() &&
      !this.status.isInvoiceCreated() &&
      !this.status.isStockDeducted()
    ) {
      throw new InvalidSaleStateException('Cannot compensate in current state');
    }

    this.transitionTo(SaleStatus.compensating());
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.compensation.started',
      aggregateId: this.id,
      invoiceId: this.invoiceId,
      companyId: this.companyId,
      timestamp: new Date(),
    });
  }

  /**
   * Mark compensation as completed
   */
  markAsCompensated(): void {
    if (!this.status.isCompensating()) {
      throw new InvalidSaleStateException('Sale must be compensating to mark as compensated');
    }

    this.transitionTo(SaleStatus.compensated());
    this.updatedAt = new Date();

    this.addDomainEvent({
      eventName: 'sale.compensation.completed',
      aggregateId: this.id,
      companyId: this.companyId,
      timestamp: new Date(),
    });
  }

  /**
   * Associate a stock reservation
   */
  associateReservation(reservationId: string): void {
    this.reservationId = reservationId;
    this.metadata.reservedAt = new Date();
    this.updatedAt = new Date();
  }

  // ========================================
  // Calculations
  // ========================================

  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.calculateSubtotal(), 0);
  }

  calculateTotalDiscount(): number {
    return this.items.reduce((sum, item) => sum + item.calculateDiscountAmount(), 0);
  }

  calculateTotalTax(): number {
    return this.items.reduce((sum, item) => sum + item.calculateTaxAmount(), 0);
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.calculateTotal(), 0);
  }

  // ========================================
  // State Management
  // ========================================

  private transitionTo(newStatus: SaleStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new InvalidSaleStateException(
        `Cannot transition from ${this.status.getValue()} to ${newStatus.getValue()}`,
      );
    }
    this.status = newStatus;
  }

  // ========================================
  // Domain Events
  // ========================================

  private addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // ========================================
  // Getters
  // ========================================

  getId(): string {
    return this.id;
  }

  getCompanyId(): string {
    return this.companyId;
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getItems(): SaleItem[] {
    return [...this.items];
  }

  getStatus(): SaleStatus {
    return this.status;
  }

  getInvoiceId(): string | undefined {
    return this.invoiceId;
  }

  getReservationId(): string | undefined {
    return this.reservationId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  /**
   * Check if sale can be processed
   */
  canBeProcessed(): boolean {
    return this.status.isPending() || this.status.isValidated();
  }

  /**
   * Check if sale needs compensation
   */
  needsCompensation(): boolean {
    return (
      this.status.isFailed() &&
      (!!this.invoiceId || this.status.isInvoiceCreated() || this.status.isStockDeducted())
    );
  }
}
