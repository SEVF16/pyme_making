import { Injectable, NotFoundException } from '@nestjs/common';

import { CustomerRepositoryAbstract } from '../../../customers/domain/interfaces/customer-repository.interface';

import { PdfGeneratorService } from '../../domain/services/pdf-generator.service';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { EmailService } from 'src/shared/application/services/email.service';

@Injectable()
export class SendInvoiceEmailUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly customerRepository: CustomerRepositoryAbstract,
    private readonly emailService: EmailService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(invoiceId: string, customEmail?: string): Promise<void> {
    const invoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    // Determinar email de destino
    let recipientEmail = customEmail;
    
    if (!recipientEmail) {
      if (invoice.customerId) {
        const customer = await this.customerRepository.findById(invoice.customerId);
        recipientEmail = customer?.email;
      } else if (invoice.customerData?.email) {
        recipientEmail = invoice.customerData.email;
      }
    }

    if (!recipientEmail) {
      throw new Error('No se encontró email del cliente para enviar la factura');
    }

    // Generar PDF de la factura
    const pdfBuffer = await this.pdfGeneratorService.generateInvoicePdf(invoice);

    // Enviar email con la factura adjunta
    await this.emailService.sendInvoiceEmail({
      to: recipientEmail,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerData?.name || 'Cliente',
      attachments: [{
        filename: `factura-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    // Actualizar estado de la factura si estaba en borrador
    if (invoice.status === 'draft') {
      await this.invoiceRepository.update(invoiceId, { status: 'sent' });
    }
  }
}