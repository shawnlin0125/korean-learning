'use client';

import { useState, useCallback, useRef } from 'react';
import { speakKorean, isKoreanTTSAvailable } from '@/lib/audio';

interface UseAudioReturn {
  play: (text: string, repeat?: number) => Promise<void>;
  isPlaying: boolean;
  isSupported: boolean;
}

export function useAudio(): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const isSupported = useRef(false);

  // 初始化時檢查
  if (typeof window !== 'undefined' && !isSupported.current) {
    isSupported.current = isKoreanTTSAvailable();
  }

  const play = useCallback(async (text: string, repeat = 1) => {
    if (isPlaying) return; // 防止重複點擊

    setIsPlaying(true);
    try {
      for (let i = 0; i < repeat; i++) {
        await speakKorean(text);
        if (i < repeat - 1) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    } catch {
      // 忽略錯誤
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { play, isPlaying, isSupported: isSupported.current };
}
