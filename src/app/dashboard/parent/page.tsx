
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/dashboard/EmptyState';

import { supabase } from '@/lib/supabase';
import { 
  Users, BookOpen, CalendarCheck, FileText, 
  Download, Activity, AlertCircle
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

import Link from 'next/link';

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/dashboard/parent?parentId=${session.user.id}`, { cache: 'no-store' });
        console.log('Parent data fetched for ID:', session.user.id);
        if (!response.ok) throw new Error('Failed to fetch parent data');
        const parentData = await response.json();
        console.log('Parent data result:', parentData);
        setData(parentData);
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
      <DashboardLayout allowedRoles={['parent']}>
        <LoadingState message="Loading your family dashboard..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout allowedRoles={['parent']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || 'Unable to load parent data.'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['parent']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Linked Children"
          value={data.children.length}
          icon={<Users className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="Overall Attendance"
          value={`${data.overallAttendance}%`}
          icon={<CalendarCheck className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Recent Activities"
          value={data.recentProgress.length}
          icon={<Activity className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Upcoming Tests"
          value={data.upcomingAssessments}
          icon={<FileText className="w-6 h-6" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="My Children">
            {data.children.length > 0 ? (
              <div className="space-y-4">
                {data.children.map((child: any) => (
                  <div key={child.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {child.profiles?.full_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{child.profiles?.full_name || 'Student'}</h4>
                        <p className="text-sm text-slate-500">
                          {child.classes?.class_name ? `Class ${child.classes.class_name}` : `Grade ${child.grade}`}
                        </p>
                        {child.profiles?.email && (
                          <p className="text-xs text-indigo-600 font-medium mt-1">
                            {child.profiles.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto">
                      <Link href={`/dashboard/parent/student/${child.id}`} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 text-sm font-medium">View Progress</Link>
                      <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 text-sm font-medium">
                        <Download className="w-4 h-4 mr-2" />
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Children Linked" 
                description="Please contact the school administrator to link your child's profile to your account."
                icon={<Users className="w-12 h-12 text-slate-300" />}
              />
            )}
          </DashboardCard>

          <DashboardCard title="Assignments & Homework">
            {data.assignments && data.assignments.length > 0 ? (
              <div className="space-y-4">
                {data.assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wider">
                        {assignment.subject}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{assignment.title}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>
                    <div className="mt-3 text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded">
                      Grade {assignment.grade}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                 title="No Assignments" 
                 description="No pending homework or assignments for your children."
                 icon={<BookOpen className="w-12 h-12 text-slate-300" />}
              />
            )}
          </DashboardCard>

          <DashboardCard title="Recent Learning Activity">
             <EmptyState 
                title="No Recent Activity" 
                description="When your children complete lessons or quizzes, they will appear here."
                icon={<BookOpen className="w-12 h-12 text-slate-300" />}
              />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Kit & Payments">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="font-medium text-slate-700">Online Payments Soon</p>
              <p className="text-sm text-slate-500 mt-2 px-4">
                You will soon be able to manage robotics kit purchases and LMS fees directly from here.
              </p>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Teacher Comments">
             <EmptyState 
                title="No New Comments" 
                description="Teachers haven't left any comments recently."
              />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
