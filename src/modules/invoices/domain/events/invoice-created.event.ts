export class InvoiceCreatedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly companyId: string,
    public readonly customerId: string | null,
    public readonly invoiceNumber: string,
    public readonly total: number,
    public readonly type: string,
    public readonly createdAt: Date
  ) {}
}