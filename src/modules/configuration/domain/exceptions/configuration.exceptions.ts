/**
 * ConfigurationNotFoundException
 * Se lanza cuando no se encuentra una configuración
 */
export class ConfigurationNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Configuración no encontrada: ${identifier}`);
    this.name = 'ConfigurationNotFoundException';
  }
}

/**
 * ConfigurationAlreadyExistsException
 * Se lanza cuando se intenta crear una configuración que ya existe
 */
export class ConfigurationAlreadyExistsException extends Error {
  constructor(configKey: string, scope: string, scopeId?: string) {
    const scopeInfo = scopeId ? `${scope}:${scopeId}` : scope;
    super(`Ya existe una configuración activa con clave '${configKey}' en scope '${scopeInfo}'`);
    this.name = 'ConfigurationAlreadyExistsException';
  }
}

/**
 * InvalidConfigurationKeyException
 * Se lanza cuando la clave de configuración es inválida
 */
export class InvalidConfigurationKeyException extends Error {
  constructor(key: string, reason?: string) {
    const message = reason
      ? `Clave de configuración inválida '${key}': ${reason}`
      : `Clave de configuración inválida: ${key}`;
    super(message);
    this.name = 'InvalidConfigurationKeyException';
  }
}

/**
 * InvalidConfigurationValueException
 * Se lanza cuando el valor de configuración es inválido
 */
export class InvalidConfigurationValueException extends Error {
  constructor(message: string) {
    super(`Valor de configuración inválido: ${message}`);
    this.name = 'InvalidConfigurationValueException';
  }
}

/**
 * InvalidConfigurationScopeException
 * Se lanza cuando el scope de configuración es inválido
 */
export class InvalidConfigurationScopeException extends Error {
  constructor(scope: string) {
    super(`Scope de configuración inválido: ${scope}`);
    this.name = 'InvalidConfigurationScopeException';
  }
}

/**
 * ConfigurationScopeInconsistencyException
 * Se lanza cuando hay inconsistencia entre scope y scopeId
 */
export class ConfigurationScopeInconsistencyException extends Error {
  constructor(scope: string, scopeId: string | null) {
    const message =
      scope === 'system'
        ? `El scope 'system' no debe tener scopeId, pero se proporcionó: ${scopeId}`
        : `El scope '${scope}' requiere un scopeId, pero no se proporcionó`;
    super(message);
    this.name = 'ConfigurationScopeInconsistencyException';
  }
}

/**
 * ConfigurationValidationException
 * Se lanza cuando la validación contra el schema falla
 */
export class ConfigurationValidationException extends Error {
  constructor(errors: string[]) {
    super(`Validación de configuración fallida:\n${errors.join('\n')}`);
    this.name = 'ConfigurationValidationException';
  }
}

/**
 * InvalidConfigurationSchemaException
 * Se lanza cuando el JSON Schema es inválido
 */
export class InvalidConfigurationSchemaException extends Error {
  constructor(message: string) {
    super(`Schema de configuración inválido: ${message}`);
    this.name = 'InvalidConfigurationSchemaException';
  }
}

/**
 * ConfigurationValidityConflictException
 * Se lanza cuando hay conflicto de vigencias entre configuraciones
 */
export class ConfigurationValidityConflictException extends Error {
  constructor(configKey: string, existingValidityRange: string) {
    super(
      `La configuración '${configKey}' tiene conflicto de vigencia con una configuración existente: ${existingValidityRange}`
    );
    this.name = 'ConfigurationValidityConflictException';
  }
}

/**
 * InvalidValidityRangeException
 * Se lanza cuando el rango de vigencia es inválido
 */
export class InvalidValidityRangeException extends Error {
  constructor(message: string) {
    super(`Rango de vigencia inválido: ${message}`);
    this.name = 'InvalidValidityRangeException';
  }
}

/**
 * ConfigurationNotActiveException
 * Se lanza cuando se intenta usar una configuración que no está activa
 */
export class ConfigurationNotActiveException extends Error {
  constructor(configKey: string) {
    super(`La configuración '${configKey}' no está activa`);
    this.name = 'ConfigurationNotActiveException';
  }
}

/**
 * ConfigurationExpiredException
 * Se lanza cuando se intenta usar una configuración que ya expiró
 */
export class ConfigurationExpiredException extends Error {
  constructor(configKey: string, expiredAt: Date) {
    super(`La configuración '${configKey}' expiró el ${expiredAt.toISOString()}`);
    this.name = 'ConfigurationExpiredException';
  }
}

/**
 * ConfigurationPendingException
 * Se lanza cuando se intenta usar una configuración que aún no es válida
 */
export class ConfigurationPendingException extends Error {
  constructor(configKey: string, validFrom: Date) {
    super(`La configuración '${configKey}' será válida desde ${validFrom.toISOString()}`);
    this.name = 'ConfigurationPendingException';
  }
}

/**
 * ConfigurationRequiresApprovalException
 * Se lanza cuando se intenta usar una configuración que requiere aprobación
 */
export class ConfigurationRequiresApprovalException extends Error {
  constructor(configKey: string) {
    super(`La configuración '${configKey}' requiere aprobación antes de ser usada`);
    this.name = 'ConfigurationRequiresApprovalException';
  }
}

/**
 * ConfigurationUnauthorizedApprovalException
 * Se lanza cuando un usuario no autorizado intenta aprobar una configuración
 */
export class ConfigurationUnauthorizedApprovalException extends Error {
  constructor(userId: string, configurationId: string) {
    super(`El usuario '${userId}' no tiene autorización para aprobar la configuración '${configurationId}'`);
    this.name = 'ConfigurationUnauthorizedApprovalException';
  }
}

/**
 * ConfigurationVersionNotFoundException
 * Se lanza cuando no se encuentra una versión específica de configuración
 */
export class ConfigurationVersionNotFoundException extends Error {
  constructor(configKey: string, version: number) {
    super(`No se encontró la versión ${version} de la configuración '${configKey}'`);
    this.name = 'ConfigurationVersionNotFoundException';
  }
}

/**
 * ConfigurationRollbackException
 * Se lanza cuando falla un rollback de configuración
 */
export class ConfigurationRollbackException extends Error {
  constructor(message: string) {
    super(`Error en rollback de configuración: ${message}`);
    this.name = 'ConfigurationRollbackException';
  }
}

/**
 * ConfigurationPermissionException
 * Se lanza cuando no se tienen permisos para realizar una operación
 */
export class ConfigurationPermissionException extends Error {
  constructor(operation: string, userId: string) {
    super(`El usuario '${userId}' no tiene permisos para ${operation}`);
    this.name = 'ConfigurationPermissionException';
  }
}

/**
 * ConfigurationCategoryInvalidException
 * Se lanza cuando la categoría de configuración es inválida
 */
export class ConfigurationCategoryInvalidException extends Error {
  constructor(category: string) {
    super(`Categoría de configuración inválida: ${category}`);
    this.name = 'ConfigurationCategoryInvalidException';
  }
}

/**
 * ConfigurationCompanyMismatchException
 * Se lanza cuando hay inconsistencia entre la configuración y la empresa
 */
export class ConfigurationCompanyMismatchException extends Error {
  constructor(configurationId: string, expectedCompanyId: string, actualCompanyId: string) {
    super(
      `La configuración '${configurationId}' pertenece a la empresa '${actualCompanyId}', no a '${expectedCompanyId}'`
    );
    this.name = 'ConfigurationCompanyMismatchException';
  }
}
