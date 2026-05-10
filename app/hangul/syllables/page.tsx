'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { basicConsonants, basicVowels } from '@/lib/hangul-data';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, ArrowRight, Info, Play, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { speakKorean } from '@/lib/audio';

// 韓文音節組合（Unicode 公式）
// 韓文音節 = (初聲索引 × 588) + (中聲索引 × 28) + 終聲索引 + 0xAC00
const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];

function combineSyllable(cho: string, jung: string): string {
  const ci = CHOSEONG.indexOf(cho);
  const ji = JUNGSEONG.indexOf(jung);
  if (ci === -1 || ji === -1) return '?';
  const code = 0xAC00 + (ci * 588) + (ji * 28);
  return String.fromCodePoint(code);
}

export default function SyllablesPage() {
  const [selectedConsonant, setSelectedConsonant] = useState('ㄱ');
  const [selectedVowel, setSelectedVowel] = useState('ㅏ');
  const [showPractice, setShowPractice] = useState(false);

  const combined = useMemo(
    () => combineSyllable(selectedConsonant, selectedVowel),
    [selectedConsonant, selectedVowel]
  );

  // 隨機組合
  const randomCombine = () => {
    const rc = CHOSEONG[Math.floor(Math.random() * CHOSEONG.length)];
    const rv = JUNGSEONG[Math.floor(Math.random() * JUNGSEONG.length)];
    setSelectedConsonant(rc);
    setSelectedVowel(rv);
  };

  const handlePlay = () => {
    speakKorean(combined);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          音節組合規則
        </h1>
        <p className="text-gray-500 mb-4">
          韓文由「初聲（子音）+ 中聲（母音）+（終聲）」組合成方塊形音節。
          下方互動區讓你自由組合子音和母音，即時看到結果！
        </p>
        <ProgressBar />

        {/* 結構說明 */}
        <Card className="mt-4 bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium mb-1">韓文音節結構</p>
                <p>
                  每個韓文音節是一個方塊，由左到右、上到下排列：<br />
                  <strong>가</strong> = ㄱ（初聲/左上）+ ㅏ（中聲/右）<br />
                  <strong>한</strong> = ㅎ（初聲/左上）+ ㅏ（中聲/右）+ ㄴ（終聲/下方）<br />
                  沒有終聲的音節叫「開音節」，有終聲的叫「閉音節」
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 互動組合器 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎛️ 音節組合器</h2>

          {/* 子音選擇 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">選擇初聲（子音）:</p>
            <div className="flex flex-wrap gap-1.5">
              {CHOSEONG.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedConsonant(c)}
                  className={`w-10 h-10 rounded-lg text-lg font-bold transition-all
                    ${selectedConsonant === c
                      ? 'bg-blue-500 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 母音選擇 */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-2">選擇中聲（母音）:</p>
            <div className="flex flex-wrap gap-1.5">
              {JUNGSEONG.map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVowel(v)}
                  className={`w-10 h-10 rounded-lg text-lg font-bold transition-all
                    ${selectedVowel === v
                      ? 'bg-pink-500 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 組合結果 */}
          <div className="flex items-center justify-center gap-8 py-6 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">初聲</p>
              <span className="text-3xl font-bold text-blue-600">{selectedConsonant}</span>
            </div>
            <span className="text-3xl text-gray-300">+</span>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">中聲</p>
              <span className="text-3xl font-bold text-pink-600">{selectedVowel}</span>
            </div>
            <span className="text-3xl text-gray-300">=</span>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">音節</p>
              <span className="text-5xl font-bold text-gray-900">{combined}</span>
            </div>
          </div>

          {/* 控制按鈕 */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600
                hover:bg-blue-100 transition-colors text-sm"
            >
              <Play className="w-4 h-4" /> 播放發音
            </button>
            <button
              onClick={randomCombine}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600
                hover:bg-gray-100 transition-colors text-sm"
            >
              <Shuffle className="w-4 h-4" /> 隨機組合
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/hangul/compound" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 複合字母
        </Link>
        <Link href="/hangul/batchim" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1">
          終聲規則 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
