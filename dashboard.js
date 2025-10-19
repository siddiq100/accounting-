const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

function updateSummary() {
    db.get("SELECT COUNT(*) AS count FROM clients", (err, row) => {
        document.getElementById('totalClients').innerText = row.count;
    });

    db.get("SELECT COUNT(*) AS count, SUM(total) AS revenue FROM invoices", (err, row) => {
        document.getElementById('totalInvoices').innerText = row.count;
        document.getElementById('totalRevenue').innerText = row.revenue || 0;
    });

    db.get("SELECT SUM(amount) AS debts FROM debts", (err, row) => {
        document.getElementById('totalDebts').innerText = row.debts || 0;
    });
}

updateSummary();
