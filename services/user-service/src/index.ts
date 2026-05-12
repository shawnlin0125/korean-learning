import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'user-service' }));

app.listen(PORT, () => console.log(`User Service running on :${PORT}`));
