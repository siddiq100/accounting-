import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Setting } from '../models/Setting';

const router = Router();

router.get('/', async (req, res) => {
  const repo = getRepository(Setting);
  const settings = await repo.find();
  res.json(settings);
});

router.post('/', async (req, res) => {
  const repo = getRepository(Setting);
  const setting = repo.create(req.body);
  await repo.save(setting);
  res.json(setting);
});

// Add PUT/DELETE similarly
export default router;
