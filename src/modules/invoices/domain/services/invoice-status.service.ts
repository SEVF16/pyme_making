import { Injectable } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceStatusValueObject } from '../value-objects/invoice-status.value-object';

@Injectable()
export class InvoiceStatusService {
  updateOverdueInvoices(invoices: Invoice[]): Invoice[] {
    const today = new Date();
    
    return invoices.map(invoice => {
      if (invoice.dueDate && 
          invoice.status === 'sent' && 
          today > invoice.dueDate) {
        invoice.status = 'overdue';
      }
      return invoice;
    });
  }

  canTransitionTo(currentStatus: string, newStatus: string): boolean {
    const current = InvoiceStatusValueObject.create(currentStatus);
    const target = InvoiceStatusValueObject.create(newStatus);
    
    return current.canTransitionTo(target);
  }

  getValidTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      'draft': ['sent', 'cancelled'],
      'sent': ['paid', 'overdue', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': ['refunded'],
      'cancelled': [],
      'refunded': [],
    };

    return transitions[currentStatus] || [];
  }

  getStatusPriority(status: string): number {
    const priorities = {
      'overdue': 1,
      'sent': 2,
      'draft': 3,
      'paid': 4,
      'cancelled': 5,
      'refunded': 6,
    };

    return priorities[status] || 999;
  }

  getStatusColor(status: string): string {
    const colors = {
      'draft': '#6B7280',      // Gray
      'sent': '#3B82F6',       // Blue
      'paid': '#10B981',       // Green
      'overdue': '#EF4444',    // Red
      'cancelled': '#6B7280',  // Gray
      'refunded': '#F59E0B',   // Amber
    };

    return colors[status] || '#6B7280';
  }
}