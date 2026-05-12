# Korean Learning Platform v2 — 微服務架構實作計畫

> **For Hermes:** 依照 `subagent-driven-development` skill 逐項執行，每階段結束後進行兩階段 review（spec + code quality）。

**Goal:** 將現有純前端韓文學習平台重構為前後端分離的微服務架構，含 PostgreSQL 資料庫、JWT 認證、三個後端微服務，全部容器化部署在 k3s 上，最終包成 Helm chart。

**Architecture:**
```
Users → Cloudflare → ingress-nginx (:80/:443)
                       ├── /          → Frontend (Next.js) :3000
                       └── /api/*     → API Gateway (Express) :4000
                                          ├── /api/auth/*   → User Service :4001
                                          ├── /api/vocab/*  → Vocab Service :4002
                                          └── /api/quiz/*   → Quiz Service :4003
                                                               ↓
                                                          PostgreSQL :5432
```
每個後端服務各自獨立的 Express + Prisma，共用一個 PostgreSQL。前端從 localStorage 改為呼叫 API Gateway。

**Tech Stack:** Next.js 16, Express.js, Prisma ORM, PostgreSQL 16, Docker, k3s, Helm

---

## Phase 0：基礎設施 — PostgreSQL on k3s

### Task 0.1: 建立 PostgreSQL 的 k8s 資源

**Objective:** 在 k3s 上部署 PostgreSQL StatefulSet + PVC + Service + Secret

**Files:**
- Create: `k8s/postgres-secret.yaml`
- Create: `k8s/postgres-pvc.yaml`
- Create: `k8s/postgres-statefulset.yaml`
- Create: `k8s/postgres-service.yaml`

**Step 1:** 建立 Secret（含 DB 密碼）

```yaml
# k8s/postgres-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: korean-learning
type: Opaque
stringData:
  POSTGRES_USER: korean_admin
  POSTGRES_PASSWORD: <generate-random-32-char>
  POSTGRES_DB: korean_learning
```

**Step 2:** 建立 PVC（10Gi）

```yaml
# k8s/postgres-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: korean-learning
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 10Gi
```

**Step 3:** 建立 StatefulSet

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: korean-learning
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: postgres-pvc
```

**Step 4:** 建立 Service

```yaml
# k8s/postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: korean-learning
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

**Step 5: Apply & 驗證**

Run:
```bash
export KUBECONFIG=~/.kube/config
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n korean-learning --timeout=120s
kubectl exec -it deploy/postgres -n korean-learning -- psql -U korean_admin -d korean_learning -c "SELECT 1"
```

Expected: `?column? = 1`

---

## Phase 1：User Service (Express + Prisma + JWT)

### Task 1.1: 建立 User Service 專案結構

**Objective:** 初始化 Express + TypeScript + Prisma 專案

**Files:**
- Create: `services/user-service/package.json`
- Create: `services/user-service/tsconfig.json`
- Create: `services/user-service/prisma/schema.prisma`

Step 1: `mkdir -p services/user-service && cd services/user-service`

Step 2: `package.json`
```json
{
  "name": "user-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/node": "^22.0.0",
    "prisma": "^6.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0"
  }
}
```

Step 3: `npm install`

### Task 1.2: 定義 Prisma Schema（User 模型）

**Objective:** 定義 User 資料表結構

**File:** `services/user-service/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // 關聯到其他服務的資料表（共享 DB）
  // 這些表由各自的 service 管理
}
```

### Task 1.3: 實作註冊 / 登入 API

**Objective:** 實作 POST /api/auth/register 和 POST /api/auth/login

**Files:**
- Create: `services/user-service/src/index.ts`
- Create: `services/user-service/src/routes/auth.ts`
- Create: `services/user-service/src/middleware/auth.ts`
- Create: `services/user-service/src/lib/jwt.ts`
- Create: `services/user-service/src/lib/validate.ts`

**核心邏輯：**

`services/user-service/src/routes/auth.ts`
```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    
    // 檢查 email / username 是否已被使用
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) {
      return res.status(409).json({ 
        error: existing.email === body.email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**驗證 Middleware：**

`services/user-service/src/middleware/auth.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; username: string };
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

### Task 1.4: Dockerize User Service

**File:** `services/user-service/Dockerfile`
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
USER node
EXPOSE 4001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

### Task 1.5: User Service k8s 資源

**Files:**
- Create: `k8s/user-service-deployment.yaml`
- Create: `k8s/user-service-service.yaml`

---

## Phase 2：Vocab Service

### Task 2.1: 建立 Vocab Service 專案 + Prisma Schema

