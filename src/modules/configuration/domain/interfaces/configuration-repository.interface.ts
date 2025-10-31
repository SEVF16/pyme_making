import { Configuration, ConfigurationScope, ConfigurationCategory } from '../entities/configuration.entity';
import { ConfigurationHistory } from '../entities/configuration-history.entity';
import {
  BaseRepositoryInterface,
  PaginatedResult,
  PaginationOptions,
} from '../../../../shared/domain/interfaces/repository.interface';

/**
 * Configuration Repository Interface
 * Define los contratos para operaciones de persistencia de configuraciones
 */
export abstract class ConfigurationRepositoryAbstract implements BaseRepositoryInterface<Configuration> {
  // Métodos heredados de BaseRepositoryInterface
  abstract findById(id: string): Promise<Configuration | null>;
  abstract create(entity: Partial<Configuration>): Promise<Configuration>;
  abstract update(id: string, entity: Partial<Configuration>): Promise<Configuration>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete?(id: string): Promise<void>;
  abstract findAll(options?: PaginationOptions): Promise<PaginatedResult<Configuration>>;

  // Métodos específicos de Configuration

  /**
   * Busca una configuración por clave y scope
   */
  abstract findByKey(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration | null>;

  /**
   * Busca configuraciones activas por clave
   */
  abstract findActiveByKey(configKey: string): Promise<Configuration[]>;

  /**
   * Busca configuraciones por categoría
   */
  abstract findByCategory(
    category: ConfigurationCategory,
    scope?: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration[]>;

  /**
   * Busca configuraciones por scope
   */
  abstract findByScope(scope: ConfigurationScope, scopeId?: string): Promise<Configuration[]>;

  /**
   * Busca configuraciones activas por scope
   */
  abstract findActiveByScope(scope: ConfigurationScope, scopeId?: string): Promise<Configuration[]>;

  /**
   * Busca la configuración más específica para una clave con resolución jerárquica
   * Orden de prioridad: user > branch > company > system
   */
  abstract findWithHierarchy(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration | null>;

  /**
   * Busca todas las configuraciones en la jerarquía para una clave
   */
  abstract findAllInHierarchy(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration[]>;

  /**
   * Busca configuraciones activas y vigentes
   */
  abstract findActiveAndValid(
    scope?: ConfigurationScope,
    scopeId?: string,
    date?: Date
  ): Promise<Configuration[]>;

  /**
   * Busca configuraciones por rango de fechas de vigencia
   */
  abstract findByValidityRange(dateFrom: Date, dateTo: Date): Promise<Configuration[]>;

  /**
   * Busca configuraciones pendientes de aprobación
   */
  abstract findPendingApproval(companyId?: string): Promise<Configuration[]>;

  /**
   * Busca configuraciones por versión
   */
  abstract findByVersion(configKey: string, version: number, scopeId?: string): Promise<Configuration | null>;

  /**
   * Busca la última versión de una configuración
   */
  abstract findLatestVersion(configKey: string, scope: ConfigurationScope, scopeId?: string): Promise<Configuration | null>;

  /**
   * Busca todas las versiones de una configuración
   */
  abstract findAllVersions(configKey: string, scope: ConfigurationScope, scopeId?: string): Promise<Configuration[]>;

  /**
   * Verifica si existe una configuración por clave
   */
  abstract existsByKey(configKey: string, scope: ConfigurationScope, scopeId?: string): Promise<boolean>;

  /**
   * Cuenta configuraciones por scope
   */
  abstract countByScope(scope: ConfigurationScope, scopeId?: string): Promise<number>;

  /**
   * Cuenta configuraciones por categoría
   */
  abstract countByCategory(category: ConfigurationCategory, scopeId?: string): Promise<number>;

  /**
   * Busca configuraciones que expiran pronto
   */
  abstract findExpiringSoon(days: number, companyId?: string): Promise<Configuration[]>;

  /**
   * Desactiva configuraciones antiguas de la misma clave
   */
  abstract deactivateOldVersions(configKey: string, scope: ConfigurationScope, scopeId: string | null, currentId: string): Promise<void>;

  // Métodos para ConfigurationHistory

  /**
   * Crea un registro de historial
   */
  abstract createHistory(history: Partial<ConfigurationHistory>): Promise<ConfigurationHistory>;

  /**
   * Obtiene el historial de una configuración
   */
  abstract getHistory(configurationId: string, options?: PaginationOptions): Promise<PaginatedResult<ConfigurationHistory>>;

  /**
   * Obtiene el historial por clave de configuración
   */
  abstract getHistoryByKey(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>>;

  /**
   * Obtiene el historial de cambios de un usuario
   */
  abstract getHistoryByUser(userId: string, options?: PaginationOptions): Promise<PaginatedResult<ConfigurationHistory>>;

  /**
   * Obtiene el historial de cambios por rango de fechas
   */
  abstract getHistoryByDateRange(
    dateFrom: Date,
    dateTo: Date,
    companyId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>>;

  /**
   * Obtiene estadísticas de historial
   */
  abstract getHistoryStats(configurationId: string): Promise<{
    totalChanges: number;
    totalVersions: number;
    lastChangeDate: Date | null;
    changesByUser: Record<string, number>;
  }>;

  /**
   * Busca en historial por acción
   */
  abstract getHistoryByAction(
    action: 'created' | 'updated' | 'deleted' | 'rollback' | 'approved' | 'deactivated',
    companyId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>>;
}
