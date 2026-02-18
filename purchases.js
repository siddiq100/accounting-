async function showPurchaseInvoice(type) {
    const container = document.getElementById('purchaseInvoiceContainer');
    container.style.display = 'block';

    // جلب إعدادات الشركة
    let companySettings = {};
    try {
        const response = await fetch('/api/settings');
        companySettings = await response.json();
    } catch (error) {
        console.error('خطأ في جلب إعدادات الشركة:', error);
    }

    if (type === 'purchase') {
        container.innerHTML = `
            <div class="invoice purchase-invoice">
                <div class="invoice-header">
                    <div class="company-info">
                        <div class="company-logo">
                            <img src="${companySettings.logo_path || 'logo.png'}" alt="Logo" style="width: 80px; height: 80px;">
                        </div>
                        <div class="company-details">
                            <h2>${companySettings.company_name || '💠 المحاسب العبقري'}</h2>
                            <p>شركة محاسبة متخصصة</p>
                            <p>العنوان: ${companySettings.company_address || '[عنوان الشركة الكامل]'}</p>
                            <p>الهاتف: ${companySettings.company_phone || '[رقم الهاتف]'} | البريد الإلكتروني: ${companySettings.company_email || '[البريد]'}</p>
                            <p>رقم الضريبة: ${companySettings.tax_number || '[رقم الضريبة]'}</p>
                        </div>
                    </div>
                    <div class="invoice-info">
                        <h1>فاتورة مشتريات</h1>
                        <div class="invoice-meta">
                            <p><strong>رقم فاتورة المشتريات:</strong> <span id="purchaseInvoiceNumber">${generatePurchaseInvoiceNumber()}</span></p>
                            <p><strong>تاريخ الفاتورة:</strong> <input type="date" id="purchaseInvoiceDate" value="${new Date().toISOString().split('T')[0]}"></p>
                            <p><strong>تاريخ الاستلام:</strong> <input type="date" id="deliveryDate" value="${new Date().toISOString().split('T')[0]}"></p>
                        </div>
                    </div>
                </div>

                <div class="bill-to">
                    <h3>المورد:</h3>
                    <select id="supplierSelect" onchange="updateSupplierInfo()">
                        <option value="">اختر المورد</option>
                    </select>
                    <div class="supplier-details">
                        <p><strong>اسم المورد:</strong> <span id="supplierName">-</span></p>
                        <p><strong>العنوان:</strong> <span id="supplierAddress">-</span></p>
                        <p><strong>الهاتف:</strong> <span id="supplierPhone">-</span></p>
                        <p><strong>البريد الإلكتروني:</strong> <span id="supplierEmail">-</span></p>
                    </div>
                </div>

                <div class="invoice-table">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%;">#</th>
                                <th style="width: 40%;">الوصف</th>
                                <th style="width: 15%;">الكمية</th>
                                <th style="width: 15%;">السعر</th>
                                <th style="width: 15%;">الإجمالي</th>
                                <th style="width: 10%;">إجراء</th>
                            </tr>
                        </thead>
                        <tbody id="purchaseItemsBody">
                            <tr>
                                <td>1</td>
                                <td><input type="text" placeholder="وصف المنتج أو الخدمة" class="description-input"></td>
                                <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculatePurchaseTotal()" class="quantity-input"></td>
                                <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseTotal()" class="price-input"></td>
                                <td><span class="itemTotal">0.00</span></td>
                                <td><button onclick="removePurchaseItem(this)" class="remove-btn">×</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button onclick="addPurchaseItem()" class="add-item-btn">+ إضافة منتج</button>
                </div>

                <div class="invoice-summary">
                    <div class="summary-left">
                        <h4>ملاحظات:</h4>
                        <textarea id="purchaseNotes" placeholder="أي ملاحظات إضافية..." rows="4"></textarea>
                        <h4>شروط الدفع:</h4>
                        <p>${companySettings.payment_terms || 'الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة'}</p>
                    </div>
                    <div class="summary-right">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="purchaseSubtotal">0.00 ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <span><input type="number" id="purchaseDiscount" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseTotal()"> ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (15%):</span>
                            <span id="purchaseTax">0.00 ريال</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>الإجمالي:</strong></span>
                            <span id="purchaseTotal"><strong>0.00 ريال</strong></span>
                        </div>
                        <div class="summary-row">
                            <span>المبلغ المدفوع:</span>
                            <span><input type="number" id="purchasePaid" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseBalance()"> ريال</span>
                        </div>
                        <div class="summary-row balance-row">
                            <span><strong>المبلغ المستحق:</strong></span>
                            <span id="purchaseBalance"><strong>0.00 ريال</strong></span>
                        </div>
                    </div>
                </div>

                <div class="invoice-footer">
                    <div class="footer-info">
                        <p>شكراً لتعاملكم معنا!</p>
                        <p>لأي استفسارات، يرجى الاتصال بنا على [رقم الهاتف] أو [البريد الإلكتروني]</p>
                    </div>
                    <div class="footer-actions">
                        <button onclick="savePurchaseInvoice('purchase')" class="save-btn">💾 حفظ فاتورة المشتريات</button>
                        <button onclick="printPurchaseInvoice()" class="print-btn">🖨️ طباعة</button>
                        <button onclick="emailPurchaseInvoice()" class="email-btn">📧 إرسال بالبريد</button>
                    </div>
                </div>
            </div>
        `;
        loadSuppliers();
    } else if (type === 'return') {
        container.innerHTML = `
            <div class="invoice purchase-return-invoice">
                <div class="invoice-header">
                    <div class="company-info">
                        <div class="company-logo">
                            <img src="${companySettings.logo_path || 'logo.png'}" alt="Logo" style="width: 80px; height: 80px;">
                        </div>
                        <div class="company-details">
                            <h2>${companySettings.company_name || '💠 المحاسب العبقري'}</h2>
                            <p>شركة محاسبة متخصصة</p>
                            <p>العنوان: ${companySettings.company_address || '[عنوان الشركة الكامل]'}</p>
                            <p>الهاتف: ${companySettings.company_phone || '[رقم الهاتف]'} | البريد الإلكتروني: ${companySettings.company_email || '[البريد]'}</p>
                            <p>رقم الضريبة: ${companySettings.tax_number || '[رقم الضريبة]'}</p>
                        </div>
                    </div>
                    <div class="invoice-info">
                        <h1>مرتجع مشتريات</h1>
                        <div class="invoice-meta">
                            <p><strong>رقم مرتجع المشتريات:</strong> <span id="purchaseReturnInvoiceNumber">PR${generatePurchaseInvoiceNumber()}</span></p>
                            <p><strong>تاريخ المرتجع:</strong> <input type="date" id="purchaseReturnInvoiceDate" value="${new Date().toISOString().split('T')[0]}"></p>
                            <p><strong>رقم فاتورة المشتريات الأصلية:</strong> <input type="text" id="originalPurchaseInvoiceNumber" placeholder="رقم فاتورة المشتريات الأصلية"></p>
                            <p><strong>سبب المرتجع:</strong> <input type="text" id="purchaseReturnReason" placeholder="سبب المرتجع"></p>
                        </div>
                    </div>
                </div>

                <div class="bill-to">
                    <h3>المورد:</h3>
                    <select id="purchaseReturnSupplierSelect" onchange="updatePurchaseReturnSupplierInfo()">
                        <option value="">اختر المورد</option>
                    </select>
                    <div class="supplier-details">
                        <p><strong>اسم المورد:</strong> <span id="purchaseReturnSupplierName">-</span></p>
                        <p><strong>العنوان:</strong> <span id="purchaseReturnSupplierAddress">-</span></p>
                        <p><strong>الهاتف:</strong> <span id="purchaseReturnSupplierPhone">-</span></p>
                        <p><strong>البريد الإلكتروني:</strong> <span id="purchaseReturnSupplierEmail">-</span></p>
                    </div>
                </div>

                <div class="invoice-table">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%;">#</th>
                                <th style="width: 40%;">الوصف</th>
                                <th style="width: 15%;">الكمية المرتجعة</th>
                                <th style="width: 15%;">السعر</th>
                                <th style="width: 15%;">الإجمالي</th>
                                <th style="width: 10%;">إجراء</th>
                            </tr>
                        </thead>
                        <tbody id="purchaseReturnItemsBody">
                            <tr>
                                <td>1</td>
                                <td><input type="text" placeholder="وصف المنتج المرتجع" class="description-input"></td>
                                <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculatePurchaseReturnTotal()" class="quantity-input"></td>
                                <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseReturnTotal()" class="price-input"></td>
                                <td><span class="itemTotal">0.00</span></td>
                                <td><button onclick="removePurchaseItem(this)" class="remove-btn">×</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button onclick="addPurchaseReturnItem()" class="add-item-btn">+ إضافة منتج مرتجع</button>
                </div>

                <div class="invoice-summary">
                    <div class="summary-left">
                        <h4>ملاحظات:</h4>
                        <textarea id="purchaseReturnNotes" placeholder="أي ملاحظات إضافية..." rows="4"></textarea>
                        <h4>سياسة المرتجع:</h4>
                        <p>${companySettings.return_policy || 'يتم قبول المرتجع خلال 14 يوماً من تاريخ الشراء. يجب أن يكون المنتج في حالته الأصلية.'}</p>
                    </div>
                    <div class="summary-right">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="purchaseReturnSubtotal">0.00 ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <span><input type="number" id="purchaseReturnDiscount" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseReturnTotal()"> ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (15%):</span>
                            <span id="purchaseReturnTax">0.00 ريال</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>إجمالي المرتجع:</strong></span>
                            <span id="purchaseReturnTotal"><strong>0.00 ريال</strong></span>
                        </div>
                        <div class="summary-row">
                            <span>المبلغ المسترد:</span>
                            <span><input type="number" id="purchaseReturnPaid" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseReturnBalance()"> ريال</span>
                        </div>
                        <div class="summary-row balance-row">
                            <span><strong>المبلغ المتبقي:</strong></span>
                            <span id="purchaseReturnBalance"><strong>0.00 ريال</strong></span>
                        </div>
                    </div>
                </div>

                <div class="invoice-footer">
                    <div class="footer-info">
                        <p>نشكركم على تعاونكم معنا</p>
                        <p>لأي استفسارات، يرجى الاتصال بنا على [رقم الهاتف] أو [البريد الإلكتروني]</p>
                    </div>
                    <div class="footer-actions">
                        <button onclick="savePurchaseInvoice('return')" class="save-btn">💾 حفظ مرتجع المشتريات</button>
                        <button onclick="printPurchaseInvoice()" class="print-btn">🖨️ طباعة</button>
                        <button onclick="emailPurchaseInvoice()" class="email-btn">📧 إرسال بالبريد</button>
                    </div>
                </div>
            </div>
        `;
        loadSuppliers();
    }
}

function generatePurchaseInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PUR-${year}${month}${day}-${random}`;
}

async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers');
        const suppliers = await response.json();
        const supplierSelect = document.getElementById('supplierSelect');
        const purchaseReturnSupplierSelect = document.getElementById('purchaseReturnSupplierSelect');

        if (supplierSelect) {
            supplierSelect.innerHTML = '<option value="">اختر المورد</option>';
            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.id;
                option.textContent = supplier.name;
                supplierSelect.appendChild(option);
            });
            supplierSelect.addEventListener('change', updateSupplierInfo);
        }

        if (purchaseReturnSupplierSelect) {
            purchaseReturnSupplierSelect.innerHTML = '<option value="">اختر المورد</option>';
            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.id;
                option.textContent = supplier.name;
                purchaseReturnSupplierSelect.appendChild(option);
            });
            purchaseReturnSupplierSelect.addEventListener('change', updatePurchaseReturnSupplierInfo);
        }
    } catch (error) {
        console.error('خطأ في جلب الموردين:', error);
    }
}

function updateSupplierInfo() {
    const supplierId = document.getElementById('supplierSelect').value;
    if (supplierId) {
        // في الوقت الحالي، لا نحتاج إلى معلومات إضافية
        document.getElementById('supplierName').textContent = 'سيتم تحديثه';
        document.getElementById('supplierAddress').textContent = 'سيتم تحديثه';
        document.getElementById('supplierPhone').textContent = 'سيتم تحديثه';
        document.getElementById('supplierEmail').textContent = 'سيتم تحديثه';
    } else {
        document.getElementById('supplierName').textContent = '-';
        document.getElementById('supplierAddress').textContent = '-';
        document.getElementById('supplierPhone').textContent = '-';
        document.getElementById('supplierEmail').textContent = '-';
    }
}

function updatePurchaseReturnSupplierInfo() {
    const supplierId = document.getElementById('purchaseReturnSupplierSelect').value;
    if (supplierId) {
        document.getElementById('purchaseReturnSupplierName').textContent = 'سيتم تحديثه';
        document.getElementById('purchaseReturnSupplierAddress').textContent = 'سيتم تحديثه';
        document.getElementById('purchaseReturnSupplierPhone').textContent = 'سيتم تحديثه';
        document.getElementById('purchaseReturnSupplierEmail').textContent = 'سيتم تحديثه';
    } else {
        document.getElementById('purchaseReturnSupplierName').textContent = '-';
        document.getElementById('purchaseReturnSupplierAddress').textContent = '-';
        document.getElementById('purchaseReturnSupplierPhone').textContent = '-';
        document.getElementById('purchaseReturnSupplierEmail').textContent = '-';
    }
}

function addPurchaseItem() {
    const tbody = document.getElementById('purchaseItemsBody');
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder="وصف المنتج أو الخدمة" class="description-input"></td>
        <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculatePurchaseTotal()" class="quantity-input"></td>
        <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseTotal()" class="price-input"></td>
        <td><span class="itemTotal">0.00</span></td>
        <td><button onclick="removePurchaseItem(this)" class="remove-btn">×</button></td>
    `;
    tbody.appendChild(row);
}

