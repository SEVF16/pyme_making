import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, product => product.stockMovements)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'enum', enum: ['in', 'out', 'adjustment'], default: 'adjustment' })
  movementType: 'in' | 'out' | 'adjustment';

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  previousStock: number;

  @Column({ type: 'int' })
  newStock: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @CreateDateColumn()
  createdAt: Date;

  // Métodos de dominio
  isInbound(): boolean {
    return this.movementType === 'in' || (this.movementType === 'adjustment' && this.quantity > 0);
  }

  isOutbound(): boolean {
    return this.movementType === 'out' || (this.movementType === 'adjustment' && this.quantity < 0);
  }

  getMovementValue(): number {
    if (!this.unitCost) return 0;
    return Math.abs(this.quantity) * this.unitCost;
  }
}