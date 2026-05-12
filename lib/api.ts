// API 客戶端 — 與後端 API Gateway 溝通

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    request<{ token: string; user: { id: string; email: string; username: string } }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; username: string } }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; email: string; username: string }>('/api/auth/me'),
};

export const vocabApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ items: any[]; total: number; page: number; limit: number }>(`/api/vocab${qs}`);
  },
  categories: () => request<string[]>('/api/vocab/categories'),
  random: (count = 10) => request<any[]>(`/api/vocab/random?count=${count}`),
  getById: (id: string) => request<any>(`/api/vocab/${id}`),
};

export const quizApi = {
  generate: (params: { categories?: string[]; count?: number }) =>
    request<{ questions: any[]; total: number }>('/api/quiz/generate', {
      method: 'POST', body: JSON.stringify(params),
    }),
  submit: (answers: any[]) =>
    request<{ sessionId: string; totalQuestions: number; correctCount: number; score: number; comment: string }>(
      '/api/quiz/submit', { method: 'POST', body: JSON.stringify({ answers }) }
    ),
  history: () => request<any[]>('/api/quiz/history'),
  stats: () => request<{ totalSessions: number; avgScore: number; bestScore: number }>('/api/quiz/stats'),
};
