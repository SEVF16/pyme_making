import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InvoiceNumberValueObject } from '../../domain/value-objects/invoice-number.value-object';

@Injectable()
export class InvoiceValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validar número de factura en parámetros de ruta
    if (req.params.invoiceNumber) {
      try {
        InvoiceNumberValueObject.create(req.params.invoiceNumber);
      } catch (error) {
        throw new BadRequestException(`Número de factura inválido en parámetro: ${req.params.invoiceNumber}`);
      }
    }

    // Validar número de factura en el body para operaciones POST/PUT
    if (req.body && req.body.invoiceNumber && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        InvoiceNumberValueObject.create(req.body.invoiceNumber);
      } catch (error) {
        throw new BadRequestException(`Número de factura inválido en el cuerpo de la petición: ${req.body.invoiceNumber}`);
      }
    }

    // Validar que la factura tenga ítems al crearla
    if (req.method === 'POST' && req.body && (!req.body.items || req.body.items.length === 0)) {
      throw new BadRequestException('La factura debe tener al menos un ítem');
    }

    // Validar fechas
    if (req.body && req.body.dueDate && req.body.issueDate) {
      const issueDate = new Date(req.body.issueDate);
      const dueDate = new Date(req.body.dueDate);
      
      if (dueDate < issueDate) {
        throw new BadRequestException('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
      }
    }

    next();
  }
}