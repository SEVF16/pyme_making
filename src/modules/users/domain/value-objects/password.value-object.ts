import * as bcrypt from 'bcrypt';

export class PasswordValueObject {
  private constructor(private readonly hashedValue: string) {}

  static async createFromPlain(plainPassword: string): Promise<PasswordValueObject> {
    this.validatePasswordStrength(plainPassword);
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    return new PasswordValueObject(hashedPassword);
  }

  static createFromHashed(hashedPassword: string): PasswordValueObject {
    return new PasswordValueObject(hashedPassword);
  }

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

  async compare(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHashedValue(): string {
    return this.hashedValue;
  }
}
