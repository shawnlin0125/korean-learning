'use client';

import Link from 'next/link';
import { basicConsonants } from '@/lib/hangul-data';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, ArrowRight, Info, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { speakKorean } from '@/lib/audio';

// 終聲規則 — 7 種發音
const batchimRules = [
  {
    sound: 'ㄱ [k̚]',
    letters: 'ㄱ ㅋ ㄲ',
    example: '각 [gak], 부엌 [bueok], 밖 [bak]',
    desc: '所有收「ㄱ」系列音的終聲都讀不爆破的 k。舌尖不參與，只做舌根閉鎖。',
  },
  {
    sound: 'ㄴ [n]',
    letters: 'ㄴ',
    example: '안 [an], 눈 [nun], 문 [mun]',
    desc: '舌尖抵上齒齦，鼻音。和中文的 n 一樣。',
  },
  {
    sound: 'ㄷ [t̚]',
    letters: 'ㄷ ㅌ ㅅ ㅆ ㅈ ㅊ ㅎ',
    example: '곧 [got], 끝 [kkeut], 옷 [ot], 낮 [nat], 좋 [jot]',
    desc: '最常見的終聲變化！ㅅㅆㅈㅊㅎ 在終聲位置全部讀成 t。舌頭抵住上齒齦但不爆破。',
  },
  {
    sound: 'ㄹ [l]',
    letters: 'ㄹ',
    example: '말 [mal], 길 [gil], 달 [dal]',
    desc: '舌尖抵上齒齦，舌側留縫。類似英文 "all" 的 l。',
  },
  {
    sound: 'ㅁ [m]',
    letters: 'ㅁ',
    example: '밤 [bam], 꿈 [kkum], 마음 [maeum]',
    desc: '雙唇閉合，鼻音。和中文的 m 一樣。',
  },
  {
    sound: 'ㅂ [p̚]',
    letters: 'ㅂ ㅍ',
    example: '밥 [bap], 앞 [ap], 잎 [ip]',
    desc: '雙唇閉合但不爆破。ㅍ 在終聲也讀 ㅂ。',
  },
  {
    sound: 'ㅇ [ŋ]',
    letters: 'ㅇ',
    example: '강 [gang], 성 [seong], 공 [gong]',
    desc: '類似中文「ㄥ」。舌根抵軟顎，鼻音。注意：在字首 ㅇ 不發音！',
  },
];

export default function BatchimPage() {
  const handlePlay = (text: string) => {
    speakKorean(text);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/hangul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> 回字母總覽
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          終聲 <span className="text-orange-500">받침</span> 規則
        </h1>
        <p className="text-gray-500 mb-4">
          받침（終聲）是韓文音節中最下方的子音。雖然有許多子音可以出現在終聲位置，
          但其實只有 <strong>7 種發音</strong>！這是韓文發音最重要的規則之一。
        </p>
        <ProgressBar />

        {/* 終聲概念說明 */}
        <Card className="mt-4 bg-orange-50/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800 space-y-2">
                <p className="font-medium">什麼是 받침（終聲）？</p>
                <p>
                  韓文音節方塊的最下方可以再放一個子音，這個位置叫 <strong>받침</strong>（終聲）。<br />
                  有終聲的音節 = 閉音節（如 각、밥、한）<br />
                  沒有終聲的音節 = 開音節（如 가、바、하）
                </p>
                <p className="text-orange-600">
                  ⚠️ 重點：終聲的發音和該子音在字首時不完全一樣！<br />
                  例如「ㅅ」在字首讀 s，在終聲讀 t！
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7 種終聲規則 */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">7 種終聲發音規則</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {batchimRules.map((rule, i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{rule.sound}</h3>
                <button
                  onClick={() => handlePlay(rule.example.split(',')[0].split(' ')[0])}
                  className="p-1.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-700">字母：</span>
                {rule.letters}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-700">範例：</span>
                {rule.example}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">{rule.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 記憶口訣 */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 mb-8">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-800 mb-2">🎵 記憶口訣</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>7 種終聲記法：</strong><br />
            「ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ」→ 記住這七個音！<br />
            其他的終聲字母都「歸化」到這七個音之一：<br />
            ㅋ→ㄱ、ㅌㅅㅆㅈㅊㅎ→ㄷ、ㅍ→ㅂ
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link href="/hangul/syllables" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← 音節組合
        </Link>
        <Link href="/hangul/quiz" className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors inline-flex items-center gap-1">
          字母測驗 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
