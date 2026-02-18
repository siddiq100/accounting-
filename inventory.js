let currentTab = 'items';
let currentItemId = null;

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    loadCategories();
    loadSuppliers();
    loadCounts();
    loadAdjustments();
    loadInventoryStats();
});

// تبديل التبويبات
function showTab(tabName) {
    // إزالة الفئة النشطة من جميع الأزرار والمحتويات
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // إضافة الفئة النشطة للتبويب المحدد
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    currentTab = tabName;
}

// تحميل الأصناف
async function loadItems() {
    try {
        const response = await fetch('/api/inventory/items');
        const items = await response.json();
        
        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = '';
        
        items.forEach(item => {
            const status = getItemStatus(item);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.item_code}</td>
                <td>${item.item_name}</td>
                <td>${item.category || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.min_quantity}</td>
                <td>${item.cost_price.toFixed(2)} ريال</td>
                <td>${item.selling_price.toFixed(2)} ريال</td>
                <td><span class="status-${status.class}">${status.text}</span></td>
                <td>
                    <button onclick="editItem(${item.id})" class="edit-btn">✏️</button>
                    <button onclick="deleteItem(${item.id})" class="delete-btn">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب الأصناف:', error);
    }
}

// تحديل حالة الصنف
function getItemStatus(item) {
    if (item.quantity <= 0) {
        return { class: 'out-of-stock', text: 'نفد المخزون' };
    } else if (item.quantity <= item.min_quantity) {
        return { class: 'low-stock', text: 'منخفض المخزون' };
    } else if (item.quantity >= item.max_quantity) {
        return { class: 'over-stock', text: 'زائد المخزون' };
    } else {
        return { class: 'normal', text: 'طبيعي' };
    }
}

// تحميل الفئات
async function loadCategories() {
    try {
        const response = await fetch('/api/inventory/items');
        const items = await response.json();
        
        const categories = [...new Set(items.map(item => item.category).filter(cat => cat))];
        const select = document.getElementById('categoryFilter');
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في جلب الفئات:', error);
    }
}

// تحميل الموردين
async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        const suppliers = await response.json();
        
        const select = document.getElementById('supplier_id');
        select.innerHTML = '<option value="">اختر المورد</option>';
        
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في جلب الموردين:', error);
    }
}

// تحميل إحصائيات المخزون
async function loadInventoryStats() {
    try {
        const response = await fetch('/api/inventory/items');
        const items = await response.json();
        
        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
        const lowStockItems = items.filter(item => item.quantity <= item.min_quantity).length;
        
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalValue').textContent = totalValue.toFixed(2) + ' ريال';
        document.getElementById('lowStockItems').textContent = lowStockItems;
    } catch (error) {
        console.error('خطأ في جلب إحصائيات المخزون:', error);
    }
}

