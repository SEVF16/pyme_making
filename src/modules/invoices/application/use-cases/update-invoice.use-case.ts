import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';

@Injectable()
export class UpdateInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

  async execute(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const existingInvoice = await this.invoiceRepository.findById(id);
    
    if (!existingInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    
    const updateData = {
      ...updateInvoiceDto,
      dueDate: updateInvoiceDto.dueDate ? new Date(updateInvoiceDto.dueDate) : undefined,
      issueDate: updateInvoiceDto.issueDate ? new Date(updateInvoiceDto.issueDate) : undefined,
    };

    return await this.invoiceRepository.update(id, updateData);
  }}