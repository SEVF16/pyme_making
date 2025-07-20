import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvoiceCreatedEvent } from '../../domain/events/invoice-created.event';
import { InvoiceStatusChangedEvent } from '../../domain/events/invoice-status-changed.event';
import { InvoicePaidEvent } from '../../domain/events/invoice-paid.event';
import { InvoiceOverdueEvent } from '../../domain/events/invoice-overdue.event';

@Injectable()
export class InvoiceEventHandler {
  private readonly logger = new Logger(InvoiceEventHandler.name);

  @OnEvent('invoice.created')
  handleInvoiceCreated(event: InvoiceCreatedEvent): void {
    this.logger.log(`Factura creada: ${event.invoiceNumber} por ${event.total}`);
    
    // Aquí puedes implementar lógica adicional como:
    // - Enviar notificaciones
    // - Actualizar métricas
    // - Integrar con sistemas externos
  }

  @OnEvent('invoice.status.changed')
  handleStatusChanged(event: InvoiceStatusChangedEvent): void {
    this.logger.log(`Estado de factura ${event.invoiceId} cambió de ${event.previousStatus} a ${event.newStatus}`);
    
    // Lógica para manejar cambios de estado
    if (event.newStatus === 'paid') {
      // Lógica cuando se paga una factura
      this.handleInvoicePaid(event);
    }
  }

  @OnEvent('invoice.paid')
  handleInvoicePaid(event: InvoicePaidEvent | InvoiceStatusChangedEvent): void {
    this.logger.log(`Factura pagada: ${event.invoiceId}`);
    
    // Implementar lógica de factura pagada:
    // - Enviar confirmación al cliente
    // - Actualizar inventario si es necesario
    // - Registrar en contabilidad
  }

  @OnEvent('invoice.overdue')
  handleInvoiceOverdue(event: InvoiceOverdueEvent): void {
    this.logger.log(`Factura vencida: ${event.invoiceNumber} (${event.daysPastDue} días)`);
    
    // Implementar lógica de factura vencida:
    // - Enviar recordatorios automáticos
    // - Aplicar recargos por mora
    // - Notificar al equipo de cobranzas
  }
}