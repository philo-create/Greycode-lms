'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { getSchoolAdminData } from '@/lib/dashboard/schoolData';
import { supabase } from '@/lib/supabase';
import { 
  Users, GraduationCap, BookOpen, 
  CalendarCheck, AlertCircle, FileText, Download, UserPlus, TrendingUp
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.school_id) {
          const schoolData = await getSchoolAdminData(profile.school_id);
          setData(schoolData);
        } else {
          setError('You are not assigned to any school.');
        }
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
      <DashboardLayout allowedRoles={['school_admin']}>
        <LoadingState message="Loading school dashboard..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout allowedRoles={['school_admin']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || 'Unable to load school data.'}
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    { label: 'View Learners', href: '/dashboard/school/learners', icon: <GraduationCap className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'View Teachers', href: '/dashboard/school/teachers', icon: <Users className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Grade Reports', href: '/dashboard/school/reports', icon: <FileText className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
    { label: 'Export Data', href: '#', icon: <Download className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <DashboardLayout allowedRoles={['school_admin']}>
      <div className="mb-6 pb-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{data.school?.name}</h2>
          <p className="text-slate-500">School Administration Hub</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {data.school?.subscription_status || 'Active Subscription'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Learners"
          value={data.stats.learners}
          icon={<GraduationCap className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Assigned Teachers"
          value={data.stats.teachers}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value={data.stats.classes}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Weekly Attendance"
          value={`${data.stats.attendance}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          color="amber"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Academic Progress">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressCard
                title="Overall Learner Progress"
                progress={data.learnerProgress}
                subtitle="Average across all grades"
                icon={<TrendingUp className="w-5 h-5" />}
                color="indigo"
              />
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start">
                <AlertCircle className="w-8 h-8 text-amber-500 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">Outstanding Assessments</h4>
                  <p className="text-2xl font-bold text-amber-700 my-1">{data.outstandingAssessments}</p>
                  <p className="text-sm text-amber-600">Need attention this week</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Active Classes using LMS">
            {data.recentClasses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-t-lg border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Class Name</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentClasses.map((cls: any) => (
                      <tr key={cls.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{cls.class_name}</td>
                        <td className="px-4 py-3">Grade {cls.grade}</td>
                        <td className="px-4 py-3 text-slate-600">{cls.profiles?.full_name || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                title="No Classes Configured" 
                description="Setup your classes and assign teachers to get started."
              />
            )}
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Quick Actions" noPadding>
            <div className="p-6">
              <QuickActions actions={quickActions} />
            </div>
          </DashboardCard>

          <DashboardCard title="Equipment & Payments">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="font-medium text-slate-700">Feature Coming Soon</p>
              <p className="text-sm text-slate-500 mt-2 px-4">
                Equipment tracking and payment management are currently in development.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

