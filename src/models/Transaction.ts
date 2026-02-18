import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './Account';
import { JournalEntry } from './JournalEntry';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column('decimal')
  debit!: number; // Debit amount

  @Column('decimal')
  credit!: number; // Credit amount

  @Column()
  date!: Date;

  @ManyToOne(() => Account, account => account.transactions)
  account!: Account;

  @ManyToOne(() => JournalEntry, journalEntry => journalEntry.transactions)
  journalEntry!: JournalEntry;
}
