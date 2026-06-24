import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function DashboardCard({ title, children, action, className = '', noPadding = false }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
}
