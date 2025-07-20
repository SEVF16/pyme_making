import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../../companies/domain/interfaces/company-repository.interface';
import { CustomerRepositoryAbstract } from '../../../customers/domain/interfaces/customer-repository.interface';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { InvoiceNumberService } from '../../domain/services/invoice-number.service';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly companyRepository: CompanyRepositoryAbstract,
    private readonly customerRepository: CustomerRepositoryAbstract,
    private readonly invoiceNumberService: InvoiceNumberService,
  ) {}

  async execute(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Validar que la empresa existe
    const company = await this.companyRepository.findById(createInvoiceDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${createInvoiceDto.companyId} no encontrada`);
    }

    // Validar cliente si se proporciona
    if (createInvoiceDto.customerId) {
      const customer = await this.customerRepository.findById(createInvoiceDto.customerId);
      if (!customer || customer.companyId !== createInvoiceDto.companyId) {
        throw new NotFoundException(`Cliente con ID ${createInvoiceDto.customerId} no encontrado`);
      }
    }

    // Generar número de factura si no se proporciona
    const invoiceNumber = createInvoiceDto.invoiceNumber || 
      await this.invoiceNumberService.generateInvoiceNumber(
        createInvoiceDto.companyId, 
        createInvoiceDto.type
      );

    // Crear la factura
    const invoiceData = {
      ...createInvoiceDto,
      invoiceNumber,
      status: 'draft' as const,
      issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
      dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
    };

    return await this.invoiceRepository.createWithItems(invoiceData);
  }
}
