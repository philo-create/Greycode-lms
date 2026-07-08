import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
};

export function StatCard({ title, value, icon, description, trend, color = 'indigo' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <h4 className="text-slate-500 font-medium text-sm mb-1">{title}</h4>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
      </div>
    </div>
  );
}
