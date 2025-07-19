import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../../companies/domain/entities/company.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rut: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column('text')
  address: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @Column()
  postalCode: string;

  @Column({ type: 'enum', enum: ['individual', 'business'], default: 'individual' })
  customerType: 'individual' | 'business';

  @Column({ type: 'enum', enum: ['active', 'inactive', 'blocked'], default: 'active' })
  status: 'active' | 'inactive' | 'blocked';

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

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

  canOperate(): boolean {
    return this.status === 'active';
  }

  isBlocked(): boolean {
    return this.status === 'blocked';
  }

  getAge(): number | null {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  isOfLegalAge(): boolean {
    const age = this.getAge();
    return age !== null && age >= 18;
  }
}