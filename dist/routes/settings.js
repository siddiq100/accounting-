"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const typeorm_1 = require("typeorm");
const Setting_1 = require("../models/Setting");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Setting_1.Setting);
    const settings = await repo.find();
    res.json(settings);
});
router.post('/', async (req, res) => {
    const repo = (0, typeorm_1.getRepository)(Setting_1.Setting);
    const setting = repo.create(req.body);
    await repo.save(setting);
    res.json(setting);
});
// Add PUT/DELETE similarly
exports.default = router;
