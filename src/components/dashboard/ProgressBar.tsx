import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  rose: 'bg-rose-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({ progress, label, showValue = true, color = 'indigo', size = 'md' }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showValue && <span className="text-sm font-bold text-slate-900">{Math.round(safeProgress)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div 
          className={`${colorMap[color]} h-full transition-all duration-500 ease-in-out`} 
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
}
