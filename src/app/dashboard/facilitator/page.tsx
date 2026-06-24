'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { getFacilitatorData } from '@/lib/dashboard/facilitatorData';
import { supabase } from '@/lib/supabase';
import { 
  Building2, BookOpen, FileText, AlertTriangle, 
  PlayCircle, ClipboardCheck, MessageSquare, Wrench, CalendarCheck
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function FacilitatorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const facilitatorData = await getFacilitatorData(session.user.id);
        setData(facilitatorData);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['facilitator']}>
        <LoadingState message="Loading your schedule..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout allowedRoles={['facilitator']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || 'Unable to load facilitator data.'}
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    { label: 'Start Class', href: '/dashboard/facilitator/class', icon: <PlayCircle className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Capture Attendance', href: '/dashboard/facilitator/attendance', icon: <ClipboardCheck className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Add Class Note', href: '/dashboard/facilitator/notes', icon: <MessageSquare className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
    { label: 'Report Issue', href: '/dashboard/facilitator/issues', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
  ];

  return (
    <DashboardLayout allowedRoles={['facilitator']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned Schools"
          value={data.stats.schoolsAssigned}
          icon={<Building2 className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Assigned Classes"
          value={data.stats.classesAssigned}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Pending Reports"
          value={data.stats.pendingReports}
          icon={<FileText className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Equipment Issues"
          value={data.stats.equipmentIssues}
          icon={<Wrench className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Today's Schedule">
            {data.todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {data.todaySchedule.map((cls: any) => (
                  <div key={cls.id} className="flex flex-col sm:flex-row justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md mr-3">
                          {cls.class_name || `Grade ${cls.grade}`}
                        </span>
                        <h4 className="font-bold text-slate-800">{cls.schools?.name || 'School Name'}</h4>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center mt-2">
                         {cls.schools?.location || 'Location missing'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                       <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 text-sm">
                         View Details
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Classes Today" 
                description="You don't have any classes scheduled for today."
                icon={<CalendarCheck className="h-12 w-12 text-slate-300" />}
              />
            )}
          </DashboardCard>

          <DashboardCard title="Class Progress Overview">
             <EmptyState 
                title="No Data Yet" 
                description="Start recording class progress to see the overview here."
              />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Quick Actions" noPadding>
            <div className="p-6">
              <QuickActions actions={quickActions} />
            </div>
          </DashboardCard>

          <DashboardCard title="Equipment Tracker">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Wrench className="w-8 h-8" />
              </div>
              <p className="font-medium text-slate-700">Feature Coming Soon</p>
              <p className="text-sm text-slate-500 mt-2 px-4">
                You will be able to manage inventory and report damaged robotics components here.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

