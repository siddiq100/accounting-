const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// إعداد قاعدة البيانات
const db = new sqlite3.Database('./database/app.db');

// إنشاء الجداول إذا لم تكن موجودة
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        approved INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        date TEXT,
        total REAL,
        paid REAL DEFAULT 0,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        amount REAL,
        description TEXT,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT DEFAULT '💠 المحاسب العبقري',
        company_address TEXT DEFAULT '[عنوان الشركة الكامل]',
        company_phone TEXT DEFAULT '[رقم الهاتف]',
        company_email TEXT DEFAULT '[البريد الإلكتروني]',
        tax_number TEXT DEFAULT '[رقم الضريبة]',
        logo_path TEXT DEFAULT 'logo.png',
        payment_terms TEXT DEFAULT 'الدفع مستحق خلال 30 يوماً من تاريخ الفاتورة',
        return_policy TEXT DEFAULT 'يتم قبول المرتجع خلال 14 يوماً من تاريخ الشراء. يجب أن يكون المنتج في حالته الأصلية.',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // إدراج إعدادات افتراضية إذا لم تكن موجودة
    db.get("SELECT COUNT(*) as count FROM company_settings", (err, row) => {
        if (!err && row.count === 0) {
            db.run(`INSERT INTO company_settings DEFAULT VALUES`);
        }
    });
    
    // جداول المخزون
    db.run(`CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_code TEXT UNIQUE NOT NULL,
        item_name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        unit TEXT DEFAULT 'قطعة',
        quantity REAL DEFAULT 0,
        min_quantity REAL DEFAULT 0,
        max_quantity REAL DEFAULT 0,
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        supplier_id INTEGER,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'count'
        quantity REAL NOT NULL,
        previous_quantity REAL NOT NULL,
        new_quantity REAL NOT NULL,
        reference_type TEXT, -- 'purchase', 'sale', 'adjustment', 'count'
        reference_id INTEGER,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(item_id) REFERENCES inventory_items(id),
        FOREIGN KEY(created_by) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS inventory_counts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        count_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'draft', -- 'draft', 'completed', 'approved'
        notes TEXT,
        counted_by INTEGER,
        approved_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(counted_by) REFERENCES users(id),
        FOREIGN KEY(approved_by) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS inventory_count_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        system_quantity REAL DEFAULT 0,
        counted_quantity REAL DEFAULT 0,
        difference REAL DEFAULT 0,
        notes TEXT,
        FOREIGN KEY(count_id) REFERENCES inventory_counts(id),
        FOREIGN KEY(item_id) REFERENCES inventory_items(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        adjustment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        adjustment_number TEXT UNIQUE NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        notes TEXT,
        requested_by INTEGER,
        approved_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(requested_by) REFERENCES users(id),
        FOREIGN KEY(approved_by) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS inventory_adjustment_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        adjustment_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        current_quantity REAL DEFAULT 0,
        adjusted_quantity REAL DEFAULT 0,
        difference REAL DEFAULT 0,
        reason TEXT,
        FOREIGN KEY(adjustment_id) REFERENCES inventory_adjustments(id),
        FOREIGN KEY(item_id) REFERENCES inventory_items(id)
    )`);
});

// إعداد Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer for form data and file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('يجب أن يكون الملف صورة'), false);
        }
    }
});

// routes
app.post('/php/login.php', upload.none(), (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.json({ success: false, message: 'خطأ في قاعدة البيانات' });
        }
        if (!user) {
            return res.json({ success: false, message: 'المستخدم غير موجود' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.json({ success: false, message: 'كلمة المرور غير صحيحة' });
        }
        if (user.approved == 0) {
            return res.json({ success: false, message: 'لم تتم الموافقة على حسابك بعد' });
        }
        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    });
});

app.post('/php/register.php', upload.none(), (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, email, password, approved) VALUES (?, ?, ?, ?)", [username, email, hashedPassword, 1], function(err) {
        if (err) {
            return res.json({ success: false, message: 'اسم المستخدم أو البريد موجود بالفعل' });
        }
        res.json({ success: true, message: 'تم التسجيل بنجاح' });
    });
});

