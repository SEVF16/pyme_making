import { Injectable } from '@nestjs/common';
import { Configuration, ConfigurationScope } from '../entities/configuration.entity';
import { ConfigurationHistory, ChangeAction } from '../entities/configuration-history.entity';
import { ConfigurationRepositoryAbstract } from '../interfaces/configuration-repository.interface';
import {
  ConfigurationVersionNotFoundException,
  ConfigurationRollbackException,
} from '../exceptions/configuration.exceptions';

/**
 * ConfigurationVersioningService
 * Servicio de dominio encargado del versionado de configuraciones
 */
@Injectable()
export class ConfigurationVersioningService {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  /**
   * Crea una nueva versión de una configuración
   */
  async createNewVersion(
    currentConfiguration: Configuration,
    newValue: Record<string, any>,
    updatedBy: string,
    changeReason?: string
  ): Promise<Configuration> {
    // Desactivar versiones anteriores
    await this.configurationRepository.deactivateOldVersions(
      currentConfiguration.configKey,
      currentConfiguration.scope,
      currentConfiguration.scopeId,
      currentConfiguration.id
    );

    // Crear nueva configuración con versión incrementada
    const newVersionData = {
      ...currentConfiguration.cloneForNewVersion(),
      configValue: newValue,
      updatedBy,
      isActive: true,
    };

    const newConfiguration = await this.configurationRepository.create(newVersionData);

    // Registrar en historial
    await this.recordChange(
      newConfiguration,
      'updated',
      updatedBy,
      currentConfiguration.configValue,
      newValue,
      changeReason
    );

    return newConfiguration;
  }

  /**
   * Realiza rollback a una versión anterior
   */
  async rollback(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null,
    targetVersion: number,
    rolledBackBy: string,
    reason?: string
  ): Promise<Configuration> {
    // Buscar la versión objetivo
    const targetConfiguration = await this.configurationRepository.findByVersion(
      configKey,
      targetVersion,
      scopeId || undefined
    );

    if (!targetConfiguration) {
      throw new ConfigurationVersionNotFoundException(configKey, targetVersion);
    }

    // Buscar la versión actual
    const currentConfiguration = await this.configurationRepository.findLatestVersion(
      configKey,
      scope,
      scopeId || undefined
    );

    if (!currentConfiguration) {
      throw new ConfigurationRollbackException('No se encontró la versión actual');
    }

    // Desactivar la versión actual
    await this.configurationRepository.update(currentConfiguration.id, {
      isActive: false,
    });

    // Crear nueva versión basada en la versión objetivo
    const rolledBackConfiguration = await this.configurationRepository.create({
      ...targetConfiguration.cloneForNewVersion(),
      configValue: targetConfiguration.configValue,
      version: currentConfiguration.version + 1,
      updatedBy: rolledBackBy,
      isActive: true,
    });

    // Registrar en historial
    await this.recordChange(
      rolledBackConfiguration,
      'rollback',
      rolledBackBy,
      currentConfiguration.configValue,
      targetConfiguration.configValue,
      reason || `Rollback a versión ${targetVersion}`
    );

    return rolledBackConfiguration;
  }

  /**
   * Obtiene todas las versiones de una configuración
   */
  async getAllVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration[]> {
    return await this.configurationRepository.findAllVersions(configKey, scope, scopeId);
  }

  /**
   * Obtiene una versión específica
   */
  async getVersion(
    configKey: string,
    version: number,
    scopeId?: string
  ): Promise<Configuration> {
    const configuration = await this.configurationRepository.findByVersion(
      configKey,
      version,
      scopeId
    );

    if (!configuration) {
      throw new ConfigurationVersionNotFoundException(configKey, version);
    }

    return configuration;
  }

