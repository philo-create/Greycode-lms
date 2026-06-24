import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface ActionItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
}

interface QuickActionsProps {
  actions: ActionItem[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {actions.map((action, idx) => (
        <Link 
          key={idx} 
          href={action.href}
          className="flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50 transition-all group"
        >
          <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 mr-4 ${action.color || 'text-indigo-600'}`}>
            {action.icon}
          </div>
          <span className="font-semibold text-slate-700 flex-1 group-hover:text-indigo-700 transition-colors">
            {action.label}
          </span>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}
