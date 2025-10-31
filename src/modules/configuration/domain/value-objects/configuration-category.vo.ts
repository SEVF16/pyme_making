/**
 * ConfigurationCategory Value Object
 * Representa la categoría funcional de una configuración
 */
export class ConfigurationCategory {
  private static readonly VALID_CATEGORIES = [
    'tax',
    'pricing',
    'workflow',
    'notification',
    'inventory',
    'accounting',
    'general',
  ] as const;

  private static readonly CATEGORY_DESCRIPTIONS: Record<string, string> = {
    tax: 'Configuraciones de impuestos y fiscales',
    pricing: 'Configuraciones de precios y descuentos',
    workflow: 'Configuraciones de flujos de trabajo',
    notification: 'Configuraciones de notificaciones',
    inventory: 'Configuraciones de inventario',
    accounting: 'Configuraciones contables',
    general: 'Configuraciones generales del sistema',
  };

  private constructor(
    private readonly value:
      | 'tax'
      | 'pricing'
      | 'workflow'
      | 'notification'
      | 'inventory'
      | 'accounting'
      | 'general'
  ) {}

  /**
   * Crea una instancia de ConfigurationCategory validada
   */
  static create(category: string): ConfigurationCategory {
    if (!ConfigurationCategory.isValid(category)) {
      throw new Error(
        `Categoría inválida: ${category}. Las categorías permitidas son: ${ConfigurationCategory.VALID_CATEGORIES.join(', ')}`
      );
    }
    return new ConfigurationCategory(category as any);
  }

  /**
   * Valida si un valor es una categoría válida
   */
  static isValid(category: string): boolean {
    return ConfigurationCategory.VALID_CATEGORIES.includes(category as any);
  }

  /**
   * Obtiene el valor de la categoría
   */
  getValue():
    | 'tax'
    | 'pricing'
    | 'workflow'
    | 'notification'
    | 'inventory'
    | 'accounting'
    | 'general' {
    return this.value;
  }

  /**
   * Obtiene la descripción de la categoría
   */
  getDescription(): string {
    return ConfigurationCategory.CATEGORY_DESCRIPTIONS[this.value];
  }

  /**
   * Verifica si es categoría de impuestos
   */
  isTax(): boolean {
    return this.value === 'tax';
  }

  /**
   * Verifica si es categoría de precios
   */
  isPricing(): boolean {
    return this.value === 'pricing';
  }

  /**
   * Verifica si es categoría de workflow
   */
  isWorkflow(): boolean {
    return this.value === 'workflow';
  }

  /**
   * Verifica si es categoría de notificaciones
   */
  isNotification(): boolean {
    return this.value === 'notification';
  }

  /**
   * Verifica si es categoría de inventario
   */
  isInventory(): boolean {
    return this.value === 'inventory';
  }

  /**
   * Verifica si es categoría de contabilidad
   */
  isAccounting(): boolean {
    return this.value === 'accounting';
  }

  /**
   * Verifica si es categoría general
   */
  isGeneral(): boolean {
    return this.value === 'general';
  }

  /**
   * Compara con otra categoría
   */
  equals(other: ConfigurationCategory): boolean {
    return this.value === other.value;
  }

  /**
   * Representación en string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtiene todas las categorías válidas
   */
  static getValidCategories(): readonly string[] {
    return ConfigurationCategory.VALID_CATEGORIES;
  }

  /**
   * Obtiene todas las categorías con sus descripciones
   */
  static getCategoriesWithDescriptions(): Array<{ value: string; description: string }> {
    return ConfigurationCategory.VALID_CATEGORIES.map((cat) => ({
      value: cat,
      description: ConfigurationCategory.CATEGORY_DESCRIPTIONS[cat],
    }));
  }

  /**
   * Factory methods para cada categoría
   */
  static tax(): ConfigurationCategory {
    return new ConfigurationCategory('tax');
  }

  static pricing(): ConfigurationCategory {
    return new ConfigurationCategory('pricing');
  }

  static workflow(): ConfigurationCategory {
    return new ConfigurationCategory('workflow');
  }

  static notification(): ConfigurationCategory {
    return new ConfigurationCategory('notification');
  }

  static inventory(): ConfigurationCategory {
    return new ConfigurationCategory('inventory');
  }

  static accounting(): ConfigurationCategory {
    return new ConfigurationCategory('accounting');
  }

  static general(): ConfigurationCategory {
    return new ConfigurationCategory('general');
  }
}