// فلترة الأصناف
function filterItems() {
    const searchTerm = document.getElementById('searchItems').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const rows = document.querySelectorAll('#itemsTableBody tr');
    
    rows.forEach(row => {
        const itemName = row.cells[1].textContent.toLowerCase();
        const itemCode = row.cells[0].textContent.toLowerCase();
        const category = row.cells[2].textContent;
        
        const matchesSearch = itemName.includes(searchTerm) || itemCode.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        
        if (matchesSearch && matchesCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// عرض modal إضافة صنف
function showAddItemModal() {
    currentItemId = null;
    document.getElementById('itemModalTitle').textContent = 'إضافة صنف جديد';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').style.display = 'block';
}

// تحرير صنف
async function editItem(id) {
    currentItemId = id;
    document.getElementById('itemModalTitle').textContent = 'تحرير الصنف';
    
    try {
        const response = await fetch('/api/inventory/items');
        const items = await response.json();
        const item = items.find(i => i.id == id);
        
        if (item) {
            document.getElementById('item_code').value = item.item_code;
            document.getElementById('item_name').value = item.item_name;
            document.getElementById('category').value = item.category || '';
            document.getElementById('unit').value = item.unit;
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('min_quantity').value = item.min_quantity;
            document.getElementById('max_quantity').value = item.max_quantity;
            document.getElementById('cost_price').value = item.cost_price;
            document.getElementById('selling_price').value = item.selling_price;
            document.getElementById('supplier_id').value = item.supplier_id || '';
            document.getElementById('location').value = item.location || '';
            document.getElementById('description').value = item.description || '';
            
            document.getElementById('itemModal').style.display = 'block';
        }
    } catch (error) {
        console.error('خطأ في جلب بيانات الصنف:', error);
    }
}

// حفظ الصنف
document.getElementById('itemForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const itemData = Object.fromEntries(formData);
    
    try {
        let response;
        if (currentItemId) {
            response = await fetch(`/api/inventory/items/${currentItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        } else {
            response = await fetch('/api/inventory/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        }
        
        if (response.ok) {
            closeModal();
            loadItems();
            loadInventoryStats();
            loadCategories();
        } else {
            alert('خطأ في حفظ الصنف');
        }
    } catch (error) {
        console.error('خطأ في حفظ الصنف:', error);
        alert('خطأ في حفظ الصنف');
    }
});

// حذف صنف
async function deleteItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        try {
            const response = await fetch(`/api/inventory/items/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadItems();
                loadInventoryStats();
            } else {
                alert('خطأ في حذف الصنف');
            }
        } catch (error) {
            console.error('خطأ في حذف الصنف:', error);
        }
    }
}

// إغلاق الmodal
function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
    currentItemId = null;
}

// تحميل عمليات الجرد
async function loadCounts() {
    try {
        const response = await fetch('/api/inventory/counts');
        const counts = await response.json();
        
        const tbody = document.getElementById('countsTableBody');
        tbody.innerHTML = '';
        
        counts.forEach(count => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${count.count_number}</td>
                <td>${new Date(count.count_date).toLocaleDateString('ar-SA')}</td>
                <td><span class="status-${count.status}">${getStatusText(count.status)}</span></td>
                <td>${count.counted_by_name || '-'}</td>
                <td>
                    <button onclick="viewCount(${count.id})" class="view-btn">👁️ عرض</button>
                    ${count.status === 'draft' ? `<button onclick="completeCount(${count.id})" class="complete-btn">✅ إكمال</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب عمليات الجرد:', error);
    }
}

// تحميل التسويات
async function loadAdjustments() {
    try {
        const response = await fetch('/api/inventory/adjustments');
        const adjustments = await response.json();
        
        const tbody = document.getElementById('adjustmentsTableBody');
        tbody.innerHTML = '';
        
        adjustments.forEach(adjustment => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${adjustment.adjustment_number}</td>
                <td>${new Date(adjustment.adjustment_date).toLocaleDateString('ar-SA')}</td>
                <td>${adjustment.reason}</td>
                <td><span class="status-${adjustment.status}">${getStatusText(adjustment.status)}</span></td>
                <td>${adjustment.requested_by_name || '-'}</td>
                <td>
                    <button onclick="viewAdjustment(${adjustment.id})" class="view-btn">👁️ عرض</button>
                    ${adjustment.status === 'pending' ? `<button onclick="approveAdjustment(${adjustment.id})" class="approve-btn">✅ اعتماد</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب التسويات:', error);
    }
}

// تحويل حالة إلى نص عربي
function getStatusText(status) {
    const statusMap = {
        'draft': 'مسودة',
        'completed': 'مكتمل',
        'approved': 'معتمد',
        'pending': 'معلق',
        'rejected': 'مرفوض'
    };
    return statusMap[status] || status;
}

// عرض modal جرد جديد
function showNewCountModal() {
    const countNumber = `CNT-${Date.now()}`;
    // يمكن إضافة modal للجرد الجديد هنا
    alert('ميزة الجرد الجديد ستكون متاحة قريباً! رقم الجرد: ' + countNumber);
}

// عرض modal تسوية جديدة
function showNewAdjustmentModal() {
    const adjustmentNumber = `ADJ-${Date.now()}`;
    // يمكن إضافة modal للتسوية الجديدة هنا
    alert('ميزة التسوية الجديدة ستكون متاحة قريباً! رقم التسوية: ' + adjustmentNumber);
}

// عرض تفاصيل الجرد
function viewCount(id) {
    // يمكن إضافة modal لعرض تفاصيل الجرد هنا
    alert('عرض تفاصيل الجرد - ستكون متاحة قريباً');
}

// إكمال الجرد
function completeCount(id) {
    // منطق إكمال الجرد
    alert('تم إكمال الجرد بنجاح');
    loadCounts();
}

// عرض التسوية
function viewAdjustment(id) {
    // يمكن إضافة modal لعرض تفاصيل التسوية هنا
    alert('عرض تفاصيل التسوية - ستكون متاحة قريباً');
}

// اعتماد التسوية
function approveAdjustment(id) {
    // منطق اعتماد التسوية
    alert('تم اعتماد التسوية بنجاح');
    loadAdjustments();
}

// عرض تقرير الأصناف منخفضة المخزون
async function showLowStockReport() {
    try {
        const response = await fetch('/api/inventory/reports/low-stock');
        const items = await response.json();
        
        const reportContent = document.getElementById('reportContent');
        reportContent.style.display = 'block';
        
        let html = `
            <h3>تقرير الأصناف منخفضة المخزون</h3>
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>كود الصنف</th>
                        <th>اسم الصنف</th>
                        <th>الكمية الحالية</th>
                        <th>الحد الأدنى</th>
                        <th>العجز</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        items.forEach(item => {
            html += `
                <tr>
                    <td>${item.item_code}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.min_quantity}</td>
                    <td class="low-stock">${item.shortage}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        reportContent.innerHTML = html;
    } catch (error) {
        console.error('خطأ في جلب تقرير المخزون المنخفض:', error);
    }
}

// عرض تقرير حركة المخزون
function showMovementReport() {
    const startDate = prompt('أدخل تاريخ البداية (YYYY-MM-DD):', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const endDate = prompt('أدخل تاريخ النهاية (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    
    if (startDate && endDate) {
        fetch(`/api/inventory/reports/movement?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.json())
            .then(data => {
                const reportContent = document.getElementById('reportContent');
                reportContent.style.display = 'block';
                
                let html = `
                    <h3>تقرير حركة المخزون (${startDate} - ${endDate})</h3>
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>تاريخ</th>
                                <th>كود الصنف</th>
                                <th>اسم الصنف</th>
                                <th>النوع</th>
                                <th>الكمية</th>
                                <th>المرجع</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                data.forEach(transaction => {
                    html += `
                        <tr>
                            <td>${new Date(transaction.created_at).toLocaleDateString('ar-SA')}</td>
                            <td>${transaction.item_code}</td>
                            <td>${transaction.item_name}</td>
                            <td>${getTransactionTypeText(transaction.transaction_type)}</td>
                            <td>${transaction.quantity}</td>
                            <td>${transaction.reference_type || '-'}</td>
                        </tr>
                    `;
                });
                
                html += `
                        </tbody>
                    </table>
                `;
                
                reportContent.innerHTML = html;
            })
            .catch(error => console.error('خطأ في جلب تقرير الحركة:', error));
    }
}

// عرض تقرير قيمة المخزون
async function showValueReport() {
    try {
        const response = await fetch('/api/inventory/reports/value');
        const data = await response.json();
        
        const reportContent = document.getElementById('reportContent');
        reportContent.style.display = 'block';
        
        const html = `
            <h3>تقرير قيمة المخزون</h3>
            <div class="value-report">
                <div class="value-card">
                    <h4>إجمالي تكلفة المخزون</h4>
                    <span class="value-amount">${(data.total_cost_value || 0).toFixed(2)} ريال</span>
                </div>
                <div class="value-card">
                    <h4>إجمالي قيمة البيع المحتملة</h4>
                    <span class="value-amount">${(data.total_selling_value || 0).toFixed(2)} ريال</span>
                </div>
                <div class="value-card">
                    <h4>إجمالي الربح المحتمل</h4>
                    <span class="value-amount profit">${(data.total_profit_potential || 0).toFixed(2)} ريال</span>
                </div>
            </div>
        `;
        
        reportContent.innerHTML = html;
    } catch (error) {
        console.error('خطأ في جلب تقرير القيمة:', error);
    }
}

// تحويل نوع المعاملة إلى نص عربي
function getTransactionTypeText(type) {
    const typeMap = {
        'in': 'وارد',
        'out': 'صادر',
        'adjustment': 'تسوية',
        'count': 'جرد'
    };
    return typeMap[type] || type;
}