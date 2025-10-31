import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../../companies/domain/entities/company.entity';

export type ConfigurationScope = 'system' | 'company' | 'branch' | 'user';
export type ConfigurationCategory =
  | 'tax'
  | 'pricing'
  | 'workflow'
  | 'notification'
  | 'inventory'
  | 'accounting'
  | 'general';

/**
 * Configuration Entity
 * Representa una configuración del sistema con soporte para jerarquía multi-tenant,
 * versionado, validación con JSON Schema y vigencia temporal.
 */
@Entity('configurations')
@Index(['scope', 'scopeId', 'category', 'configKey'])
@Index(['scope', 'scopeId', 'isActive'])
@Index(['category', 'isActive'])
@Index(['configKey', 'isActive'])
export class Configuration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nivel de alcance de la configuración
   */
  @Column({
    type: 'enum',
    enum: ['system', 'company', 'branch', 'user'],
    default: 'company',
  })
  scope: ConfigurationScope;

  /**
   * ID del scope (companyId, branchId, userId)
   * Nullable para configuraciones de nivel 'system'
   */
  @Column({ type: 'varchar', nullable: true })
  scopeId: string | null;

  /**
   * Relación con Company (solo cuando scope = 'company')
   */
  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  /**
   * Categoría funcional de la configuración
   */
  @Column({
    type: 'enum',
    enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'],
  })
  category: ConfigurationCategory;

  /**
   * Clave única de configuración (ej: 'tax.default_rate', 'pricing.discount_policy')
   */
  @Column()
  configKey: string;

  /**
   * Valor de configuración en formato JSON
   */
  @Column({ type: 'jsonb' })
  configValue: Record<string, any>;

  /**
   * JSON Schema para validación del configValue
   */
  @Column({ type: 'jsonb', nullable: true })
  schema: Record<string, any> | null;

  /**
   * Versión de la configuración (incrementa con cada actualización)
   */
  @Column({ type: 'int', default: 1 })
  version: number;

  /**
   * Indica si la configuración está activa
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * Fecha desde la cual la configuración es válida
   */
  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date | null;

  /**
   * Fecha hasta la cual la configuración es válida
   */
  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date | null;

  /**
   * ID del usuario que creó la configuración
   */
  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  /**
   * ID del usuario que actualizó la configuración por última vez
   */
  @Column({ type: 'varchar', nullable: true })
  updatedBy: string | null;

  /**
   * ID del usuario que aprobó la configuración (si requiere aprobación)
   */
  @Column({ type: 'varchar', nullable: true })
  approvedBy: string | null;

  /**
   * Fecha de aprobación
   */
  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  /**
   * Metadatos adicionales de la configuración
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  /**
   * Descripción de la configuración
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Domain Methods

  /**
   * Verifica si la configuración es de nivel sistema
   */
  isSystemLevel(): boolean {
    return this.scope === 'system';
  }

  /**
   * Verifica si la configuración es de nivel empresa
   */
  isCompanyLevel(): boolean {
    return this.scope === 'company';
  }

  /**
   * Verifica si la configuración es de nivel sucursal
   */
  isBranchLevel(): boolean {
    return this.scope === 'branch';
  }

  /**
   * Verifica si la configuración es de nivel usuario
   */
  isUserLevel(): boolean {
    return this.scope === 'user';
  }

  /**
   * Verifica si la configuración está vigente en la fecha especificada
   */
  isValidAt(date: Date = new Date()): boolean {
    const now = date.getTime();

    if (this.validFrom && now < this.validFrom.getTime()) {
      return false;
    }

    if (this.validUntil && now > this.validUntil.getTime()) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si la configuración está activa y vigente
   */
  isEffective(date: Date = new Date()): boolean {
    return this.isActive && this.isValidAt(date);
  }

  /**
   * Verifica si la configuración ha expirado
   */
  hasExpired(date: Date = new Date()): boolean {
    if (!this.validUntil) return false;
    return date.getTime() > this.validUntil.getTime();
  }

  /**
   * Verifica si la configuración está pendiente de vigencia
   */
  isPending(date: Date = new Date()): boolean {
    if (!this.validFrom) return false;
    return date.getTime() < this.validFrom.getTime();
  }

  /**
   * Verifica si la configuración ha sido aprobada
   */
  isApproved(): boolean {
    return this.approvedBy !== null && this.approvedAt !== null;
  }

  /**
   * Verifica si la configuración requiere aprobación (según metadata)
   */
  requiresApproval(): boolean {
    return this.metadata?.requiresApproval === true;
  }

  /**
   * Obtiene el valor de una clave específica del configValue
   */
  getValue<T = any>(key?: string): T {
    if (!key) return this.configValue as T;
    const keys = key.split('.');
    let value: any = this.configValue;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined as T;
      }
    }
    return value as T;
  }

  /**
   * Crea una copia de la configuración para una nueva versión
   */
  cloneForNewVersion(): Partial<Configuration> {
    return {
      scope: this.scope,
      scopeId: this.scopeId,
      companyId: this.companyId,
      category: this.category,
      configKey: this.configKey,
      configValue: { ...this.configValue },
      schema: this.schema ? { ...this.schema } : null,
      version: this.version + 1,
      isActive: this.isActive,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      metadata: this.metadata ? { ...this.metadata } : null,
      description: this.description,
    };
  }

  /**
   * Obtiene la prioridad del scope (mayor = más prioritario)
   */
  getScopePriority(): number {
    const priorities: Record<ConfigurationScope, number> = {
      user: 4,
      branch: 3,
      company: 2,
      system: 1,
    };
    return priorities[this.scope];
  }

  /**
   * Compara la prioridad con otra configuración
   * Retorna: positivo si esta es más prioritaria, negativo si la otra es más prioritaria, 0 si igual
   */
  comparePriority(other: Configuration): number {
    return this.getScopePriority() - other.getScopePriority();
  }

  /**
   * Verifica si tiene un schema de validación
   */
  hasSchema(): boolean {
    return this.schema !== null && Object.keys(this.schema).length > 0;
  }

  /**
   * Verifica si pertenece a un scope específico
   */
  belongsToScope(scope: ConfigurationScope, scopeId?: string): boolean {
    if (this.scope !== scope) return false;
    if (scopeId && this.scopeId !== scopeId) return false;
    return true;
  }

  /**
   * Marca la configuración como inactiva
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Marca la configuración como activa
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Aprueba la configuración
   */
  approve(approvedBy: string): void {
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  /**
   * Incrementa la versión
   */
  incrementVersion(): void {
    this.version += 1;
  }
}
