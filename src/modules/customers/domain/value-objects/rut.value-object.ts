export class RutValueObject {
  private constructor(private readonly value: string) {}

  static create(rut: string): RutValueObject {
    const cleanRut = rut.replace(/[.-]/g, '');
    
    if (!this.isValidRut(cleanRut)) {
      throw new Error(`RUT inválido: ${rut}`);
    }

    return new RutValueObject(this.formatRut(cleanRut));
  }

  private static isValidRut(rut: string): boolean {
    // Verificar longitud
    if (rut.length < 8 || rut.length > 9) {
      return false;
    }

    const rutNumber = rut.slice(0, -1);
    const dv = rut.slice(-1).toLowerCase();

    // Verificar que el número sea válido
    if (!/^\d+$/.test(rutNumber)) {
      return false;
    }

    let sum = 0;
    let multiplier = 2;

    // Calcular desde el final hacia el inicio
    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedDv = remainder === 0 ? '0' : 
                        remainder === 1 ? '1' : 
                        remainder === 2 ? 'k' : 
                        (11 - remainder).toString();

    return dv === calculatedDv;
  }

  private static formatRut(rut: string): string {
    const rutNumber = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    return `${rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  }

  getValue(): string {
    return this.value;
  }

  getCleanValue(): string {
    return this.value.replace(/[.-]/g, '');
  }
}
