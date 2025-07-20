import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { BaseRepositoryInterface, FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

export interface FindInvoicesOptions extends FindOptions {
  companyId?: string;
  customerId?: string;
  type?: string;
  status?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  currency?: string;
  overdue?: boolean;
  paymentMethod?: string;
}

export abstract class InvoiceRepositoryAbstract implements BaseRepositoryInterface<Invoice> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<Invoice | null>;
  abstract findAll(options?: FindOptions): Promise<PaginatedResult<Invoice>>;
  abstract create(entity: Partial<Invoice>): Promise<Invoice>;
  abstract update(id: string, entity: Partial<Invoice>): Promise<Invoice>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;

  // Métodos específicos de Invoice
  abstract findByIdWithItems(id: string): Promise<Invoice | null>;
  abstract findByInvoiceNumber(invoiceNumber: string, companyId: string): Promise<Invoice | null>;
  abstract findByCompany(companyId: string): Promise<Invoice[]>;
  abstract findByCustomer(customerId: string, companyId: string): Promise<Invoice[]>;
  abstract findByStatus(status: string, companyId: string): Promise<Invoice[]>;
  abstract findByType(type: string, companyId: string): Promise<Invoice[]>;
  abstract findByDateRange(fromDate: Date, toDate: Date, companyId: string): Promise<Invoice[]>;
  abstract findOverdueInvoices(companyId: string): Promise<Invoice[]>;
  abstract findByPaymentMethod(paymentMethod: string, companyId: string): Promise<Invoice[]>;
  abstract searchInvoices(query: string, companyId: string): Promise<Invoice[]>;
  abstract countByCompany(companyId: string): Promise<number>;
  abstract getNextInvoiceNumber(companyId: string, type: string): Promise<string>;
  abstract getInvoiceStats(companyId: string): Promise<{
    totalInvoices: number;
    totalSales: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
  }>;

  // Métodos para Items
  abstract createWithItems(invoiceData: any): Promise<Invoice>;
  abstract addItem(invoiceId: string, itemData: any): Promise<Invoice>;
  abstract updateItem(invoiceId: string, itemId: string, itemData: any): Promise<Invoice>;
  abstract removeItem(invoiceId: string, itemId: string): Promise<Invoice>;
  abstract getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
}