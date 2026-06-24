'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { getSuperAdminData } from '@/lib/dashboard/adminData';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  PlusCircle, FileText, CheckCircle2, TrendingUp,
  Clock, Server
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const adminData = await getSuperAdminData();
        setData(adminData);
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
      <DashboardLayout allowedRoles={['super_admin']}>
        <LoadingState message="Loading platform statistics..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={['super_admin']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const quickActions = [
    { label: 'Add School', href: '/dashboard/admin/schools/new', icon: <Building2 className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Add Teacher', href: '/dashboard/admin/users/new?role=teacher', icon: <Users className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Add Learner', href: '/dashboard/admin/users/new?role=learner', icon: <GraduationCap className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
    { label: 'Manage Content', href: '/dashboard/admin/content', icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Schools"
          value={data.stats.schools}
          icon={<Building2 className="w-6 h-6" />}
          color="indigo"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Learners"
          value={data.stats.learners}
          icon={<GraduationCap className="w-6 h-6" />}
          color="blue"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Teachers"
          value={data.stats.teachers}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value={data.stats.classes}
          icon={<BookOpen className="w-6 h-6" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard title="Platform Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProgressCard
                title="CAPS Coverage Progress"
                progress={data.capsProgress}
                subtitle="Curriculum content uploaded"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="indigo"
              />
              <ProgressCard
                title="Practical Assessments"
                progress={data.practicalAssessments}
                subtitle="Completion rate across schools"
                icon={<TrendingUp className="w-5 h-5" />}
                color="emerald"
              />
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-slate-800 mb-4">LMS Subscription & Infrastructure</h4>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center">
                  <Server className="w-8 h-8 text-slate-400 mr-4" />
                  <div>
                    <p className="font-medium text-slate-800">System Status</p>
                    <p className="text-sm text-emerald-600 font-medium">All services operational</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  View Logs
                </button>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Schools">
            {data.recentSchools.length > 0 ? (
              <div className="space-y-4">
                {data.recentSchools.map((school: any) => (
                  <div key={school.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-slate-800">{school.name}</p>
                      <p className="text-xs text-slate-500">{school.location || 'Location not specified'}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      {school.subscription_status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Schools Yet" 
                description="Get started by adding your first school to the platform."
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

          <DashboardCard title="Recent Activity">
            <ActivityFeed activities={[
              { id: '1', title: 'New School Onboarded', description: 'Curro Academy registered on the platform.', time: '2 hours ago', icon: <Building2 className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
              { id: '2', title: 'Content Update', description: 'Term 2 Robotics module published.', time: '5 hours ago', icon: <BookOpen className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
              { id: '3', title: 'System Backup', description: 'Automated database backup completed.', time: '1 day ago', icon: <Server className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600' },
            ]} />
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
