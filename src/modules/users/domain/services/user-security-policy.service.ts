import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationResolutionService } from '../../../configuration/domain/services/configuration-resolution.service';

/**
 * UserSecurityPolicyService
 * Servicio de dominio que gestiona políticas de seguridad configurables para usuarios
 */
@Injectable()
export class UserSecurityPolicyService {
  private readonly logger = new Logger(UserSecurityPolicyService.name);

  constructor(
    private readonly configResolutionService: ConfigurationResolutionService,
  ) {}

  /**
   * Obtiene la política de contraseñas para una empresa
   */
  async getPasswordPolicy(companyId: string): Promise<PasswordPolicy> {
    const defaultPolicy: PasswordPolicy = {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      specialChars: '@$!%*?&',
      maxAgeDays: 90,
    };

    try {
      const configuredPolicy = await this.configResolutionService.resolveValue<PasswordPolicy>(
        'users.password_policy',
        companyId,
      );

      this.logger.debug(`Password policy loaded from configuration for company ${companyId}`);
      return configuredPolicy || defaultPolicy;
    } catch (error) {
      this.logger.debug(
        `Using default password policy for company ${companyId}: ${error.message}`,
      );
      return defaultPolicy;
    }
  }

  /**
   * Obtiene la política de sesiones para una empresa
   */
  async getSessionPolicy(companyId: string): Promise<SessionPolicy> {
    const defaultPolicy: SessionPolicy = {
      sessionTimeout: '24h',
      maxConcurrentSessions: 3,
      refreshTokenExpiry: '7d',
    };

    try {
      const configuredPolicy = await this.configResolutionService.resolveValue<SessionPolicy>(
        'users.session_policy',
        companyId,
      );

      return configuredPolicy || defaultPolicy;
    } catch (error) {
      this.logger.debug(
        `Using default session policy for company ${companyId}: ${error.message}`,
      );
      return defaultPolicy;
    }
  }

  /**
   * Obtiene la configuración de verificación de email
   */
  async getEmailVerificationConfig(companyId: string): Promise<EmailVerificationConfig> {
    const defaultConfig: EmailVerificationConfig = {
      tokenExpiryHours: 24,
      requireVerification: true,
      resendCooldownMinutes: 5,
    };

    try {
      const configuredConfig = await this.configResolutionService.resolveValue<EmailVerificationConfig>(
        'users.email_verification',
        companyId,
      );

      return configuredConfig || defaultConfig;
    } catch (error) {
      this.logger.debug(
        `Using default email verification config for company ${companyId}: ${error.message}`,
      );
      return defaultConfig;
    }
  }

  /**
   * Obtiene la configuración de reset de contraseña
   */
  async getPasswordResetConfig(companyId: string): Promise<PasswordResetConfig> {
    const defaultConfig: PasswordResetConfig = {
      tokenExpiryHours: 1,
      maxAttemptsPerDay: 3,
      cooldownMinutes: 15,
    };

    try {
      const configuredConfig = await this.configResolutionService.resolveValue<PasswordResetConfig>(
        'users.password_reset',
        companyId,
      );

      return configuredConfig || defaultConfig;
    } catch (error) {
      this.logger.debug(
        `Using default password reset config for company ${companyId}: ${error.message}`,
      );
      return defaultConfig;
    }
  }

  /**
   * Obtiene la configuración de intentos de login
   */
  async getLoginAttemptsConfig(companyId: string): Promise<LoginAttemptsConfig> {
    const defaultConfig: LoginAttemptsConfig = {
      maxAttempts: 5,
      lockoutDurationMinutes: 30,
      resetAfterMinutes: 60,
    };

    try {
      const configuredConfig = await this.configResolutionService.resolveValue<LoginAttemptsConfig>(
        'users.login_attempts',
        companyId,
      );

      return configuredConfig || defaultConfig;
    } catch (error) {
      this.logger.debug(
        `Using default login attempts config for company ${companyId}: ${error.message}`,
      );
      return defaultConfig;
    }
  }

  /**
   * Valida si una contraseña cumple con la política de la empresa
   */
  async validatePassword(password: string, companyId: string): Promise<PasswordValidationResult> {
    const policy = await this.getPasswordPolicy(companyId);
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`La contraseña debe tener al menos ${policy.minLength} caracteres`);
    }

    if (policy.requireLowercase && !/(?=.*[a-z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (policy.requireUppercase && !/(?=.*[A-Z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (policy.requireNumbers && !/(?=.*\d)/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (policy.requireSpecialChars) {
      const specialCharsRegex = new RegExp(`(?=.*[${policy.specialChars}])`);
      if (!specialCharsRegex.test(password)) {
        errors.push(
          `La contraseña debe contener al menos un carácter especial (${policy.specialChars})`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      policy,
    };
  }
}

// Types
export interface PasswordPolicy {
  minLength: number;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
  maxAgeDays: number;
}

export interface SessionPolicy {
  sessionTimeout: string;
  maxConcurrentSessions: number;
  refreshTokenExpiry: string;
}

export interface EmailVerificationConfig {
  tokenExpiryHours: number;
  requireVerification: boolean;
  resendCooldownMinutes: number;
}

export interface PasswordResetConfig {
  tokenExpiryHours: number;
  maxAttemptsPerDay: number;
  cooldownMinutes: number;
}

export interface LoginAttemptsConfig {
  maxAttempts: number;
  lockoutDurationMinutes: number;
  resetAfterMinutes: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  policy: PasswordPolicy;
}
