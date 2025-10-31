/**
 * InvoiceAdapter - Infrastructure Layer
 *
 * Adapts the Invoice module's service to the interface expected by the domain layer.
 */

import { Injectable } from '@nestjs/common';
import { IInvoiceService } from '../../application/use-cases/process-sale.use-case';
import { InvoiceService } from '../../../invoices/application/services/invoices.service';
import { InvoiceRepositoryAbstract } from '../../../invoices/domain/interfaces/invoice-repository.interface';

@Injectable()
export class InvoiceAdapter implements IInvoiceService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
  ) {}

  async createWithItems(invoiceData: any): Promise<any> {
    // Use the invoice service's create method
    const invoice = await this.invoiceService.createInvoice(invoiceData);
    return invoice;
  }

  async delete(invoiceId: string): Promise<void> {
    // Delete invoice using repository to avoid circular dependencies
    await this.invoiceRepository.delete(invoiceId);
  }
}
