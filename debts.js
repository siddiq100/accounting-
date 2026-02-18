async function loadClientsToSelect() {
    try {
        const response = await fetch('/api/clients');
        const clients = await response.json();
        const select = document.getElementById('clientSelect');
        select.innerHTML = '<option value="">اختر العميل</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.text = client.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
    }
}

async function loadDebts() {
    try {
        const response = await fetch('/api/debts');
        const debts = await response.json();
        const tbody = document.querySelector('#debtsTable tbody');
        tbody.innerHTML = '';
        let total = 0;
        debts.forEach(debt => {
            total += debt.amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${debt.id}</td>
                            <td>${debt.client_name}</td>
                            <td>${debt.amount}</td>
                            <td>${debt.description}</td>
                            <td>
                                <button onclick="editDebt(${debt.id})">تحرير</button>
                                <button onclick="deleteDebt(${debt.id})">حذف</button>
                            </td>`;
            tbody.appendChild(tr);
        });
        document.getElementById('totalDebts').innerText = total;
    } catch (error) {
        console.error('خطأ في جلب المديونيات:', error);
    }
}

document.getElementById('addDebtForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const clientId = document.getElementById('clientSelect').value;
    const amount = parseFloat(document.getElementById('debtAmount').value);
    const description = document.getElementById('debtDescription').value;

    try {
        const response = await fetch('/api/debts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, amount, description })
        });
        if (response.ok) {
            loadDebts();
            this.reset();
        }
    } catch (error) {
        console.error('خطأ في إضافة المديونية:', error);
    }
});

loadClientsToSelect();
loadDebts();

async function editDebt(id) {
    const newAmount = prompt('أدخل المبلغ الجديد:');
    if (newAmount) {
        try {
            const response = await fetch(`/api/debts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(newAmount) })
            });
            if (response.ok) {
                loadDebts();
            }
        } catch (error) {
            console.error('خطأ في تحرير المديونية:', error);
        }
    }
}

async function deleteDebt(id) {
    if (confirm('هل أنت متأكد من حذف هذه المديونية؟')) {
        try {
            const response = await fetch(`/api/debts/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadDebts();
            }
        } catch (error) {
            console.error('خطأ في حذف المديونية:', error);
        }
    }
}
