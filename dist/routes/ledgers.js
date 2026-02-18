"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Ledger_1 = require("../models/Ledger");
const equations_1 = require("../utils/equations");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Ledger_1.Ledger);
    const ledgers = await repo.find({ relations: ['account'] });
    res.json(ledgers);
});
router.get('/balance/:accountId', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Ledger_1.Ledger);
    const ledgers = await repo.find({ where: { account: { id: parseInt(req.params.accountId) } } });
    const balance = (0, equations_1.calculateLedgerBalance)(ledgers);
    res.json({ balance });
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Ledger_1.Ledger);
    const ledger = repo.create(req.body);
    await repo.save(ledger);
    res.json(ledger);
});
// Add PUT/DELETE similarly
exports.default = router;
