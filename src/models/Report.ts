import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // e.g., balance_sheet, profit_loss

  @Column('json')
  data!: any; // JSON for report content

  @Column()
  generatedAt!: Date;
}
