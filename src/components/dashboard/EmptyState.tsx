import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  icon = <FileQuestion className="h-12 w-12 text-slate-300" />,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      {description && <p className="text-slate-500 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
