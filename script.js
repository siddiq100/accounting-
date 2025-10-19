// تسجيل مستخدم جديد
document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const response = await fetch('php/register.php', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    if (data.success) {
        alert(data.message);
        window.location.href = "index.html";
    } else {
        document.getElementById('registerError').innerText = data.message;
    }
});

// تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const response = await fetch('php/login.php', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    if (data.success) {
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('loginError').innerText = data.message;
    }
});

// تسجيل الخروج
function logout() {
    window.location.href = "index.html";
}
