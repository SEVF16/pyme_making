import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { InvoiceCalculationService } from '../services/invoice-calculation.service';

export class InvoiceAggregate {
  constructor(
    private readonly invoice: Invoice,
    private readonly calculationService: InvoiceCalculationService
  ) {}

  static create(invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[] = []): InvoiceAggregate {
    const invoice = new Invoice();
    Object.assign(invoice, invoiceData);
    
    invoice.items = items.map(itemData => {
      const item = new InvoiceItem();
      Object.assign(item, itemData);
      item.invoice = invoice;
      return item;
    });

    const calculationService = new InvoiceCalculationService();
    const aggregate = new InvoiceAggregate(invoice, calculationService);
    aggregate.recalculateTotals();
    
    return aggregate;
  }

  getInvoice(): Invoice {
    return this.invoice;
  }

  addItem(itemData: Partial<InvoiceItem>): void {
    const item = new InvoiceItem();
    Object.assign(item, itemData);
    item.invoice = this.invoice;
    item.updateCalculatedFields();

    if (!this.invoice.items) {
      this.invoice.items = [];
    }

    this.invoice.items.push(item);
    this.recalculateTotals();
  }

  updateItem(itemId: string, itemData: Partial<InvoiceItem>): void {
    const item = this.invoice.items?.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`Ítem con ID ${itemId} no encontrado`);
    }

    Object.assign(item, itemData);
    item.updateCalculatedFields();
    this.recalculateTotals();
  }

  removeItem(itemId: string): void {
    if (!this.invoice.items) return;

    const itemIndex = this.invoice.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Ítem con ID ${itemId} no encontrado`);
    }

    this.invoice.items.splice(itemIndex, 1);
    this.recalculateTotals();
  }

  applyGlobalDiscount(discountPercentage: number, discountAmount: number): void {
    this.calculationService.applyGlobalDiscount(this.invoice, discountPercentage, discountAmount);
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    const totals = this.calculationService.calculateInvoiceTotals(this.invoice);
    
    this.invoice.subtotal = totals.subtotal;
    this.invoice.discountTotal = totals.discountTotal;
    this.invoice.taxTotal = totals.taxTotal;
    this.invoice.total = totals.total;
  }

  markAsSent(): void {
    if (!this.invoice.canBeEdited()) {
      throw new Error('La factura no puede ser marcada como enviada en su estado actual');
    }

    if (this.invoice.items?.length === 0) {
      throw new Error('No se puede enviar una factura sin ítems');
    }

    this.invoice.status = 'sent';
  }

  markAsPaid(): void {
    if (!this.invoice.canBePaid()) {
      throw new Error('La factura no puede ser marcada como pagada en su estado actual');
    }

    this.invoice.status = 'paid';
  }

  cancel(): void {
    if (!this.invoice.canBeCancelled()) {
      throw new Error('La factura no puede ser cancelada en su estado actual');
    }

    this.invoice.status = 'cancelled';
  }

  refund(): void {
    if (!this.invoice.canBeRefunded()) {
      throw new Error('La factura no puede ser reembolsada en su estado actual');
    }

    this.invoice.status = 'refunded';
  }

  validate(): string[] {
    const errors: string[] = [];

    // Validar que tiene ítems
    if (!this.invoice.items || this.invoice.items.length === 0) {
      errors.push('La factura debe tener al menos un ítem');
    }

    // Validar fechas
    if (this.invoice.dueDate && this.invoice.issueDate && 
        this.invoice.dueDate < this.invoice.issueDate) {
      errors.push('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
    }

    // Validar montos
    if (this.invoice.total < 0) {
      errors.push('El total de la factura no puede ser negativo');
    }

    // Validar ítems
    this.invoice.items?.forEach((item, index) => {
      if (!item.name || item.name.trim().length === 0) {
        errors.push(`El ítem ${index + 1} debe tener un nombre`);
      }

      if (item.quantity <= 0) {
        errors.push(`El ítem ${index + 1} debe tener una cantidad mayor a 0`);
      }

      if (item.unitPrice < 0) {
        errors.push(`El ítem ${index + 1} no puede tener precio negativo`);
      }
    });

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }

  clone(): InvoiceAggregate {
    const clonedData = {
      ...this.invoice,
      id: undefined, // Nueva factura
      invoiceNumber: undefined, // Se generará nuevo número
      status: 'draft' as const,
      issueDate: new Date(),
      items: undefined, // Se clonarán por separado
    };

    const clonedItems = this.invoice.items?.map(item => item.clone()) || [];

    return InvoiceAggregate.create(clonedData, clonedItems);
  }

  getTotalsByType(): {
    itemsSubtotal: number;
    itemsDiscount: number;
    itemsTax: number;
    globalDiscount: number;
    finalTotal: number;
  } {
    const itemsSubtotal = this.invoice.calculateSubtotal();
    const itemsDiscount = this.invoice.items?.reduce((sum, item) => sum + item.discountTotal, 0) || 0;
    const itemsTax = this.invoice.calculateTotalTax();
    const globalDiscount = (this.invoice.globalDiscountAmount || 0) + 
                          (itemsSubtotal * (this.invoice.globalDiscountPercentage || 0) / 100);

    return {
      itemsSubtotal,
      itemsDiscount,
      itemsTax,
      globalDiscount,
      finalTotal: this.invoice.total,
    };
  }
}