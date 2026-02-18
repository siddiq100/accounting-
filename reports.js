async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        document.getElementById('totalClients').innerText = data.totalClients;
        document.getElementById('totalInvoices').innerText = data.totalInvoices;
        document.getElementById('totalRevenue').innerText = data.totalRevenue;
        document.getElementById('totalPaid').innerText = data.totalRevenue - data.unpaidInvoices; // افتراضي
        document.getElementById('remainingRevenue').innerText = data.unpaidInvoices;
        document.getElementById('totalDebts').innerText = data.totalDebts;
    } catch (error) {
        console.error('خطأ في جلب التقارير:', error);
    }
}

loadReports();
