const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

function loadClients() {
    db.all("SELECT * FROM clients", (err, rows) => {
        const tbody = document.querySelector('#clientsTable tbody');
        tbody.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.id}</td><td>${row.name}</td><td>${row.phone}</td><td>${row.email}</td>`;
            tbody.appendChild(tr);
        });
    });
}

document.getElementById('addClientForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;

    const stmt = db.prepare("INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)");
    stmt.run(name, phone, email, function(err) {
        if (!err) {
            loadClients();
            this.reset();
        }
    });
    stmt.finalize();
});

loadClients();
