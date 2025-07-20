import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../../companies/domain/entities/company.entity';
import { StockMovement } from './stock-movement.entity';


@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ unique: false })
  sku: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'enum', enum: ['physical', 'digital', 'service'], default: 'physical' })
  productType: 'physical' | 'digital' | 'service';

  @Column({ type: 'enum', enum: ['active', 'inactive', 'discontinued'], default: 'active' })
  status: 'active' | 'inactive' | 'discontinued';

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'int', nullable: true })
  maxStock: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ nullable: true })
  dimensions: string;

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ nullable: true })
  barcode: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  allowNegativeStock: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @OneToMany(() => StockMovement, movement => movement.product, { cascade: true })
  stockMovements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de dominio
  getProfitMargin(): number {
    if (!this.costPrice || this.costPrice === 0) return 0;
    return ((this.price - this.costPrice) / this.price) * 100;
  }

  getProfitAmount(): number {
    if (!this.costPrice) return 0;
    return this.price - this.costPrice;
  }

  isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  isOutOfStock(): boolean {
    return this.stock <= 0;
  }

  canSell(quantity: number = 1): boolean {
    if (!this.isActive) return false;
    if (this.status !== 'active') return false;
    if (this.allowNegativeStock) return true;
    return this.stock >= quantity;
  }

  hasStock(quantity: number = 1): boolean {
    return this.stock >= quantity;
  }

  canAddStock(quantity: number): boolean {
    if (!this.maxStock) return true;
    return (this.stock + quantity) <= this.maxStock;
  }

  calculateStockValue(): number {
    return this.stock * (this.costPrice || this.price);
  }

  isPhysicalProduct(): boolean {
    return this.productType === 'physical';
  }

  isDigitalProduct(): boolean {
    return this.productType === 'digital';
  }

  isService(): boolean {
    return this.productType === 'service';
  }

  needsInventoryTracking(): boolean {
    return this.productType === 'physical';
  }

  hasImages(): boolean {
    return this.images && this.images.length > 0;
  }

  getPrimaryImage(): string | null {
    return this.images && this.images.length > 0 ? this.images[0] : null;
  }

  hasTag(tag: string): boolean {
    return this.tags ? this.tags.includes(tag) : false;
  }

  isDiscontinued(): boolean {
    return this.status === 'discontinued';
  }

  getStockStatus(): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (this.isOutOfStock()) return 'out_of_stock';
    if (this.isLowStock()) return 'low_stock';
    return 'in_stock';
  }
}
