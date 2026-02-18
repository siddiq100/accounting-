import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Supplier } from './Supplier';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  item_code!: string;

  @Column()
  item_name!: string;

  @Column({ nullable: true })
  category!: string;

  @Column({ default: 'قطعة' })
  unit!: string;

  @Column('decimal', { default: 0 })
  quantity!: number;

  @Column('decimal', { default: 0 })
  min_quantity!: number;

  @Column('decimal', { nullable: true })
  max_quantity!: number;

  @Column('decimal')
  cost_price!: number;

  @Column('decimal')
  selling_price!: number;

  @ManyToOne(() => Supplier, { nullable: true })
  supplier!: Supplier;

  @Column({ nullable: true })
  location!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}