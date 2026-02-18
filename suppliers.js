async function loadSuppliers() {
    try {
        const response = await fetch('/suppliers');
        const suppliers = await response.json();
        const tbody = document.querySelector('#suppliersTable tbody');
        tbody.innerHTML = '';
        suppliers.forEach(supplier => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${supplier.id}</td><td>${supplier.name}</td><td>${supplier.phone || ''}</td><td>${supplier.email || ''}</td>
                            <td>
                                <button onclick="editSupplier(${supplier.id})">تحرير</button>
                                <button onclick="deleteSupplier(${supplier.id})">حذف</button>
                                <button onclick="viewAccountStatement(${supplier.id})">كشف حساب</button>
                            </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب الموردين:', error);
    }
}

document.getElementById('addSupplierForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('supplierName').value;
    const phone = document.getElementById('supplierPhone').value;
    const email = document.getElementById('supplierEmail').value;

    try {
        const response = await fetch('/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email })
        });
        if (response.ok) {
            loadSuppliers();
            this.reset();
        }
    } catch (error) {
        console.error('خطأ في إضافة المورد:', error);
    }
});

loadSuppliers();

// فلترة الموردين
function filterSuppliers() {
    const searchTerm = document.getElementById('searchSupplier').value.toLowerCase();
    const rows = document.querySelectorAll('#suppliersTable tbody tr');
    
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

// عرض modal إضافة مورد
function showAddSupplierModal() {
    document.getElementById('supplierModalTitle').textContent = 'إضافة مورد جديد';
    document.getElementById('addSupplierForm').reset();
    document.getElementById('supplierModal').style.display = 'block';
}

// إغلاق الmodal
function closeModal() {
    document.getElementById('supplierModal').style.display = 'none';
    document.getElementById('accountStatementModal').style.display = 'none';
}

// عرض كشف حساب
async function viewAccountStatement(supplierId) {
    try {
        const response = await fetch(`/suppliers/${supplierId}/transactions`);
        const transactions = await response.json();
        
        const supplierResponse = await fetch(`/suppliers`);
        const suppliers = await supplierResponse.json();
        const supplier = suppliers.find(s => s.id == supplierId);
        
        let html = `<h4>كشف حساب: ${supplier.name}</h4>
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
            const response = await fetch(`/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            if (response.ok) {
                loadSuppliers();
            }
        } catch (error) {
            console.error('خطأ في تحرير المورد:', error);
        }
    }
}

async function deleteSupplier(id) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
        try {
            const response = await fetch(`/suppliers/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadSuppliers();
            }
        } catch (error) {
            console.error('خطأ في حذف المورد:', error);
        }
    }
}
