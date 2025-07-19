import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  CustomerNotFoundException,
  CustomerAlreadyExistsException,
  InvalidCustomerRutException,
  InvalidCustomerStatusException,
  InvalidCustomerTypeException,
  InvalidCustomerEmailException,
  CustomerOperationNotAllowedException,
  CustomerCompanyMismatchException,
} from '../../domain/exceptions/customer.exceptions';

@Catch(
  CustomerNotFoundException,
  CustomerAlreadyExistsException,
  InvalidCustomerRutException,
  InvalidCustomerStatusException,
  InvalidCustomerTypeException,
  InvalidCustomerEmailException,
  CustomerOperationNotAllowedException,
  CustomerCompanyMismatchException,
)
export class CustomerExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case CustomerNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case CustomerAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case InvalidCustomerRutException:
      case InvalidCustomerStatusException:
      case InvalidCustomerTypeException:
      case InvalidCustomerEmailException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case CustomerOperationNotAllowedException:
      case CustomerCompanyMismatchException:
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