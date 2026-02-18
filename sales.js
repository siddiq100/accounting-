async function showInvoice(type) {
    const container = document.getElementById('invoiceContainer');
    container.style.display = 'block';

    // جلب إعدادات الشركة
    let companySettings = {};
    try {
        const response = await fetch('/api/settings');
        companySettings = await response.json();
    } catch (error) {
        console.error('خطأ في جلب إعدادات الشركة:', error);
    }

    if (type === 'sales') {
        container.innerHTML = `
            <div class="invoice sales-invoice">
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
                        <h1>فاتورة مبيعات</h1>
                        <div class="invoice-meta">
                            <p><strong>رقم الفاتورة:</strong> <span id="invoiceNumber">${generateInvoiceNumber()}</span></p>
                            <p><strong>تاريخ الفاتورة:</strong> <input type="date" id="invoiceDate" value="${new Date().toISOString().split('T')[0]}"></p>
                            <p><strong>تاريخ الاستحقاق:</strong> <input type="date" id="dueDate" value="${getDueDate()}"></p>
                        </div>
                    </div>
                </div>
                
                <div class="bill-to">
                    <h3>الفاتورة إلى:</h3>
                    <select id="clientSelect" onchange="updateClientInfo()">
                        <option value="">اختر العميل</option>
                    </select>
                    <div class="client-details">
                        <p><strong>اسم العميل:</strong> <span id="clientName">-</span></p>
                        <p><strong>العنوان:</strong> <span id="clientAddress">-</span></p>
                        <p><strong>الهاتف:</strong> <span id="clientPhone">-</span></p>
                        <p><strong>البريد الإلكتروني:</strong> <span id="clientEmail">-</span></p>
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
                        <tbody id="itemsBody">
                            <tr>
                                <td>1</td>
                                <td><input type="text" placeholder="وصف المنتج أو الخدمة" class="description-input"></td>
                                <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculateTotal()" class="quantity-input"></td>
                                <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculateTotal()" class="price-input"></td>
                                <td><span class="itemTotal">0.00</span></td>
                                <td><button onclick="removeItem(this)" class="remove-btn">×</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button onclick="addItem()" class="add-item-btn">+ إضافة منتج</button>
                </div>
                
                <div class="invoice-summary">
                    <div class="summary-left">
                        <h4>ملاحظات:</h4>
                        <textarea id="notes" placeholder="أي ملاحظات إضافية..." rows="4"></textarea>
                        <h4>شروط الدفع:</h4>
                        <p>${companySettings.payment_terms || 'الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة'}</p>
                    </div>
                    <div class="summary-right">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="subtotal">0.00 ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <span><input type="number" id="discount" placeholder="0.00" min="0" step="0.01" onchange="calculateTotal()"> ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (15%):</span>
                            <span id="tax">0.00 ريال</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>الإجمالي:</strong></span>
                            <span id="total"><strong>0.00 ريال</strong></span>
                        </div>
                        <div class="summary-row">
                            <span>المبلغ المدفوع:</span>
                            <span><input type="number" id="paid" placeholder="0.00" min="0" step="0.01" onchange="calculateBalance()"> ريال</span>
                        </div>
                        <div class="summary-row balance-row">
                            <span><strong>المبلغ المستحق:</strong></span>
                            <span id="balance"><strong>0.00 ريال</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <div class="footer-info">
                        <p>شكراً لتعاملكم معنا!</p>
                        <p>لأي استفسارات، يرجى الاتصال بنا على [رقم الهاتف] أو [البريد الإلكتروني]</p>
                    </div>
                    <div class="footer-actions">
                        <button onclick="saveInvoice('sales')" class="save-btn">💾 حفظ الفاتورة</button>
                        <button onclick="printInvoice()" class="print-btn">🖨️ طباعة</button>
                        <button onclick="emailInvoice()" class="email-btn">📧 إرسال بالبريد</button>
                    </div>
                </div>
            </div>
        `;
        loadClients();
    } else if (type === 'return') {
        container.innerHTML = `
            <div class="invoice return-invoice">
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
                        <h1>فاتورة مرتجع</h1>
                        <div class="invoice-meta">
                            <p><strong>رقم فاتورة المرتجع:</strong> <span id="returnInvoiceNumber">R${generateInvoiceNumber()}</span></p>
                            <p><strong>تاريخ الفاتورة:</strong> <input type="date" id="returnInvoiceDate" value="${new Date().toISOString().split('T')[0]}"></p>
                            <p><strong>رقم الفاتورة الأصلية:</strong> <input type="text" id="originalInvoiceNumber" placeholder="رقم الفاتورة الأصلية"></p>
                            <p><strong>سبب المرتجع:</strong> <input type="text" id="returnReason" placeholder="سبب المرتجع"></p>
                        </div>
                    </div>
                </div>
                
                <div class="bill-to">
                    <h3>الفاتورة إلى:</h3>
                    <select id="returnClientSelect" onchange="updateReturnClientInfo()">
                        <option value="">اختر العميل</option>
                    </select>
                    <div class="client-details">
                        <p><strong>اسم العميل:</strong> <span id="returnClientName">-</span></p>
                        <p><strong>العنوان:</strong> <span id="returnClientAddress">-</span></p>
                        <p><strong>الهاتف:</strong> <span id="returnClientPhone">-</span></p>
                        <p><strong>البريد الإلكتروني:</strong> <span id="returnClientEmail">-</span></p>
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
                        <tbody id="returnItemsBody">
                            <tr>
                                <td>1</td>
                                <td><input type="text" placeholder="وصف المنتج المرتجع" class="description-input"></td>
                                <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculateReturnTotal()" class="quantity-input"></td>
                                <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculateReturnTotal()" class="price-input"></td>
                                <td><span class="itemTotal">0.00</span></td>
                                <td><button onclick="removeItem(this)" class="remove-btn">×</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <button onclick="addReturnItem()" class="add-item-btn">+ إضافة منتج مرتجع</button>
                </div>
                
                <div class="invoice-summary">
                    <div class="summary-left">
                        <h4>ملاحظات:</h4>
                        <textarea id="returnNotes" placeholder="أي ملاحظات إضافية..." rows="4"></textarea>
                        <h4>سياسة المرتجع:</h4>
                        <p>${companySettings.return_policy || 'يتم قبول المرتجع خلال 14 يوماً من تاريخ الشراء. يجب أن يكون المنتج في حالته الأصلية.'}</p>
                    </div>
                    <div class="summary-right">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="returnSubtotal">0.00 ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <span><input type="number" id="returnDiscount" placeholder="0.00" min="0" step="0.01" onchange="calculateReturnTotal()"> ريال</span>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة (15%):</span>
                            <span id="returnTax">0.00 ريال</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>إجمالي المرتجع:</strong></span>
                            <span id="returnTotal"><strong>0.00 ريال</strong></span>
                        </div>
                        <div class="summary-row">
                            <span>المبلغ المسترد:</span>
                            <span><input type="number" id="returnPaid" placeholder="0.00" min="0" step="0.01" onchange="calculateReturnBalance()"> ريال</span>
                        </div>
                        <div class="summary-row balance-row">
                            <span><strong>المبلغ المتبقي:</strong></span>
                            <span id="returnBalance"><strong>0.00 ريال</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <div class="footer-info">
                        <p>نشكركم على تعاونكم معنا</p>
                        <p>لأي استفسارات، يرجى الاتصال بنا على [رقم الهاتف] أو [البريد الإلكتروني]</p>
                    </div>
                    <div class="footer-actions">
                        <button onclick="saveInvoice('return')" class="save-btn">💾 حفظ فاتورة المرتجع</button>
                        <button onclick="printInvoice()" class="print-btn">🖨️ طباعة</button>
                        <button onclick="emailInvoice()" class="email-btn">📧 إرسال بالبريد</button>
                    </div>
                </div>
            </div>
        `;
        loadClients();
    }
}

