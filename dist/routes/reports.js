"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Report_1 = require("../models/Report");
const Account_1 = require("../models/Account");
const Transaction_1 = require("../models/Transaction");
const equations_1 = require("../utils/equations");
const router = (0, express_1.Router)();
router.get('/balance-sheet', async (req, res) => {
    const accountRepo = (0, typeorm_1.getRepository)(Account_1.Account);
    const accounts = await accountRepo.find();
    const data = (0, equations_1.generateBalanceSheet)(accounts);
    const report = { type: 'balance_sheet', data, generatedAt: new Date() };
    res.json(report);
});
router.get('/profit-loss', async (req, res) => {
    const transactionRepo = (0, typeorm_1.getRepository)(Transaction_1.Transaction);
    const transactions = await transactionRepo.find();
    const data = (0, equations_1.generateProfitLoss)(transactions);
    const report = { type: 'profit_loss', data, generatedAt: new Date() };
    res.json(report);
});
router.get('/income-statement', async (req, res) => {
    // Assume revenue, expenses, taxes from transactions or settings
    const revenue = 10000; // Placeholder, fetch from DB
    const expenses = 6000;
    const taxes = 1000;
    const data = (0, equations_1.generateIncomeStatement)(revenue, expenses, taxes);
    const report = { type: 'income_statement', data, generatedAt: new Date() };
    res.json(report);
});
router.get('/cash-flow', async (req, res) => {
    // Placeholder values
    const operating = 5000;
    const investing = -2000;
    const financing = 1000;
    const data = (0, equations_1.generateCashFlow)(operating, investing, financing);
    const report = { type: 'cash_flow', data, generatedAt: new Date() };
    res.json(report);
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Report_1.Report);
    const report = repo.create(req.body);
    await repo.save(report);
    res.json(report);
});
exports.default = router;
