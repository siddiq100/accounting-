import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Ledger } from '../models/Ledger';
import { calculateLedgerBalance } from '../utils/equations';

const router = Router();

router.get('/', async (req, res) => {
  const repo = getRepository(Ledger);
  const ledgers = await repo.find({ relations: ['account'] });
  res.json(ledgers);
});

router.get('/balance/:accountId', async (req, res) => {
  const repo = getRepository(Ledger);
  const ledgers = await repo.find({ where: { account: { id: parseInt(req.params.accountId) } } });
  const balance = calculateLedgerBalance(ledgers);
  res.json({ balance });
});

router.post('/', async (req, res) => {
  const repo = getRepository(Ledger);
  const ledger = repo.create(req.body);
  await repo.save(ledger);
  res.json(ledger);
});

// Add PUT/DELETE similarly
export default router;