  /**
   * Obtiene la última versión
   */
  async getLatestVersion(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration | null> {
    return await this.configurationRepository.findLatestVersion(configKey, scope, scopeId);
  }

  /**
   * Compara dos versiones
   */
  async compareVersions(
    configKey: string,
    version1: number,
    version2: number,
    scopeId?: string
  ): Promise<{
    version1: Configuration;
    version2: Configuration;
    differences: Record<string, { old: any; new: any }>;
  }> {
    const config1 = await this.getVersion(configKey, version1, scopeId);
    const config2 = await this.getVersion(configKey, version2, scopeId);

    const differences = this.calculateDifferences(config1.configValue, config2.configValue);

    return {
      version1: config1,
      version2: config2,
      differences,
    };
  }

  /**
   * Calcula diferencias entre dos valores
   */
  private calculateDifferences(
    value1: Record<string, any>,
    value2: Record<string, any>
  ): Record<string, { old: any; new: any }> {
    const differences: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([
      ...this.getAllKeys(value1),
      ...this.getAllKeys(value2),
    ]);

    for (const key of allKeys) {
      const val1 = this.getValueByPath(value1, key);
      const val2 = this.getValueByPath(value2, key);

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences[key] = { old: val1, new: val2 };
      }
    }

    return differences;
  }

  /**
   * Obtiene todas las claves de un objeto recursivamente
   */
  private getAllKeys(obj: Record<string, any>, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        keys.push(...this.getAllKeys(obj[key], fullKey));
      }
    }

    return keys;
  }

  /**
   * Obtiene valor por path (ej: 'a.b.c')
   */
  private getValueByPath(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Registra un cambio en el historial
   */
  async recordChange(
    configuration: Configuration,
    action: ChangeAction,
    changedBy: string,
    previousValue?: Record<string, any>,
    newValue?: Record<string, any>,
    changeReason?: string,
    metadata?: Record<string, any>
  ): Promise<ConfigurationHistory> {
    const changes = previousValue && newValue
      ? this.calculateDifferences(previousValue, newValue)
      : null;

    const historyData: Partial<ConfigurationHistory> = {
      configurationId: configuration.id,
      companyId: configuration.companyId,
      action,
      previousVersion: configuration.version - 1,
      newVersion: configuration.version,
      scope: configuration.scope,
      category: configuration.category,
      configKey: configuration.configKey,
      previousValue: previousValue || null,
      newValue: newValue || null,
      changes: changes || null,
      changedBy,
      changeReason: changeReason || null,
      metadata: metadata || null,
    };

    return await this.configurationRepository.createHistory(historyData);
  }

  /**
   * Obtiene el historial de versiones
   */
  async getVersionHistory(configurationId: string): Promise<ConfigurationHistory[]> {
    const result = await this.configurationRepository.getHistory(configurationId, {
      sortField: 'createdAt',
      sortDirection: 'DESC',
    });

    return result.result;
  }

  /**
   * Verifica si una configuración tiene versiones anteriores
   */
  async hasPreviousVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<boolean> {
    const versions = await this.getAllVersions(configKey, scope, scopeId);
    return versions.length > 1;
  }

  /**
   * Cuenta el número total de versiones
   */
  async countVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<number> {
    const versions = await this.getAllVersions(configKey, scope, scopeId);
    return versions.length;
  }

  /**
   * Obtiene estadísticas de versiones
   */
  async getVersionStats(configurationId: string): Promise<{
    totalVersions: number;
    totalChanges: number;
    lastChangeDate: Date | null;
    changesByUser: Record<string, number>;
  }> {
    return await this.configurationRepository.getHistoryStats(configurationId);
  }

  /**
   * Limpia versiones antiguas inactivas (mantiene solo las últimas N versiones)
   */
  async cleanupOldVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null,
    keepLastN: number = 10
  ): Promise<number> {
    const allVersions = await this.getAllVersions(configKey, scope, scopeId || undefined);

    // Ordenar por versión descendente
    const sorted = allVersions.sort((a, b) => b.version - a.version);

    // Mantener las últimas N y la activa
    const toDelete = sorted
      .slice(keepLastN)
      .filter((v) => !v.isActive);

    for (const version of toDelete) {
      await this.configurationRepository.delete(version.id);
    }

    return toDelete.length;
  }
}
