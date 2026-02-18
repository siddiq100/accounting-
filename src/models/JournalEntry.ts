import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';

@Entity()
export class JournalEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date;

  @Column()
  description!: string;

  @OneToMany(() => Transaction, transaction => transaction.journalEntry, { cascade: true })
  transactions!: Transaction[];
}
