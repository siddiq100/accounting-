async function updateSummary() {
    try {
        const response = await fetch('/api/summary');
        const data = await response.json();
        document.getElementById('totalClients').innerText = data.totalClients;
        document.getElementById('totalInvoices').innerText = data.totalInvoices;
        document.getElementById('totalRevenue').innerText = data.totalRevenue;
        document.getElementById('totalDebts').innerText = data.totalDebts;
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
    }
}

updateSummary();
