import { Injectable } from '@nestjs/common';
import { InvoiceAggregate } from '../aggregates/invoice.aggregate';
import { InvoiceCalculationService } from '../services/invoice-calculation.service';
import { InvoiceNumberService } from '../services/invoice-number.service';
import { InvoiceTypeValueObject } from '../value-objects/invoice-type.value-object';

@Injectable()
export class InvoiceFactory {
  constructor(
    private readonly calculationService: InvoiceCalculationService,
    private readonly numberService: InvoiceNumberService
  ) {}

  async createSaleInvoice(data: {
    companyId: string;
    customerId?: string;
    customerData?: any;
    items: any[];
    currency?: string;
    terms?: string;
    notes?: string;
  }): Promise<InvoiceAggregate> {
    const invoiceNumber = await this.numberService.generateInvoiceNumber(
      data.companyId, 
      'sale'
    );

    const invoiceData = {
      companyId: data.companyId,
      customerId: data.customerId,
      customerData: data.customerData,
      type: 'sale' as const,
      status: 'draft' as const,
      invoiceNumber,
      issueDate: new Date(),
      currency: data.currency || 'CLP',
      exchangeRate: 1,
      terms: data.terms,
      notes: data.notes,
      globalDiscountPercentage: 0,
      globalDiscountAmount: 0,
    };

    return InvoiceAggregate.create(invoiceData, data.items);
  }

  async createPurchaseInvoice(data: {
    companyId: string;
    supplierId?: string;
    supplierData?: any;
    items: any[];
    invoiceNumber: string;
    issueDate: Date;
    currency?: string;
  }): Promise<InvoiceAggregate> {
    const invoiceData = {
      companyId: data.companyId,
      customerId: data.supplierId, // Usar customerId para proveedor
      customerData: data.supplierData,
      type: 'purchase' as const,
      status: 'draft' as const,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      currency: data.currency || 'CLP',
      exchangeRate: 1,
      globalDiscountPercentage: 0,
      globalDiscountAmount: 0,
    };

    return InvoiceAggregate.create(invoiceData, data.items);
  }

  async createCreditNote(originalInvoiceId: string, data: {
    reason: string;
    items: any[];
    partialAmount?: number;
  }): Promise<InvoiceAggregate> {
    // En una implementación real, buscarías la factura original
    // const originalInvoice = await this.invoiceRepository.findById(originalInvoiceId);
    
    const creditNoteNumber = await this.numberService.generateInvoiceNumber(
      'company-id', // Se obtendría de la factura original
      'credit_note'
    );

    const invoiceData = {
      companyId: 'company-id', // De la factura original
      type: 'credit_note' as const,
      status: 'draft' as const,
      invoiceNumber: creditNoteNumber,
      issueDate: new Date(),
      currency: 'CLP',
      exchangeRate: 1,
      notes: `Nota de crédito - ${data.reason}`,
      globalDiscountPercentage: 0,
      globalDiscountAmount: 0,
      additionalInfo: {
        originalInvoiceId,
        reason: data.reason,
      },
    };

    return InvoiceAggregate.create(invoiceData, data.items);
  }

  createProformaInvoice(data: {
    companyId: string;
    customerId?: string;
    customerData?: any;
    items: any[];
    validUntil?: Date;
  }): InvoiceAggregate {
    const invoiceData = {
      companyId: data.companyId,
      customerId: data.customerId,
      customerData: data.customerData,
      type: 'proforma' as const,
      status: 'draft' as const,
      invoiceNumber: `PRO-${Date.now()}`, // Temporal
      issueDate: new Date(),
      currency: 'CLP',
      exchangeRate: 1,
      notes: 'Factura Proforma - No constituye documento tributario',
      globalDiscountPercentage: 0,
      globalDiscountAmount: 0,
      additionalInfo: {
        validUntil: data.validUntil,
        isProforma: true,
      },
    };

    return InvoiceAggregate.create(invoiceData, data.items);
  }
}