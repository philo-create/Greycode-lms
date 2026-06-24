import React from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return <div className="text-sm text-slate-500 py-4">No recent activity.</div>;
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, idx) => (
        <div key={activity.id} className="flex relative">
          {idx !== activities.length - 1 && (
            <div className="absolute top-10 left-5 bottom-[-24px] w-0.5 bg-slate-100" />
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${activity.color || 'bg-slate-100 text-slate-600'}`}>
            {activity.icon}
          </div>
          <div className="ml-4 flex-1 pt-2">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-semibold text-slate-800">{activity.title}</h4>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{activity.time}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
