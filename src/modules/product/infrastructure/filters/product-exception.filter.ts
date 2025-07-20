import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  ProductNotFoundException,
  ProductAlreadyExistsException,
  InvalidProductSkuException,
  InvalidProductPriceException,
  InvalidProductStockException,
  InsufficientStockException,
  ProductNotActiveException,
  ProductDiscontinuedException,
  InvalidStockMovementException,
  ProductCompanyMismatchException,
} from '../../domain/exceptions/product.exceptions';

@Catch(
  ProductNotFoundException,
  ProductAlreadyExistsException,
  InvalidProductSkuException,
  InvalidProductPriceException,
  InvalidProductStockException,
  InsufficientStockException,
  ProductNotActiveException,
  ProductDiscontinuedException,
  InvalidStockMovementException,
  ProductCompanyMismatchException,
)
export class ProductExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case ProductNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case ProductAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case InvalidProductSkuException:
      case InvalidProductPriceException:
      case InvalidProductStockException:
      case InvalidStockMovementException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case InsufficientStockException:
      case ProductNotActiveException:
      case ProductDiscontinuedException:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = exception.message;
        break;
      case ProductCompanyMismatchException:
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