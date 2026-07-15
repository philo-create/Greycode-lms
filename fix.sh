cat << 'INNEREOF' > src/components/dashboard/QuickActions.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface ActionItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  color?: string;
  variant?: 'primary' | 'default';
}

interface QuickActionsProps {
  actions: ActionItem[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {actions.map((action, idx) => {
        const isPrimary = action.variant === 'primary';

        const content = isPrimary ? (
          <>
            <div className="p-2 rounded-lg bg-white/20 text-white shadow-sm mr-4">
              {action.icon}
            </div>
            <span className="font-semibold text-white flex-1 transition-colors">
              {action.label}
            </span>
            <ChevronRight className="h-5 w-5 text-indigo-200 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </>
        ) : (
          <>
            <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 mr-4 ${action.color || 'text-indigo-600'}`}>
              {action.icon}
            </div>
            <span className="font-semibold text-slate-700 flex-1 group-hover:text-indigo-700 transition-colors">
              {action.label}
            </span>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
          </>
        );

        const className = isPrimary
          ? "flex items-center p-4 rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-[0_4px_12px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_16px_-4px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer w-full text-left"
          : "flex items-center p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50 transition-all group cursor-pointer w-full text-left";

        if (action.href) {
          return (
            <Link key={idx} href={action.href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button key={idx} onClick={action.onClick} className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
INNEREOF
