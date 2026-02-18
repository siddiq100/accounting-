"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const Customer_1 = require("./models/Customer");
const Supplier_1 = require("./models/Supplier");
const Account_1 = require("./models/Account");
const Transaction_1 = require("./models/Transaction");
const JournalEntry_1 = require("./models/JournalEntry");
const Ledger_1 = require("./models/Ledger");
const Report_1 = require("./models/Report");
const Setting_1 = require("./models/Setting");
const Item_1 = require("./models/Item");
const customers_1 = __importDefault(require("./routes/customers"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const reports_1 = __importDefault(require("./routes/reports"));
const settings_1 = __importDefault(require("./routes/settings"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const journalEntries_1 = __importDefault(require("./routes/journalEntries"));
const ledgers_1 = __importDefault(require("./routes/ledgers"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '..')));
(0, typeorm_1.createConnection)({
    type: 'sqlite',
    database: 'accounting.db',
    entities: [Customer_1.Customer, Supplier_1.Supplier, Account_1.Account, Transaction_1.Transaction, JournalEntry_1.JournalEntry, Ledger_1.Ledger, Report_1.Report, Setting_1.Setting, Item_1.Item],
    synchronize: true,
}).then(() => {
    console.log('Database connected');
    app.use('/customers', customers_1.default);
    app.use('/suppliers', suppliers_1.default);
    app.use('/accounts', accounts_1.default);
    app.use('/reports', reports_1.default);
    app.use('/settings', settings_1.default);
    app.use('/transactions', transactions_1.default);
    app.use('/journal-entries', journalEntries_1.default);
    app.use('/ledgers', ledgers_1.default);
    app.use('/api/inventory', inventory_1.default);
    app.listen(3000, () => console.log('Server running on port 3000'));
}).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});
