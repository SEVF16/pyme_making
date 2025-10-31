import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  ConfigurationNotFoundException,
  ConfigurationAlreadyExistsException,
  InvalidConfigurationKeyException,
  InvalidConfigurationValueException,
  InvalidConfigurationScopeException,
  ConfigurationScopeInconsistencyException,
  ConfigurationValidationException,
  InvalidConfigurationSchemaException,
  ConfigurationValidityConflictException,
  InvalidValidityRangeException,
  ConfigurationNotActiveException,
  ConfigurationExpiredException,
  ConfigurationPendingException,
  ConfigurationRequiresApprovalException,
  ConfigurationUnauthorizedApprovalException,
  ConfigurationVersionNotFoundException,
  ConfigurationRollbackException,
  ConfigurationPermissionException,
  ConfigurationCategoryInvalidException,
  ConfigurationCompanyMismatchException,
} from '../../domain/exceptions/configuration.exceptions';

@Catch(
  ConfigurationNotFoundException,
  ConfigurationAlreadyExistsException,
  InvalidConfigurationKeyException,
  InvalidConfigurationValueException,
  InvalidConfigurationScopeException,
  ConfigurationScopeInconsistencyException,
  ConfigurationValidationException,
  InvalidConfigurationSchemaException,
  ConfigurationValidityConflictException,
  InvalidValidityRangeException,
  ConfigurationNotActiveException,
  ConfigurationExpiredException,
  ConfigurationPendingException,
  ConfigurationRequiresApprovalException,
  ConfigurationUnauthorizedApprovalException,
  ConfigurationVersionNotFoundException,
  ConfigurationRollbackException,
  ConfigurationPermissionException,
  ConfigurationCategoryInvalidException,
  ConfigurationCompanyMismatchException,
)
export class ConfigurationExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case ConfigurationNotFoundException:
      case ConfigurationVersionNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;

      case ConfigurationAlreadyExistsException:
      case ConfigurationValidityConflictException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;

      case InvalidConfigurationKeyException:
      case InvalidConfigurationValueException:
      case InvalidConfigurationScopeException:
      case ConfigurationScopeInconsistencyException:
      case ConfigurationValidationException:
      case InvalidConfigurationSchemaException:
      case InvalidValidityRangeException:
      case ConfigurationCategoryInvalidException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;

      case ConfigurationNotActiveException:
      case ConfigurationExpiredException:
      case ConfigurationPendingException:
      case ConfigurationRequiresApprovalException:
      case ConfigurationRollbackException:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = exception.message;
        break;

      case ConfigurationPermissionException:
      case ConfigurationUnauthorizedApprovalException:
      case ConfigurationCompanyMismatchException:
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
