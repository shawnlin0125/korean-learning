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
import { quizApi } from '@/lib/api';

export const useProgressStore = create<ProgressState>((set, get) => ({
  // 初始狀態從 localStorage 讀取（保留降級方案，直到後端提供 progress API）
  learnedChars: typeof window !== 'undefined' ? getLearnedChars() : {},
  quizScores: typeof window !== 'undefined' ? getQuizScores() : {},
  lastVisit: new Date().toISOString(),

  // TODO: 等 vocab service 提供 progress API 後，改用 API 呼叫
  // 目前保留 localStorage 降級方案
  markLearned: (char: string, status: LearnStatus) => {
    setLearnedChar(char, status);
    set(state => ({
      learnedChars: { ...state.learnedChars, [char]: status },
    }));
  },

  // 改用 API 提交測驗成績
  recordQuizScore: async (category: string, score: number) => {
    try {
      const result = await quizApi.submit([
        { category, score },
      ]);
      // API 成功 → 更新 store 狀態
      set(state => {
        const scores = [...(state.quizScores[category] || []), score];
        return {
          quizScores: { ...state.quizScores, [category]: scores.slice(-20) },
        };
      });
    } catch {
      // API 失敗 → 降級到 localStorage
      addQuizScore(category, score);
      set(state => {
        const scores = [...(state.quizScores[category] || []), score];
        return {
          quizScores: { ...state.quizScores, [category]: scores.slice(-20) },
        };
      });
    }
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
