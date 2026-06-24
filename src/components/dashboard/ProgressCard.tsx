import React from 'react';
import { ProgressBar } from './ProgressBar';

interface ProgressCardProps {
  title: string;
  progress: number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose';
}

export function ProgressCard({ title, progress, subtitle, icon, color = 'indigo' }: ProgressCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center mb-4">
        {icon && (
          <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 mr-3`}>
            {icon}
          </div>
        )}
        <div>
          <h4 className="font-semibold text-slate-800">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <ProgressBar progress={progress} color={color} size="md" />
    </div>
  );
}
