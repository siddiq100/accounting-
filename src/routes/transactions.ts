import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Transaction } from '../models/Transaction';

const router = Router();

router.get('/', async (req, res) => {
  const repo = getRepository(Transaction);
  const transactions = await repo.find({ relations: ['account'] });
  res.json(transactions);
});

router.post('/', async (req, res) => {
  const repo = getRepository(Transaction);
  const transaction = repo.create(req.body);
  await repo.save(transaction);
  res.json(transaction);
});

// Add PUT/DELETE similarly
export default router;
