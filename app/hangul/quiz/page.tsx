'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateQuiz, calculateScore, getScoreComment } from '@/lib/quiz-engine';
import { useProgressStore } from '@/store/progress';
import { speakKorean } from '@/lib/audio';
import { useAudio } from '@/hooks/useAudio';
import type { QuizQuestion, QuizResult, HangulChar, CharCategory } from '@/lib/types';
import {
  ArrowLeft, Volume2, Check, X, Trophy, RotateCcw,
  Sparkles, Frown, Meh, Smile, PartyPopper
} from 'lucide-react';

type QuizState = 'setup' | 'playing' | 'finished';

export default function QuizPage() {
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [questionCount, setQuestionCount] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<CharCategory[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { play, isPlaying } = useAudio();
  const recordQuizScore = useProgressStore(s => s.recordQuizScore);

  // 開始測驗
  const startQuiz = () => {
    const qs = generateQuiz(
      selectedCategories.length > 0 ? selectedCategories : [],
      questionCount
    );
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResult(null);
    setQuizState('playing');
  };

  // 選擇答案
  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // 已選過
    setSelectedAnswer(optionIndex);

    // 延遲一下再顯示結果
    setTimeout(() => {
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);
      setShowResult(true);
    }, 500);
  };

  // 下一題
  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      // 測驗結束
      const correctCount = answers.filter(
        (a, i) => a === questions[i].correctIndex
      ).length;
      const score = calculateScore(correctCount, questions.length);
      const wrongItems = questions
        .map((q, i) => ({ q, userAnswer: q.options[answers[i]] }))
        .filter((item, i) => answers[i] !== questions[i].correctIndex)
        .map(item => ({
          question: item.q,
          userAnswer: item.userAnswer,
        }));

      const result: QuizResult = {
        totalQuestions: questions.length,
        correctCount,
        score,
        wrongItems,
        category: selectedCategories.join(', ') || '全部',
        timestamp: new Date().toISOString(),
      };
      setQuizResult(result);
      setQuizState('finished');
      recordQuizScore(result.category, score);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // 重新測驗
  const handleRetry = () => {
    setQuizState('setup');
    setQuizResult(null);
  };

  // 播放題目音檔
  const handlePlayAudio = async (char?: string) => {
    if (char) {
      await play(char, 2);
    }
  };

  // --- Setup 畫面 ---
  if (quizState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">字母測驗</h1>
        <p className="text-gray-500 mb-8">選擇測驗範圍和題數，準備挑戰你的韓文字母實力！</p>

        {/* 範圍選擇 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-800 mb-3">測驗範圍</h2>
            <p className="text-sm text-gray-500 mb-4">不選 = 全部字母隨機出題</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'vowel' as CharCategory, label: '基本母音', color: 'bg-pink-100 text-pink-700' },
                { key: 'consonant' as CharCategory, label: '基本子音', color: 'bg-blue-100 text-blue-700' },
                { key: 'compound-vowel' as CharCategory, label: '複合母音', color: 'bg-purple-100 text-purple-700' },
                { key: 'double-consonant' as CharCategory, label: '雙子音', color: 'bg-orange-100 text-orange-700' },
              ].map(cat => {
                const active = selectedCategories.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategories(prev =>
                        prev.includes(cat.key)
                          ? prev.filter(c => c !== cat.key)
                          : [...prev, cat.key]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${active
                        ? 'ring-2 ring-offset-1 ring-blue-400 bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 題數選擇 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-800 mb-3">題目數量</h2>
            <div className="flex gap-3">
              {[10, 20, 30].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all
                    ${questionCount === n
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {n} 題
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 開始按鈕 */}
        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white
            text-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl
            active:scale-[0.98]"
        >
          開始測驗！
        </button>
      </div>
    );
  }

  // --- 測驗中畫面 ---
  if (quizState === 'playing') {
    const question = questions[currentIndex];
    const progress = Math.round(((currentIndex + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100);
    const isCorrect = selectedAnswer === question.correctIndex;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 進度條 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>第 {currentIndex + 1} / {questions.length} 題</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 題目卡片 */}
        <Card className="mb-4">
          <CardContent className="p-6 md:p-8">
            {/* 題型標籤 */}
            <Badge variant="outline" className="mb-4">
              {question.type === 'listen-choose' ? '🎧 聽音選字' :
               question.type === 'see-choose-sound' ? '👁️ 看字選音' :
               question.type === 'spell' ? '✍️ 拼音組合' :
               '🏷️ 字母辨識'}
            </Badge>

            {/* 題目內容 */}
            <h2 className="text-lg font-medium text-gray-800 mb-4">{question.prompt}</h2>

            {/* 聽音題：播放按鈕 */}
            {question.type === 'listen-choose' && question.audio && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => handlePlayAudio(question.audio)}
                  disabled={isPlaying}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold transition-all
                    ${isPlaying
                      ? 'bg-blue-100 text-blue-400'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? '播放中...' : '🔊 點擊聆聽'}
                </button>
              </div>
            )}

            {/* 選項 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrectAnswer = showResult && i === question.correctIndex;
                const isWrongAnswer = showResult && isSelected && !isCorrect;

                let buttonStyle = 'bg-white border-2 text-gray-700 hover:border-gray-400 hover:bg-gray-50';
                if (isSelected && !showResult) {
                  buttonStyle = 'bg-blue-50 border-blue-400 text-blue-700';
                }
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-green-50 border-green-500 text-green-700';
                }
                if (isWrongAnswer) {
                  buttonStyle = 'bg-red-50 border-red-400 text-red-700';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl text-lg font-bold transition-all ${buttonStyle}
                      ${selectedAnswer === null ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                      ${isCorrectAnswer ? 'ring-2 ring-green-300' : ''}
                      ${isWrongAnswer ? 'ring-2 ring-red-300' : ''}
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {opt}
                      {isCorrectAnswer && <Check className="w-5 h-5 text-green-600" />}
                      {isWrongAnswer && <X className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 結果回饋 */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✅ 正確！' : '❌ 錯誤！'}
                </p>
                <p className="text-sm text-gray-600">{question.explanation}</p>
                <button
                  onClick={handleNext}
                  className="mt-3 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium
                    hover:bg-gray-800 transition-colors"
                >
                  {currentIndex + 1 >= questions.length ? '查看結果' : '下一題 →'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 跳題（可選） */}
        {!showResult && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              跳過此題 →
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- 結果畫面 ---
  if (quizState === 'finished' && quizResult) {
    const { score, correctCount, totalQuestions, wrongItems } = quizResult;
    const ScoreIcon = score >= 90 ? PartyPopper : score >= 70 ? Smile : score >= 50 ? Meh : Frown;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <ScoreIcon className="w-16 h-16 mx-auto text-purple-500 mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">測驗完成！</h1>

          {/* 分數 */}
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
            <div className="text-center">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-lg">分</span>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-1">
            {correctCount} / {totalQuestions} 題正確
          </p>
          <p className="text-md text-gray-500">{getScoreComment(score)}</p>
        </div>

        {/* 錯題回顧 */}
        {wrongItems.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                錯題回顧 ({wrongItems.length} 題需要複習)
              </h2>
              <div className="space-y-3">
                {wrongItems.map((item, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm font-medium text-gray-700">{item.question.prompt}</p>
                    <p className="text-sm mt-1">
                      <span className="text-red-600">你的答案：{item.userAnswer}</span>
                      {' → '}
                      <span className="text-green-600 font-medium">
                        正確：{item.question.options[item.question.correctIndex]}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.question.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 行動按鈕 */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium
              hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 重新測驗
          </button>
          <Link
            href="/hangul"
            className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium
              hover:bg-purple-600 transition-colors text-center inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> 繼續學習
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
