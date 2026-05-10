// 測驗引擎 — 隨機出題 + 計分邏輯

import { allHangulChars } from './hangul-data';
import type { HangulChar, QuizQuestion } from './types';

type QuestionType = QuizQuestion['type'];

const QUESTION_TYPES: QuestionType[] = ['listen-choose', 'see-choose-sound', 'spell', 'identify'];

// 從陣列中隨機取 N 個不重複元素
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// 生成錯誤選項（與正確答案不同）
function generateWrongOptions(correct: string, pool: string[], count: number): string[] {
  const others = pool.filter(c => c !== correct);
  return pickRandom(others, count);
}

/**
 * 生成一組測驗題目
 * @param categories 要包含的字母類別（空 = 全部）
 * @param questionCount 題目數量
 */
export function generateQuiz(
  categories: HangulChar['category'][] = [],
  questionCount = 20
): QuizQuestion[] {
  // 篩選字母池
  let charPool = allHangulChars;
  if (categories.length > 0) {
    charPool = allHangulChars.filter(c => categories.includes(c.category));
  }

  if (charPool.length < 4) {
    // 字母不夠，補足
    charPool = allHangulChars;
  }

  const questions: QuizQuestion[] = [];
  const allChars = charPool.map(c => c.char);
  const allRomanizations = charPool.map(c => c.romanization);
  const allNames = charPool.map(c => c.name);

  for (let i = 0; i < questionCount; i++) {
    const type = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];
    const target = charPool[Math.floor(Math.random() * charPool.length)];
    let question: QuizQuestion;

    switch (type) {
      case 'listen-choose': {
        // 聽發音，選正確字母
        const wrongChars = generateWrongOptions(target.char, allChars, 3);
        const options = [target.char, ...wrongChars].sort(() => Math.random() - 0.5);
        question = {
          id: `q-${i}-listen`,
          type: 'listen-choose',
          prompt: '請聽發音，選出對應的韓文字母：',
          audio: target.char,
          options,
          correctIndex: options.indexOf(target.char),
          explanation: `正確答案是「${target.char}」（${target.romanization}）：${target.zhTW.description.slice(0, 30)}...`,
        };
        break;
      }

      case 'see-choose-sound': {
        // 看字母，選正確羅馬音
        const wrongSounds = generateWrongOptions(target.romanization, allRomanizations, 3);
        const options = [target.romanization, ...wrongSounds].sort(() => Math.random() - 0.5);
        question = {
          id: `q-${i}-sound`,
          type: 'see-choose-sound',
          prompt: `字母「${target.char}」的羅馬拼音是？`,
          options,
          correctIndex: options.indexOf(target.romanization),
          explanation: `「${target.char}」讀作「${target.romanization}」：${target.zhTW.similar}`,
        };
        break;
      }

      case 'spell': {
        // 給羅馬音，選正確字母
        const wrongChars = generateWrongOptions(target.char, allChars, 3);
        const options = [target.char, ...wrongChars].sort(() => Math.random() - 0.5);
        question = {
          id: `q-${i}-spell`,
          type: 'spell',
          prompt: `羅馬拼音「${target.romanization}」對應的韓文字母是？`,
          options,
          correctIndex: options.indexOf(target.char),
          explanation: `「${target.romanization}」對應的字母是「${target.char}」：${target.zhTW.mnemonic}`,
        };
        break;
      }

      case 'identify': {
        // 看字母，選正確名稱
        const wrongNames = generateWrongOptions(target.name, allNames, 3);
        const options = [target.name, ...wrongNames].sort(() => Math.random() - 0.5);
        question = {
          id: `q-${i}-identify`,
          type: 'identify',
          prompt: `字母「${target.char}」的韓文名稱是？`,
          options,
          correctIndex: options.indexOf(target.name),
          explanation: `「${target.char}」的名稱是「${target.name}」（${target.nameRomanized}）`,
        };
        break;
      }

      default:
        // fallback
        question = {
          id: `q-${i}-fallback`,
          type: 'see-choose-sound',
          prompt: `字母「${target.char}」的羅馬拼音是？`,
          options: [target.romanization, ...generateWrongOptions(target.romanization, allRomanizations, 3)],
          correctIndex: 0,
          explanation: `「${target.char}」讀作「${target.romanization}」`,
        };
    }

    questions.push(question);
  }

  return questions;
}

/**
 * 計算測驗分數
 */
export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * 取得分數對應的評語（繁體中文）
 */
export function getScoreComment(score: number): string {
  if (score === 100) return '完美！你已經完全掌握了！🎉';
  if (score >= 90) return '非常棒！繼續保持！🌟';
  if (score >= 80) return '很好！再多練習一點就完美了！💪';
  if (score >= 70) return '不錯！某些字母還需要複習喔～📚';
  if (score >= 60) return '加油！建議回到字母頁面複習一下 🔄';
  return '別灰心！從頭再學一次，會越來越好的！🌱';
}
