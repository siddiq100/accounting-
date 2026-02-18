import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { authMiddleware, adminOnly } from '../middleware/auth';
import * as crypto from 'crypto';

const router = Router();

// تسجيل دخول المستخدم
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم غير موجود' });
    }

    // مقارنة كلمة المرور (في الإنتاج، استخدم bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'الحساب غير نشط' });
    }

    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({ error: 'لم يتم الموافقة على الحساب بعد' });
    }

    // تحديث وقت آخر دخول
    user.lastLogin = new Date();
    await userRepo.save(user);

    // إنشاء token
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      permissions: user.permissions
    })).toString('base64');

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

// إضافة مستخدم جديد (Admin فقط)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    const userRepo = getRepository(User);
    const existingUser = await userRepo.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // الأذونات الافتراضية حسب الدور
    const defaultPermissions = getDefaultPermissions(role);

    const newUser = userRepo.create({
      username,
      password: hashedPassword,
      fullName,
      email,
      role: role || 'user',
      permissions: defaultPermissions,
      isApproved: true
    });

    await userRepo.save(newUser);

    res.status(201).json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة المستخدم' });
  }
});

// جلب جميع المستخدمين (Admin فقط)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const userRepo = getRepository(User);
    const users = await userRepo.find({
      select: ['id', 'username', 'fullName', 'email', 'role', 'isActive', 'isApproved', 'lastLogin', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المستخدمين' });
  }
});

// جلب بيانات المستخدم الحالي
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  res.json(req.user);
});

// تحديث بيانات المستخدم
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, password } = req.body;

    // المستخدم يمكنه تعديل بيانات نفسه فقط، والـ Admin يمكنه تعديل أي مستخدم
    if (req.user?.id !== parseInt(id) && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'لا توجد صلاحية لتعديل هذا المستخدم' });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: parseInt(id) } });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) {
      user.password = crypto.createHash('sha256').update(password).digest('hex');
    }

    await userRepo.save(user);

    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث البيانات' });
  }
});

// تحديث الصلاحيات (Admin فقط)
router.put('/:id/permissions', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions, role } = req.body;

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: parseInt(id) } });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    if (role) {
      user.role = role;
      user.permissions = getDefaultPermissions(role);
    }

    if (permissions) {
      user.permissions = { ...user.permissions, ...permissions };
    }

    await userRepo.save(user);

    res.json({
      success: true,
      message: 'تم تحديث الصلاحيات بنجاح',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الصلاحيات' });
  }
});

// الموافقة على مستخدم جديد (Admin فقط)
router.put('/:id/approve', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: parseInt(id) } });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    user.isApproved = true;

    await userRepo.save(user);

    res.json({
      success: true,
      message: 'تم الموافقة على المستخدم بنجاح'
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في الموافقة على المستخدم' });
  }
});

// تفعيل/تعطيل مستخدم (Admin فقط)
router.put('/:id/toggle-status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: parseInt(id) } });

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    user.isActive = !user.isActive;

    await userRepo.save(user);

    res.json({
      success: true,
      message: user.isActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تغيير حالة المستخدم' });
  }
});

// حذف مستخدم (Admin فقط)
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // منع حذف الـ Admin الأخير
    const userRepo = getRepository(User);
    const adminCount = await userRepo.count({ where: { role: 'admin' } });

    const userToDelete = await userRepo.findOne({ where: { id: parseInt(id) } });

    if (userToDelete?.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ error: 'لا يمكن حذف آخر مسؤول' });
    }

    await userRepo.delete({ id: parseInt(id) });

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف المستخدم' });
  }
});

// دالة مساعدة لإرجاع الأذونات الافتراضية
function getDefaultPermissions(role: string) {
  const permissions: any = {
    canViewInvoices: true,
    canCreateInvoices: false,
    canEditInvoices: false,
    canDeleteInvoices: false,
    canViewReports: false,
    canViewClients: true,
    canEditClients: false,
    canViewInventory: true,
    canEditInventory: false,
    canViewAccounts: false,
    canEditAccounts: false,
    canManageUsers: false,
    canViewSettings: false,
    canEditSettings: false
  };

  switch (role) {
    case 'admin':
      return {
        canViewInvoices: true,
        canCreateInvoices: true,
        canEditInvoices: true,
        canDeleteInvoices: true,
        canViewReports: true,
        canViewClients: true,
        canEditClients: true,
        canViewInventory: true,
        canEditInventory: true,
        canViewAccounts: true,
        canEditAccounts: true,
        canManageUsers: true,
        canViewSettings: true,
        canEditSettings: true
      };
    case 'accountant':
      return {
        ...permissions,
        canCreateInvoices: true,
        canEditInvoices: true,
        canViewReports: true,
        canEditClients: true,
        canViewAccounts: true,
        canEditAccounts: true,
        canViewSettings: true
      };
    case 'viewer':
      return {
        canViewInvoices: true,
        canViewReports: true,
        canViewClients: true,
        canViewInventory: true,
        canViewAccounts: true,
        canViewSettings: true,
        canCreateInvoices: false,
        canEditInvoices: false,
        canDeleteInvoices: false,
        canEditClients: false,
        canEditInventory: false,
        canEditAccounts: false,
        canManageUsers: false,
        canEditSettings: false
      };
    default:
      return permissions;
  }
}

export default router;