function addPurchaseReturnItem() {
    const tbody = document.getElementById('purchaseReturnItemsBody');
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder="وصف المنتج المرتجع" class="description-input"></td>
        <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculatePurchaseReturnTotal()" class="quantity-input"></td>
        <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculatePurchaseReturnTotal()" class="price-input"></td>
        <td><span class="itemTotal">0.00</span></td>
        <td><button onclick="removePurchaseItem(this)" class="remove-btn">×</button></td>
    `;
    tbody.appendChild(row);
}

function removePurchaseItem(button) {
    button.closest('tr').remove();
    calculatePurchaseTotal();
    calculatePurchaseReturnTotal();
}

function calculatePurchaseTotal() {
    const rows = document.querySelectorAll('#purchaseItemsBody tr');
    let subtotal = 0;
    rows.forEach(row => {
        const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = qty * price;
        row.cells[4].textContent = total.toFixed(2);
        subtotal += total;
    });

    const discount = parseFloat(document.getElementById('purchaseDiscount').value) || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.15;
    const total = discountedSubtotal + tax;

    document.getElementById('purchaseSubtotal').textContent = subtotal.toFixed(2) + ' ريال';
    document.getElementById('purchaseTax').textContent = tax.toFixed(2) + ' ريال';
    document.getElementById('purchaseTotal').innerHTML = '<strong>' + total.toFixed(2) + ' ريال</strong>';

    calculatePurchaseBalance();
}

function calculatePurchaseReturnTotal() {
    const rows = document.querySelectorAll('#purchaseReturnItemsBody tr');
    let subtotal = 0;
    rows.forEach(row => {
        const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = qty * price;
        row.cells[4].textContent = total.toFixed(2);
        subtotal += total;
    });

    const discount = parseFloat(document.getElementById('purchaseReturnDiscount').value) || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.15;
    const total = discountedSubtotal + tax;

    document.getElementById('purchaseReturnSubtotal').textContent = subtotal.toFixed(2) + ' ريال';
    document.getElementById('purchaseReturnTax').textContent = tax.toFixed(2) + ' ريال';
    document.getElementById('purchaseReturnTotal').innerHTML = '<strong>' + total.toFixed(2) + ' ريال</strong>';

    calculatePurchaseReturnBalance();
}

function calculatePurchaseBalance() {
    const total = parseFloat(document.getElementById('purchaseTotal').textContent.replace(' ريال', '').replace('<strong>', '').replace('</strong>', '')) || 0;
    const paid = parseFloat(document.getElementById('purchasePaid').value) || 0;
    const balance = total - paid;
    document.getElementById('purchaseBalance').innerHTML = '<strong>' + balance.toFixed(2) + ' ريال</strong>';
}

function calculatePurchaseReturnBalance() {
    const total = parseFloat(document.getElementById('purchaseReturnTotal').textContent.replace(' ريال', '').replace('<strong>', '').replace('</strong>', '')) || 0;
    const paid = parseFloat(document.getElementById('purchaseReturnPaid').value) || 0;
    const balance = total - paid;
    document.getElementById('purchaseReturnBalance').innerHTML = '<strong>' + balance.toFixed(2) + ' ريال</strong>';
}

async function savePurchaseInvoice(type) {
    // منطق حفظ فاتورة المشتريات - يمكن توسيعه لاحقاً
    alert('تم حفظ فاتورة المشتريات بنجاح!');
}

function printPurchaseInvoice() {
    window.print();
}

function emailPurchaseInvoice() {
    alert('ميزة إرسال فاتورة المشتريات بالبريد الإلكتروني ستكون متاحة قريباً!');
}