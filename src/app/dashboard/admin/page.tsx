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
import { CURRICULUM_LESSONS, GRADES } from '@/curriculumData';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Building2, Users, GraduationCap, BookOpen, 
  PlusCircle, FileText, CheckCircle2, TrendingUp,
  Clock, Server, ChevronDown, ChevronRight, BookOpenCheck, PlayCircle,
  CheckCircle, XCircle
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const loadPendingRequests = async () => {
    if (!supabase) return;
    try {
      setPendingError(null);
      
      // Fetch schools to build a lookup map
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name');
        
      if (schoolsError) {
        console.warn('Error fetching schools in loadPendingRequests:', schoolsError);
      }
      
      const schoolsMap = new Map<string, { id: string, name: string }>();
      if (schoolsData) {
        schoolsData.forEach(s => schoolsMap.set(s.id, s));
      }

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error('Supabase profiles query error details:', JSON.stringify(profilesError));
        setPendingError(`${profilesError.message || 'No message'} (Code: ${profilesError.code || 'No code'})`);
        return;
      }
      
      if (profiles) {
        // Filter pending users
        const pendingProfiles = profiles.filter(p => {
          const status = p.enrollment_status || ((p.role === 'student' || p.role === 'learner') ? 'pending' : 'approved');
          return status === 'pending';
        });

        // Map schools to pending profiles
        const pendingData = pendingProfiles.map(p => {
          const matchedSchool = p.school_id ? schoolsMap.get(p.school_id) : null;
          return {
            ...p,
            schools: matchedSchool ? { id: matchedSchool.id, name: matchedSchool.name } : null,
            school: matchedSchool ? { id: matchedSchool.id, name: matchedSchool.name } : null
          };
        });

        setPendingRequests(pendingData);
      }
    } catch (err: any) {
      console.error('Failed to load pending system registrations:', err);
      setPendingError(err.message || 'Unknown query error');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const adminData = await getSuperAdminData();
        setData(adminData);
        await loadPendingRequests();
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRequestStatusChange = async (userId: string, newStatus: string) => {
    if (!supabase) return;
    setActioningId(userId);
    setPendingError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ enrollment_status: newStatus })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Update local pending requests
      setPendingRequests(prev => prev.filter(r => r.id !== userId));
      
      // Refresh statistics counts
      const adminData = await getSuperAdminData();
      setData(adminData);
    } catch (err: any) {
      console.error('Failed to update status for access request:', err);
      let msg = 'Unknown error';
      if (err?.message) msg = err.message;
      else if (err?.details) msg = err.details;
      else if (typeof err === 'object') msg = JSON.stringify(err);
      else if (typeof err === 'string') msg = err;
      
      setPendingError(`Failed to update status: ${msg}`);
    } finally {
      setActioningId(null);
    }
  };

  const toggleGrade = (gradeValue: string) => {
    setExpandedGrades(prev => ({
      ...prev,
      [gradeValue]: !prev[gradeValue]
    }));
  };

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
          <DashboardCard title="Pending System Access Requests ⏳">
            {pendingError ? (
              <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-sm font-semibold">
                ⚠️ Error loading access requests: {pendingError}
                <p className="text-xs text-rose-500 mt-1 font-normal">This can happen if you do not have permission, or if the database is syncing. Please check back shortly.</p>
              </div>
            ) : pendingRequests.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-slate-500">
                    New student, teacher, or admin accounts awaiting global system approval:
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">School</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {pendingRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {req.first_name} {req.last_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold capitalize">
                              {req.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {(() => {
                              const schoolData = req.schools || req.school;
                              if (!schoolData) return '-';
                              if (Array.isArray(schoolData)) {
                                return schoolData[0]?.name || '-';
                              }
                              return schoolData.name || '-';
                            })()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                disabled={actioningId === req.id}
                                onClick={() => handleRequestStatusChange(req.id, 'approved')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                                title="Approve registration"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                disabled={actioningId === req.id}
                                onClick={() => handleRequestStatusChange(req.id, 'rejected')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                                title="Deny registration"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs">There are currently no student, teacher, or admin accounts awaiting approval.</p>
              </div>
            )}
          </DashboardCard>

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

          <DashboardCard title="Curriculum Overview (All Lessons)">
            <div className="mb-4">
              <p className="text-sm text-slate-500">Overview of all curriculum content</p>
            </div>
            <div className="space-y-4">
              {GRADES.map(grade => {
                const isExpanded = expandedGrades[grade.value];
                const gradeLessons = CURRICULUM_LESSONS.filter(l => l.grade === grade.value);
                
                return (
                  <div key={grade.value} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleGrade(grade.value)}
                      className={`w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors ${isExpanded ? 'border-b border-slate-200' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${grade.color}`}>
                          <BookOpenCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-800">{grade.label}</h3>
                          <p className="text-xs text-slate-500">{gradeLessons.length} lessons available</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {gradeLessons.map(lesson => (
                          <div key={lesson.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <h4 className="font-medium text-sm text-slate-800">{lesson.title}</h4>
                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wider">
                                    Term {lesson.term} Week {lesson.week}
                                  </span>
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold uppercase tracking-wider">
                                    {lesson.strand}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 mb-2">{lesson.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {lesson.capsCode.map(code => (
                                  <span key={code} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/admin/lessons/${lesson.id}`}
                                className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-2"
                              >
                                <PlayCircle className="w-4 h-4" />
                                View Lesson
                              </Link>
                            </div>
                          </div>
                        ))}
                        {gradeLessons.length === 0 && (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            No lessons available for this grade yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
