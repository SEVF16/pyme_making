/**
 * ConfigurationKey Value Object
 * Representa una clave de configuración con formato y validación
 */
export class ConfigurationKey {
  private static readonly KEY_PATTERN = /^[a-z0-9]+(\.[a-z0-9_]+)*$/;
  private static readonly MAX_LENGTH = 255;
  private static readonly MIN_LENGTH = 3;

  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia de ConfigurationKey validada
   */
  static create(key: string): ConfigurationKey {
    const trimmedKey = key.trim().toLowerCase();

    if (!ConfigurationKey.isValid(trimmedKey)) {
      throw new Error(ConfigurationKey.getValidationErrorMessage(trimmedKey));
    }

    return new ConfigurationKey(trimmedKey);
  }

  /**
   * Valida si una clave es válida
   */
  static isValid(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    if (key.length < ConfigurationKey.MIN_LENGTH) return false;
    if (key.length > ConfigurationKey.MAX_LENGTH) return false;
    if (!ConfigurationKey.KEY_PATTERN.test(key)) return false;
    if (key.startsWith('.') || key.endsWith('.')) return false;
    if (key.includes('..')) return false;
    return true;
  }

  /**
   * Obtiene mensaje de error de validación
   */
  private static getValidationErrorMessage(key: string): string {
    if (!key || typeof key !== 'string') {
      return 'La clave de configuración no puede estar vacía';
    }
    if (key.length < ConfigurationKey.MIN_LENGTH) {
      return `La clave debe tener al menos ${ConfigurationKey.MIN_LENGTH} caracteres`;
    }
    if (key.length > ConfigurationKey.MAX_LENGTH) {
      return `La clave no puede exceder ${ConfigurationKey.MAX_LENGTH} caracteres`;
    }
    if (key.startsWith('.') || key.endsWith('.')) {
      return 'La clave no puede comenzar ni terminar con un punto';
    }
    if (key.includes('..')) {
      return 'La clave no puede contener puntos consecutivos';
    }
    if (!ConfigurationKey.KEY_PATTERN.test(key)) {
      return 'La clave solo puede contener letras minúsculas, números, guiones bajos y puntos como separadores. Formato: categoria.subcategoria.nombre';
    }
    return 'Clave de configuración inválida';
  }

  /**
   * Obtiene el valor de la clave
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Obtiene las partes de la clave separadas por punto
   */
  getParts(): string[] {
    return this.value.split('.');
  }

  /**
   * Obtiene la categoría base (primera parte antes del primer punto)
   */
  getBaseCategory(): string {
    return this.getParts()[0];
  }

  /**
   * Obtiene el nombre final (última parte después del último punto)
   */
  getFinalName(): string {
    const parts = this.getParts();
    return parts[parts.length - 1];
  }

  /**
   * Obtiene el prefijo (todas las partes excepto la última)
   */
  getPrefix(): string | null {
    const parts = this.getParts();
    if (parts.length === 1) return null;
    return parts.slice(0, -1).join('.');
  }

  /**
   * Verifica si la clave comienza con un prefijo específico
   */
  startsWith(prefix: string): boolean {
    return this.value.startsWith(prefix);
  }

  /**
   * Verifica si la clave pertenece a una categoría base
   */
  belongsToCategory(category: string): boolean {
    return this.getBaseCategory() === category.toLowerCase();
  }

  /**
   * Obtiene el nivel de anidamiento (cantidad de partes)
   */
  getDepth(): number {
    return this.getParts().length;
  }

  /**
   * Verifica si es una clave simple (sin puntos)
   */
  isSimple(): boolean {
    return this.getDepth() === 1;
  }

  /**
   * Verifica si es una clave compuesta (con puntos)
   */
  isComposite(): boolean {
    return this.getDepth() > 1;
  }

  /**
   * Compara con otra clave
   */
  equals(other: ConfigurationKey): boolean {
    return this.value === other.value;
  }

  /**
   * Representación en string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Crea una clave hija concatenando un sufijo
   */
  createChild(suffix: string): ConfigurationKey {
    return ConfigurationKey.create(`${this.value}.${suffix}`);
  }

  /**
   * Verifica si es clave padre de otra clave
   */
  isParentOf(other: ConfigurationKey): boolean {
    return other.value.startsWith(this.value + '.');
  }

  /**
   * Verifica si es clave hija de otra clave
   */
  isChildOf(other: ConfigurationKey): boolean {
    return this.value.startsWith(other.value + '.');
  }

  /**
   * Obtiene ejemplos de claves válidas
   */
  static getExamples(): string[] {
    return [
      'tax.default_rate',
      'tax.iva.general',
      'pricing.discount_policy',
      'pricing.bulk.tier1',
      'workflow.invoice.approval',
      'notification.email.enabled',
      'inventory.stock.alert_level',
      'accounting.currency.default',
      'general.timezone',
    ];
  }

  /**
   * Obtiene el patrón regex usado para validación
   */
  static getPattern(): RegExp {
    return ConfigurationKey.KEY_PATTERN;
  }
}
