import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { InvoiceNumberService } from '../../domain/services/invoice-number.service';
import { Invoice } from '../../domain/entities/invoice.entity';

@Injectable()
export class DuplicateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly invoiceNumberService: InvoiceNumberService,
  ) {}

  async execute(invoiceId: string): Promise<Invoice> {
    const originalInvoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!originalInvoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    // Generar nuevo número de factura
    const newInvoiceNumber = await this.invoiceNumberService.generateInvoiceNumber(
      originalInvoice.companyId,
      originalInvoice.type
    );

    // Crear datos para la nueva factura
    const duplicateData = {
      companyId: originalInvoice.companyId,
      customerId: originalInvoice.customerId,
      type: originalInvoice.type,
      invoiceNumber: newInvoiceNumber,
      issueDate: new Date(),
      dueDate: originalInvoice.dueDate ? new Date(Date.now() + (originalInvoice.dueDate.getTime() - originalInvoice.issueDate.getTime())) : undefined,
      customerData: originalInvoice.customerData,
      currency: originalInvoice.currency,
      exchangeRate: originalInvoice.exchangeRate,
      terms: originalInvoice.terms,
      notes: originalInvoice.notes,
      paymentMethod: originalInvoice.paymentMethod,
      globalDiscountPercentage: originalInvoice.globalDiscountPercentage,
      globalDiscountAmount: originalInvoice.globalDiscountAmount,
      items: originalInvoice.items?.map(item => ({
        productId: item.productId,
        productSku: item.productSku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxPercentage: item.taxPercentage,
        unit: item.unit,
        additionalInfo: item.additionalInfo,
      })) || [],
      additionalInfo: originalInvoice.additionalInfo,
    };

    return await this.invoiceRepository.createWithItems(duplicateData);
  }
} 