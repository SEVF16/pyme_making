import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';
import { InvoiceStatusService } from '../../domain/services/invoice-status.service';

@Injectable()
export class InvoiceSchedulerService {
  private readonly logger = new Logger(InvoiceSchedulerService.name);

  constructor(
    private readonly invoiceRepository: InvoiceRepositoryAbstract,
    private readonly statusService: InvoiceStatusService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOverdueInvoices(): Promise<void> {
    this.logger.log('Iniciando actualización de facturas vencidas');

    try {
      // Buscar todas las facturas enviadas que están vencidas
      const today = new Date();
      const companies = await this.getCompaniesWithInvoices();

      for (const companyId of companies) {
        const invoices = await this.invoiceRepository.findByStatus('sent', companyId);
        const overdueInvoices = invoices.filter(invoice => 
          invoice.dueDate && invoice.dueDate < today
        );

        for (const invoice of overdueInvoices) {
          await this.invoiceRepository.update(invoice.id, { status: 'overdue' });
          this.logger.log(`Factura ${invoice.invoiceNumber} marcada como vencida`);
        }
      }

      this.logger.log('Actualización de facturas vencidas completada');
    } catch (error) {
      this.logger.error('Error al actualizar facturas vencidas', error);
    }
  }

  @Cron('0 0 1 * *') // Primer día de cada mes a medianoche
  async generateMonthlyReports(): Promise<void> {
    this.logger.log('Generando reportes mensuales de facturas');

    try {
      const companies = await this.getCompaniesWithInvoices();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      for (const companyId of companies) {
        const monthlyInvoices = await this.invoiceRepository.findByDateRange(
          firstDay, 
          lastDay, 
          companyId
        );

        const stats = {
          totalInvoices: monthlyInvoices.length,
          totalAmount: monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0),
          paidInvoices: monthlyInvoices.filter(inv => inv.status === 'paid').length,
          overdueInvoices: monthlyInvoices.filter(inv => inv.status === 'overdue').length,
        };

        this.logger.log(`Reporte mensual para empresa ${companyId}:`, stats);
        
        // Aquí podrías enviar el reporte por email o guardarlo en base de datos
      }

      this.logger.log('Reportes mensuales generados exitosamente');
    } catch (error) {
      this.logger.error('Error al generar reportes mensuales', error);
    }
  }

  private async getCompaniesWithInvoices(): Promise<string[]> {
    // Implementación simplificada - en la realidad consultarías las empresas activas
    // que tienen facturas
    return ['sample-company-id'];
  }
}