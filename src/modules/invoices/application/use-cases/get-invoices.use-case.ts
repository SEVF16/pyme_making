import { Injectable } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class GetInvoicesUseCase {
 constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

 async execute(options: PaginationOptions): Promise<{ result: Invoice[]}> {
   const result = await this.invoiceRepository.findAll(options);
   return await this.invoiceRepository.findAll(options);
 }
}