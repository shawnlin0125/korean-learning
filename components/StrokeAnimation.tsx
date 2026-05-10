'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface StrokeAnimationProps {
  character: string;
  onComplete?: () => void;
}

// 簡化版筆順動畫 — 使用 CSS 繪製
export default function StrokeAnimation({ character, onComplete }: StrokeAnimationProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // 模擬筆順步驟（每個字元約 2-3 筆）
  const totalSteps = character.length > 1 ? character.length : 3;

  useEffect(() => {
    if (!playing) return;

    if (step >= totalSteps) {
      setPlaying(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setStep(s => s + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [step, playing, totalSteps, onComplete]);

  const handlePlay = () => {
    setStep(0);
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setStep(0);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 大寫字區域 */}
      <div className="w-32 h-32 flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200">
        <span
          className={`text-7xl font-bold transition-all duration-500 select-none
            ${playing ? 'text-blue-600 scale-110' : 'text-gray-300'}
            ${step >= totalSteps ? 'text-green-600' : ''}
          `}
        >
          {character}
        </span>
      </div>

      {/* 筆順進度 */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
              i < step ? 'bg-green-500' : i === step && playing ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* 控制按鈕 */}
      <div className="flex gap-2">
        <button
          onClick={handlePlay}
          disabled={playing}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600
            hover:bg-blue-100 transition-colors text-sm disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          筆順動畫
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500
            hover:bg-gray-100 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          重來
        </button>
      </div>

      {/* 提示文字 */}
      <p className="text-xs text-gray-400 text-center">
        {playing && step < totalSteps ? `第 ${step + 1} / ${totalSteps} 筆` :
         step >= totalSteps ? '書寫完成！' :
         '點擊按鈕觀看筆順'}
      </p>
    </div>
  );
}
