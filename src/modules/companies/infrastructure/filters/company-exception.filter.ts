import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class CompanyNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Empresa no encontrada: ${identifier}`);
    this.name = 'CompanyNotFoundException';
  }
}

export class CompanyAlreadyExistsException extends Error {
  constructor(rut: string) {
    super(`Ya existe una empresa con RUT: ${rut}`);
    this.name = 'CompanyAlreadyExistsException';
  }
}

export class InvalidRutException extends Error {
  constructor(rut: string) {
    super(`RUT inválido: ${rut}`);
    this.name = 'InvalidRutException';
  }
}

export class InvalidCompanyStatusException extends Error {
  constructor(status: string) {
    super(`Estado de empresa inválido: ${status}`);
    this.name = 'InvalidCompanyStatusException';
  }
}

@Catch(
  CompanyNotFoundException,
  CompanyAlreadyExistsException,
  InvalidRutException,
  InvalidCompanyStatusException,
)
export class CompanyExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case CompanyNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case CompanyAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case InvalidRutException:
      case InvalidCompanyStatusException:
        status = HttpStatus.BAD_REQUEST;
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
