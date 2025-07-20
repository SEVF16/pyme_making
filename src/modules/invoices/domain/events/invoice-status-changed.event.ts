export class InvoiceStatusChangedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly companyId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedAt: Date
  ) {}
}