**Prisma Model（加在共用 DB 中）：**

```prisma
model Vocabulary {
  id          String   @id @default(uuid())
  word        String                    // 韓文單字
  romanization String                   // 羅馬音
  meaningZhTw String                   // 繁體中文意思
  partOfSpeech String?                  // 詞性 (noun/verb/adjective...)
  example     String?                   // 例句
  exampleZhTw String?                  // 例句翻譯
  level       String   @default("beginner") // beginner/intermediate/advanced
  category    String?                   // 分類 (food/travel/daily...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Task 2.2: 實作 API

| Method | Route | Auth | 說明 |
|--------|-------|------|------|
| GET | `/api/vocab` | No | 單字列表（分頁、篩選） |
| GET | `/api/vocab/:id` | No | 單字詳情 |
| POST | `/api/vocab` | Yes | 新增單字 |
| PUT | `/api/vocab/:id` | Yes | 更新單字 |
| DELETE | `/api/vocab/:id` | Yes | 刪除單字 |
| GET | `/api/vocab/categories` | No | 取得所有分類 |
| GET | `/api/vocab/random?count=10` | No | 隨機取 N 個單字 |

### Task 2.3: Seed Data（匯入基礎韓文單字）

```typescript
// services/vocab-service/src/seed.ts
const seedVocab = [
  { word: '사랑', romanization: 'sarang', meaningZhTw: '愛', partOfSpeech: 'noun', level: 'beginner', category: 'emotion' },
  { word: '학교', romanization: 'hakgyo', meaningZhTw: '學校', partOfSpeech: 'noun', level: 'beginner', category: 'place' },
  { word: '먹다', romanization: 'meokda', meaningZhTw: '吃', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '가다', romanization: 'gada', meaningZhTw: '去', partOfSpeech: 'verb', level: 'beginner', category: 'action' },
  { word: '좋다', romanization: 'jota', meaningZhTw: '好、喜歡', partOfSpeech: 'adjective', level: 'beginner', category: 'emotion' },
  // ... 約 50 個基礎單字
];
```

### Task 2.4: Dockerfile + k8s 資源（類似 User Service）

---

## Phase 3：Quiz Service

### Task 3.1: Prisma Schema

```prisma
model QuizSession {
  id          String   @id @default(uuid())
  userId      String
  category    String
  totalQuestions Int
  correctCount   Int
  score       Int
  createdAt   DateTime @default(now())
}

model QuizAnswer {
  id          String   @id @default(uuid())
  sessionId   String
  questionType String
  prompt      String
  correctAnswer String
  userAnswer  String
  isCorrect   Boolean
}
```

### Task 3.2: 實作 API

| Method | Route | Auth | 說明 |
|--------|-------|------|------|
| POST | `/api/quiz/generate` | No | 生成考題（可指定類別、數量） |
| POST | `/api/quiz/submit` | Yes | 提交答案、計算分數 |
| GET | `/api/quiz/history` | Yes | 查詢測驗紀錄 |
| GET | `/api/quiz/stats` | Yes | 個人統計（正確率、弱項分析） |

---

## Phase 4：API Gateway

### Task 4.1: 建立 Gateway 專案

**Objective:** Express + http-proxy-middleware，統一入口、JWT 驗證、路由轉發

**File:** `services/api-gateway/src/index.ts`

```typescript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// JWT 驗證 middleware（不對外暴露的 endpoint 跳過）
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
      (req as any).userId = payload.userId;
    } catch {}
  }
  next();
}
app.use(optionalAuth);

