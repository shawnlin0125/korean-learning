// localStorage 封裝 — 學習進度持久化

import type { LearnStatus, QuizResult } from './types';

const STORAGE_KEY = 'korean-learning-progress';
const VERSION = 1;

interface StorageData {
  version: number;
  learnedChars: Record<string, LearnStatus>;
  quizScores: Record<string, number[]>; // category → 分數陣列
  lastVisit: string;
}

function getDefaultData(): StorageData {
  return {
    version: VERSION,
    learnedChars: {},
    quizScores: {},
    lastVisit: new Date().toISOString(),
  };
}

function readStorage(): StorageData {
  if (typeof window === 'undefined') return getDefaultData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();

    const data = JSON.parse(raw) as StorageData;

    // 版本遷移（未來可擴充）
    if (!data.version || data.version < VERSION) {
      const migrated = getDefaultData();
      if (data.learnedChars) migrated.learnedChars = data.learnedChars;
      if (data.quizScores) migrated.quizScores = data.quizScores;
      return migrated;
    }

    return data;
  } catch {
    return getDefaultData();
  }
}

function writeStorage(data: StorageData): void {
  if (typeof window === 'undefined') return;
  try {
    data.lastVisit = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 滿了或不可用
  }
}

export function getLearnedChars(): Record<string, LearnStatus> {
  return readStorage().learnedChars;
}

export function setLearnedChar(char: string, status: LearnStatus): void {
  const data = readStorage();
  data.learnedChars[char] = status;
  writeStorage(data);
}

export function getQuizScores(): Record<string, number[]> {
  return readStorage().quizScores;
}

export function addQuizScore(category: string, score: number): void {
  const data = readStorage();
  if (!data.quizScores[category]) {
    data.quizScores[category] = [];
  }
  data.quizScores[category].push(score);
  // 只保留最近 20 次成績
  if (data.quizScores[category].length > 20) {
    data.quizScores[category] = data.quizScores[category].slice(-20);
  }
  writeStorage(data);
}

export function getMasteredCount(): number {
  const chars = readStorage().learnedChars;
  return Object.values(chars).filter(s => s === 'mastered').length;
}

export function getTotalChars(): number {
  return 40; // 10+14+11+5
}

export function getProgressPercent(): number {
  return Math.round((getMasteredCount() / getTotalChars()) * 100);
}
