'use client';

import Link from 'next/link';
import { useState } from 'react';
import { compoundVowels, doubleConsonants } from '@/lib/hangul-data';
import HangulGrid from '@/components/HangulGrid';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CompoundPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          複合母音與雙子音
        </h1>
        <p className="text-gray-500 mb-4">
          複合母音由基本母音組合而成，雙子音是基本子音的「加強版」。
          掌握基本字母後，複合字母就很容易理解了！
        </p>
        <ProgressBar />

        {/* 組合規則說明 */}
        <Card className="mt-4 bg-purple-50/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800 space-y-2">
                <p className="font-medium">組合邏輯</p>
                <p>
                  <strong>複合母音</strong> = 基本母音 + 基本母音<br />
                  例：ㅏ + ㅣ = ㅐ（a + i = ae）<br />
                  例：ㅗ + ㅏ = ㅘ（o + a = wa）
                </p>
                <p>
                  <strong>雙子音</strong> = 基本子音 × 2<br />
                  寫成兩個子音並排（쌍 = 雙），發音比原本更「緊」
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compound-vowels" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="compound-vowels">複合母音 ({compoundVowels.length})</TabsTrigger>
          <TabsTrigger value="double-consonants">雙子音 ({doubleConsonants.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="compound-vowels">
          <HangulGrid chars={compoundVowels} title="點擊字母聆聽發音" />
        </TabsContent>
        <TabsContent value="double-consonants">
          <HangulGrid chars={doubleConsonants} title="點擊字母聆聽發音" />
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/hangul/consonants" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 子音教學
        </Link>
        <Link href="/hangul/syllables" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1">
          音節組合 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
