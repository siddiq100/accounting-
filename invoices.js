const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

function loadClientsToSelect() {
    db.all("SELECT * FROM clients", (err, rows) => {
        const select = document.getElementById('clientSelect');
        select.innerHTML = '<option value="">اختر العميل</option>';
        rows.forEach(row => {
            const option = document.createElement('option');
            option.value = row.id;
            option.text = row.name;
            select.appendChild(option);
        });
    });
}

function loadInvoices() {
    db.all(`SELECT invoices.id, clients.name as clientName, invoices.date, invoices.total, invoices.paid
            FROM invoices
            LEFT JOIN clients ON invoices.client_id = clients.id`, (err, rows) => {
        const tbody = document.querySelector('#invoicesTable tbody');
        tbody.innerHTML = '';
        rows.forEach(row => {
            const remaining = row.total - row.paid;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.id}</td>
                            <td>${row.clientName}</td>
                            <td>${row.date}</td>
                            <td>${row.total}</td>
                            <td>${row.paid}</td>
                            <td>${remaining}</td>`;
            tbody.appendChild(tr);
        });
    });
}

document.getElementById('addInvoiceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const clientId = document.getElementById('clientSelect').value;
    const date = document.getElementById('invoiceDate').value;
    const total = parseFloat(document.getElementById('invoiceTotal').value);
    const paid = parseFloat(document.getElementById('invoicePaid').value || 0);

    const stmt = db.prepare("INSERT INTO invoices (client_id, date, total, paid) VALUES (?, ?, ?, ?)");
    stmt.run(clientId, date, total, paid, function(err) {
        if (!err) {
            loadInvoices();
            this.reset();
        }
    });
    stmt.finalize();
});

loadClientsToSelect();
loadInvoices();