async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        const clients = await response.json();
        const clientSelect = document.getElementById('clientSelect');
        const returnClientSelect = document.getElementById('returnClientSelect');
        
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">اختر العميل</option>';
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);
            });
            clientSelect.addEventListener('change', updateClientInfo);
        }
        
        if (returnClientSelect) {
            returnClientSelect.innerHTML = '<option value="">اختر العميل</option>';
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                returnClientSelect.appendChild(option);
            });
            returnClientSelect.addEventListener('change', updateReturnClientInfo);
        }
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
    }
}

function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
}

function getDueDate() {
    const now = new Date();
    now.setDate(now.getDate() + 30); // 30 days from now
    return now.toISOString().split('T')[0];
}

function updateClientInfo() {
    const clientId = document.getElementById('clientSelect').value;
    if (clientId) {
        // في الوقت الحالي، لا نحتاج إلى معلومات إضافية
        // يمكن توسيع هذا لاحقاً لجلب تفاصيل العميل من API
        document.getElementById('clientName').textContent = 'سيتم تحديثه';
        document.getElementById('clientAddress').textContent = 'سيتم تحديثه';
        document.getElementById('clientPhone').textContent = 'سيتم تحديثه';
        document.getElementById('clientEmail').textContent = 'سيتم تحديثه';
    } else {
        document.getElementById('clientName').textContent = '-';
        document.getElementById('clientAddress').textContent = '-';
        document.getElementById('clientPhone').textContent = '-';
        document.getElementById('clientEmail').textContent = '-';
    }
}

function updateReturnClientInfo() {
    const clientId = document.getElementById('returnClientSelect').value;
    if (clientId) {
        document.getElementById('returnClientName').textContent = 'سيتم تحديثه';
        document.getElementById('returnClientAddress').textContent = 'سيتم تحديثه';
        document.getElementById('returnClientPhone').textContent = 'سيتم تحديثه';
        document.getElementById('returnClientEmail').textContent = 'سيتم تحديثه';
    } else {
        document.getElementById('returnClientName').textContent = '-';
        document.getElementById('returnClientAddress').textContent = '-';
        document.getElementById('returnClientPhone').textContent = '-';
        document.getElementById('returnClientEmail').textContent = '-';
    }
}

