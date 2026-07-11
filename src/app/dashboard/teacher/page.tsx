
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import { getTeacherData } from '@/lib/dashboard/teacherData';
import { supabase } from '@/lib/supabase';
import { 
  Users, BookOpen, PlayCircle, ClipboardCheck, 
  Target, TrendingUp, Clock, CheckCircle2
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const teacherData = await getTeacherData(session.user.id);
        
        let assignments: any[] = [];
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('school_id')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            let query = supabase
              .from('assignments')
              .select('*')
              .order('due_date', { ascending: true });
              
            if (profile.school_id) {
              query = query.eq('school_id', profile.school_id);
            }
            const { data: assignmentsData } = await query;
            if (assignmentsData) {
              assignments = assignmentsData;
            }
          }
        } catch (asgErr) {
          console.warn('Could not fetch assignments for teacher:', asgErr);
        }

        setData({
          ...teacherData,
          assignments
        });
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
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading your classes..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || 'Unable to load teacher data.'}
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    { label: 'Start Lesson', href: '/dashboard/teacher/preparation', icon: <PlayCircle className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Capture Marks', href: '/dashboard/teacher/assessments', icon: <Target className="w-5 h-5" />, color: 'text-rose-600 bg-rose-100' },
    { label: 'Assign Homework', href: '/dashboard/teacher/assignments', icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
  ];

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Classes"
          value={data.stats.classes}
          icon={<BookOpen className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Total Learners"
          value={data.stats.learners}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Average Completion"
          value={`${data.stats.averageCompletion}%`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Average Score"
          value={`${data.stats.averageScore}%`}
          icon={<Target className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="mb-8">
        <DashboardCalendar assignments={data?.assignments || []} role="teacher" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Today's Lessons">
            {data.todaysLessons.length > 0 ? (
              <div className="space-y-4">
                {data.todaysLessons.map((lesson: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center mr-4 shadow-sm text-indigo-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{lesson.class_name || `Grade ${lesson.grade}`}</h4>
                        <p className="text-sm text-slate-500">Scheduled for today</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Lessons Scheduled" 
                description="You don't have any lessons scheduled for today."
                icon={<Clock className="h-12 w-12 text-slate-300" />}
              />
            )}
          </DashboardCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title="Term Progress">
              <ProgressCard
                title="Curriculum Covered"
                progress={data.stats.averageCompletion || 0}
                subtitle="Based on student completion"
                color="indigo"
              />
            </DashboardCard>
            <DashboardCard title="Assessments Overview">
              <ProgressCard
                title="Average Class Score"
                progress={data.stats.averageScore || 0}
                subtitle="Across all assessments"
                color="amber"
              />
            </DashboardCard>
          </div>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Quick Actions" noPadding>
            <div className="p-6">
              <QuickActions actions={quickActions} />
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Quiz Results">
            {data.recentResults.length > 0 ? (
              <div className="space-y-3">
                {data.recentResults.map((result: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-3">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{result.learner}</h4>
                        <p className="text-xs text-slate-500">
                          {new Date(result.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{result.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Recent Results" 
                description="Learners haven't completed any quizzes recently."
                icon={<CheckCircle2 className="h-10 w-10 text-slate-300" />}
              />
            )}
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
