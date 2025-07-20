import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInvoiceItemDto } from '../dto/update-invoice-item.dto';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';

@Injectable()
export class UpdateInvoiceItemUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

  async execute(invoiceId: string, itemId: string, updateDto: UpdateInvoiceItemDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    const item = invoice.items?.find(item => item.id === itemId);
    if (!item) {
      throw new NotFoundException(`Ítem con ID ${itemId} no encontrado en la factura`);
    }

    return await this.invoiceRepository.updateItem(invoiceId, itemId, updateDto);
  }
}