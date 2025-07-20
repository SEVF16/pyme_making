import { Injectable } from '@nestjs/common';
import { InvoiceRepositoryAbstract } from '../interfaces/invoice-repository.interface';
import { InvoiceTypeValueObject } from '../value-objects/invoice-type.value-object';

@Injectable()
export class InvoiceNumberService {
  constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

  async generateInvoiceNumber(companyId: string, type: string): Promise<string> {
    const invoiceType = InvoiceTypeValueObject.create(type);
    const prefix = invoiceType.getPrefix();
    const year = new Date().getFullYear();
    
    // Obtener el siguiente número secuencial
    const nextNumber = await this.invoiceRepository.getNextInvoiceNumber(companyId, type);
    
    // Formato: PREFIX-YYYY-NNNNN
    return `${prefix}-${year}-${nextNumber.padStart(5, '0')}`;
  }

  async isInvoiceNumberAvailable(invoiceNumber: string, companyId: string): Promise<boolean> {
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber, companyId);
    return !existingInvoice;
  }

  validateInvoiceNumberFormat(invoiceNumber: string): boolean {
    // Formato esperado: XXX-YYYY-NNNNN
    const pattern = /^[A-Z]{2,4}-\d{4}-\d{5}$/;
    return pattern.test(invoiceNumber);
  }

  extractInvoiceNumberParts(invoiceNumber: string): {
    prefix: string;
    year: string;
    sequence: string;
  } | null {
    const pattern = /^([A-Z]{2,4})-(\d{4})-(\d{5})$/;
    const match = invoiceNumber.match(pattern);
    
    if (!match) return null;
    
    return {
      prefix: match[1],
      year: match[2],
      sequence: match[3],
    };
  }

  generateCustomInvoiceNumber(prefix: string, year: number, sequence: number): string {
    return `${prefix}-${year}-${sequence.toString().padStart(5, '0')}`;
  }
}