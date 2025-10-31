/**
 * Domain Events for Sales Orchestration
 *
 * Events represent things that have happened in the domain.
 * They are used for:
 * - Eventual consistency between bounded contexts
 * - Audit logging
 * - Triggering side effects (notifications, analytics)
 * - Event sourcing (optional)
 */

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SaleInitiatedEvent extends DomainEvent {
  eventName: 'sale.initiated';
  companyId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SaleValidatedEvent extends DomainEvent {
  eventName: 'sale.validated';
  companyId: string;
}

export interface SaleInvoiceCreatedEvent extends DomainEvent {
  eventName: 'sale.invoice.created';
  invoiceId: string;
  companyId: string;
}

export interface SaleStockDeductedEvent extends DomainEvent {
  eventName: 'sale.stock.deducted';
  invoiceId?: string;
  companyId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface SaleCompletedEvent extends DomainEvent {
  eventName: 'sale.completed';
  invoiceId?: string;
  companyId: string;
  customerId: string;
  total: number;
}

export interface SaleFailedEvent extends DomainEvent {
  eventName: 'sale.failed';
  companyId: string;
  reason: string;
  currentStatus: string;
}

export interface SaleCompensationStartedEvent extends DomainEvent {
  eventName: 'sale.compensation.started';
  invoiceId?: string;
  companyId: string;
}

export interface SaleCompensationCompletedEvent extends DomainEvent {
  eventName: 'sale.compensation.completed';
  companyId: string;
}

export type SaleDomainEvent =
  | SaleInitiatedEvent
  | SaleValidatedEvent
  | SaleInvoiceCreatedEvent
  | SaleStockDeductedEvent
  | SaleCompletedEvent
  | SaleFailedEvent
  | SaleCompensationStartedEvent
  | SaleCompensationCompletedEvent;
