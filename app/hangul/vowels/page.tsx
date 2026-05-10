'use client';

import Link from 'next/link';
import { basicVowels } from '@/lib/hangul-data';
import HangulGrid from '@/components/HangulGrid';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function VowelsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          基本母音 <span className="text-pink-500">({basicVowels.length} 個)</span>
        </h1>
        <p className="text-gray-500 mb-4">
          母音是韓文發音的基礎。韓文有 10 個基本母音，由「天 •、地 ㅡ、人 ㅣ」三元素組合而成。
          學習母音時注意嘴型和舌位，對比中文和注音的相似音，會更容易掌握！
        </p>
        <ProgressBar />

        {/* 母音結構說明 */}
        <Card className="mt-4 bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">母音結構小知識</p>
                <p>
                  韓文母音由三個基本元素組合而成：<br />
                  • <strong>ㆍ（天）</strong>：圓點代表太陽 → 演變為短橫<br />
                  • <strong>ㅡ（地）</strong>：橫線代表地平線 → 嘴唇扁平<br />
                  • <strong>ㅣ（人）</strong>：直線代表站立的人 → 嘴唇拉開<br />
                  所有的母音都是這三種元素的組合變化！
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <HangulGrid chars={basicVowels} title="點擊字母聆聽發音，展開查看詳細解說" />

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 字母總覽
        </Link>
        <Link href="/hangul/consonants" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1">
          子音教學 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
