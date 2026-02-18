import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { createConnection } from 'typeorm';
import { Customer } from './models/Customer';
import { Supplier } from './models/Supplier';
import { Account } from './models/Account';
import { Transaction } from './models/Transaction';
import { JournalEntry } from './models/JournalEntry';
import { Ledger } from './models/Ledger';
import { Report } from './models/Report';
import { Setting } from './models/Setting';
import { Item } from './models/Item';
import { User } from './models/User';
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import accountRoutes from './routes/accounts';
import reportRoutes from './routes/reports';
import settingRoutes from './routes/settings';
import transactionRoutes from './routes/transactions';
import journalEntryRoutes from './routes/journalEntries';
import ledgerRoutes from './routes/ledgers';
import inventoryRoutes from './routes/inventory';
import userRoutes from './routes/users';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

createConnection({
  type: 'sqlite',
  database: 'accounting.db',
  entities: [Customer, Supplier, Account, Transaction, JournalEntry, Ledger, Report, Setting, Item, User],
  synchronize: true,
}).then(async () => {
  console.log('Database connected');
  
  // التحقق من وجود مستخدم admin
  const userRepo = require('typeorm').getRepository(User);
  const adminExists = await userRepo.findOne({ where: { role: 'admin' } });
  
  if (!adminExists) {
    const crypto = require('crypto');
    const adminPassword = crypto.createHash('sha256').update('admin123').digest('hex');
    await userRepo.save(userRepo.create({
      username: 'admin',
      password: adminPassword,
      fullName: 'المسؤول',
      email: 'admin@genius-accountant.com',
      role: 'admin',
      isActive: true,
      isApproved: true,
      permissions: {
        canViewInvoices: true,
        canCreateInvoices: true,
        canEditInvoices: true,
        canDeleteInvoices: true,
        canViewReports: true,
        canViewClients: true,
        canEditClients: true,
        canViewInventory: true,
        canEditInventory: true,
        canViewAccounts: true,
        canEditAccounts: true,
        canManageUsers: true,
        canViewSettings: true,
        canEditSettings: true
      }
    }));
    console.log('✅ تم إنشاء حساب Admin افتراضي');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');
  }
  
  app.use('/api/customers', customerRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/journal-entries', journalEntryRoutes);
  app.use('/api/ledgers', ledgerRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/users', userRoutes);

  app.listen(3000, () => console.log('Server running on port 3000'));
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
