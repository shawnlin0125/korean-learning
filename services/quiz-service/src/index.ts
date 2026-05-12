import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quiz';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use('/api/quiz', quizRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'quiz-service' }));

app.listen(PORT, () => console.log(`Quiz Service running on :${PORT}`));
