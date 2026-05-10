'use client';

import { useProgressStore } from '@/store/progress';
import { speakKorean } from '@/lib/audio';
import type { HangulChar } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Volume2, Check, BookOpen, Star } from 'lucide-react';
import { useState } from 'react';

interface HangulCardProps {
  data: HangulChar;
  showDetail?: boolean;
  onLearn?: (char: string) => void;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  new: { icon: <BookOpen className="w-3 h-3" />, label: '新學', color: 'bg-gray-100 text-gray-600' },
  learning: { icon: <Star className="w-3 h-3" />, label: '學習中', color: 'bg-yellow-100 text-yellow-700' },
  mastered: { icon: <Check className="w-3 h-3" />, label: '已掌握', color: 'bg-green-100 text-green-700' },
};

export default function HangulCard({ data, showDetail = true, onLearn }: HangulCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const learnedChars = useProgressStore(s => s.learnedChars);
  const markLearned = useProgressStore(s => s.markLearned);

  const status = learnedChars[data.char] || 'new';
  const config = statusConfig[status];

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakKorean(data.char);
    } catch {
      // ignore
    }
    setIsPlaying(false);
  };

  const handleLearnToggle = () => {
    const nextStatus = status === 'mastered' ? 'new' : status === 'learning' ? 'mastered' : 'learning';
    markLearned(data.char, nextStatus);
    onLearn?.(data.char);
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg
        ${status === 'mastered' ? 'border-green-300 bg-green-50/30' : ''}
        ${status === 'learning' ? 'border-yellow-300 bg-yellow-50/30' : ''}
      `}
      onClick={() => setExpanded(!expanded)}
    >
      {/* 狀態標記 */}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className={`text-xs gap-1 ${config.color}`}>
          {config.icon}
          {config.label}
        </Badge>
      </div>

      {/* 大字顯示 */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <span className="text-6xl font-bold text-gray-800 select-none leading-none mb-1">
          {data.char}
        </span>
        <span className="text-sm text-gray-400">{data.romanization}</span>
      </div>

      {/* 發音按鈕 */}
      <div className="flex justify-center pb-3">
        <button
          onClick={(e) => { e.stopPropagation(); handlePlay(); }}
          disabled={isPlaying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600
            hover:bg-blue-100 transition-colors text-sm disabled:opacity-50"
        >
          <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          {isPlaying ? '播放中...' : '發音'}
        </button>
      </div>

      {/* 展開詳細資訊 */}
      {expanded && showDetail && (
        <div className="border-t px-4 py-3 space-y-3 text-sm bg-gray-50/50">
          <div>
            <span className="font-semibold text-gray-700">名稱：</span>
            {data.name} ({data.nameRomanized})
          </div>
          <div>
            <span className="font-semibold text-gray-700">發音：</span>
            {data.sound}
          </div>
          <div className="leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-700">說明：</span>
            {data.zhTW.description}
          </div>
          <div className="leading-relaxed text-gray-500 italic">
            <span className="font-semibold text-gray-600 not-italic">口訣：</span>
            {data.zhTW.mnemonic}
          </div>
          <div className="text-gray-500">
            <span className="font-semibold text-gray-600">提示：</span>
            {data.zhTW.similar}
          </div>
          {data.isBatchim && data.batchimSound && (
            <div className="text-orange-600">
              <span className="font-semibold">終聲發音：</span>
              {data.batchimSound}
            </div>
          )}

          {/* 標記學習按鈕 */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleLearnToggle(); }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
                ${status === 'mastered'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : status === 'learning'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {status === 'mastered' ? '✓ 已掌握（點擊取消）' :
               status === 'learning' ? '★ 學習中（點擊完成）' : '+ 標記學習'}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
