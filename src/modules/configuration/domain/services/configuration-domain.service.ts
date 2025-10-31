import { Injectable } from '@nestjs/common';
import { ConfigurationBusinessRules } from '../interfaces/configuration-business-rules.interface';
import { ConfigurationRepositoryAbstract } from '../interfaces/configuration-repository.interface';
import { ConfigurationScope, ConfigurationCategory } from '../entities/configuration.entity';
import {
  ConfigurationScopeInconsistencyException,
  InvalidValidityRangeException,
  ConfigurationValidityConflictException,
} from '../exceptions/configuration.exceptions';

/**
 * ConfigurationDomainService
 * Implementa las reglas de negocio del dominio de configuraciones
 */
@Injectable()
export class ConfigurationDomainService implements ConfigurationBusinessRules {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async canCreateConfiguration(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null
  ): Promise<boolean> {
    // Validar consistencia de scope
    if (!this.validateScopeConsistency(scope, scopeId)) {
      return false;
    }

    // Verificar si ya existe una configuración activa con la misma clave
    const existing = await this.configurationRepository.findByKey(configKey, scope, scopeId || undefined);

    return !existing || !existing.isActive;
  }

  async canUpdateConfiguration(configurationId: string, userId: string): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // Si requiere aprobación y no está aprobada, solo el creador puede editarla
    if (configuration.requiresApproval() && !configuration.isApproved()) {
      return configuration.createdBy === userId;
    }

    return true;
  }

  async canDeleteConfiguration(configurationId: string, userId: string): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // No se pueden eliminar configuraciones de sistema (solo administradores)
    if (configuration.isSystemLevel()) {
      // Aquí se debería verificar rol de administrador del sistema
      return false;
    }

    return true;
  }

  requiresApproval(category: ConfigurationCategory, scope: ConfigurationScope): boolean {
    // Configuraciones críticas que requieren aprobación
    const criticalCategories: ConfigurationCategory[] = ['tax', 'accounting', 'workflow'];
    const criticalScopes: ConfigurationScope[] = ['system', 'company'];

    return criticalCategories.includes(category) && criticalScopes.includes(scope);
  }

  async canApproveConfiguration(configurationId: string, userId: string): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // El creador no puede aprobar su propia configuración
    if (configuration.createdBy === userId) {
      return false;
    }

    // Aquí se debería verificar rol de aprobador
    // Por ahora, cualquier usuario diferente al creador puede aprobar
    return true;
  }

  async canRollback(configurationId: string, targetVersion: number): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // No se puede hacer rollback a la versión actual o superior
    if (targetVersion >= configuration.version) {
      return false;
    }

    // Verificar que la versión objetivo existe
    const targetConfig = await this.configurationRepository.findByVersion(
      configuration.configKey,
      targetVersion,
      configuration.scopeId || undefined
    );

    return targetConfig !== null;
  }

  validateScopeConsistency(scope: ConfigurationScope, scopeId: string | null): boolean {
    if (scope === 'system') {
      return scopeId === null;
    }

    return scopeId !== null && scopeId.length > 0;
  }

  validateValidityRange(validFrom: Date | null, validUntil: Date | null): boolean {
    if (!validFrom && !validUntil) {
      return true;
    }

    if (validFrom && validUntil) {
      return validFrom < validUntil;
    }

    return true;
  }

  async validateNoValidityConflicts(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null,
    validFrom: Date | null,
    validUntil: Date | null,
    excludeId?: string
  ): Promise<boolean> {
    // Si no tiene rango de vigencia, no hay conflicto
    if (!validFrom && !validUntil) {
      return true;
    }

    // Buscar configuraciones con la misma clave y scope
    const existing = await this.configurationRepository.findByKey(
      configKey,
      scope,
      scopeId || undefined
    );

    if (!existing || (excludeId && existing.id === excludeId)) {
      return true;
    }

    // Verificar si hay solapamiento de fechas
    if (!existing.validFrom && !existing.validUntil) {
      // La configuración existente no tiene rango, hay conflicto
      return false;
    }

    // Verificar solapamiento
    const hasOverlap = this.checkDateOverlap(
      validFrom,
      validUntil,
      existing.validFrom,
      existing.validUntil
    );

    return !hasOverlap;
  }

  private checkDateOverlap(
    start1: Date | null,
    end1: Date | null,
    start2: Date | null,
    end2: Date | null
  ): boolean {
    // Si alguno no tiene fechas, considerar solapamiento
    if (!start1 || !start2) {
      return true;
    }

    if (!end1 && !end2) {
      return true;
    }

    if (!end1) {
      return start1 <= (end2 || new Date());
    }

    if (!end2) {
      return (start2 || new Date()) <= end1;
    }

    return start1 <= end2 && start2 <= end1;
  }

  async canActivateConfiguration(configurationId: string): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // Si requiere aprobación, debe estar aprobada
    if (configuration.requiresApproval() && !configuration.isApproved()) {
      return false;
    }

    return true;
  }

  async canDeactivateConfiguration(configurationId: string): Promise<boolean> {
    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      return false;
    }

    // Siempre se puede desactivar
    return true;
  }

  async calculateConfigurationMetrics(companyId?: string): Promise<{
    totalConfigurations: number;
    activeConfigurations: number;
    pendingApproval: number;
    expiringSoon: number;
    byCategory: Record<ConfigurationCategory, number>;
    byScope: Record<ConfigurationScope, number>;
  }> {
    const byCategory: Record<ConfigurationCategory, number> = {
      tax: 0,
      pricing: 0,
      workflow: 0,
      notification: 0,
      inventory: 0,
      accounting: 0,
      general: 0,
    };

    const byScope: Record<ConfigurationScope, number> = {
      system: 0,
      company: 0,
      branch: 0,
      user: 0,
    };

    // Obtener todas las configuraciones
    const allConfigs = companyId
      ? await this.configurationRepository.findByScope('company', companyId)
      : await this.configurationRepository.findAll();

    const totalConfigurations = Array.isArray(allConfigs) ? allConfigs.length : allConfigs.result.length;
    const configs = Array.isArray(allConfigs) ? allConfigs : allConfigs.result;

    const activeConfigurations = configs.filter((c) => c.isActive).length;

    const pendingApprovalConfigs = await this.configurationRepository.findPendingApproval(companyId);
    const pendingApproval = pendingApprovalConfigs.length;

    const expiringSoonConfigs = await this.configurationRepository.findExpiringSoon(30, companyId);
    const expiringSoon = expiringSoonConfigs.length;

    // Contar por categoría
    for (const config of configs) {
      byCategory[config.category]++;
      byScope[config.scope]++;
    }

    return {
      totalConfigurations,
      activeConfigurations,
      pendingApproval,
      expiringSoon,
      byCategory,
      byScope,
    };
  }
}
