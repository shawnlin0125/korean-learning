'use client';

import { create } from 'zustand';
import type { LearnStatus, ProgressState } from '@/lib/types';
import {
  getLearnedChars,
  setLearnedChar,
  getQuizScores,
  addQuizScore,
  getMasteredCount,
  getTotalChars,
} from '@/lib/storage';

export const useProgressStore = create<ProgressState>((set, get) => ({
  // 初始狀態從 localStorage 讀取
  learnedChars: typeof window !== 'undefined' ? getLearnedChars() : {},
  quizScores: typeof window !== 'undefined' ? getQuizScores() : {},
  lastVisit: new Date().toISOString(),

  markLearned: (char: string, status: LearnStatus) => {
    setLearnedChar(char, status);
    set(state => ({
      learnedChars: { ...state.learnedChars, [char]: status },
    }));
  },

  recordQuizScore: (category: string, score: number) => {
    addQuizScore(category, score);
    set(state => {
      const scores = [...(state.quizScores[category] || []), score];
      return {
        quizScores: { ...state.quizScores, [category]: scores.slice(-20) },
      };
    });
  },

  getMasteredCount: () => {
    // 優先從 store 拿，fallback 到 localStorage
    const chars = get().learnedChars;
    if (Object.keys(chars).length > 0) {
      return Object.values(chars).filter(s => s === 'mastered').length;
    }
    return getMasteredCount();
  },

  getTotalCount: () => getTotalChars(),
}));
