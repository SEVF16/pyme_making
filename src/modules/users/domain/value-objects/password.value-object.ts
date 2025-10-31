import * as bcrypt from 'bcrypt';
import { PasswordPolicy } from '../services/user-security-policy.service';

export class PasswordValueObject {
  private constructor(private readonly hashedValue: string) {}

  /**
   * Crea una instancia desde contraseña plana usando política por defecto
   * @deprecated Usar createFromPlainWithPolicy para aplicar políticas de empresa
   */
  static async createFromPlain(plainPassword: string): Promise<PasswordValueObject> {
    this.validatePasswordStrength(plainPassword);

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    return new PasswordValueObject(hashedPassword);
  }

  /**
   * Crea una instancia desde contraseña plana aplicando política específica
   */
  static async createFromPlainWithPolicy(
    plainPassword: string,
    policy: PasswordPolicy,
  ): Promise<PasswordValueObject> {
    this.validatePasswordWithPolicy(plainPassword, policy);

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    return new PasswordValueObject(hashedPassword);
  }

  static createFromHashed(hashedPassword: string): PasswordValueObject {
    return new PasswordValueObject(hashedPassword);
  }

  /**
   * Validación legacy con valores hardcodeados
   * @deprecated Usar validatePasswordWithPolicy
   */
  private static validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('La contraseña debe contener al menos un número');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('La contraseña debe contener al menos un carácter especial');
    }
  }

  /**
   * Valida contraseña contra política específica
   */
  private static validatePasswordWithPolicy(password: string, policy: PasswordPolicy): void {
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

    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
  }

  async compare(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHashedValue(): string {
    return this.hashedValue;
  }
}
