import { Injectable } from '@nestjs/common';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendInvoiceEmailOptions {
  to: string;
  invoiceNumber: string;
  customerName: string;
  attachments?: EmailAttachment[];
}

@Injectable()
export class EmailService {
  async sendInvoiceEmail(options: SendInvoiceEmailOptions): Promise<void> {
    // Implementación placeholder - aquí integrarías con un servicio real como:
    // - Nodemailer
    // - SendGrid
    // - Amazon SES
    // - etc.
    
    console.log(`Enviando factura ${options.invoiceNumber} a ${options.to}`);
    console.log(`Cliente: ${options.customerName}`);
    console.log(`Adjuntos: ${options.attachments?.length || 0}`);
    
    // Por ahora solo log, pero aquí iría la implementación real
    return Promise.resolve();
  }

  async sendEmail(to: string, subject: string, body: string, attachments?: EmailAttachment[]): Promise<void> {
    console.log(`Enviando email a ${to}: ${subject}`);
    return Promise.resolve();
  }
}