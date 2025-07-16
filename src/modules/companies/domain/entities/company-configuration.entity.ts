// src/modules/companies/domain/entities/company-configuration.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('company_configurations')
export class CompanyConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, company => company.configurations)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'enum', enum: ['sii', 'accounting', 'general'], default: 'general' })
  configurationType: 'sii' | 'accounting' | 'general';

  // Configuración SII
  @Column({ nullable: true })
  siiEnvironment: 'production' | 'certification';

  @Column({ nullable: true })
  siiRutRepresentante: string;

  @Column({ nullable: true })
  siiClaveCertificado: string;

  @Column({ nullable: true })
  siiCertificadoDigital: string;

  @Column({ nullable: true })
  siiResolucionFecha: Date;

  @Column({ nullable: true })
  siiResolucionNumero: string;

  @Column({ type: 'jsonb', nullable: true })
  siiActivityCodes: number[];

  @Column({ type: 'jsonb', nullable: true })
  siiAuthorizedDocuments: string[];

  // Configuración contable
  @Column({ nullable: true })
  accountingPeriod: 'monthly' | 'quarterly' | 'annual';

  @Column({ nullable: true })
  fiscalYearStart: Date;

  @Column({ nullable: true })
  baseCurrency: string;

  @Column({ type: 'jsonb', nullable: true })
  taxSettings: Record<string, any>;

  // Configuración general
  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  dateFormat: string;

  @Column({ nullable: true })
  numberFormat: string;

  @Column({ type: 'jsonb', nullable: true })
  customSettings: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}