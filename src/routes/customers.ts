import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Customer } from '../models/Customer';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const repo = getRepository(Customer);
    const customers = await repo.find({ relations: ['accounts'] });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب العملاء' });
  }
});

router.post('/', async (req, res) => {
  try {
    const repo = getRepository(Customer);
    const customer = repo.create(req.body);
    await repo.save(customer);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة العميل' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const repo = getRepository(Customer);
    const customer = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    if (customer) {
      repo.merge(customer, req.body);
      await repo.save(customer);
      res.json(customer);
    } else {
      res.status(404).json({ error: 'العميل غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث العميل' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const repo = getRepository(Customer);
    await repo.delete({ id: parseInt(req.params.id) });
    res.json({ message: 'تم حذف العميل بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف العميل' });
  }
});

router.get('/:id/transactions', async (req, res) => {
  try {
    const accountRepo = getRepository(Account);
    const accounts = await accountRepo.find({ where: { customer: { id: parseInt(req.params.id) } }, relations: ['transactions'] });
    
    const transactions: Transaction[] = [];
    accounts.forEach(account => {
      transactions.push(...account.transactions);
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المعاملات' });
  }
});

export default router;
