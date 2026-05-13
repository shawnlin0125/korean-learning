import { headers } from 'next/headers';

// Server Component — 在 runtime 讀取環境變數，顯示環境標識
export default function EnvBanner() {
  headers(); // 強制 dynamic rendering，確保 runtime env 可讀
  const env = process.env.APP_ENV;

  // production 不顯示橫幅
  if (!env || env === 'production') return null;

  const isStaging = env === 'staging';

  return (
    <div
      className={`text-center text-xs font-medium py-1.5 ${
        isStaging
          ? 'bg-amber-500 text-white'
          : 'bg-gray-700 text-gray-200'
      }`}
    >
      🚧 {env.toUpperCase()} 環境 — 資料可能隨時重置
    </div>
  );
}
