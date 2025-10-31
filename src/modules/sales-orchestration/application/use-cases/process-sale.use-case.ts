/**
 * ProcessSaleUseCase - Application Layer
 *
 * This is the orchestration layer that coordinates the entire sale process.
 * It uses the SAGA pattern for distributed transactions with compensation.
 *
 * Workflow:
 * 1. Create SaleAggregate
 * 2. Validate products and stock (Domain Services)
 * 3. Create Invoice (Invoice Module)
 * 4. Deduct Stock (Product Module)
 * 5. Complete Sale
 * 6. Emit Domain Events
 *
 * On failure: Compensate (rollback) in reverse order
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { SaleAggregate } from '../../domain/aggregates/sale.aggregate';
import { SaleItem } from '../../domain/value-objects/sale-item.value-object';
import { StockValidationService } from '../../domain/services/stock-validation.service';
import { PriceValidationService } from '../../domain/services/price-validation.service';
import { ProcessSaleDto, ProcessSaleResponseDto } from '../dto/process-sale.dto';
import {
  InsufficientStockException,
  ProductNotFoundException,
  SaleProcessingException,
} from '../../domain/exceptions/sale.exceptions';

/**
 * External service interfaces (to be injected)
 */
export interface IProductService {
  findByIds(productIds: string[]): Promise<any[]>;
  updateStock(productId: string, quantity: number, reason: string, reference: string): Promise<any>;
}

export interface IInvoiceService {
  createWithItems(invoiceData: any): Promise<any>;
  delete(invoiceId: string): Promise<void>;
}

@Injectable()
export class ProcessSaleUseCase {
  private readonly logger = new Logger(ProcessSaleUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject('IProductService')
    private readonly productService: IProductService,
    @Inject('IInvoiceService')
    private readonly invoiceService: IInvoiceService,
    private readonly stockValidationService: StockValidationService,
    private readonly priceValidationService: PriceValidationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Main execution method - orchestrates the entire sale process
   */
  async execute(dto: ProcessSaleDto): Promise<ProcessSaleResponseDto> {
    this.logger.log(`Processing sale for company ${dto.companyId}, customer ${dto.customerId}`);

    // Start a database transaction for the entire operation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let sale: SaleAggregate | null = null;
    let invoiceId: string | null = null;
    const stockMovements: any[] = [];

    try {
      // ========================================
      // STEP 1: Fetch and Validate Products First
      // ========================================
      this.logger.debug('Step 1: Fetching products');

      const productIds = dto.items.map((item) => item.productId);
      const products = await this.productService.findByIds(productIds);

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        throw new ProductNotFoundException(missingIds[0]);
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // ========================================
      // STEP 2: Create Sale Aggregate with Product Data
      // ========================================
      this.logger.debug('Step 2: Creating sale aggregate');

      const saleItems = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;
        return SaleItem.create(
          item.productId,
          product.name,
          product.sku,
          item.quantity,
          item.unitPrice,
          item.discountPercentage || 0,
          item.taxPercentage || 0,
        );
      });

      sale = SaleAggregate.create({
        companyId: dto.companyId,
        customerId: dto.customerId,
        items: saleItems,
      });

      // ========================================
      // STEP 3: Validate Stock
      // ========================================
      if (!dto.skipStockValidation) {
        this.logger.debug('Step 3: Validating stock');

        this.stockValidationService.validateStockForSaleItems(
          sale.getItems(),
          productMap,
        );

        this.logger.log('Stock validation passed');
      } else {
        this.logger.warn('Stock validation SKIPPED');
      }

      // ========================================
      // STEP 4: Validate Prices
      // ========================================
      this.logger.debug('Step 4: Validating prices');

      this.priceValidationService.validatePricesForSaleItems(sale.getItems(), productMap, {
        strictMode: dto.strictPriceValidation ?? true,
        allowPriceOverride: !(dto.strictPriceValidation ?? true),
      });

      this.logger.log('Price validation passed');

      sale.markAsValidated();

      // ========================================
      // STEP 5: Create Invoice
      // ========================================
      this.logger.debug('Step 5: Creating invoice');

      const invoiceData = {
        companyId: dto.companyId,
        customerId: dto.customerId,
        type: dto.invoiceType || 'sale',
        status: 'draft',
        issueDate: dto.issueDate || new Date().toISOString().split('T')[0],
        dueDate: dto.dueDate,
        notes: dto.notes,
        items: sale.getItems().map((item) => ({
          productId: item.productId,
          productSku: item.productSku,
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          taxPercentage: item.taxPercentage,
        })),
      };

      const invoice = await this.invoiceService.createWithItems(invoiceData);
      invoiceId = invoice.id;

      if (invoiceId !== null) {
        sale.associateInvoice(invoiceId);
      } 
      this.logger.log(`Invoice created: ${invoiceId}`);

      // ========================================
      // STEP 6: Deduct Stock
      // ========================================
      this.logger.debug('Step 6: Deducting stock');

      for (const item of sale.getItems()) {
        const product = productMap.get(item.productId)!;

        // Only deduct stock for physical products
        if (product.productType === 'physical') {
          const movement = await this.productService.updateStock(
            item.productId,
            -item.quantity, // Negative for deduction
            `Sale - Invoice ${invoiceId}`,
            `invoice:${invoiceId}`,
          );

          stockMovements.push({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            movementType: 'out',
            movementId: movement.id,
          });

          this.logger.debug(
            `Stock deducted for product ${item.productId}: ${item.quantity} units`,
          );
        }
      }

      sale.markStockDeducted();
      this.logger.log('Stock deduction completed');

      // ========================================
      // STEP 7: Complete Sale
      // ========================================
      this.logger.debug('Step 7: Completing sale');

      sale.complete();

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`Sale completed successfully: ${sale.getId()}`);