// route للعملاء
app.get('/api/clients', (req, res) => {
    db.all("SELECT * FROM clients", (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/clients', (req, res) => {
    const { name, phone, email } = req.body;
    db.run("INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)", [name, phone, email], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في إضافة العميل' });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    db.run("UPDATE clients SET name = ?, phone = ?, email = ? WHERE id = ?", [name, phone, email, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تحرير العميل' });
        }
        res.json({ message: 'تم التحرير' });
    });
});

app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM clients WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف العميل' });
        }
        res.json({ message: 'تم الحذف' });
    });
});

// route للموردين
app.get('/api/suppliers', (req, res) => {
    db.all("SELECT * FROM suppliers", (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/suppliers', (req, res) => {
    const { name, phone, email } = req.body;
    db.run("INSERT INTO suppliers (name, phone, email) VALUES (?, ?, ?)", [name, phone, email], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في إضافة المورد' });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    db.run("UPDATE suppliers SET name = ?, phone = ?, email = ? WHERE id = ?", [name, phone, email, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تحرير المورد' });
        }
        res.json({ message: 'تم التحرير' });
    });
});

app.delete('/api/suppliers/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM suppliers WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف المورد' });
        }
        res.json({ message: 'تم الحذف' });
    });
});

// route للمستخدمين
app.get('/api/users', (req, res) => {
    db.all("SELECT id, username, email, approved FROM users", (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/users', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, email, password, approved) VALUES (?, ?, ?, 1)", [username, email, hashedPassword], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في إضافة المستخدم' });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    db.run("UPDATE users SET username = ?, email = ? WHERE id = ?", [username, email, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تحرير المستخدم' });
        }
        res.json({ message: 'تم التحرير' });
    });
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف المستخدم' });
        }
        res.json({ message: 'تم الحذف' });
    });
});

// route للفواتير
app.get('/api/invoices', (req, res) => {
    db.all("SELECT invoices.*, clients.name as client_name FROM invoices JOIN clients ON invoices.client_id = clients.id", (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/invoices', (req, res) => {
    const { clientId, date, total, paid } = req.body;
    db.run("INSERT INTO invoices (client_id, date, total, paid) VALUES (?, ?, ?, ?)", [clientId, date, total, paid], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في إضافة الفاتورة' });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    const { paid } = req.body;
    db.run("UPDATE invoices SET paid = ? WHERE id = ?", [paid, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تحرير الفاتورة' });
        }
        res.json({ message: 'تم التحرير' });
    });
});

app.delete('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM invoices WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف الفاتورة' });
        }
        res.json({ message: 'تم الحذف' });
    });
});

// route للمديونيات
app.get('/api/debts', (req, res) => {
    db.all("SELECT debts.*, clients.name as client_name FROM debts JOIN clients ON debts.client_id = clients.id", (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/debts', (req, res) => {
    const { clientId, amount, description } = req.body;
    db.run("INSERT INTO debts (client_id, amount, description) VALUES (?, ?, ?)", [clientId, amount, description], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في إضافة المديونية' });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/api/debts/:id', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    db.run("UPDATE debts SET amount = ? WHERE id = ?", [amount, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تحرير المديونية' });
        }
        res.json({ message: 'تم التحرير' });
    });
});

app.delete('/api/debts/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM debts WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف المديونية' });
        }
        res.json({ message: 'تم الحذف' });
    });
});

// route للإعدادات
app.get('/api/settings', (req, res) => {
    db.get("SELECT * FROM company_settings WHERE id = 1", (err, row) => {
        if (err) {
            return res.json({});
        }
        res.json(row || {});
    });
});

