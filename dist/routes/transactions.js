"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Transaction_1 = require("../models/Transaction");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Transaction_1.Transaction);
    const transactions = await repo.find({ relations: ['account'] });
    res.json(transactions);
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Transaction_1.Transaction);
    const transaction = repo.create(req.body);
    await repo.save(transaction);
    res.json(transaction);
});
// Add PUT/DELETE similarly
exports.default = router;
