import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Company } from '../../../companies/domain/entities/company.entity';

@Entity('users')
@Index(['email', 'companyId'], { unique: true }) // Email único por empresa
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column() // No incluir en queries por defecto
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: ['admin', 'manager', 'employee', 'viewer'], default: 'employee' })
  role: 'admin' | 'manager' | 'employee' | 'viewer';

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended', 'pending'], default: 'pending' })
  status: 'active' | 'inactive' | 'suspended' | 'pending';

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[];

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de dominio
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  hasPermission(permission: string): boolean {
    return this.permissions?.includes(permission) || false;
  }

  canAccessCompany(companyId: string): boolean {
    return this.companyId === companyId && this.isActive();
  }
}