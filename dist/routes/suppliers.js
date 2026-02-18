"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Supplier_1 = require("../models/Supplier");
const Account_1 = require("../models/Account");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Supplier_1.Supplier);
        const suppliers = await repo.find({ relations: ['accounts'] });
        res.json(suppliers);
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في جلب الموردين' });
    }
});
router.post('/', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Supplier_1.Supplier);
        const supplier = repo.create(req.body);
        await repo.save(supplier);
        res.json(supplier);
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في إضافة المورد' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Supplier_1.Supplier);
        const supplier = await repo.findOne({ where: { id: parseInt(req.params.id) } });
        if (supplier) {
            repo.merge(supplier, req.body);
            await repo.save(supplier);
            res.json(supplier);
        }
        else {
            res.status(404).json({ error: 'المورد غير موجود' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في تحديث المورد' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const repo = (0, typeorm_1.getRepository)(Supplier_1.Supplier);
        await repo.delete({ id: parseInt(req.params.id) });
        res.json({ message: 'تم حذف المورد بنجاح' });
    }
    catch (error) {
        res.status(500).json({ error: 'خطأ في حذف المورد' });
    }
});
router.get('/:id/transactions', async (req, res) => {
    try {
        const accountRepo = (0, typeorm_1.getRepository)(Account_1.Account);
        const accounts = await accountRepo.find({ where: { supplier: { id: parseInt(req.params.id) } }, relations: ['transactions'] });
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
