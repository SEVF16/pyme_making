import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  InvoiceNotFoundException,
  InvoiceItemNotFoundException,
  InvalidInvoiceNumberException,
  DuplicateInvoiceNumberException,
  InvalidInvoiceStatusException,
  InvalidInvoiceTypeException,
  InvalidStatusTransitionException,
  InvoiceNotEditableException,
  EmptyInvoiceException,
  InvalidInvoiceAmountException,
  InvoiceCompanyMismatchException,
} from '../../domain/exceptions/invoice.exceptions';

@Catch(
  InvoiceNotFoundException,
  InvoiceItemNotFoundException,
  InvalidInvoiceNumberException,
  DuplicateInvoiceNumberException,
  InvalidInvoiceStatusException,
  InvalidInvoiceTypeException,
  InvalidStatusTransitionException,
  InvoiceNotEditableException,
  EmptyInvoiceException,
  InvalidInvoiceAmountException,
  InvoiceCompanyMismatchException,
)
export class InvoiceExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case InvoiceNotFoundException:
      case InvoiceItemNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case DuplicateInvoiceNumberException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case InvalidInvoiceNumberException:
      case InvalidInvoiceStatusException:
      case InvalidInvoiceTypeException:
      case InvalidInvoiceAmountException:
      case EmptyInvoiceException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case InvalidStatusTransitionException:
      case InvoiceNotEditableException:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = exception.message;
        break;
      case InvoiceCompanyMismatchException:
        status = HttpStatus.FORBIDDEN;
        message = exception.message;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error interno del servidor';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}