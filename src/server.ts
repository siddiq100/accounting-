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
import customerRoutes from './routes/customers';
import supplierRoutes from './routes/suppliers';
import accountRoutes from './routes/accounts';
import reportRoutes from './routes/reports';
import settingRoutes from './routes/settings';
import transactionRoutes from './routes/transactions';
import journalEntryRoutes from './routes/journalEntries';
import ledgerRoutes from './routes/ledgers';
import inventoryRoutes from './routes/inventory';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

createConnection({
  type: 'sqlite',
  database: 'accounting.db',
  entities: [Customer, Supplier, Account, Transaction, JournalEntry, Ledger, Report, Setting, Item],
  synchronize: true,
}).then(() => {
  console.log('Database connected');
  app.use('/customers', customerRoutes);
  app.use('/suppliers', supplierRoutes);
  app.use('/accounts', accountRoutes);
  app.use('/reports', reportRoutes);
  app.use('/settings', settingRoutes);
  app.use('/transactions', transactionRoutes);
  app.use('/journal-entries', journalEntryRoutes);
  app.use('/ledgers', ledgerRoutes);
  app.use('/api/inventory', inventoryRoutes);

  app.listen(3000, () => console.log('Server running on port 3000'));
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
