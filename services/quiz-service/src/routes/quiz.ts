import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/quiz/generate - Generate questions from vocab database
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { categories, count = 10 } = req.body;
    const where: any = {};
    if (categories?.length) where.category = { in: categories };

    const words = await prisma.vocabulary.findMany({
      where,
      take: Math.min(count * 2, 100),
    });

    // Shuffle and pick
    const shuffled = words.sort(() => Math.random() - 0.5).slice(0, Math.min(count, words.length));

    const questions = shuffled.map((w, i) => {
      const types = ['meaning-guess', 'word-guess'];
      const type = types[Math.floor(Math.random() * types.length)];
      if (type === 'meaning-guess') {
        // Show Korean word, pick correct Chinese meaning
        const wrongOptions = words.filter(x => x.id !== w.id).slice(0, 3).map(x => x.meaningZhTw);
        const options = [w.meaningZhTw, ...wrongOptions].sort(() => Math.random() - 0.5);
        return {
          id: `q-${i}`,
          type: 'meaning-guess',
          prompt: `「${w.word}」(${w.romanization}) 的意思是？`,
          options,
          correctIndex: options.indexOf(w.meaningZhTw),
        };
      } else {
        // Show Chinese meaning, pick correct Korean word
        const wrongOptions = words.filter(x => x.id !== w.id).slice(0, 3).map(x => x.word);
        const options = [w.word, ...wrongOptions].sort(() => Math.random() - 0.5);
        return {
          id: `q-${i}`,
          type: 'word-guess',
          prompt: `「${w.meaningZhTw}」的韓文是？`,
          options,
          correctIndex: options.indexOf(w.word),
        };
      }
    });

    res.json({ questions, total: questions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/quiz/submit
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { answers, category = 'general' } = req.body;
    const userId = (req as any).userId || 'anonymous';
    const correctCount = answers.filter((a: any) => a.isCorrect).length;
    const total = answers.length;
    const score = Math.round((correctCount / total) * 100);

    const session = await prisma.quizSession.create({
      data: {
        userId,
        category,
        totalQuestions: total,
        correctCount,
        score,
      },
    });

    // Save individual answers
    await prisma.quizAnswer.createMany({
      data: answers.map((a: any) => ({
        sessionId: session.id,
        questionType: a.type || 'unknown',
        prompt: a.prompt || '',
        correctAnswer: a.correctAnswer || '',
        userAnswer: a.userAnswer || '',
        isCorrect: a.isCorrect,
      })),
    });

    res.json({
      sessionId: session.id,
      totalQuestions: total,
      correctCount,
      score,
      comment: getScoreComment(score),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/quiz/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'anonymous';
    const sessions = await prisma.quizSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/quiz/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 'anonymous';
    const sessions = await prisma.quizSession.findMany({ where: { userId } });
    const totalSessions = sessions.length;
    const avgScore = totalSessions > 0
      ? Math.round(sessions.reduce((s, x) => s + x.score, 0) / totalSessions)
      : 0;
    const bestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.score)) : 0;
    res.json({ totalSessions, avgScore, bestScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getScoreComment(score: number): string {
  if (score === 100) return '完美！全部答對！🎉';
  if (score >= 80) return '很好！繼續加油！🌟';
  if (score >= 60) return '不錯，再練習一下！💪';
  if (score >= 40) return '加油！多複習單字！📚';
  return '別灰心，多多練習！🌱';
}

export default router;
