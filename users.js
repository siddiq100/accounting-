async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        users.forEach(user => {
            const status = user.approved ? 'مفعل' : 'غير مفعل';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${user.id}</td><td>${user.username}</td><td>${user.email}</td><td>${status}</td>
                            <td>
                                <button onclick="editUser(${user.id})">تحرير</button>
                                <button onclick="deleteUser(${user.id})">حذف</button>
                            </td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('خطأ في جلب المستخدمين:', error);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('userUsername').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (response.ok) {
            loadUsers();
            this.reset();
        }
    } catch (error) {
        console.error('خطأ في إضافة المستخدم:', error);
    }
});

loadUsers();

async function editUser(id) {
    const newUsername = prompt('أدخل اسم المستخدم الجديد:');
    const newEmail = prompt('أدخل البريد الإلكتروني الجديد:');
    if (newUsername && newEmail) {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, email: newEmail })
            });
            if (response.ok) {
                loadUsers();
            }
        } catch (error) {
            console.error('خطأ في تحرير المستخدم:', error);
        }
    }
}

async function deleteUser(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadUsers();
            }
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
        }
    }
}