import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './Account';

@Entity()
export class Ledger {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date;

  @Column('decimal')
  debit!: number;

  @Column('decimal')
  credit!: number;

  @Column('decimal')
  balance!: number;

  @ManyToOne(() => Account)
  account!: Account;
}
