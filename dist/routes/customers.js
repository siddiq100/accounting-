"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Customer_1 = require("../models/Customer");
const Account_1 = require("../models/Account");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Customer_1.Customer);
        const customers = await repo.find({ relations: ['accounts'] });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في جلب العملاء' });
    }
});
router.post('/', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Customer_1.Customer);
        const customer = repo.create(req.body);
        await repo.save(customer);
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في إضافة العميل' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Customer_1.Customer);
        const customer = await repo.findOne({ where: { id: parseInt(req.params.id) } });
        if (customer) {
            repo.merge(customer, req.body);
            await repo.save(customer);
            res.json(customer);
        }
        else {
            res.status(404).json({ error: 'العميل غير موجود' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في تحديث العميل' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Customer_1.Customer);
        await repo.delete({ id: parseInt(req.params.id) });
        res.json({ message: 'تم حذف العميل بنجاح' });
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في حذف العميل' });
    }
});
router.get('/:id/transactions', async (req, res) => {
    try {
        const accountRepo = (0, typeorm_1.getRepository)(Account_1.Account);
        const accounts = await accountRepo.find({ where: { customer: { id: parseInt(req.params.id) } }, relations: ['transactions'] });
        const transactions = [];
        accounts.forEach(account => {
            transactions.push(...account.transactions);
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في جلب المعاملات' });
    }
});
exports.default = router;
