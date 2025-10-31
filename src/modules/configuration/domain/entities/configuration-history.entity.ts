import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Configuration, ConfigurationScope, ConfigurationCategory } from './configuration.entity';
import { Company } from '../../../companies/domain/entities/company.entity';

export type ChangeAction = 'created' | 'updated' | 'deleted' | 'rollback' | 'approved' | 'deactivated';

/**
 * ConfigurationHistory Entity
 * Registra todos los cambios realizados sobre las configuraciones para auditoría y rollback
 */
@Entity('configuration_history')
@Index(['configurationId', 'createdAt'])
@Index(['changedBy', 'createdAt'])
@Index(['action', 'createdAt'])
export class ConfigurationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID de la configuración afectada
   */
  @Column({ type: 'varchar' })
  configurationId: string;

  @ManyToOne(() => Configuration)
  @JoinColumn({ name: 'configurationId' })
  configuration: Configuration;

  /**
   * Relación con Company para auditoría
   */
  @Column({ type: 'varchar', nullable: true })
  companyId: string | null;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  /**
   * Acción realizada
   */
  @Column({
    type: 'enum',
    enum: ['created', 'updated', 'deleted', 'rollback', 'approved', 'deactivated'],
  })
  action: ChangeAction;

  /**
   * Versión antes del cambio
   */
  @Column({ type: 'int' })
  previousVersion: number;

  /**
   * Versión después del cambio
   */
  @Column({ type: 'int' })
  newVersion: number;

  /**
   * Scope de la configuración (snapshot)
   */
  @Column({
    type: 'enum',
    enum: ['system', 'company', 'branch', 'user'],
  })
  scope: ConfigurationScope;

  /**
   * Categoría de la configuración (snapshot)
   */
  @Column({
    type: 'enum',
    enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'],
  })
  category: ConfigurationCategory;

  /**
   * Clave de configuración (snapshot)
   */
  @Column({ type: 'varchar' })
  configKey: string;

  /**
   * Valor anterior de la configuración
   */
  @Column({ type: 'jsonb', nullable: true })
  previousValue: Record<string, any> | null;

  /**
   * Nuevo valor de la configuración
   */
  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any> | null;

  /**
   * Cambios específicos (diff entre previousValue y newValue)
   */
  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any> | null;

  /**
   * ID del usuario que realizó el cambio
   */
  @Column({ type: 'varchar' })
  changedBy: string;

  /**
   * Motivo o descripción del cambio
   */
  @Column({ type: 'text', nullable: true })
  changeReason: string | null;

  /**
   * IP desde donde se realizó el cambio
   */
  @Column({ type: 'varchar', nullable: true })
  ipAddress: string | null;

  /**
   * User Agent del cliente que realizó el cambio
   */
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  /**
   * Metadatos adicionales del cambio
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  // Domain Methods

  /**
   * Verifica si el cambio es una creación
   */
  isCreation(): boolean {
    return this.action === 'created';
  }

  /**
   * Verifica si el cambio es una actualización
   */
  isUpdate(): boolean {
    return this.action === 'updated';
  }

  /**
   * Verifica si el cambio es una eliminación
   */
  isDeletion(): boolean {
    return this.action === 'deleted';
  }

  /**
   * Verifica si el cambio es un rollback
   */
  isRollback(): boolean {
    return this.action === 'rollback';
  }

  /**
   * Verifica si el cambio es una aprobación
   */
  isApproval(): boolean {
    return this.action === 'approved';
  }

  /**
   * Verifica si el cambio es una desactivación
   */
  isDeactivation(): boolean {
    return this.action === 'deactivated';
  }

  /**
   * Obtiene el número de versiones que cambió
   */
  getVersionDiff(): number {
    return this.newVersion - this.previousVersion;
  }

  /**
   * Verifica si hubo cambio de versión
   */
  hasVersionChange(): boolean {
    return this.newVersion !== this.previousVersion;
  }

  /**
   * Obtiene un resumen del cambio
   */
  getChangeSummary(): string {
    const actionDescriptions: Record<ChangeAction, string> = {
      created: 'Configuración creada',
      updated: 'Configuración actualizada',
      deleted: 'Configuración eliminada',
      rollback: 'Rollback a versión anterior',
      approved: 'Configuración aprobada',
      deactivated: 'Configuración desactivada',
    };

    let summary = actionDescriptions[this.action];

    if (this.hasVersionChange()) {
      summary += ` (v${this.previousVersion} → v${this.newVersion})`;
    }

    return summary;
  }

  /**
   * Verifica si tiene información de cambios detallados
   */
  hasDetailedChanges(): boolean {
    return this.changes !== null && Object.keys(this.changes).length > 0;
  }

  /**
   * Obtiene las claves que fueron modificadas
   */
  getModifiedKeys(): string[] {
    if (!this.changes) return [];
    return Object.keys(this.changes);
  }

  /**
   * Verifica si una clave específica fue modificada
   */
  wasKeyModified(key: string): boolean {
    return this.changes ? key in this.changes : false;
  }

  /**
   * Obtiene el valor anterior de una clave específica
   */
  getPreviousValue<T = any>(key?: string): T | null {
    if (!this.previousValue) return null;
    if (!key) return this.previousValue as T;

    const keys = key.split('.');
    let value: any = this.previousValue;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    return value as T;
  }

  /**
   * Obtiene el nuevo valor de una clave específica
   */
  getNewValue<T = any>(key?: string): T | null {
    if (!this.newValue) return null;
    if (!key) return this.newValue as T;

    const keys = key.split('.');
    let value: any = this.newValue;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    return value as T;
  }

  /**
   * Verifica si tiene información de rastreo (IP, UserAgent)
   */
  hasTrackingInfo(): boolean {
    return this.ipAddress !== null || this.userAgent !== null;
  }

  /**
   * Verifica si el cambio fue realizado por un usuario específico
   */
  wasChangedBy(userId: string): boolean {
    return this.changedBy === userId;
  }
}
