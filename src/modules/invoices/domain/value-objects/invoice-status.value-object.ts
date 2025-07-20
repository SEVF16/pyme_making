export class InvoiceStatusValueObject {
  private static readonly VALID_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'] as const;
  
  private constructor(private readonly value: typeof InvoiceStatusValueObject.VALID_STATUSES[number]) {}

  static create(status: string): InvoiceStatusValueObject {
    if (!this.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Estado de factura inválido: ${status}`);
    }

    return new InvoiceStatusValueObject(status as any);
  }

  getValue(): string {
    return this.value;
  }

  isDraft(): boolean {
    return this.value === 'draft';
  }

  isSent(): boolean {
    return this.value === 'sent';
  }

  isPaid(): boolean {
    return this.value === 'paid';
  }

  isOverdue(): boolean {
    return this.value === 'overdue';
  }

  isCancelled(): boolean {
    return this.value === 'cancelled';
  }

  isRefunded(): boolean {
    return this.value === 'refunded';
  }

  canTransitionTo(newStatus: InvoiceStatusValueObject): boolean {
    const current = this.value;
    const target = newStatus.value;

    // Reglas de transición de estados
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['sent', 'cancelled'],
      'sent': ['paid', 'overdue', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': ['refunded'],
      'cancelled': [],
      'refunded': [],
    };

    return allowedTransitions[current]?.includes(target) || false;
  }

  requiresPayment(): boolean {
    return this.value === 'sent' || this.value === 'overdue';
  }

  isEditable(): boolean {
    return this.value === 'draft' || this.value === 'sent';
  }

  isFinal(): boolean {
    return this.value === 'paid' || this.value === 'cancelled' || this.value === 'refunded';
  }
}