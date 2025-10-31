/**
 * ConfigurationScope Value Object
 * Representa el alcance de una configuración con validación
 */
export class ConfigurationScope {
  private static readonly VALID_SCOPES = ['system', 'company', 'branch', 'user'] as const;

  private constructor(private readonly value: 'system' | 'company' | 'branch' | 'user') {}

  /**
   * Crea una instancia de ConfigurationScope validada
   */
  static create(scope: string): ConfigurationScope {
    if (!ConfigurationScope.isValid(scope)) {
      throw new Error(
        `Scope inválido: ${scope}. Los valores permitidos son: ${ConfigurationScope.VALID_SCOPES.join(', ')}`
      );
    }
    return new ConfigurationScope(scope as any);
  }

  /**
   * Valida si un valor es un scope válido
   */
  static isValid(scope: string): boolean {
    return ConfigurationScope.VALID_SCOPES.includes(scope as any);
  }

  /**
   * Obtiene el valor del scope
   */
  getValue(): 'system' | 'company' | 'branch' | 'user' {
    return this.value;
  }

  /**
   * Obtiene la prioridad del scope (mayor = más prioritario)
   */
  getPriority(): number {
    const priorities = {
      user: 4,
      branch: 3,
      company: 2,
      system: 1,
    };
    return priorities[this.value];
  }

  /**
   * Verifica si es scope de sistema
   */
  isSystem(): boolean {
    return this.value === 'system';
  }

  /**
   * Verifica si es scope de empresa
   */
  isCompany(): boolean {
    return this.value === 'company';
  }

  /**
   * Verifica si es scope de sucursal
   */
  isBranch(): boolean {
    return this.value === 'branch';
  }

  /**
   * Verifica si es scope de usuario
   */
  isUser(): boolean {
    return this.value === 'user';
  }

  /**
   * Compara con otro scope
   */
  equals(other: ConfigurationScope): boolean {
    return this.value === other.value;
  }

  /**
   * Compara prioridad con otro scope
   * Retorna: positivo si este tiene mayor prioridad, negativo si el otro tiene mayor prioridad, 0 si igual
   */
  comparePriority(other: ConfigurationScope): number {
    return this.getPriority() - other.getPriority();
  }

  /**
   * Verifica si requiere scopeId
   */
  requiresScopeId(): boolean {
    return this.value !== 'system';
  }

  /**
   * Representación en string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtiene todos los scopes válidos
   */
  static getValidScopes(): readonly string[] {
    return ConfigurationScope.VALID_SCOPES;
  }

  /**
   * Crea un scope de sistema
   */
  static system(): ConfigurationScope {
    return new ConfigurationScope('system');
  }

  /**
   * Crea un scope de empresa
   */
  static company(): ConfigurationScope {
    return new ConfigurationScope('company');
  }

  /**
   * Crea un scope de sucursal
   */
  static branch(): ConfigurationScope {
    return new ConfigurationScope('branch');
  }

  /**
   * Crea un scope de usuario
   */
  static user(): ConfigurationScope {
    return new ConfigurationScope('user');
  }
}
