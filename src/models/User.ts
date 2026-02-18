import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column({ default: 'user' })
  role!: 'admin' | 'accountant' | 'viewer' | 'user';

  @Column('simple-json', { nullable: true })
  permissions!: {
    canViewInvoices: boolean;
    canCreateInvoices: boolean;
    canEditInvoices: boolean;
    canDeleteInvoices: boolean;
    canViewReports: boolean;
    canViewClients: boolean;
    canEditClients: boolean;
    canViewInventory: boolean;
    canEditInventory: boolean;
    canViewAccounts: boolean;
    canEditAccounts: boolean;
    canManageUsers: boolean;
    canViewSettings: boolean;
    canEditSettings: boolean;
  };

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isApproved!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLogin?: Date;
}
