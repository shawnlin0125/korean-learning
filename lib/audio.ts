// 韓文發音工具 — Web Speech API 封裝

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(cachedVoices);
    };
  });
}

function findKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // 優先找韓文原生語音
  const koreanVoice = voices.find(
    v => v.lang.startsWith('ko') && v.localService
  );
  if (koreanVoice) return koreanVoice;

  // 備用：任何韓文語音
  const anyKorean = voices.find(v => v.lang.startsWith('ko'));
  if (anyKorean) return anyKorean;

  // 最後手段：用第一個可用語音（發音可能不準）
  return voices[0] || null;
}

/**
 * 使用 Web Speech API 朗讀韓文
 * @param text 要朗讀的韓文
 * @returns Promise，播放完成後 resolve
 */
export async function speakKorean(text: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // 取消任何正在進行的語音
  window.speechSynthesis.cancel();

  // 確保語音清單已載入
  if (!voicesLoaded) {
    await loadVoices();
  }

  const voice = findKoreanVoice(cachedVoices);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;  // 稍慢，適合學習
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (voice) {
    utterance.voice = voice;
  }

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // 出錯也不卡住
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 朗讀單一字母，可重複播放
 */
export async function speakChar(char: string, repeat = 1): Promise<void> {
  for (let i = 0; i < repeat; i++) {
    await speakKorean(char);
    if (i < repeat - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

/**
 * 檢查瀏覽器是否支援韓文 TTS
 */
export function isKoreanTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.speechSynthesis) return false;

  const voices = window.speechSynthesis.getVoices();
  return voices.some(v => v.lang.startsWith('ko'));
}