// 路由轉發
app.use('/api/auth', createProxyMiddleware({ target: 'http://user-service:4001', changeOrigin: true }));
app.use('/api/vocab', createProxyMiddleware({ target: 'http://vocab-service:4002', changeOrigin: true }));
app.use('/api/quiz', createProxyMiddleware({ target: 'http://quiz-service:4003', changeOrigin: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(4000, () => console.log('API Gateway running on :4000'));
```

---

## Phase 5：Frontend 改造

### Task 5.1: 將 localStorage 改為 API 呼叫

**Files:**
- Modify: `lib/storage.ts` → 改成 `lib/api.ts`
- Modify: `store/progress.ts` → 使用 API 而非 localStorage
- Create: `lib/auth-context.tsx` (React Context for JWT)
- Create: `components/LoginForm.tsx`
- Create: `components/RegisterForm.tsx`

改完後的 `lib/api.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API Error');
  }
  return res.json();
}

export const vocabApi = {
  list: (params?: { category?: string; level?: string; page?: number }) =>
    request<any[]>(`/vocab?${new URLSearchParams(params as any)}`),
  getById: (id: string) => request<any>(`/vocab/${id}`),
};

export const quizApi = {
  generate: (params: { categories?: string[]; count?: number }) =>
    request<any[]>('/quiz/generate', { method: 'POST', body: JSON.stringify(params) }),
  submit: (answers: any[]) =>
    request<any>('/quiz/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  history: () => request<any[]>('/quiz/history'),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { email: string; username: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};
```

### Task 5.2: Next.js 反向代理 API（開發環境）

在 `next.config.ts` 加入 rewrites，開發時 Next.js dev server 反向代理 `/api/*` 到 Gateway：

```typescript
// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};
export default nextConfig;
```

---

## Phase 6：Docker + k8s + Helm

### Task 6.1: 每個服務的 Dockerfile

四個服務（gateway, user-service, vocab-service, quiz-service）各有獨立 Dockerfile

### Task 6.2: 統一的 k8s 部署 YAML

```
k8s/
├── postgres-secret.yaml
├── postgres-pvc.yaml
├── postgres-statefulset.yaml
├── postgres-service.yaml
├── api-gateway-deployment.yaml
├── api-gateway-service.yaml
├── user-service-deployment.yaml
├── user-service-service.yaml
├── vocab-service-deployment.yaml
├── vocab-service-service.yaml
├── quiz-service-deployment.yaml
├── quiz-service-service.yaml
└── ingress-update.yaml        # 更新現有 Ingress 加入 /api 路由
```

### Task 6.3: Helm Chart

```
helm/korean-learning/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── postgres-secret.yaml
│   ├── postgres-statefulset.yaml
│   ├── postgres-service.yaml
│   ├── api-gateway-deployment.yaml
│   ├── api-gateway-service.yaml
│   ├── user-service-deployment.yaml
│   ├── user-service-service.yaml
│   ├── vocab-service-deployment.yaml
│   ├── vocab-service-service.yaml
│   ├── quiz-service-deployment.yaml
│   ├── quiz-service-service.yaml
│   └── ingress.yaml
└── values/
    ├── dev.yaml
    └── prod.yaml
```

---

## Phase 7：部署與驗證

### Task 7.1: Build all images

```bash
for svc in api-gateway user-service vocab-service quiz-service; do
  docker build -t $svc:latest services/$svc/
  sudo k3s ctr images import docker.io/library/$svc:latest
done
# Frontend rebuild
docker build -t korean-learning:latest .
sudo k3s ctr images import docker.io/library/korean-learning:latest
```

### Task 7.2: Deploy all services

```bash
export KUBECONFIG=~/.kube/config
kubectl apply -f k8s/
kubectl rollout status deploy -n korean-learning --timeout=120s
```

### Task 7.3: 端到端驗證

```bash
# 1. 註冊用戶
curl -X POST https://shawnlin.online/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test1234"}'

# 2. 取單字列表
curl https://shawnlin.online/api/vocab

# 3. 生成考題
curl -X POST https://shawnlin.online/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"categories":["consonant"],"count":5}'

# 4. 前端能開 https://shawnlin.online → 看到登入頁面
```

---

## 架構總結

```
                         ┌── Frontend (Next.js) :3000
shawnlin.online ──→      │
  ingress-nginx :443 ────┼── API Gateway (Express) :4000
                         │      ├── /api/auth/*  → user-service :4001
                         │      ├── /api/vocab/* → vocab-service :4002
                         │      └── /api/quiz/*  → quiz-service :4003
                         │             ↓
                         └─────── PostgreSQL :5432
```

| 服務 | Port | 技術 |
|------|------|------|
| Frontend | 3000 | Next.js 16 + React 19 |
| API Gateway | 4000 | Express + http-proxy-middleware |
| User Service | 4001 | Express + Prisma + JWT + bcrypt |
| Vocab Service | 4002 | Express + Prisma |
| Quiz Service | 4003 | Express + Prisma |
| PostgreSQL | 5432 | StatefulSet + PVC 10Gi |

---

## 風險與考量

- **共用資料庫 vs 獨立 DB**：初期用一個 PostgreSQL 簡化部署，未來可拆成獨立 DB per service
- **Prisma schema 共用**：各 service 各自跑 `prisma migrate`，需要確保 migration 不衝突
- **JWT Secret**：需用 k8s Secret 管理，所有 service 共用同一個 secret
- **本地開發**：用 docker-compose 或直接在 host 跑 `tsx watch`，連到 k3s 內的 PostgreSQL port-forward
