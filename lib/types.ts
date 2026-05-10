// 韓文學習平台 - 型別定義

export type CharCategory = 'vowel' | 'consonant' | 'compound-vowel' | 'double-consonant';

export type LearnStatus = 'new' | 'learning' | 'mastered';

export interface HangulChar {
  char: string;              // 韓文字母
  name: string;              // 韓文名稱
  nameRomanized: string;     // 名稱羅馬音
  romanization: string;      // 發音羅馬音
  category: CharCategory;
  sound: string;             // IPA / 發音描述
  zhTW: {
    description: string;     // 繁體中文解說
    mnemonic: string;        // 記憶口訣
    similar: string;         // 相似發音提示
  };
  strokeOrder: string[];     // SVG path 筆順資料（簡化為方向描述）
  isBatchim: boolean;        // 是否可作終聲
  batchimSound?: string;     // 作終聲時的發音
}

export interface QuizQuestion {
  id: string;
  type: 'listen-choose' | 'see-choose-sound' | 'spell' | 'identify';
  prompt: string;            // 題目文字
  audio?: string;            // 播放的字元（用於聽音題型）
  options: string[];         // 選項
  correctIndex: number;      // 正確答案索引
  explanation: string;       // 繁體中文解釋
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  score: number;             // 0-100
  wrongItems: {
    question: QuizQuestion;
    userAnswer: string;
  }[];
  category: string;
  timestamp: string;
}

export interface ProgressState {
  learnedChars: Record<string, LearnStatus>;
  quizScores: Record<string, number[]>;
  lastVisit: string;
  markLearned: (char: string, status: LearnStatus) => void;
  recordQuizScore: (category: string, score: number) => void;
  getMasteredCount: () => number;
  getTotalCount: () => number;
}