app.put('/api/settings', upload.single('logo'), (req, res) => {
    const { company_name, company_address, company_phone, company_email, tax_number, payment_terms, return_policy } = req.body;
    let logo_path = req.body.logo_path || 'logo.png';
    
    if (req.file) {
        logo_path = req.file.filename;
    }
    
    db.run(`UPDATE company_settings SET 
        company_name = ?, 
        company_address = ?, 
        company_phone = ?, 
        company_email = ?, 
        tax_number = ?, 
        logo_path = ?, 
        payment_terms = ?, 
        return_policy = ?, 
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1`,
        [company_name, company_address, company_phone, company_email, tax_number, logo_path, payment_terms, return_policy], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في حفظ الإعدادات' });
            }
            res.json({ message: 'تم حفظ الإعدادات بنجاح' });
        });
});

// route للمخزون
app.get('/api/inventory/items', (req, res) => {
    const { search, category, low_stock } = req.query;
    let query = `SELECT inventory_items.*, suppliers.name as supplier_name 
                 FROM inventory_items 
                 LEFT JOIN suppliers ON inventory_items.supplier_id = suppliers.id`;
    let params = [];
    
    if (search || category || low_stock) {
        query += ' WHERE';
        let conditions = [];
        
        if (search) {
            conditions.push(' (item_name LIKE ? OR item_code LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (category) {
            conditions.push(' category = ?');
            params.push(category);
        }
        
        if (low_stock === 'true') {
            conditions.push(' quantity <= min_quantity');
        }
        
        query += conditions.join(' AND');
    }
    
    query += ' ORDER BY item_name';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/inventory/items', (req, res) => {
    const { item_code, item_name, description, category, unit, quantity, min_quantity, max_quantity, cost_price, selling_price, supplier_id, location } = req.body;
    
    db.run(`INSERT INTO inventory_items 
            (item_code, item_name, description, category, unit, quantity, min_quantity, max_quantity, cost_price, selling_price, supplier_id, location) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item_code, item_name, description, category, unit, quantity, min_quantity, max_quantity, cost_price, selling_price, supplier_id, location], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في إضافة الصنف' });
            }
            res.json({ id: this.lastID });
        });
});

app.put('/api/inventory/items/:id', (req, res) => {
    const { id } = req.params;
    const { item_code, item_name, description, category, unit, min_quantity, max_quantity, cost_price, selling_price, supplier_id, location } = req.body;
    
    db.run(`UPDATE inventory_items SET 
            item_code = ?, item_name = ?, description = ?, category = ?, unit = ?, 
            min_quantity = ?, max_quantity = ?, cost_price = ?, selling_price = ?, 
            supplier_id = ?, location = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
        [item_code, item_name, description, category, unit, min_quantity, max_quantity, cost_price, selling_price, supplier_id, location, id], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في تحديث الصنف' });
            }
            res.json({ message: 'تم تحديث الصنف' });
        });
});

app.delete('/api/inventory/items/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM inventory_items WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'خطأ في حذف الصنف' });
        }
        res.json({ message: 'تم حذف الصنف' });
    });
});

// route للجرد
app.get('/api/inventory/counts', (req, res) => {
    db.all(`SELECT inventory_counts.*, users.username as counted_by_name 
            FROM inventory_counts 
            LEFT JOIN users ON inventory_counts.counted_by = users.id 
            ORDER BY count_date DESC`, (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/inventory/counts', (req, res) => {
    const { count_number, notes, counted_by } = req.body;
    
    db.run('INSERT INTO inventory_counts (count_number, notes, counted_by) VALUES (?, ?, ?)',
        [count_number, notes, counted_by], function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في إنشاء الجرد' });
            }
            res.json({ id: this.lastID });
        });
});

