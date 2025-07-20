export class InvoiceOverdueEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly companyId: string,
    public readonly customerId: string | null,
    public readonly invoiceNumber: string,
    public readonly total: number,
    public readonly dueDate: Date,
    public readonly daysPastDue: number
  ) {}
}