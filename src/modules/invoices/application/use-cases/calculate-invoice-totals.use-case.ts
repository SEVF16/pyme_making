import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { InvoiceCalculationService } from '../../domain/services/invoice-calculation.service';

@Injectable()
export class CalculateInvoiceTotalsUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly calculationService: InvoiceCalculationService,
  ) {}

  async execute(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    // Recalcular totales usando el servicio de dominio
    const updatedTotals = this.calculationService.calculateInvoiceTotals(invoice);
    
    return await this.invoiceRepository.update(invoiceId, updatedTotals);
  }
}