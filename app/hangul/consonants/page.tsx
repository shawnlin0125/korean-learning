'use client';

import Link from 'next/link';
import { basicConsonants } from '@/lib/hangul-data';
import HangulGrid from '@/components/HangulGrid';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ConsonantsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          基本子音 <span className="text-blue-500">({basicConsonants.length} 個)</span>
        </h1>
        <p className="text-gray-500 mb-4">
          子音是韓文音節的骨架。14 個基本子音模仿發音器官（舌、唇、喉）的形狀創造而成。
          學習時特別注意平音、送氣音、緊音的區別！
        </p>
        <ProgressBar />

        {/* 子音分類說明 */}
        <Card className="mt-4 bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-medium">子音三種發音強度</p>
                <p>
                  <strong>平音</strong>（ㄱㄴㄷㄹㅁㅂㅅㅇㅈ）：基本發音，不特別用力<br />
                  <strong>送氣音</strong>（ㅊㅋㅌㅍㅎ）：比平音多一口氣，類似中文送氣音<br />
                  <strong>緊音</strong>（ㄲㄸㅃㅆㅉ）：喉嚨收緊，不送氣，比平音更硬
                </p>
                <p className="text-blue-600">
                  💡 對繁體中文使用者來說：平音 ≈ 注音不送氣音（ㄍㄉㄅ），送氣音 ≈ 注音送氣音（ㄎㄊㄆ）
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <HangulGrid chars={basicConsonants} title="點擊字母聆聽發音，展開查看詳細解說" />

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/hangul/vowels" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 母音教學
        </Link>
        <Link href="/hangul/compound" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1">
          複合字母 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
