import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceItemDto } from '../dto/create-invoice-item.dto';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { ProductRepositoryAbstract } from 'src/modules/product/domain/interface/product-repository.interface';


@Injectable()
export class AddInvoiceItemUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly productRepository: ProductRepositoryAbstract,
  ) {}

  async execute(invoiceId: string, itemDto: CreateInvoiceItemDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByIdWithItems(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${invoiceId} no encontrada`);
    }

    // Validar producto si se proporciona productId
    if (itemDto.productId) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product || product.companyId !== invoice.companyId) {
        throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado`);
      }
    }

    return await this.invoiceRepository.addItem(invoiceId, itemDto);
  }
}