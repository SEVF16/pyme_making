import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceItem } from '../../domain/entities/invoice-item.entity';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { PaginationService } from '../../../../shared/application/services/pagination.service';
import { FindOptions, PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class InvoiceRepository implements InvoiceRepositoryAbstract {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    private readonly paginationService: PaginationService,
  ) {}

  // Métodos heredados de BaseRepositoryInterface
  async findById(id: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({ where: { id } });
  }

  async findAll(options?: FindOptions): Promise<PaginatedResult<Invoice>> {
    const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
    
    if (options?.filters) {
      this.applyFilters(queryBuilder, options.filters);
    }

    return await this.paginationService.paginate(queryBuilder, {
      page: options?.pagination?.page,
      limit: options?.pagination?.limit,
      sortField: options?.sort?.field,
      sortDirection: options?.sort?.direction,
      search: options?.search,
    });
  }

  async create(entity: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.invoiceRepository.create(entity);
    return await this.invoiceRepository.save(invoice);
  }

  async update(id: string, entity: Partial<Invoice>): Promise<Invoice> {
    await this.invoiceRepository.update(id, entity);
    const updatedInvoice = await this.findById(id);
    
    if (!updatedInvoice) {
      throw new Error(`Factura con ID ${id} no encontrada`);
    }
    
    return updatedInvoice;
  }

  async delete(id: string): Promise<void> {
    const result = await this.invoiceRepository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`Factura con ID ${id} no encontrada`);
    }
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.invoiceRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new Error(`Factura con ID ${id} no encontrada`);
    }
  }

  // Métodos específicos de Invoice
  async findByIdWithItems(id: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items', 'customer', 'company']
    });
  }

  async findByInvoiceNumber(invoiceNumber: string, companyId: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({
      where: { invoiceNumber, companyId },
      relations: ['items']
    });
  }

  async findByCompany(companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { companyId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByCustomer(customerId: string, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { customerId, companyId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: string, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { status: status as any, companyId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByType(type: string, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { type: type as any, companyId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByDateRange(fromDate: Date, toDate: Date, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.issueDate >= :fromDate', { fromDate })
      .andWhere('invoice.issueDate <= :toDate', { toDate })
      .orderBy('invoice.issueDate', 'DESC')
      .getMany();
  }

  async findOverdueInvoices(companyId: string): Promise<Invoice[]> {
    const today = new Date();
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.dueDate < :today', { today })
      .andWhere('invoice.status IN (:...statuses)', { statuses: ['sent', 'overdue'] })
      .orderBy('invoice.dueDate', 'ASC')
      .getMany();
  }

  async findByPaymentMethod(paymentMethod: string, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { paymentMethod: paymentMethod as any, companyId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async searchInvoices(query: string, companyId: string): Promise<Invoice[]> {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere(`(
        LOWER(invoice.invoiceNumber) LIKE LOWER(:query) OR 
        LOWER(invoice.notes) LIKE LOWER(:query) OR 
        LOWER(invoice.customerData->>'name') LIKE LOWER(:query) OR
        LOWER(customer.firstName) LIKE LOWER(:query) OR
        LOWER(customer.lastName) LIKE LOWER(:query)
      )`, { query: `%${query}%` })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async countByCompany(companyId: string): Promise<number> {
    return await this.invoiceRepository.count({ where: { companyId } });
  }

  async getNextInvoiceNumber(companyId: string, type: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.type = :type', { type })
      .andWhere("invoice.invoiceNumber LIKE :pattern", { pattern: `%-${currentYear}-%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .limit(1)
      .getOne();

    if (!lastInvoice) {
      return '1';
    }

    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length >= 3) {
      const lastSequence = parseInt(parts[2]) || 0;
      return (lastSequence + 1).toString();
    }

    return '1';
  }

  async getInvoiceStats(companyId: string): Promise<{
    totalInvoices: number;
    totalSales: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
  }> {
    const totalInvoices = await this.invoiceRepository.count({
      where: { companyId }
    });

    const salesResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'totalSales')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.type = :type', { type: 'sale' })
      .getRawOne();

    const paidResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'totalPaid')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status = :status', { status: 'paid' })
      .getRawOne();

    const pendingResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'totalPending')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status IN (:...statuses)', { statuses: ['sent', 'overdue'] })
      .getRawOne();

    const overdueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'totalOverdue')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status = :status', { status: 'overdue' })
      .getRawOne();

    const avgResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('AVG(invoice.total)', 'averageAmount')
      .where('invoice.companyId = :companyId', { companyId })
      .getRawOne();

    return {
      totalInvoices,
      totalSales: parseFloat(salesResult.totalSales) || 0,
      totalPaid: parseFloat(paidResult.totalPaid) || 0,
      totalPending: parseFloat(pendingResult.totalPending) || 0,
      totalOverdue: parseFloat(overdueResult.totalOverdue) || 0,
      averageInvoiceAmount: parseFloat(avgResult.averageAmount) || 0,
    };
  }

  // Métodos para Items
  async createWithItems(invoiceData: any): Promise<Invoice> {
    return await this.invoiceRepository.manager.transaction(async transactionalEntityManager => {
      const { items, ...invoiceFields } = invoiceData;
      const invoice = transactionalEntityManager.create(Invoice, invoiceFields);
      const savedInvoice = await transactionalEntityManager.save(invoice);

      if (items && items.length > 0) {
        const invoiceItems = items.map(itemData => {
          const item = transactionalEntityManager.create(InvoiceItem, {
            ...itemData,
            invoiceId: savedInvoice.id,
          });
          item.updateCalculatedFields();
          return item;
        });

        savedInvoice.items = await transactionalEntityManager.save(InvoiceItem, invoiceItems);
        
        const subtotal = savedInvoice.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const discountTotal = savedInvoice.items.reduce((sum, item) => sum + Number(item.discountTotal), 0);
        const taxTotal = savedInvoice.items.reduce((sum, item) => sum + Number(item.taxAmount), 0);
        const total = subtotal - discountTotal + taxTotal;

        await transactionalEntityManager.update(Invoice, savedInvoice.id, {
          subtotal: Number(subtotal),
          discountTotal: Number(discountTotal),
          taxTotal: Number(taxTotal),
          total: Number(total),
        });

        savedInvoice.subtotal = subtotal;
        savedInvoice.discountTotal = discountTotal;
        savedInvoice.taxTotal = taxTotal;
        savedInvoice.total = total;
      }

      return savedInvoice;
    });
  }

 async addItem(invoiceId: string, itemData: any): Promise<Invoice> {
  return await this.invoiceRepository.manager.transaction(async transactionalEntityManager => {
    const item = transactionalEntityManager.create(InvoiceItem, {
      ...itemData,
      invoiceId,
    });
    item.updateCalculatedFields();
    
    await transactionalEntityManager.save(InvoiceItem, item);
    await this.recalculateInvoiceTotals(invoiceId, transactionalEntityManager);

    const invoice = await this.findByIdWithItems(invoiceId);
    if (!invoice) {
      throw new Error(`Factura con ID ${invoiceId} no encontrada`);
    }
    return invoice;
  });
}

async updateItem(invoiceId: string, itemId: string, itemData: any): Promise<Invoice> {
  return await this.invoiceRepository.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager.update(InvoiceItem, itemId, itemData);
    
    const item = await transactionalEntityManager.findOne(InvoiceItem, { where: { id: itemId } });
    if (item) {
      item.updateCalculatedFields();
      await transactionalEntityManager.save(InvoiceItem, item);
    }

    await this.recalculateInvoiceTotals(invoiceId, transactionalEntityManager);
    const invoice = await this.findByIdWithItems(invoiceId);
    if (!invoice) {
      throw new Error(`Factura con ID ${invoiceId} no encontrada`);
    }
    return invoice;
  });
}

async removeItem(invoiceId: string, itemId: string): Promise<Invoice> {
  return await this.invoiceRepository.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager.delete(InvoiceItem, itemId);
    await this.recalculateInvoiceTotals(invoiceId, transactionalEntityManager);

    const invoice = await this.findByIdWithItems(invoiceId);
    if (!invoice) {
      throw new Error(`Factura con ID ${invoiceId} no encontrada`);
    }
    return invoice;
  });
}

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await this.invoiceItemRepository.find({
      where: { invoiceId },
      order: { createdAt: 'ASC' }
    });
  }

private async recalculateInvoiceTotals(invoiceId: string, entityManager: any): Promise<void> {
  const items = await entityManager.find(InvoiceItem, { where: { invoiceId } });
  
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const discountTotal = items.reduce((sum, item) => sum + Number(item.discountTotal), 0);
  const taxTotal = items.reduce((sum, item) => sum + Number(item.taxAmount), 0);
  const total = subtotal - discountTotal + taxTotal;

  await entityManager.update(Invoice, invoiceId, {
    subtotal: Number(subtotal),
    discountTotal: Number(discountTotal),
    taxTotal: Number(taxTotal),
    total: Number(total),
  });
}

  private applyFilters(queryBuilder: SelectQueryBuilder<Invoice>, filters: any): void {
    if (filters.companyId) {
      queryBuilder.andWhere('invoice.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('invoice.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.type) {
      queryBuilder.andWhere('invoice.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters.issueDateFrom) {
      queryBuilder.andWhere('invoice.issueDate >= :issueDateFrom', { issueDateFrom: filters.issueDateFrom });
    }

    if (filters.issueDateTo) {
      queryBuilder.andWhere('invoice.issueDate <= :issueDateTo', { issueDateTo: filters.issueDateTo });
    }

    if (filters.dueDateFrom) {
      queryBuilder.andWhere('invoice.dueDate >= :dueDateFrom', { dueDateFrom: filters.dueDateFrom });
    }

    if (filters.dueDateTo) {
      queryBuilder.andWhere('invoice.dueDate <= :dueDateTo', { dueDateTo: filters.dueDateTo });
    }

    if (filters.currency) {
      queryBuilder.andWhere('invoice.currency = :currency', { currency: filters.currency });
    }

    if (filters.paymentMethod) {
      queryBuilder.andWhere('invoice.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    if (filters.overdue) {
      const today = new Date();
      queryBuilder.andWhere('invoice.dueDate < :today', { today });
      queryBuilder.andWhere('invoice.status IN (:...statuses)', { statuses: ['sent', 'overdue'] });
    }

    if (filters.search) {
      queryBuilder.leftJoin('invoice.customer', 'customer');
      queryBuilder.andWhere(`(
        invoice.invoiceNumber ILIKE :search OR 
        invoice.notes ILIKE :search OR 
        invoice.customerData->>'name' ILIKE :search OR
        customer.firstName ILIKE :search OR
        customer.lastName ILIKE :search
      )`, { search: `%${filters.search}%` });
    }
  }
}