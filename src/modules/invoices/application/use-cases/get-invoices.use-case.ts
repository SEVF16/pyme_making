import { Injectable } from '@nestjs/common';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { FindOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class GetInvoicesUseCase {
 constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

 async execute(options: FindOptions): Promise<{ data: Invoice[]; total: number }> {
   const result = await this.invoiceRepository.findAll(options);
   return {
     data: result.data,
     total: result.total
   };
 }
}