import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const vocabSchema = z.object({
  word: z.string().min(1),
  romanization: z.string().min(1),
  meaningZhTw: z.string().min(1),
  partOfSpeech: z.string().optional(),
  example: z.string().optional(),
  exampleZhTw: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
});

// GET /api/vocab?level=beginner&category=food&page=1&limit=20
router.get('/', async (req: Request, res: Response) => {
  try {
    const { level, category, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (level) where.level = level;
    if (category) where.category = category;
    if (search) where.word = { contains: search as string };

    const [items, total] = await Promise.all([
      prisma.vocabulary.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.vocabulary.count({ where }),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vocab/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const results = await prisma.vocabulary.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });
    res.json(results.map(r => r.category).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vocab/random?count=10
router.get('/random', async (req: Request, res: Response) => {
  try {
    const count = Math.min(Number(req.query.count) || 10, 50);
    const total = await prisma.vocabulary.count();
    const skip = Math.max(0, Math.floor(Math.random() * (total - count)));
    const items = await prisma.vocabulary.findMany({ skip, take: count });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vocab/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.vocabulary.findUnique({ where: { id: req.params.id as string } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vocab
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = vocabSchema.parse(req.body);
    const item = await prisma.vocabulary.create({ data: body as any });
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/vocab/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = vocabSchema.partial().parse(req.body);
    const item = await prisma.vocabulary.update({ where: { id: req.params.id as string }, data: body });
    res.json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/vocab/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.vocabulary.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
