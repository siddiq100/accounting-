import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from './Customer';
import { Supplier } from './Supplier';
import { Transaction } from './Transaction';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // e.g., asset, liability

  @Column('decimal')
  balance!: number;

  @ManyToOne(() => Customer, customer => customer.accounts, { nullable: true })
  customer!: Customer;

  @ManyToOne(() => Supplier, supplier => supplier.accounts, { nullable: true })
  supplier!: Supplier;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions!: Transaction[];
}
