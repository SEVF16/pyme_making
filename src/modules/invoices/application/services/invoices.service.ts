import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from '../dto/update-invoice-item.dto';
import { InvoiceResponseDto } from '../dto/invoice-response.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { CreateInvoiceUseCase } from '../use-cases/create-invoice.use-case';
import { GetInvoiceUseCase } from '../use-cases/get-invoice.use-case';
import { UpdateInvoiceUseCase } from '../use-cases/update-invoice.use-case';
import { GetInvoicesUseCase } from '../use-cases/get-invoices.use-case';
import { AddInvoiceItemUseCase } from '../use-cases/add-invoice-item.use-case';
import { UpdateInvoiceItemUseCase } from '../use-cases/update-invoice-item.use-case';
import { RemoveInvoiceItemUseCase } from '../use-cases/remove-invoice-item.use-case';
import { CalculateInvoiceTotalsUseCase } from '../use-cases/calculate-invoice-totals.use-case';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { FindOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly updateInvoiceUseCase: UpdateInvoiceUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly addInvoiceItemUseCase: AddInvoiceItemUseCase,
    private readonly updateInvoiceItemUseCase: UpdateInvoiceItemUseCase,
    private readonly removeInvoiceItemUseCase: RemoveInvoiceItemUseCase,
    private readonly calculateInvoiceTotalsUseCase: CalculateInvoiceTotalsUseCase,
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.createInvoiceUseCase.execute(createInvoiceDto);
    return this.toResponseDto(invoice);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceUseCase.execute(id);
    return this.toResponseDto(invoice);
  }

  async getInvoiceByNumber(invoiceNumber: string, companyId: string): Promise<InvoiceResponseDto | null> {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber, companyId);
    return invoice ? this.toResponseDto(invoice) : null;
  }

  async getInvoicesByCompany(companyId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepository.findByCompany(companyId);
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async getInvoices(queryDto: InvoiceQueryDto): Promise<PaginatedResponseDto<InvoiceResponseDto>> {
    const findOptions: FindOptions = {
      pagination: {
        page: queryDto.page,
        limit: queryDto.limit,
      },
      sort: {
        field: queryDto.sortField || 'createdAt',
        direction: queryDto.sortDirection || 'DESC',
      },
      filters: {
        companyId: queryDto.companyId,
        customerId: queryDto.customerId,
        type: queryDto.type,
        status: queryDto.status,
        issueDateFrom: queryDto.issueDateFrom,
        issueDateTo: queryDto.issueDateTo,
        dueDateFrom: queryDto.dueDateFrom,
        dueDateTo: queryDto.dueDateTo,
        currency: queryDto.currency,
        overdue: queryDto.overdue,
        paymentMethod: queryDto.paymentMethod,
      },
      search: queryDto.search,
    };

    const result = await this.invoiceRepository.findAll(findOptions);
    
    const invoices = result.data.map(invoice => this.toResponseDto(invoice));
    
    return new PaginatedResponseDto(invoices, result.total, result.page, result.limit);
  }

  async getInvoicesByCustomer(customerId: string, companyId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepository.findByCustomer(customerId, companyId);
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async getOverdueInvoices(companyId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepository.findOverdueInvoices(companyId);
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async getDraftInvoices(companyId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepository.findByStatus('draft', companyId);
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.updateInvoiceUseCase.execute(id, updateInvoiceDto);
    return this.toResponseDto(invoice);
  }

  async addInvoiceItem(invoiceId: string, itemDto: any): Promise<InvoiceResponseDto> {
    const invoice = await this.addInvoiceItemUseCase.execute(invoiceId, itemDto);
    return this.toResponseDto(invoice);
  }

  async updateInvoiceItem(invoiceId: string, itemId: string, updateDto: UpdateInvoiceItemDto): Promise<InvoiceResponseDto> {
    const invoice = await this.updateInvoiceItemUseCase.execute(invoiceId, itemId, updateDto);
    return this.toResponseDto(invoice);
  }

  async removeInvoiceItem(invoiceId: string, itemId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.removeInvoiceItemUseCase.execute(invoiceId, itemId);
    return this.toResponseDto(invoice);
  }

  async recalculateInvoiceTotals(invoiceId: string): Promise<InvoiceResponseDto> {
    const invoice = await this.calculateInvoiceTotalsUseCase.execute(invoiceId);
    return this.toResponseDto(invoice);
  }

  async deleteInvoice(id: string): Promise<void> {
    if (this.invoiceRepository.softDelete) {
      await this.invoiceRepository.softDelete(id);
    } else {
      await this.invoiceRepository.delete(id);
    }
  }

  async searchInvoices(query: string, companyId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.invoiceRepository.searchInvoices(query, companyId);
    return invoices.map(invoice => this.toResponseDto(invoice));
  }

  async getInvoiceStats(companyId: string): Promise<{
    totalInvoices: number;
    totalSales: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
  }> {
    return await this.invoiceRepository.getInvoiceStats(companyId);
  }

  private toResponseDto(invoice: any): InvoiceResponseDto {
    const now = new Date();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    const isOverdue = dueDate ? now > dueDate && invoice.status !== 'paid' : false;
    const daysPastDue = isOverdue && dueDate ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      customerId: invoice.customerId,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      customerData: invoice.customerData,
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate,
      terms: invoice.terms,
      notes: invoice.notes,
      paymentMethod: invoice.paymentMethod,
      globalDiscountPercentage: invoice.globalDiscountPercentage,
      globalDiscountAmount: invoice.globalDiscountAmount,
      subtotal: invoice.subtotal,
      discountTotal: invoice.discountTotal,
      taxTotal: invoice.taxTotal,
      total: invoice.total,
      items: invoice.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        productSku: item.productSku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxPercentage: item.taxPercentage,
        subtotal: item.subtotal,
        discountTotal: item.discountTotal,
        taxAmount: item.taxAmount,
        total: item.total,
        unit: item.unit,
        additionalInfo: item.additionalInfo,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) || [],
      itemCount: invoice.items?.length || 0,
      isOverdue,
      daysPastDue,
      additionalInfo: invoice.additionalInfo,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}