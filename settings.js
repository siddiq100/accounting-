document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    document.getElementById('companySettingsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
});

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        document.getElementById('company_name').value = settings.company_name || '';
        document.getElementById('company_address').value = settings.company_address || '';
        document.getElementById('company_phone').value = settings.company_phone || '';
        document.getElementById('company_email').value = settings.company_email || '';
        document.getElementById('tax_number').value = settings.tax_number || '';
        document.getElementById('payment_terms').value = settings.payment_terms || '';
        document.getElementById('return_policy').value = settings.return_policy || '';
        
        if (settings.logo_path) {
            document.getElementById('currentLogo').src = settings.logo_path;
        }
    } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
    }
}

function previewLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentLogo').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function saveSettings() {
    const formData = new FormData();
    formData.append('company_name', document.getElementById('company_name').value);
    formData.append('company_address', document.getElementById('company_address').value);
    formData.append('company_phone', document.getElementById('company_phone').value);
    formData.append('company_email', document.getElementById('company_email').value);
    formData.append('tax_number', document.getElementById('tax_number').value);
    formData.append('payment_terms', document.getElementById('payment_terms').value);
    formData.append('return_policy', document.getElementById('return_policy').value);
    
    const logoInput = document.getElementById('logo');
    if (logoInput.files && logoInput.files[0]) {
        formData.append('logo', logoInput.files[0]);
    }
    
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            alert('تم حفظ الإعدادات بنجاح!');
            loadSettings(); // إعادة تحميل الإعدادات
        } else {
            alert('خطأ في حفظ الإعدادات');
        }
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات:', error);
        alert('خطأ في حفظ الإعدادات');
    }
}

function resetSettings() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
        // إعادة تعيين النموذج
        document.getElementById('companySettingsForm').reset();
        document.getElementById('currentLogo').src = 'logo.png';
    }
}