import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function DashboardCard({ title, children, action, className = '', noPadding = false, onClick }: DashboardCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
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
