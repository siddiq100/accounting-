"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBalance = calculateBalance;
exports.calculateProfit = calculateProfit;
exports.generateBalanceSheet = generateBalanceSheet;
exports.generateProfitLoss = generateProfitLoss;
exports.calculateLedgerBalance = calculateLedgerBalance;
exports.generateIncomeStatement = generateIncomeStatement;
exports.generateCashFlow = generateCashFlow;
exports.processJournalEntry = processJournalEntry;
function calculateBalance(assets, liabilities) {
    return assets - liabilities; // Basic balance equation
}
function calculateProfit(revenue, expenses) {
    return revenue - expenses; // Profit/loss equation
}
function generateBalanceSheet(accounts) {
    const assets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
    return { assets, liabilities, equity: calculateBalance(assets, liabilities) };
}
function generateProfitLoss(transactions) {
    const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { revenue, expenses, profit: calculateProfit(revenue, expenses) };
}
function calculateLedgerBalance(ledgers) {
    return ledgers.reduce((balance, l) => balance + l.debit - l.credit, 0);
}
function generateIncomeStatement(revenue, expenses, taxes) {
    const grossProfit = revenue - expenses;
    const netProfit = grossProfit - taxes;
    return { revenue, expenses, grossProfit, taxes, netProfit };
}
function generateCashFlow(operating, investing, financing) {
    const netCashFlow = operating + investing + financing;
    return { operating, investing, financing, netCashFlow };
}
function processJournalEntry(transactions) {
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    return totalDebit === totalCredit; // Double-entry check
}
