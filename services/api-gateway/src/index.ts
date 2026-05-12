import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Optional auth - attaches userId if token present
app.use((req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'dev-secret') as any;
      (req as any).userId = payload.userId;
    } catch { /* token invalid, continue as anonymous */ }
  }
  next();
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Proxy to microservices
const proxyOpts = { changeOrigin: true, timeout: 30000 };
app.use('/api/auth', createProxyMiddleware({ ...proxyOpts, target: process.env.USER_SERVICE_URL || 'http://user-service:4001' }));
app.use('/api/vocab', createProxyMiddleware({ ...proxyOpts, target: process.env.VOCAB_SERVICE_URL || 'http://vocab-service:4002' }));
app.use('/api/quiz', createProxyMiddleware({ ...proxyOpts, target: process.env.QUIZ_SERVICE_URL || 'http://quiz-service:4003' }));

app.listen(PORT, () => console.log(`API Gateway running on :${PORT}`));
