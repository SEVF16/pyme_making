import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// Domain Exceptions
export class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Usuario no encontrado: ${identifier}`);
    this.name = 'UserNotFoundException';
  }
}

export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Ya existe un usuario con email: ${email}`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class InvalidEmailException extends Error {
  constructor(email: string) {
    super(`Email inválido: ${email}`);
    this.name = 'InvalidEmailException';
  }
}

export class WeakPasswordException extends Error {
  constructor(message: string) {
    super(`Contraseña no válida: ${message}`);
    this.name = 'WeakPasswordException';
  }
}

export class InvalidUserRoleException extends Error {
  constructor(role: string) {
    super(`Rol de usuario inválido: ${role}`);
    this.name = 'InvalidUserRoleException';
  }
}

export class InsufficientPermissionsException extends Error {
  constructor(action: string) {
    super(`Permisos insuficientes para: ${action}`);
    this.name = 'InsufficientPermissionsException';
  }
}

@Catch(
  UserNotFoundException,
  UserAlreadyExistsException,
  InvalidEmailException,
  WeakPasswordException,
  InvalidUserRoleException,
  InsufficientPermissionsException,
)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case UserNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case UserAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case InvalidEmailException:
      case WeakPasswordException:
      case InvalidUserRoleException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case InsufficientPermissionsException:
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
    });
  }
}