import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Report } from '../models/Report';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { generateBalanceSheet, generateProfitLoss, generateIncomeStatement, generateCashFlow } from '../utils/equations';

const router = Router();

router.get('/balance-sheet', async (req, res) => {
  const accountRepo = getRepository(Account);
  const accounts = await accountRepo.find();
  const data = generateBalanceSheet(accounts);
  const report = { type: 'balance_sheet', data, generatedAt: new Date() };
  res.json(report);
});

router.get('/profit-loss', async (req, res) => {
  const transactionRepo = getRepository(Transaction);
  const transactions = await transactionRepo.find();
  const data = generateProfitLoss(transactions);
  const report = { type: 'profit_loss', data, generatedAt: new Date() };
  res.json(report);
});

router.get('/income-statement', async (req, res) => {
  // Assume revenue, expenses, taxes from transactions or settings
  const revenue = 10000; // Placeholder, fetch from DB
  const expenses = 6000;
  const taxes = 1000;
  const data = generateIncomeStatement(revenue, expenses, taxes);
  const report = { type: 'income_statement', data, generatedAt: new Date() };
  res.json(report);
});

router.get('/cash-flow', async (req, res) => {
  // Placeholder values
  const operating = 5000;
  const investing = -2000;
  const financing = 1000;
  const data = generateCashFlow(operating, investing, financing);
  const report = { type: 'cash_flow', data, generatedAt: new Date() };
  res.json(report);
});

router.post('/', async (req, res) => {
  const repo = getRepository(Report);
  const report = repo.create(req.body);
  await repo.save(report);
  res.json(report);
});

export default router;
