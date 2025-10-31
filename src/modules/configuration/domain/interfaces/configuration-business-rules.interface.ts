import { Configuration, ConfigurationScope, ConfigurationCategory } from '../entities/configuration.entity';

/**
 * Configuration Business Rules Interface
 * Define las reglas de negocio para configuraciones
 */
export interface ConfigurationBusinessRules {
  /**
   * Verifica si se puede crear una configuración
   */
  canCreateConfiguration(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null
  ): Promise<boolean>;

  /**
   * Verifica si se puede actualizar una configuración
   */
  canUpdateConfiguration(configurationId: string, userId: string): Promise<boolean>;

  /**
   * Verifica si se puede eliminar una configuración
   */
  canDeleteConfiguration(configurationId: string, userId: string): Promise<boolean>;

  /**
   * Verifica si una configuración requiere aprobación
   */
  requiresApproval(category: ConfigurationCategory, scope: ConfigurationScope): boolean;

  /**
   * Verifica si un usuario puede aprobar una configuración
   */
  canApproveConfiguration(configurationId: string, userId: string): Promise<boolean>;

  /**
   * Verifica si se puede hacer rollback de una configuración
   */
  canRollback(configurationId: string, targetVersion: number): Promise<boolean>;

  /**
   * Valida que el scope y scopeId sean consistentes
   */
  validateScopeConsistency(scope: ConfigurationScope, scopeId: string | null): boolean;

  /**
   * Valida rangos de vigencia
   */
  validateValidityRange(validFrom: Date | null, validUntil: Date | null): boolean;

  /**
   * Valida que no haya conflictos de vigencia con otras configuraciones
   */
  validateNoValidityConflicts(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null,
    validFrom: Date | null,
    validUntil: Date | null,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * Verifica si una configuración puede ser activada
   */
  canActivateConfiguration(configurationId: string): Promise<boolean>;

  /**
   * Verifica si una configuración puede ser desactivada
   */
  canDeactivateConfiguration(configurationId: string): Promise<boolean>;

  /**
   * Calcula métricas de configuraciones
   */
  calculateConfigurationMetrics(companyId?: string): Promise<{
    totalConfigurations: number;
    activeConfigurations: number;
    pendingApproval: number;
    expiringSoon: number;
    byCategory: Record<ConfigurationCategory, number>;
    byScope: Record<ConfigurationScope, number>;
  }>;
}
