import { Injectable } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    // Aquí implementarías la generación del PDF usando una librería como puppeteer, jsPDF, etc.
    // Por ahora retorno un buffer vacío como placeholder
    
    const pdfContent = this.generatePdfContent(invoice);
    
    // En una implementación real, usarías algo como:
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(pdfContent);
    // const pdf = await page.pdf({ format: 'A4' });
    // await browser.close();
    // return pdf;
    
    // Por ahora retornamos un buffer de ejemplo
    return Buffer.from(pdfContent);
  }

  private generatePdfContent(invoice: Invoice): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
          .totals { text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURA</h1>
          <h2>${invoice.invoiceNumber}</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Fecha:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
          <p><strong>Cliente:</strong> ${invoice.getCustomerName() || 'N/A'}</p>
          <p><strong>Estado:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toLocaleString()}</td>
                <td>${item.total.toLocaleString()}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Subtotal:</strong> ${invoice.subtotal.toLocaleString()}</p>
          <p><strong>Descuentos:</strong> -${invoice.discountTotal.toLocaleString()}</p>
          <p><strong>Impuestos:</strong> ${invoice.taxTotal.toLocaleString()}</p>
          <h3><strong>Total:</strong> ${invoice.total.toLocaleString()}</h3>
        </div>
      </body>
      </html>
    `;
  }

  async generateInvoiceReport(invoices: Invoice[]): Promise<Buffer> {
    // Generar reporte consolidado de múltiples facturas
    const reportContent = this.generateReportContent(invoices);
    return Buffer.from(reportContent);
  }

  private generateReportContent(invoices: Invoice[]): string {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Facturas</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 20px; }
          .invoices-table { width: 100%; border-collapse: collapse; }
          .invoices-table th, .invoices-table td { border: 1px solid #ddd; padding: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE FACTURAS</h1>
        </div>
        
        <div class="summary">
          <p><strong>Total de Facturas:</strong> ${invoices.length}</p>
          <p><strong>Monto Total:</strong> ${totalAmount.toLocaleString()}</p>
        </div>
        
        <table class="invoices-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(invoice => `
              <tr>
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.issueDate.toLocaleDateString()}</td>
                <td>${invoice.getCustomerName() || 'N/A'}</td>
                <td>${invoice.status}</td>
                <td>${invoice.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}