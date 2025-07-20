import { BaseValueObject } from '../../../../shared/domain/value-objects/base.value-object';

export class InvoiceNumberValueObject extends BaseValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(invoiceNumber: string): InvoiceNumberValueObject {
    const cleanNumber = invoiceNumber.trim();
    
    if (!this.isValidInvoiceNumber(cleanNumber)) {
      throw new Error(`Número de factura inválido: ${invoiceNumber}`);
    }

    return new InvoiceNumberValueObject(cleanNumber);
  }

  private static isValidInvoiceNumber(number: string): boolean {
    // Número de factura debe tener entre 1 y 50 caracteres
    if (number.length < 1 || number.length > 50) return false;
    
    // Solo letras, números, guiones y guiones bajos
    const numberRegex = /^[A-Z0-9_-]+$/i;
    return numberRegex.test(number);
  }

  getPrefix(): string | null {
    const parts = this.value.split('-');
    return parts.length > 1 ? parts[0] : null;
  }

  getSequentialNumber(): string | null {
    const parts = this.value.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : null;
  }

  isSequential(): boolean {
    const sequential = this.getSequentialNumber();
    return sequential ? /^\d+$/.test(sequential) : false;
  }
}