
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
  CheckCircle, XCircle, Mail, Settings, Send, HelpCircle, Info, Lock
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

const SIGNUP_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang='en'>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #4f46e5; padding: 32px; text-align: center; color: #ffffff; }
    .content { padding: 32px; line-height: 1.6; }
    .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 24px 0; text-align: center; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #64748b; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Greycode Academy</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-top: 0;"><b>Welcome to Greycode Academy!</b></p>
      <p>Thank you for signing up. To complete your registration and verify your email, please click the button below:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button" target="_blank">Confirm My Account</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">If the button above does not work, please copy and paste the following link into your browser:</p>
      <p style="font-size: 12px; word-break: break-all; color: #4f46e5;"><a href="{{ .ConfirmationURL }}" target="_blank">{{ .ConfirmationURL }}</a></p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 13px; color: #64748b;">Note: After verification, a school administrator will review and approve your account enrollment status.</p>
    </div>
    <div class="footer">
      &copy; 2026 Greycode Academy. All rights reserved.
    </div>
  </div>
</body>
</html>`;

const PASSWORD_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang='en'>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: #4f46e5; padding: 32px; text-align: center; color: #ffffff; }
    .content { padding: 32px; line-height: 1.6; }
    .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 24px 0; text-align: center; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #64748b; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Greycode Academy</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; margin-top: 0;"><b>Set Up or Reset Your Password</b></p>
      <p>We received a request to set up or change the password for your Greycode Academy account. Click the button below to choose your secure password:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button" target="_blank">Set Up New Password</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; word-break: break-all; color: #4f46e5;"><a href="{{ .ConfirmationURL }}" target="_blank">{{ .ConfirmationURL }}</a></p>
    </div>
    <div class="footer">
      &copy; 2026 Greycode Academy. All rights reserved.
    </div>
  </div>
</body>
</html>`;

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // Zoho SMTP Custom test states
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [showZohoDocs, setShowZohoDocs] = useState(false);
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<'signup' | 'password'>('signup');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [useCustomCreds, setUseCustomCreds] = useState(false);
  const [customUser, setCustomUser] = useState('');
  const [customPass, setCustomPass] = useState('');
  const [smtpEnvConfigured, setSmtpEnvConfigured] = useState<boolean | null>(null);
  const [smtpServerUser, setSmtpServerUser] = useState<string | null>(null);

  const handleTestZohoEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    
    // Client-side credentials validation to prevent confusing errors
    if (!smtpEnvConfigured && !useCustomCreds) {
      setTestStatus('error');
      setTestErrorMessage('Please check "Use custom test credentials" and enter your Zoho User Email and App Password to run the test.');
      return;
    }

    if (useCustomCreds && (!customUser || !customPass)) {
      setTestStatus('error');
      setTestErrorMessage('Please fill in both the Zoho User Email and App Password.');
      return;
    }

    setTestStatus('sending');
    setTestErrorMessage('');
    try {
      const payload: any = { testRecipient: testEmail };
      if (useCustomCreds) {
        payload.customUser = customUser;
        payload.customPass = customPass;
      }
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Failed to send test email');
      }
      setTestStatus('success');
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setTestErrorMessage(err.message || 'Unknown error occurred while sending email.');
    }
  };

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
          const status = p.enrollment_status || (p.role === 'learner' ? 'pending' : 'approved');
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
    
    async function checkSmtpStatus() {
      try {
        const res = await fetch('/api/email/test');
        const result = await res.json();
        setSmtpEnvConfigured(!!result.configured);
        setSmtpServerUser(result.user || null);
        if (!result.configured) {
          setUseCustomCreds(true);
        }
      } catch (err) {
        console.warn('Failed to check SMTP setup on server:', err);
      }
    }

    loadData();
    checkSmtpStatus();
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

          <DashboardCard title="Zoho Email Integration 📧">
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                By default, auth emails say "Supabase". Connect your Zoho Mail to brand them and remove generic mentions.
              </p>

              {/* Document toggle button */}
              <button
                onClick={() => setShowZohoDocs(!showZohoDocs)}
                className="w-full flex items-center justify-between p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>How to setup Zoho in Supabase</span>
                </div>
                {showZohoDocs ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {showZohoDocs && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-3 text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800">Follow these simple steps in your Supabase Dashboard:</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Log into your <b>Supabase Dashboard</b>.</li>
                    <li>Go to <b>Project Settings</b> &rarr; <b>Auth</b>.</li>
                    <li>Scroll down to the <b>SMTP Settings</b> section.</li>
                    <li>Toggle on <b>Enable Custom SMTP</b>.</li>
                    <li>Fill in these <b>Zoho SMTP</b> details:
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px] text-slate-500">
                        <li><b>Sender Email:</b> Your Zoho email (e.g. hello@domain.com)</li>
                        <li><b>Sender Name:</b> E.g., "Greycode Academy"</li>
                        <li><b>SMTP Host:</b> <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-600 font-mono">smtp.zoho.com</code> (or <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-600 font-mono">smtp.zoho.eu</code>)</li>
                        <li><b>Port:</b> <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-600 font-mono">465</code> (SSL) or <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-600 font-mono">587</code> (TLS)</li>
                        <li><b>Username:</b> Your Zoho email</li>
                        <li><b>Password:</b> Your Zoho <i>App Password</i> (create this in your Zoho Security Account settings under App Passwords)</li>
                      </ul>
                    </li>
                    <li>Save settings.</li>
                    <li>Go to <b>Auth</b> &rarr; <b>Email Templates</b> &rarr; <b>Confirm Signup</b> to edit the text and completely remove any references to Supabase!</li>
                  </ol>
                  <div className="p-2 bg-indigo-50/50 rounded flex items-start gap-2 text-[11px] text-indigo-700 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Using an "App Password" is required by Zoho if multi-factor auth is enabled.</span>
                  </div>
                </div>
              )}

              {/* Email templates toggle button */}
              <button
                onClick={() => setShowEmailTemplates(!showEmailTemplates)}
                className="w-full flex items-center justify-between p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-2"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Branded Email Templates for Supabase</span>
                </div>
                {showEmailTemplates ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {showEmailTemplates && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-3 text-slate-600 leading-relaxed text-left">
                  <p className="font-semibold text-slate-800">
                    Copy and paste these pre-formatted HTML templates into your <b>Supabase Dashboard</b> under <b>Auth &rarr; Email Templates</b> to ensure high-end branding:
                  </p>

                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateTab('signup')}
                      className={`flex-1 py-1.5 text-center font-bold text-xs border-b-2 transition-all ${
                        selectedTemplateTab === 'signup'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Confirm Signup (Welcome)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateTab('password')}
                      className={`flex-1 py-1.5 text-center font-bold text-xs border-b-2 transition-all ${
                        selectedTemplateTab === 'password'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Confirm Password Setup / Reset
                    </button>
                  </div>

                  {selectedTemplateTab === 'signup' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">Subject: Confirm your registration on Greycode Academy</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('Confirm your registration on Greycode Academy');
                            setCopiedType('subject_signup');
                            setTimeout(() => setCopiedType(null), 2000);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 transition font-bold text-slate-600"
                        >
                          {copiedType === 'subject_signup' ? 'Copied!' : 'Copy Subject'}
                        </button>
                      </div>
                      <div className="relative">
                        <textarea
                          readOnly
                          value={SIGNUP_EMAIL_TEMPLATE}
                          className="w-full h-48 p-2 font-mono text-[10px] bg-white border border-slate-200 rounded-lg focus:outline-none resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(SIGNUP_EMAIL_TEMPLATE);
                            setCopiedType('body_signup');
                            setTimeout(() => setCopiedType(null), 2000);
                          }}
                          className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 text-white rounded text-[11px] hover:bg-indigo-700 transition font-bold shadow-sm"
                        >
                          {copiedType === 'body_signup' ? 'Copied HTML!' : 'Copy HTML Template'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">Subject: Set up your password on Greycode Academy</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('Set up your password on Greycode Academy');
                            setCopiedType('subject_password');
                            setTimeout(() => setCopiedType(null), 2000);
                          }}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 transition font-bold text-slate-600"
                        >
                          {copiedType === 'subject_password' ? 'Copied!' : 'Copy Subject'}
                        </button>
                      </div>
                      <div className="relative">
                        <textarea
                          readOnly
                          value={PASSWORD_EMAIL_TEMPLATE}
                          className="w-full h-48 p-2 font-mono text-[10px] bg-white border border-slate-200 rounded-lg focus:outline-none resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(PASSWORD_EMAIL_TEMPLATE);
                            setCopiedType('body_password');
                            setTimeout(() => setCopiedType(null), 2000);
                          }}
                          className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 text-white rounded text-[11px] hover:bg-indigo-700 transition font-bold shadow-sm"
                        >
                          {copiedType === 'body_password' ? 'Copied HTML!' : 'Copy HTML Template'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-emerald-50/50 rounded text-[11px] text-emerald-800 font-medium text-left">
                    💡 <b>How to install:</b> Paste these inside Supabase Dashboard &rarr; <b>Auth</b> &rarr; <b>Email Templates</b> for <b>Confirm signup</b> and <b>Reset password</b>.
                  </div>
                </div>
              )}

              {/* SMTP configuration status indicator */}
              <div className="border-t border-slate-150 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700">Notification Server:</span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                    ● Manual Supabase Setup Active
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-lg text-xs text-emerald-800 space-y-1.5 mb-4 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Branded Zoho Emails Configured</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Since you configured Zoho Custom SMTP directly in your Supabase Dashboard, all authentication and verification emails are fully handled and branded under your custom domain. No Supabase branding will appear!
                  </p>
                  {smtpEnvConfigured === true && smtpServerUser && (
                    <div className="text-[10px] text-emerald-800 font-mono mt-1 pt-1 border-t border-emerald-100/60">
                      Server API Fallback: Configured for {smtpServerUser}
                    </div>
                  )}
                  {smtpEnvConfigured === false && (
                    <div className="text-[10px] text-amber-800 font-medium mt-1 pt-1 border-t border-emerald-100/40">
                      ℹ️ To run custom test sends from this Next.js dashboard, use the form below with "custom test credentials" checked.
                    </div>
                  )}
                </div>

                {/* SMTP Test Tool */}
                <form onSubmit={handleTestZohoEmail} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                      Send Zoho Test Email
                    </label>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useCustomCreds}
                        onChange={(e) => setUseCustomCreds(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                      />
                      <span>Use custom test credentials</span>
                    </label>
                  </div>

                  {useCustomCreds && (
                    <div className="space-y-2 p-2.5 bg-white rounded-lg border border-slate-150 text-[11px] space-y-2">
                      <p className="text-[10.5px] text-slate-400 font-medium mb-1">
                        These credentials are only used for this test send session and are not stored.
                      </p>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-0.5">Zoho User Email</label>
                        <input
                          type="email"
                          required={useCustomCreds}
                          placeholder="your-email@domain.com"
                          value={customUser}
                          onChange={(e) => setCustomUser(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-0.5">Zoho App Password</label>
                        <input
                          type="password"
                          required={useCustomCreds}
                          placeholder="••••••••••••••••"
                          value={customPass}
                          onChange={(e) => setCustomPass(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="recipient@domain.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={testStatus === 'sending'}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:bg-indigo-400 cursor-pointer shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      {testStatus === 'sending' ? 'Sending...' : 'Test Send'}
                    </button>
                  </div>

                  {testStatus === 'success' && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Success! Test email sent. Check inbox.
                    </p>
                  )}
                  {testStatus === 'error' && (
                    <div className="p-2 bg-rose-50 border border-rose-100 rounded text-[11px] text-rose-700 font-semibold mt-1 leading-relaxed">
                      ❌ {testErrorMessage}
                    </div>
                  )}
                </form>
              </div>
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