      // ========================================
      // STEP 8: Emit Domain Events
      // ========================================
      this.emitDomainEvents(sale);

      // ========================================
      // STEP 9: Build Response
      // ========================================
      const response: ProcessSaleResponseDto = {
        saleId: sale.getId(),
        invoiceId: invoiceId!,
        status: sale.getStatus().getValue(),
        total: sale.calculateTotal(),
        subtotal: sale.calculateSubtotal(),
        totalDiscount: sale.calculateTotalDiscount(),
        totalTax: sale.calculateTotalTax(),
        stockMovements,
        processedAt: new Date(),
        warnings: this.generateWarnings(products),
      };

      return response;
    } catch (error) {
      // ========================================
      // ERROR HANDLING & COMPENSATION
      // ========================================
      this.logger.error('Sale processing failed, starting compensation', error);

      await queryRunner.rollbackTransaction();

      if (sale) {
        sale.markAsFailed(error.message, error);
        await this.compensate(sale, invoiceId, stockMovements);
      }

      throw new SaleProcessingException(
        `Failed to process sale: ${error.message}`,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Compensation logic (rollback)
   * Executes in reverse order of the main workflow
   */
  private async compensate(
    sale: SaleAggregate,
    invoiceId: string | null,
    stockMovements: any[],
  ): Promise<void> {
    this.logger.warn('Starting compensation (rollback)');

    sale.startCompensation();

    try {
      // Reverse stock movements
      if (stockMovements.length > 0) {
        this.logger.debug('Reversing stock movements');

        for (const movement of stockMovements) {
          try {
            await this.productService.updateStock(
              movement.productId,
              movement.quantity, // Positive to restore
              `Compensation - Sale failed`,
              `compensation:sale:${sale.getId()}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to reverse stock for product ${movement.productId}`,
              error,
            );
          }
        }
      }

      // Delete invoice
      if (invoiceId) {
        this.logger.debug(`Deleting invoice ${invoiceId}`);

        try {
          await this.invoiceService.delete(invoiceId);
        } catch (error) {
          this.logger.error(`Failed to delete invoice ${invoiceId}`, error);
        }
      }

      sale.markAsCompensated();
      this.logger.log('Compensation completed');

      // Emit compensation events
      this.emitDomainEvents(sale);
    } catch (error) {
      this.logger.error('Compensation failed', error);
      throw error;
    }
  }

  /**
   * Emit all domain events from the aggregate
   */
  private emitDomainEvents(sale: SaleAggregate): void {
    const events = sale.getDomainEvents();

    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event);
      this.logger.debug(`Event emitted: ${event.eventName}`);
    }

    sale.clearDomainEvents();
  }

  /**
   * Generate warnings (e.g., low stock)
   */
  private generateWarnings(products: any[]): string[] {
    const warnings: string[] = [];

    for (const product of products) {
      if (product.minStock && product.stock < product.minStock) {
        warnings.push(
          `Product "${product.name}" is below minimum stock (current: ${product.stock}, min: ${product.minStock})`,
        );
      }
    }

    return warnings;
  }
}
