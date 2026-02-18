"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const JournalEntry_1 = require("../models/JournalEntry");
const equations_1 = require("../utils/equations");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(JournalEntry_1.JournalEntry);
    const entries = await repo.find({ relations: ['transactions'] });
    res.json(entries);
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(JournalEntry_1.JournalEntry);
    const entry = repo.create(req.body);
    if (!(0, equations_1.processJournalEntry)(entry.transactions)) {
        return res.status(400).json({ error: 'Debits and credits do not balance' });
    }
    await repo.save(entry);
    res.json(entry);
});
// Add PUT/DELETE similarly
exports.default = router;
