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

function loadDebts() {
    db.all(`SELECT debts.id, clients.name AS clientName, debts.amount, debts.description
            FROM debts
            LEFT JOIN clients ON debts.client_id = clients.id`, (err, rows) => {
        const tbody = document.querySelector('#debtsTable tbody');
        tbody.innerHTML = '';
        let total = 0;
        rows.forEach(row => {
            total += row.amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.id}</td>
                            <td>${row.clientName}</td>
                            <td>${row.amount}</td>
                            <td>${row.description}</td>`;
            tbody.appendChild(tr);
        });
        document.getElementById('totalDebts').innerText = total;
    });
}

document.getElementById('addDebtForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const clientId = document.getElementById('clientSelect').value;
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const description = document.getElementById('debtDescription').value;

    const stmt = db.prepare("INSERT INTO debts (client_id, amount, description) VALUES (?, ?, ?)");
    stmt.run(clientId, amount, description, function(err) {
        if (!err) {
            loadDebts();
            this.reset();
        }
    });
    stmt.finalize();
});

loadClientsToSelect();
loadDebts();
