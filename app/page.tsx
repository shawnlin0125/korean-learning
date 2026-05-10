'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';
import {
  BookOpen, Mic, Puzzle, Headphones, Lock, ChevronRight, Sparkles,
  Type
} from 'lucide-react';

const courses = [
  {
    id: 'hangul',
    title: '한글 韓文字母',
    description: '從零開始學習 40 個韓文字母，包含母音、子音、複合字母與音節組合規則。',
    icon: Type,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    available: true,
    progress: '40 個字母',
  },
  {
    id: 'hangul/quiz',
    title: '字母測驗',
    description: '聽音選字、看字選音、拼音組合⋯⋯多種題型幫你鞏固字母記憶。',
    icon: Puzzle,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    available: true,
    progress: '挑戰你的實力',
  },
  {
    id: 'vocabulary',
    title: '基礎單字（即將推出）',
    description: '主題式單字學習，利用漢字詞關聯幫助記憶，搭配閃卡複習。',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    available: false,
    progress: '敬請期待',
  },
  {
    id: 'grammar',
    title: '基礎文法（即將推出）',
    description: '韓文語序、助詞系統、語尾變化，以繁體中文角度理解韓文文法。',
    icon: Sparkles,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    available: false,
    progress: '敬請期待',
  },
];

export default function HomePage() {
  const masteredCount = useProgressStore(s => s.getMasteredCount());
  const totalCount = useProgressStore(s => s.getTotalCount());
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🇰🇷 從零開始學韓文
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          專為繁體中文使用者設計的韓文學習平台。<br className="hidden sm:inline" />
          從 <span className="text-blue-600 font-semibold">한글</span> 字母開始，循序漸進掌握韓文。
        </p>

        {/* 總進度 */}
        <div className="mt-6 inline-flex items-center gap-3 bg-white rounded-full px-5 py-2.5 shadow-sm border">
          <span className="text-sm text-gray-500">總體進度</span>
          <Progress value={progressPercent} className="w-24 h-2" />
          <span className="text-sm font-semibold text-blue-600">
            {masteredCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {/* 字母學習 */}
        <Link href="/hangul">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">開始學習字母</h3>
                  <p className="text-sm text-gray-500 mt-1">從母音、子音到音節組合，完整教學</p>
                  <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm font-medium">
                    進入課程 <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 測驗 */}
        <Link href="/hangul/quiz">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">字母測驗</h3>
                  <p className="text-sm text-gray-500 mt-1">聽音選字、拼音組合，多種題型等你挑戰</p>
                  <div className="flex items-center gap-1 mt-2 text-purple-600 text-sm font-medium">
                    開始測驗 <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 完整課程列表 */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">課程列表</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id}>
            {course.available ? (
              <Link href={`/${course.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${course.color} rounded-lg flex items-center justify-center shrink-0`}>
                        <course.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{course.progress}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="h-full opacity-60 border-dashed">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${course.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
                      <course.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-400">{course.title}</h3>
                        <Lock className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs text-gray-400 border-gray-200">敬請期待</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
