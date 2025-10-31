import { Injectable } from '@nestjs/common';
import { Configuration, ConfigurationScope } from '../entities/configuration.entity';
import { ConfigurationRepositoryAbstract } from '../interfaces/configuration-repository.interface';
import { ConfigurationNotFoundException } from '../exceptions/configuration.exceptions';

/**
 * ConfigurationResolutionService
 * Servicio de dominio encargado de resolver configuraciones con jerarquía multi-tenant
 */
@Injectable()
export class ConfigurationResolutionService {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  /**
   * Resuelve una configuración con jerarquía de precedencia
   * Orden: user > branch > company > system
   */
  async resolve(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration> {
    const configuration = await this.configurationRepository.findWithHierarchy(
      configKey,
      companyId,
      branchId,
      userId
    );

    if (!configuration) {
      throw new ConfigurationNotFoundException(
        `No se encontró configuración para clave '${configKey}' en la jerarquía especificada`
      );
    }

    return configuration;
  }

  /**
   * Resuelve una configuración y retorna su valor
   */
  async resolveValue<T = any>(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string,
    valueKey?: string
  ): Promise<T> {
    const configuration = await this.resolve(configKey, companyId, branchId, userId);
    return configuration.getValue<T>(valueKey);
  }

  /**
   * Resuelve múltiples configuraciones a la vez
   */
  async resolveMultiple(
    configKeys: string[],
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Map<string, Configuration>> {
    const results = new Map<string, Configuration>();

    for (const key of configKeys) {
      try {
        const config = await this.resolve(key, companyId, branchId, userId);
        results.set(key, config);
      } catch (error) {
        // Silenciar errores de configuraciones no encontradas en resolución múltiple
        if (!(error instanceof ConfigurationNotFoundException)) {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Resuelve todas las configuraciones en la jerarquía para una clave
   * Retorna desde la más específica hasta la más general
   */
  async resolveHierarchy(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration[]> {
    const configurations = await this.configurationRepository.findAllInHierarchy(
      configKey,
      companyId,
      branchId,
      userId
    );

    // Ordenar por prioridad (mayor a menor)
    return configurations.sort((a, b) => b.getScopePriority() - a.getScopePriority());
  }

  /**
   * Resuelve configuración con valor por defecto si no existe
   */
  async resolveWithDefault<T = any>(
    configKey: string,
    defaultValue: T,
    companyId?: string,
    branchId?: string,
    userId?: string,
    valueKey?: string
  ): Promise<T> {
    try {
      return await this.resolveValue<T>(configKey, companyId, branchId, userId, valueKey);
    } catch (error) {
      if (error instanceof ConfigurationNotFoundException) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Resuelve configuraciones por categoría con jerarquía
   */
  async resolveByCategory(
    category: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration[]> {
    const allConfigs: Configuration[] = [];

    // Obtener configuraciones de cada nivel
    const scopes: ConfigurationScope[] = ['system', 'company', 'branch', 'user'];
    const scopeIds: (string | undefined)[] = [undefined, companyId, branchId, userId];

    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];
      const scopeId = scopeIds[i];

      if (scope === 'system' || scopeId) {
        const configs = await this.configurationRepository.findByCategory(
          category as any,
          scope,
          scopeId || undefined
        );
        allConfigs.push(...configs.filter((c) => c.isEffective()));
      }
    }

    // Deduplicar por configKey, manteniendo la de mayor prioridad
    const configMap = new Map<string, Configuration>();
    for (const config of allConfigs) {
      const existing = configMap.get(config.configKey);
      if (!existing || config.getScopePriority() > existing.getScopePriority()) {
        configMap.set(config.configKey, config);
      }
    }

    return Array.from(configMap.values());
  }

  /**
   * Obtiene el scope efectivo de una configuración resuelta
   */
  async getEffectiveScope(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<ConfigurationScope> {
    const config = await this.resolve(configKey, companyId, branchId, userId);
    return config.scope;
  }

  /**
   * Verifica si existe una configuración en la jerarquía
   */
  async exists(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      await this.resolve(configKey, companyId, branchId, userId);
      return true;
    } catch (error) {
      if (error instanceof ConfigurationNotFoundException) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Resuelve configuración con merge de valores jerárquicos
   * Combina valores desde system hasta user, aplicando merge profundo
   */
  async resolveWithMerge(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Record<string, any>> {
    const hierarchy = await this.resolveHierarchy(configKey, companyId, branchId, userId);

    if (hierarchy.length === 0) {
      throw new ConfigurationNotFoundException(
        `No se encontró configuración para clave '${configKey}'`
      );
    }

    // Merge desde la menos específica (system) hasta la más específica (user)
    let mergedValue: Record<string, any> = {};

    for (const config of hierarchy.reverse()) {
      mergedValue = this.deepMerge(mergedValue, config.configValue);
    }

    return mergedValue;
  }

  /**
   * Deep merge de dos objetos
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = this.deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }

  /**
   * Obtiene metadata de resolución (qué nivel de jerarquía se usó)
   */
  async getResolutionMetadata(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<{
    effectiveScope: ConfigurationScope;
    effectiveScopeId: string | null;
    totalInHierarchy: number;
    availableScopes: ConfigurationScope[];
  }> {
    const hierarchy = await this.resolveHierarchy(configKey, companyId, branchId, userId);
    const effective = hierarchy[0];

    if (!effective) {
      throw new ConfigurationNotFoundException(
        `No se encontró configuración para clave '${configKey}'`
      );
    }

    return {
      effectiveScope: effective.scope,
      effectiveScopeId: effective.scopeId,
      totalInHierarchy: hierarchy.length,
      availableScopes: hierarchy.map((c) => c.scope),
    };
  }
}
