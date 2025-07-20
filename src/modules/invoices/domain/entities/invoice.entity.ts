import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../../../companies/domain/entities/company.entity';
import { Customer } from '../../../customers/domain/entities/customer.entity';
import { InvoiceItem } from './invoice-item.entity';


@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ unique: false })
  invoiceNumber: string;

  @Column({ type: 'enum', enum: ['sale', 'purchase', 'credit_note', 'debit_note', 'proforma'], default: 'sale' })
  type: 'sale' | 'purchase' | 'credit_note' | 'debit_note' | 'proforma';

  @Column({ type: 'enum', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'], default: 'draft' })
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  customerData: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  @Column({ default: 'CLP' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number;

  @Column('text', { nullable: true })
  terms: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ['cash', 'transfer', 'credit_card', 'debit_card', 'check', 'other'], nullable: true })
  paymentMethod: 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'check' | 'other';

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  globalDiscountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  globalDiscountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de dominio
  getItemCount(): number {
    return this.items ? this.items.length : 0;
  }

  getTotalQuantity(): number {
    return this.items ? this.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }

  isPaid(): boolean {
    return this.status === 'paid';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.status === 'paid' || this.status === 'cancelled') {
      return false;
    }
    return new Date() > this.dueDate;
  }

  getDaysPastDue(): number {
    if (!this.isOverdue()) return 0;
    
    const now = new Date();
    const diffTime = now.getTime() - this.dueDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  canBeEdited(): boolean {
    return this.status === 'draft' || this.status === 'sent';
  }

  canBePaid(): boolean {
    return this.status === 'sent' || this.status === 'overdue';
  }

  canBeCancelled(): boolean {
    return this.status !== 'paid' && this.status !== 'cancelled' && this.status !== 'refunded';
  }

  canBeRefunded(): boolean {
    return this.status === 'paid';
  }

  isSale(): boolean {
    return this.type === 'sale';
  }

  isPurchase(): boolean {
    return this.type === 'purchase';
  }

  isCreditNote(): boolean {
    return this.type === 'credit_note';
  }

  isDebitNote(): boolean {
    return this.type === 'debit_note';
  }

  isProforma(): boolean {
    return this.type === 'proforma';
  }

  hasCustomer(): boolean {
    return !!this.customerId;
  }

  getCustomerName(): string | null {
    if (this.customer) {
      return this.customer.getFullName();
    }
    return this.customerData?.name || null;
  }

  getCustomerEmail(): string | null {
    if (this.customer) {
      return this.customer.email;
    }
    return this.customerData?.email || null;
  }

  calculateSubtotal(): number {
    return this.items ? this.items.reduce((sum, item) => sum + item.subtotal, 0) : 0;
  }

  calculateTotalDiscount(): number {
    const itemsDiscount = this.items ? this.items.reduce((sum, item) => sum + item.discountTotal, 0) : 0;
    return itemsDiscount + (this.globalDiscountAmount || 0);
  }

  calculateTotalTax(): number {
    return this.items ? this.items.reduce((sum, item) => sum + item.taxAmount, 0) : 0;
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateTotalDiscount();
    const tax = this.calculateTotalTax();
    return subtotal - discount + tax;
  }

  updateStatus(): void {
    if (this.isOverdue()) {
      this.status = 'overdue';
    }
  }

  getDisplayNumber(): string {
    return this.invoiceNumber;
  }

  isInForeignCurrency(): boolean {
    return this.currency !== 'CLP';
  }

  getAmountInBaseCurrency(amount: number): number {
    return amount * this.exchangeRate;
  }
}
