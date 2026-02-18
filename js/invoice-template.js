// حفظ التصميم الحالي
let currentTemplate = 'invoice';
let headerColor = '#667eea';

// دالة تبديل نوع الفاتورة
function switchTemplate(type) {
    currentTemplate = type;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.template-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // تحديث رأس الفاتورة
    const typeLabels = {
        'invoice': 'فاتورة بيع',
        'receipt': 'سند استقبال',
        'purchase': 'فاتورة شراء'
    };
    
    document.getElementById('invoiceTypeHeader').textContent = typeLabels[type];
    updatePreview();
}

// دالة اختيار اللون
function selectColor(color) {
    headerColor = color;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updatePreview();
}

// تحديث المعاينة
function updatePreview() {
    // تحديث معلومات الشركة
    document.getElementById('previewCompanyName').textContent = 
        document.getElementById('companyName').value || 'المحاسب العبقري';
    document.getElementById('previewAddress').textContent = 
        document.getElementById('companyAddress').value || 'الرياض - المملكة العربية السعودية';
    document.getElementById('previewPhone').textContent = 
        document.getElementById('companyPhone').value || '+966 55 0000000';
    document.getElementById('previewEmail').textContent = 
        document.getElementById('companyEmail').value || 'info@genius.sa';
    
    // تحديث البيانات الإضافية
    document.getElementById('previewTerms').textContent = 
        document.getElementById('termsConditions').value || 'شكراً لتعاملكم معنا';
    document.getElementById('previewSignature').textContent = 
        document.getElementById('signature').value || 'ختم الشركة';
    
    // تحديث الرؤية
    const invoiceNumberDisplay = document.getElementById('invoiceNumberDisplay');
    const invoiceDateDisplay = document.getElementById('invoiceDateDisplay');
    
    invoiceNumberDisplay.style.display = document.getElementById('showInvoiceNumber').value === 'true' ? 'block' : 'none';
    invoiceDateDisplay.style.display = document.getElementById('showDate').value === 'true' ? 'block' : 'none';
    
    // تحديث التاريخ
    const today = new Date();
    const hijriDate = convertToHijri(today);
    document.getElementById('currentDate').textContent = hijriDate;
    
    // تحديث اللون
    const preview = document.getElementById('invoicePreview');
    const tables = preview.querySelectorAll('th');
    tables.forEach(th => {
        th.style.backgroundColor = headerColor;
    });
}

// دالة تحويل التاريخ إلى هجري (توافق أساسي)
function convertToHijri(date) {
    const hijriYear = Math.floor(date.getFullYear() - 622 + (date.getMonth() - 1) / 12);
    const hijriMonth = date.getMonth() + 1;
    const hijriDay = date.getDate();
    return `${hijriDay}/${hijriMonth}/${hijriYear}`;
}

// دالة طباعة المعاينة
function printPreview() {
    const preview = document.getElementById('invoicePreview').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>طباعة الفاتورة</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                }
                .preview {
                    page-break-after: always;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${preview}
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

// دالة حفظ التصميم
function saveTemplate() {
    const template = {
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyEmail: document.getElementById('companyEmail').value,
        headerColor: headerColor,
        showInvoiceNumber: document.getElementById('showInvoiceNumber').value,
        showDate: document.getElementById('showDate').value,
        termsConditions: document.getElementById('termsConditions').value,
        signature: document.getElementById('signature').value,
        templateType: currentTemplate
    };
    
    localStorage.setItem('invoiceTemplate_' + currentTemplate, JSON.stringify(template));
    alert('✅ تم حفظ التصميم بنجاح!');
}

// دالة استعادة التصميم المحفوظ
function loadTemplate() {
    const savedTemplate = localStorage.getItem('invoiceTemplate_' + currentTemplate);
    if (savedTemplate) {
        const template = JSON.parse(savedTemplate);
        document.getElementById('companyName').value = template.companyName;
        document.getElementById('companyAddress').value = template.companyAddress;
        document.getElementById('companyPhone').value = template.companyPhone;
        document.getElementById('companyEmail').value = template.companyEmail;
        document.getElementById('showInvoiceNumber').value = template.showInvoiceNumber;
        document.getElementById('showDate').value = template.showDate;
        document.getElementById('termsConditions').value = template.termsConditions;
        document.getElementById('signature').value = template.signature;
        headerColor = template.headerColor;
        updatePreview();
    }
}

// دالة إعادة تعيين
function resetTemplate() {
    if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين التصميم؟')) {
        document.getElementById('companyName').value = 'المحاسب العبقري';
        document.getElementById('companyAddress').value = 'الرياض - المملكة العربية السعودية';
        document.getElementById('companyPhone').value = '+966 55 0000000';
        document.getElementById('companyEmail').value = 'info@genius.sa';
        document.getElementById('showInvoiceNumber').value = 'true';
        document.getElementById('showDate').value = 'true';
        document.getElementById('termsConditions').value = 'شكراً لتعاملكم معنا';
        document.getElementById('signature').value = 'ختم الشركة';
        headerColor = '#667eea';
        updatePreview();
    }
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', function() {
    // تحديث المعاينة عند تغيير المدخلات
    const inputs = document.querySelectorAll(
        '#companyName, #companyAddress, #companyPhone, #companyEmail, ' +
        '#showInvoiceNumber, #showDate, #termsConditions, #signature'
    );
    
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // تحميل التصميم المحفوظ
    loadTemplate();
    
    // تحديث المعاينة الأولية
    updatePreview();
});

// دالة تصدير الفاتورة كـ PDF
function exportAsPDF() {
    const preview = document.getElementById('invoicePreview').innerHTML;
    const element = document.createElement('div');
    element.innerHTML = preview;
    
    // يمكن استخدام مكتبة html2pdf عند إضافتها
    alert('هذه الميزة ستتطلب مكتبة html2pdf للتصدير');
    printPreview();
}
