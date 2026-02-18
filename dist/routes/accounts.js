"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Account_1 = require("../models/Account");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Account_1.Account);
    const accounts = await repo.find({ relations: ['customer', 'supplier', 'transactions'] });
    res.json(accounts);
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Account_1.Account);
    const account = repo.create(req.body);
    await repo.save(account);
    res.json(account);
});
// Add PUT/DELETE similarly
exports.default = router;
