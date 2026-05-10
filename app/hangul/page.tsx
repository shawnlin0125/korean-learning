'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import { basicVowels, basicConsonants, compoundVowels, doubleConsonants } from '@/lib/hangul-data';
import HangulGrid from '@/components/HangulGrid';
import { ChevronRight, Type, Music, CombineIcon, Layers } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

const sections = [
  {
    id: 'vowels',
    title: '基本母音',
    desc: '10 個基本母音，韓文的基礎發音元素',
    icon: Music,
    color: 'from-pink-500 to-rose-500',
    chars: basicVowels,
  },
  {
    id: 'consonants',
    title: '基本子音',
    desc: '14 個基本子音，構成韓文音節的骨架',
    icon: Type,
    color: 'from-blue-500 to-indigo-500',
    chars: basicConsonants,
  },
  {
    id: 'compound',
    title: '複合母音與雙子音',
    desc: '11 個複合母音 + 5 個雙子音，進階字母',
    icon: Layers,
    color: 'from-purple-500 to-violet-500',
    chars: [...compoundVowels, ...doubleConsonants],
  },
  {
    id: 'syllables',
    title: '音節組合規則',
    desc: '學習如何將子音和母音組合成完整的韓文音節',
    icon: CombineIcon,
    color: 'from-emerald-500 to-teal-500',
    chars: [],
  },
  {
    id: 'batchim',
    title: '終聲（받침）規則',
    desc: '音節結尾子音的發音規則，韓文最關鍵的發音變化',
    icon: Layers,
    color: 'from-orange-500 to-amber-500',
    chars: [],
  },
];

export default function HangulOverviewPage() {
  const masteredCount = useProgressStore(s => s.getMasteredCount());
  const totalCount = useProgressStore(s => s.getTotalCount());
  const percent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 頁首 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          한글 韓文字母
        </h1>
        <p className="text-gray-500">
          韓文共有 40 個基本字母：10 個母音、14 個子音、11 個複合母音、5 個雙子音。
          點擊字母聆聽發音，展開卡片查看詳細解說。
        </p>
        <div className="mt-4">
          <ProgressBar />
        </div>
      </div>

      {/* 分類入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {sections.map(section => (
          <Link key={section.id} href={`/hangul/${section.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.desc}</p>
                    <div className="flex items-center gap-1 mt-2 text-gray-400 text-sm">
                      進入 <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 完整字母表 */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">完整字母表</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            基本母音 ({basicVowels.length})
          </h3>
          <HangulGrid chars={basicVowels} showFilter={false} />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            基本子音 ({basicConsonants.length})
          </h3>
          <HangulGrid chars={basicConsonants} showFilter={false} />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            複合母音與雙子音 ({compoundVowels.length + doubleConsonants.length})
          </h3>
          <HangulGrid chars={[...compoundVowels, ...doubleConsonants]} showFilter={false} />
        </div>
      </div>

      {/* 底部導航 */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 回首頁
        </Link>
        <Link href="/hangul/quiz" className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
          開始測驗 →
        </Link>
      </div>
    </div>
  );
}
