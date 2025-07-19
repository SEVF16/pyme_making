export class EmailValueObject {
  private constructor(private readonly value: string) {}

  static create(email: string): EmailValueObject {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!this.isValidEmail(cleanEmail)) {
      throw new Error(`Email inválido: ${email}`);
    }

    return new EmailValueObject(cleanEmail);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  getLocalPart(): string {
    return this.value.split('@')[0];
  }
}