export function calculateBalance(assets: number, liabilities: number): number {
  return assets - liabilities; // Basic balance equation
}

export function calculateProfit(revenue: number, expenses: number): number {
  return revenue - expenses; // Profit/loss equation
}

export function generateBalanceSheet(accounts: any[]): any {
  const assets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
  const liabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
  return { assets, liabilities, equity: calculateBalance(assets, liabilities) };
}

export function generateProfitLoss(transactions: any[]): any {
  const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return { revenue, expenses, profit: calculateProfit(revenue, expenses) };
}

export function calculateLedgerBalance(ledgers: any[]): number {
  return ledgers.reduce((balance, l) => balance + l.debit - l.credit, 0);
}

export function generateIncomeStatement(revenue: number, expenses: number, taxes: number): any {
  const grossProfit = revenue - expenses;
  const netProfit = grossProfit - taxes;
  return { revenue, expenses, grossProfit, taxes, netProfit };
}

export function generateCashFlow(operating: number, investing: number, financing: number): any {
  const netCashFlow = operating + investing + financing;
  return { operating, investing, financing, netCashFlow };
}

export function processJournalEntry(transactions: any[]): boolean {
  const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
  return totalDebit === totalCredit; // Double-entry check
}
