import { Injectable } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';

@Injectable()
export class InvoiceCalculationService {
  calculateItemTotals(item: InvoiceItem): {
    subtotal: number;
    discountTotal: number;
    taxAmount: number;
    total: number;
  } {
    const subtotal = item.calculateSubtotal();
    const discountTotal = item.calculateDiscountTotal();
    const taxAmount = item.calculateTaxAmount();
    const total = item.calculateTotal();

    return {
      subtotal,
      discountTotal,
      taxAmount,
      total,
    };
  }

  calculateInvoiceTotals(invoice: Invoice): {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
  } {
    if (!invoice.items || invoice.items.length === 0) {
      return {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        total: 0,
      };
    }

    // Primero calcular totales de cada ítem
    invoice.items.forEach(item => {
      item.updateCalculatedFields();
    });

    // Calcular subtotal de la factura
    const subtotal = invoice.calculateSubtotal();

    // Calcular descuento total (ítems + descuento global)
    let discountTotal = invoice.items.reduce((sum, item) => sum + item.discountTotal, 0);
    
    // Aplicar descuento global
    if (invoice.globalDiscountPercentage > 0) {
      const globalDiscountByPercentage = subtotal * (invoice.globalDiscountPercentage / 100);
      discountTotal += globalDiscountByPercentage;
    }
    
    if (invoice.globalDiscountAmount > 0) {
      discountTotal += invoice.globalDiscountAmount;
    }

    // Calcular impuestos totales
    const taxTotal = invoice.calculateTotalTax();

    // Calcular total final
    const total = subtotal - discountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      total: Math.max(0, total), // No puede ser negativo
    };
  }

  applyGlobalDiscount(invoice: Invoice, discountPercentage: number, discountAmount: number): void {
    const subtotal = invoice.calculateSubtotal();
    
    let totalGlobalDiscount = 0;
    
    if (discountPercentage > 0) {
      totalGlobalDiscount += subtotal * (discountPercentage / 100);
    }
    
    if (discountAmount > 0) {
      totalGlobalDiscount += discountAmount;
    }

    // No puede ser mayor al subtotal
    totalGlobalDiscount = Math.min(totalGlobalDiscount, subtotal);

    invoice.globalDiscountPercentage = discountPercentage;
    invoice.globalDiscountAmount = discountAmount;
  }

  validateInvoiceAmounts(invoice: Invoice): boolean {
    // Validar que los totales sean consistentes
    const calculatedTotals = this.calculateInvoiceTotals(invoice);
    
    const tolerance = 0.01; // Tolerancia para diferencias de redondeo
    
    return (
      Math.abs(invoice.subtotal - calculatedTotals.subtotal) <= tolerance &&
      Math.abs(invoice.discountTotal - calculatedTotals.discountTotal) <= tolerance &&
      Math.abs(invoice.taxTotal - calculatedTotals.taxTotal) <= tolerance &&
      Math.abs(invoice.total - calculatedTotals.total) <= tolerance
    );
  }

  calculateEffectiveTaxRate(invoice: Invoice): number {
    if (invoice.subtotal === 0) return 0;
    
    const netAmount = invoice.subtotal - invoice.discountTotal;
    if (netAmount === 0) return 0;
    
    return (invoice.taxTotal / netAmount) * 100;
  }

  calculateEffectiveDiscountRate(invoice: Invoice): number {
    if (invoice.subtotal === 0) return 0;
    
    return (invoice.discountTotal / invoice.subtotal) * 100;
  }
}