import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CompanyConfiguration } from './company-configuration.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  businessName: string;

  @Column()
  fantasyName: string;

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

  @Column({ type: 'enum', enum: ['micro', 'small', 'medium', 'large'], default: 'micro' })
  companySize: 'micro' | 'small' | 'medium' | 'large';

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @OneToMany(() => CompanyConfiguration, config => config.company, { cascade: true })
  configurations: CompanyConfiguration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}