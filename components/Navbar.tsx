'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProgressStore } from '@/store/progress';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Home, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const masteredCount = useProgressStore(s => s.getMasteredCount());
  const totalCount = useProgressStore(s => s.getTotalCount());
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // 麵包屑邏輯
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = seg === 'hangul' ? '韓文字母' :
                  seg === 'vowels' ? '母音' :
                  seg === 'consonants' ? '子音' :
                  seg === 'compound' ? '複合字母' :
                  seg === 'syllables' ? '音節組合' :
                  seg === 'batchim' ? '終聲規則' :
                  seg === 'quiz' ? '測驗' :
                  seg;
    return { href, label };
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左側：Logo + 麵包屑 */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">한</span>
              </div>
              <span className="font-semibold text-gray-800 hidden sm:inline">韓文學習</span>
            </Link>

            {/* 桌面麵包屑 */}
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                <Link href="/" className="hover:text-gray-600 transition-colors">
                  <Home className="w-3.5 h-3.5" />
                </Link>
                {breadcrumbs.map((bc, i) => (
                  <span key={bc.href} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    <Link
                      href={bc.href}
                      className={`hover:text-gray-600 transition-colors truncate max-w-[100px]
                        ${i === breadcrumbs.length - 1 ? 'text-gray-700 font-medium' : ''}`}
                    >
                      {bc.label}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 右側：進度 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {masteredCount} / {totalCount} 字母
              </span>
              <Progress value={progressPercent} className="w-20 h-2" />
              <span className="text-xs text-gray-400 w-8">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
