'use client';

import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/progress';

interface ProgressBarProps {
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ showLabel = true, className = '' }: ProgressBarProps) {
  const masteredCount = useProgressStore(s => s.getMasteredCount());
  const totalCount = useProgressStore(s => s.getTotalCount());
  const percent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          學習進度
        </span>
      )}
      <Progress value={percent} className="flex-1 h-2" />
      <span className="text-sm font-medium text-gray-700 w-10 text-right">
        {percent}%
      </span>
    </div>
  );
}
