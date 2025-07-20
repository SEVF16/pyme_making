
// src/modules/invoices/application/use-cases/get-invoice.use-case.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';

@Injectable()
export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

  async execute(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByIdWithItems(id);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return invoice;
  }
}