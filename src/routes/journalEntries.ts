import { Router } from 'express';
import { getRepository } from 'typeorm';
import { JournalEntry } from '../models/JournalEntry';
import { processJournalEntry } from '../utils/equations';

const router = Router();

router.get('/', async (req, res) => {
  const repo = getRepository(JournalEntry);
  const entries = await repo.find({ relations: ['transactions'] });
  res.json(entries);
});

router.post('/', async (req, res) => {
  const repo = getRepository(JournalEntry);
  const entry = repo.create(req.body as Partial<JournalEntry>);
  if (!processJournalEntry(entry.transactions)) {
    return res.status(400).json({ error: 'Debits and credits do not balance' });
  }
  await repo.save(entry);
  res.json(entry);
});

// Add PUT/DELETE similarly
export default router;
