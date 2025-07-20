import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { PdfGeneratorService } from '../../domain/services/pdf-generator.service';

@Injectable()
export class GenerateInvoicePdfUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(invoiceId: string): Promise<Buffer> {
    const invoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    return await this.pdfGeneratorService.generateInvoicePdf(invoice);
  }
}
