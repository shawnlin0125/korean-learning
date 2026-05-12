import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import vocabRoutes from './routes/vocab';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use('/api/vocab', vocabRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'vocab-service' }));

app.listen(PORT, () => console.log(`Vocab Service running on :${PORT}`));
