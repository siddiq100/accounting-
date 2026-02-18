async function loadClients() {
    try {
        const response = await fetch('/customers');
        const clients = await response.json();
        const tbody = document.querySelector('#clientsTable tbody');
        tbody.innerHTML = '';
        clients.forEach(client => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${client.id}</td><td>${client.name}</td><td>${client.phone || ''}</td><td>${client.email || ''}</td>
                            <td>
                                <button onclick="editClient(${client.id})">تحرير</button>
                                <button onclick="deleteClient(${client.id})">حذف</button>
                                <button onclick="viewAccountStatement(${client.id})">كشف حساب</button>
                            </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
    }
}

document.getElementById('addClientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;

    try {
        const response = await fetch('/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email })
        });
        if (response.ok) {
            loadClients();
            this.reset();
        }
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
    }
loadClients();

// فلترة العملاء
function filterClients() {
    const searchTerm = document.getElementById('searchClient').value.toLowerCase();
    const rows = document.querySelectorAll('#clientsTable tbody tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const phone = row.cells[2].textContent.toLowerCase();
        const email = row.cells[3].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || phone.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// عرض modal إضافة عميل
function showAddClientModal() {
    document.getElementById('clientModalTitle').textContent = 'إضافة عميل جديد';
    document.getElementById('addClientForm').reset();
    document.getElementById('clientModal').style.display = 'block';
}

// إغلاق الmodal
function closeModal() {
    document.getElementById('clientModal').style.display = 'none';
    document.getElementById('accountStatementModal').style.display = 'none';
}

// عرض كشف حساب
async function viewAccountStatement(clientId) {
    try {
        const response = await fetch(`/customers/${clientId}/transactions`);
        const transactions = await response.json();
        
        const clientResponse = await fetch(`/customers`);
        const clients = await clientResponse.json();
        const client = clients.find(c => c.id == clientId);
        
        let html = `<h4>كشف حساب: ${client.name}</h4>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الوصف</th>
                                <th>المدين</th>
                                <th>الدائن</th>
                                <th>الرصيد</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        let balance = 0;
        transactions.forEach(transaction => {
            balance += transaction.debit - transaction.credit;
            html += `<tr>
                        <td>${new Date(transaction.date).toLocaleDateString('ar-SA')}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.debit}</td>
                        <td>${transaction.credit}</td>
                        <td>${balance}</td>
                     </tr>`;
        });
        
        html += `</tbody></table>`;
        
        document.getElementById('accountStatementContent').innerHTML = html;
        document.getElementById('accountStatementModal').style.display = 'block';
    } catch (error) {
        console.error('خطأ في جلب كشف الحساب:', error);
    }
}
    const newName = prompt('أدخل الاسم الجديد:');
    if (newName) {
        try {
            const response = await fetch(`/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            if (response.ok) {
                loadClients();
            }
        } catch (error) {
            console.error('خطأ في تحرير العميل:', error);
        }
    }
}

async function deleteClient(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        try {
            const response = await fetch(`/customers/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadClients();
            }
        } catch (error) {
            console.error('خطأ في حذف العميل:', error);
        }
    }
}
