import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from '../../../product/domain/entities/product.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string;

  @ManyToOne(() => Invoice, invoice => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  productSku: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de dominio
  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }

  calculateDiscountTotal(): number {
    const subtotal = this.calculateSubtotal();
    let discountTotal = 0;
    
    // Aplicar descuento por porcentaje
    if (this.discountPercentage > 0) {
      discountTotal += subtotal * (this.discountPercentage / 100);
    }
    
    // Agregar descuento fijo
    if (this.discountAmount > 0) {
      discountTotal += this.discountAmount;
    }
    
    return Math.min(discountTotal, subtotal); // No puede ser mayor al subtotal
  }

  calculateTaxAmount(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscountTotal();
    const taxableAmount = subtotal - discount;
    
    return taxableAmount * (this.taxPercentage / 100);
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscountTotal();
    const tax = this.calculateTaxAmount();
    
    return subtotal - discount + tax;
  }

  updateCalculatedFields(): void {
    this.subtotal = this.calculateSubtotal();
    this.discountTotal = this.calculateDiscountTotal();
    this.taxAmount = this.calculateTaxAmount();
    this.total = this.calculateTotal();
  }

  hasProduct(): boolean {
    return !!this.productId;
  }

  hasDiscount(): boolean {
    return this.discountPercentage > 0 || this.discountAmount > 0;
  }

  hasTax(): boolean {
    return this.taxPercentage > 0;
  }

  getEffectivePrice(): number {
    return this.total / this.quantity;
  }

  getDiscountPercentageEffective(): number {
    const subtotal = this.calculateSubtotal();
    if (subtotal === 0) return 0;
    
    return (this.calculateDiscountTotal() / subtotal) * 100;
  }

  clone(): Partial<InvoiceItem> {
    return {
      productId: this.productId,
      productSku: this.productSku,
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      discountPercentage: this.discountPercentage,
      discountAmount: this.discountAmount,
      taxPercentage: this.taxPercentage,
      unit: this.unit,
      additionalInfo: this.additionalInfo,
    };
  }
}
