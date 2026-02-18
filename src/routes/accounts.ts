import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Account } from '../models/Account';

const router = Router();

router.get('/', async (req, res) => {
  const repo = getRepository(Account);
  const accounts = await repo.find({ relations: ['customer', 'supplier', 'transactions'] });
  res.json(accounts);
});

router.post('/', async (req, res) => {
  const repo = getRepository(Account);
  const account = repo.create(req.body);
  await repo.save(account);
  res.json(account);
});

// Add PUT/DELETE similarly
export default router;