app.get('/api/inventory/counts/:id/items', (req, res) => {
    const { id } = req.params;
    
    db.all(`SELECT inventory_count_items.*, inventory_items.item_name, inventory_items.item_code 
            FROM inventory_count_items 
            JOIN inventory_items ON inventory_count_items.item_id = inventory_items.id 
            WHERE count_id = ?`, [id], (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/inventory/counts/:id/items', (req, res) => {
    const { id } = req.params;
    const { item_id, system_quantity, counted_quantity, notes } = req.body;
    const difference = counted_quantity - system_quantity;
    
    db.run(`INSERT INTO inventory_count_items 
            (count_id, item_id, system_quantity, counted_quantity, difference, notes) 
            VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item_id, system_quantity, counted_quantity, difference, notes], function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في إضافة صنف للجرد' });
            }
            res.json({ id: this.lastID });
        });
});

// route للتسويات
app.get('/api/inventory/adjustments', (req, res) => {
    db.all(`SELECT inventory_adjustments.*, 
            u1.username as requested_by_name, 
            u2.username as approved_by_name 
            FROM inventory_adjustments 
            LEFT JOIN users u1 ON inventory_adjustments.requested_by = u1.id 
            LEFT JOIN users u2 ON inventory_adjustments.approved_by = u2.id 
            ORDER BY adjustment_date DESC`, (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/inventory/adjustments', (req, res) => {
    const { adjustment_number, reason, notes, requested_by } = req.body;
    
    db.run('INSERT INTO inventory_adjustments (adjustment_number, reason, notes, requested_by) VALUES (?, ?, ?, ?)',
        [adjustment_number, reason, notes, requested_by], function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في إنشاء التسوية' });
            }
            res.json({ id: this.lastID });
        });
});

app.get('/api/inventory/adjustments/:id/items', (req, res) => {
    const { id } = req.params;
    
    db.all(`SELECT inventory_adjustment_items.*, inventory_items.item_name, inventory_items.item_code 
            FROM inventory_adjustment_items 
            JOIN inventory_items ON inventory_adjustment_items.item_id = inventory_items.id 
            WHERE adjustment_id = ?`, [id], (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.post('/api/inventory/adjustments/:id/items', (req, res) => {
    const { id } = req.params;
    const { item_id, current_quantity, adjusted_quantity, reason } = req.body;
    const difference = adjusted_quantity - current_quantity;
    
    db.run(`INSERT INTO inventory_adjustment_items 
            (adjustment_id, item_id, current_quantity, adjusted_quantity, difference, reason) 
            VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item_id, current_quantity, adjusted_quantity, difference, reason], function(err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في إضافة صنف للتسوية' });
            }
            res.json({ id: this.lastID });
        });
});

// route لتقارير المخزون
app.get('/api/inventory/reports/low-stock', (req, res) => {
    db.all(`SELECT *, (min_quantity - quantity) as shortage 
            FROM inventory_items 
            WHERE quantity <= min_quantity 
            ORDER BY shortage DESC`, (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.get('/api/inventory/reports/movement', (req, res) => {
    const { start_date, end_date } = req.query;
    
    db.all(`SELECT inventory_transactions.*, inventory_items.item_name, inventory_items.item_code 
            FROM inventory_transactions 
            JOIN inventory_items ON inventory_transactions.item_id = inventory_items.id 
            WHERE created_at BETWEEN ? AND ? 
            ORDER BY created_at DESC`, [start_date, end_date], (err, rows) => {
        if (err) {
            return res.json([]);
        }
        res.json(rows);
    });
});

app.get('/api/inventory/reports/value', (req, res) => {
    db.all(`SELECT 
            SUM(quantity * cost_price) as total_cost_value,
            SUM(quantity * selling_price) as total_selling_value,
            SUM((selling_price - cost_price) * quantity) as total_profit_potential
            FROM inventory_items`, (err, row) => {
        if (err) {
            return res.json({});
        }
        res.json(row || {});
    });
});

// route للتقارير
app.get('/api/reports', (req, res) => {
    const queries = {
        totalClients: "SELECT COUNT(*) as count FROM clients",
        totalInvoices: "SELECT COUNT(*) as count FROM invoices",
        totalRevenue: "SELECT SUM(total) as sum FROM invoices WHERE paid > 0",
        totalDebts: "SELECT SUM(amount) as sum FROM debts",
        unpaidInvoices: "SELECT SUM(total - paid) as sum FROM invoices WHERE paid < total"
    };

    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], (err, row) => {
            if (err) {
                results[key] = 0;
            } else {
                results[key] = row.count || row.sum || 0;
            }
            completed++;
            if (completed === total) {
                res.json(results);
            }
        });
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`💠 Genius Accountant يعمل على: http://localhost:${PORT}`);
});