function addItem() {
    const tbody = document.getElementById('itemsBody');
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder="وصف المنتج أو الخدمة" class="description-input"></td>
        <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculateTotal()" class="quantity-input"></td>
        <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculateTotal()" class="price-input"></td>
        <td><span class="itemTotal">0.00</span></td>
        <td><button onclick="removeItem(this)" class="remove-btn">×</button></td>
    `;
    tbody.appendChild(row);
}

function addReturnItem() {
    const tbody = document.getElementById('returnItemsBody');
    const rowCount = tbody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder="وصف المنتج المرتجع" class="description-input"></td>
        <td><input type="number" placeholder="0" min="0" step="0.01" onchange="calculateReturnTotal()" class="quantity-input"></td>
        <td><input type="number" placeholder="0.00" min="0" step="0.01" onchange="calculateReturnTotal()" class="price-input"></td>
        <td><span class="itemTotal">0.00</span></td>
        <td><button onclick="removeItem(this)" class="remove-btn">×</button></td>
    `;
    tbody.appendChild(row);
}

function emailInvoice() {
    alert('ميزة إرسال الفاتورة بالبريد الإلكتروني ستكون متاحة قريباً!');
}

function removeItem(button) {
    button.closest('tr').remove();
    calculateTotal();
    calculateReturnTotal();
}

function calculateTotal() {
    const rows = document.querySelectorAll('#itemsBody tr');
    let subtotal = 0;
    rows.forEach(row => {
        const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = qty * price;
        row.cells[4].textContent = total.toFixed(2);
        subtotal += total;
    });
    
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.15;
    const total = discountedSubtotal + tax;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ريال';
    document.getElementById('tax').textContent = tax.toFixed(2) + ' ريال';
    document.getElementById('total').innerHTML = '<strong>' + total.toFixed(2) + ' ريال</strong>';
    
    calculateBalance();
}

function calculateReturnTotal() {
    const rows = document.querySelectorAll('#returnItemsBody tr');
    let subtotal = 0;
    rows.forEach(row => {
        const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const total = qty * price;
        row.cells[4].textContent = total.toFixed(2);
        subtotal += total;
    });
    
    const discount = parseFloat(document.getElementById('returnDiscount').value) || 0;
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.15;
    const total = discountedSubtotal + tax;
    
    document.getElementById('returnSubtotal').textContent = subtotal.toFixed(2) + ' ريال';
    document.getElementById('returnTax').textContent = tax.toFixed(2) + ' ريال';
    document.getElementById('returnTotal').innerHTML = '<strong>' + total.toFixed(2) + ' ريال</strong>';
    
    calculateReturnBalance();
}

function calculateBalance() {
    const total = parseFloat(document.getElementById('total').textContent.replace(' ريال', '').replace('<strong>', '').replace('</strong>', '')) || 0;
    const paid = parseFloat(document.getElementById('paid').value) || 0;
    const balance = total - paid;
    document.getElementById('balance').innerHTML = '<strong>' + balance.toFixed(2) + ' ريال</strong>';
}

function calculateReturnBalance() {
    const total = parseFloat(document.getElementById('returnTotal').textContent.replace(' ريال', '').replace('<strong>', '').replace('</strong>', '')) || 0;
    const paid = parseFloat(document.getElementById('returnPaid').value) || 0;
    const balance = total - paid;
    document.getElementById('returnBalance').innerHTML = '<strong>' + balance.toFixed(2) + ' ريال</strong>';
}

async function saveInvoice(type) {
    const clientId = type === 'sales' ? document.getElementById('clientSelect').value : document.getElementById('returnClientSelect').value;
    const date = type === 'sales' ? document.getElementById('invoiceDate').value : document.getElementById('returnInvoiceDate').value;
    const total = type === 'sales' ? parseFloat(document.getElementById('total').textContent) : parseFloat(document.getElementById('returnTotal').textContent);

    if (!clientId || !date) {
        alert('يرجى اختيار العميل وتاريخ الفاتورة');
        return;
    }

    try {
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: parseInt(clientId),
                date: date,
                total: total,
                paid: type === 'return' ? total : 0 // افتراض أن المرتجع مدفوع
            })
        });
        if (response.ok) {
            alert('تم حفظ الفاتورة بنجاح!');
            // إعادة تعيين النموذج أو إخفاء الفاتورة
            document.getElementById('invoiceContainer').style.display = 'none';
        } else {
            alert('خطأ في حفظ الفاتورة');
        }
    } catch (error) {
        console.error('خطأ في حفظ الفاتورة:', error);
        alert('خطأ في حفظ الفاتورة');
    }
}

function printInvoice() {
    window.print();
}