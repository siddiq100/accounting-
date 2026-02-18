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

async function loadInvoices() {
    try {
        const response = await fetch('/api/invoices');
        const invoices = await response.json();
        const tbody = document.querySelector('#invoicesTable tbody');
        tbody.innerHTML = '';
        invoices.forEach(invoice => {
            const remaining = invoice.total - invoice.paid;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${invoice.id}</td>
                            <td>${invoice.client_name}</td>
                            <td>${invoice.date}</td>
                            <td>${invoice.total}</td>
                            <td>${invoice.paid}</td>
                            <td>${remaining}</td>
                            <td>
                                <button onclick="editInvoice(${invoice.id})">تحرير</button>
                                <button onclick="deleteInvoice(${invoice.id})">حذف</button>
                            </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب الفواتير:', error);
    }
}

document.getElementById('addInvoiceForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const clientId = document.getElementById('clientSelect').value;
    const date = document.getElementById('invoiceDate').value;
    const total = parseFloat(document.getElementById('invoiceTotal').value);
    const paid = parseFloat(document.getElementById('invoicePaid').value || 0);

    try {
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, date, total, paid })
        });
        if (response.ok) {
            loadInvoices();
            this.reset();
        }
    } catch (error) {
        console.error('خطأ في إضافة الفاتورة:', error);
    }
});

loadClientsToSelect();
loadInvoices();

async function editInvoice(id) {
    const newPaid = prompt('أدخل المبلغ المدفوع الجديد:');
    if (newPaid !== null) {
        try {
            const response = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paid: parseFloat(newPaid) })
            });
            if (response.ok) {
                loadInvoices();
            }
        } catch (error) {
            console.error('خطأ في تحرير الفاتورة:', error);
        }
    }
}

async function deleteInvoice(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        try {
            const response = await fetch(`/api/invoices/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadInvoices();
            }
        } catch (error) {
            console.error('خطأ في حذف الفاتورة:', error);
        }
    }
}
