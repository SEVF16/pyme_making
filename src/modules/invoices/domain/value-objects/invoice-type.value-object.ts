export class InvoiceTypeValueObject {
  private static readonly VALID_TYPES = ['sale', 'purchase', 'credit_note', 'debit_note', 'proforma'] as const;
  
  private constructor(private readonly value: typeof InvoiceTypeValueObject.VALID_TYPES[number]) {}

  static create(type: string): InvoiceTypeValueObject {
    if (!this.VALID_TYPES.includes(type as any)) {
      throw new Error(`Tipo de factura inválido: ${type}`);
    }

    return new InvoiceTypeValueObject(type as any);
  }

  getValue(): string {
    return this.value;
  }

  isSale(): boolean {
    return this.value === 'sale';
  }

  isPurchase(): boolean {
    return this.value === 'purchase';
  }

  isCreditNote(): boolean {
    return this.value === 'credit_note';
  }

  isDebitNote(): boolean {
    return this.value === 'debit_note';
  }

  isProforma(): boolean {
    return this.value === 'proforma';
  }

  affectsRevenue(): boolean {
    return this.value === 'sale' || this.value === 'debit_note';
  }

  affectsExpenses(): boolean {
    return this.value === 'purchase';
  }

  isAdjustment(): boolean {
    return this.value === 'credit_note' || this.value === 'debit_note';
  }

  requiresCustomer(): boolean {
    return this.value === 'sale' || this.value === 'credit_note' || this.value === 'debit_note' || this.value === 'proforma';
  }

  requiresSupplier(): boolean {
    return this.value === 'purchase';
  }

  getDisplayName(): string {
    const names = {
      'sale': 'Factura de Venta',
      'purchase': 'Factura de Compra',
      'credit_note': 'Nota de Crédito',
      'debit_note': 'Nota de Débito',
      'proforma': 'Factura Proforma',
    };

    return names[this.value];
  }

  getPrefix(): string {
    const prefixes = {
      'sale': 'FAC',
      'purchase': 'COM',
      'credit_note': 'NC',
      'debit_note': 'ND',
      'proforma': 'PRO',
    };

    return prefixes[this.value];
  }
}