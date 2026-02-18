import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Item } from '../models/Item';

const router = Router();

// GET /api/inventory/items - جلب جميع الأصناف
router.get('/items', async (req, res) => {
  try {
    const repo = getRepository(Item);
    const items = await repo.find({ relations: ['supplier'] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الأصناف' });
  }
});

// POST /api/inventory/items - إضافة صنف جديد
router.post('/items', async (req, res) => {
  try {
    const repo = getRepository(Item);
    const item = repo.create(req.body);
    await repo.save(item);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الصنف' });
  }
});

// PUT /api/inventory/items/:id - تحديث صنف
router.put('/items/:id', async (req, res) => {
  try {
    const repo = getRepository(Item);
    const item = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    if (item) {
      repo.merge(item, req.body);
      await repo.save(item);
      res.json(item);
    } else {
      res.status(404).json({ error: 'الصنف غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الصنف' });
  }
});

// DELETE /api/inventory/items/:id - حذف صنف
router.delete('/items/:id', async (req, res) => {
  try {
    const repo = getRepository(Item);
    await repo.delete({ id: parseInt(req.params.id) });
    res.json({ message: 'تم حذف الصنف بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف الصنف' });
  }
});

// GET /api/inventory/counts - جلب عمليات الجرد (placeholder)
router.get('/counts', async (req, res) => {
  // Placeholder - يمكن إضافة model للجرد لاحقاً
  res.json([]);
});

// GET /api/inventory/adjustments - جلب التسويات (placeholder)
router.get('/adjustments', async (req, res) => {
  // Placeholder - يمكن إضافة model للتسويات لاحقاً
  res.json([]);
});

// GET /api/inventory/reports/low-stock - تقرير الأصناف منخفضة المخزون
router.get('/reports/low-stock', async (req, res) => {
  try {
    const repo = getRepository(Item);
    const items = await repo.find();
    const lowStockItems = items.filter(item => item.quantity <= item.min_quantity).map(item => ({
      ...item,
      shortage: item.min_quantity - item.quantity
    }));
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التقرير' });
  }
});

// GET /api/inventory/reports/value - تقرير قيمة المخزون
router.get('/reports/value', async (req, res) => {
  try {
    const repo = getRepository(Item);
    const items = await repo.find();
    const totalCostValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
    const totalSellingValue = items.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0);
    const totalProfitPotential = totalSellingValue - totalCostValue;
    res.json({
      total_cost_value: totalCostValue,
      total_selling_value: totalSellingValue,
      total_profit_potential: totalProfitPotential
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التقرير' });
  }
});

// GET /api/inventory/reports/movement - تقرير حركة المخزون (placeholder)
router.get('/reports/movement', async (req, res) => {
  // Placeholder - يحتاج إلى model للحركات
  res.json([]);
});

export default router;