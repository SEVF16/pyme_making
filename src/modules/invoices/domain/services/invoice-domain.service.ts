import { Injectable } from '@nestjs/common';
import { InvoiceBusinessRules } from '../interfaces/invoice-business-rules.interface';
import { InvoiceRepositoryAbstract } from '../interfaces/invoice-repository.interface';
import { CustomerRepositoryAbstract } from '../../../customers/domain/interfaces/customer-repository.interface';
import { ProductRepositoryAbstract } from 'src/modules/product/domain/interface/product-repository.interface';


@Injectable()
export class InvoiceDomainService implements InvoiceBusinessRules {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly customerRepository: CustomerRepositoryAbstract,
    private readonly productRepository: ProductRepositoryAbstract,
  ) {}

  async canCreateInvoice(companyId: string, customerId?: string): Promise<boolean> {
    // Validar que el cliente pertenece a la empresa si se proporciona
    if (customerId) {
      const customer = await this.customerRepository.findById(customerId);
      return customer?.companyId === companyId && customer.canOperate();
    }
    
    return true;
  }

  async canUpdateInvoice(invoiceId: string, companyId: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    return invoice?.companyId === companyId && invoice.canBeEdited();
  }

  async canDeleteInvoice(invoiceId: string, companyId: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    return invoice?.companyId === companyId && invoice.isDraft();
  }

  async canAddItem(invoiceId: string, productId?: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice || !invoice.canBeEdited()) return false;

    // Validar producto si se proporciona
    if (productId) {
      const product = await this.productRepository.findById(productId);
      return product?.companyId === invoice.companyId && product.isActive;
    }

    return true;
  }

  async canChangeStatus(invoiceId: string, newStatus: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) return false;

    // Validar transición de estados
    const currentStatus = invoice.status;
    
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['sent', 'cancelled'],
      'sent': ['paid', 'overdue', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': ['refunded'],
      'cancelled': [],
      'refunded': [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  async validateInvoiceData(invoiceData: any): Promise<boolean> {
    // Validar que tiene al menos un ítem
    if (!invoiceData.items || invoiceData.items.length === 0) {
      return false;
    }

    // Validar que todos los ítems tienen datos válidos
    for (const item of invoiceData.items) {
      if (!item.name || item.quantity <= 0 || item.unitPrice < 0) {
        return false;
      }
    }

    // Validar fechas
    if (invoiceData.dueDate && invoiceData.issueDate) {
      const issueDate = new Date(invoiceData.issueDate);
      const dueDate = new Date(invoiceData.dueDate);
      if (dueDate < issueDate) {
        return false;
      }
    }

    return true;
  }

  async canMarkAsPaid(invoiceId: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    return invoice?.canBePaid() || false;
  }

  async canCancel(invoiceId: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    return invoice?.canBeCancelled() || false;
  }

  async canRefund(invoiceId: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    return invoice?.canBeRefunded() || false;
  }

  async calculateInvoiceMetrics(companyId: string): Promise<{
    totalInvoices: number;
    totalSales: number;
    averageInvoiceAmount: number;
    overdueInvoices: number;
    paidInvoicesThisMonth: number;
    pendingAmount: number;
  }> {
    const stats = await this.invoiceRepository.getInvoiceStats(companyId);
    const overdueInvoices = (await this.invoiceRepository.findOverdueInvoices(companyId)).length;
    
    // Calcular facturas pagadas este mes
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyPaidInvoices = await this.invoiceRepository.findByDateRange(firstDayOfMonth, lastDayOfMonth, companyId);
    const paidInvoicesThisMonth = monthlyPaidInvoices.filter(inv => inv.status === 'paid').length;

    return {
      totalInvoices: stats.totalInvoices,
      totalSales: stats.totalSales,
      averageInvoiceAmount: stats.averageInvoiceAmount,
      overdueInvoices,
      paidInvoicesThisMonth,
      pendingAmount: stats.totalPending,
    };
  }

  async validateInvoiceNumberUniqueness(invoiceNumber: string, companyId: string, excludeId?: string): Promise<boolean> {
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber, companyId);
    
    if (!existingInvoice) return true;
    
    // Si es una actualización, permitir si es la misma factura
    return excludeId ? existingInvoice.id === excludeId : false;
  }
}