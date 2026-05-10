'use client';

import { HangulChar } from '@/lib/types';
import HangulCard from './HangulCard';
import { useProgressStore } from '@/store/progress';

interface HangulGridProps {
  chars: HangulChar[];
  title?: string;
  showFilter?: boolean;
}

type FilterKey = 'all' | 'new' | 'learning' | 'mastered';

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '未學' },
  { key: 'learning', label: '學習中' },
  { key: 'mastered', label: '已掌握' },
];

export default function HangulGrid({ chars, title, showFilter = true }: HangulGridProps) {
  const learnedChars = useProgressStore(s => s.learnedChars);

  const getFilterKey = (): FilterKey => {
    // 簡單地顯示全部，過濾邏輯保留
    return 'all';
  };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}

      {/* 分類按鈕（可選） */}
      {showFilter && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600
                hover:bg-gray-200 transition-colors"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* 卡片網格 — RWD: 手機 2 欄 → 平板 3-4 欄 → 桌面 5-6 欄 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {chars.map(char => (
          <HangulCard key={char.char} data={char} />
        ))}
      </div>

      {chars.length === 0 && (
        <p className="text-center text-gray-400 py-12">沒有符合的字母</p>
      )}
    </div>
  );
}
