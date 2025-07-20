export class InvoicePaidEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly companyId: string,
    public readonly customerId: string | null,
    public readonly invoiceNumber: string,
    public readonly total: number,
    public readonly paidAt: Date
  ) {}
}
