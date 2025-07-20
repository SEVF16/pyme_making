export interface InvoiceBusinessRules {
  canCreateInvoice(companyId: string, customerId?: string): Promise<boolean>;
  canUpdateInvoice(invoiceId: string, companyId: string): Promise<boolean>;
  canDeleteInvoice(invoiceId: string, companyId: string): Promise<boolean>;
  canAddItem(invoiceId: string, productId?: string): Promise<boolean>;
  canChangeStatus(invoiceId: string, newStatus: string): Promise<boolean>;
  validateInvoiceData(invoiceData: any): Promise<boolean>;
  canMarkAsPaid(invoiceId: string): Promise<boolean>;
  canCancel(invoiceId: string): Promise<boolean>;
  canRefund(invoiceId: string): Promise<boolean>;
}