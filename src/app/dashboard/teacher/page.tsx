
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
import { CURRICULUM_LESSONS } from '@/curriculumData';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, BookOpen, PlayCircle, ClipboardCheck, 
  Target, TrendingUp, Clock, CheckCircle2, Sparkles, Megaphone, X, Plus, LineChart,
  Sliders, Settings, AlertCircle, ChevronDown, ChevronUp, Cpu, Globe, Laptop
} from 'lucide-react';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom School Assessment Weights State
  const [weights, setWeights] = useState({
    test: 45,
    'practical test': 30,
    classwork: 15,
    home: 10,
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmState, setConfirmState] = useState<'none' | 'save' | 'reset'>('none');

  // Load custom weights from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('school_assessment_weights');
      if (stored) {
        try {
          setWeights(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading custom weights:', e);
        }
      }
    }
  }, []);

  const totalWeight = (weights.test || 0) + (weights['practical test'] || 0) + (weights.classwork || 0) + (weights.home || 0);

  // Dynamic CAPS Strand Progress calculation based on current students
  const strandProgress = React.useMemo(() => {
    if (!data?.students || data.students.length === 0) {
      return { Coding: 0, Robotics: 0, Digital: 0, totalRelevant: 0 };
    }

    const teacherGrades = Array.from(new Set(data.students.map((s: any) => s.grade).filter(Boolean))) as string[];
    const activeGrades = teacherGrades.length > 0 ? teacherGrades : ['R', '1', '2', '3'];
    
    const relevantLessons = CURRICULUM_LESSONS.filter(l => activeGrades.includes(l.grade));
    
    const lessonsByStrand = {
      Coding: relevantLessons.filter(l => l.strand === 'Coding'),
      Robotics: relevantLessons.filter(l => l.strand === 'Robotics'),
      Digital: relevantLessons.filter(l => l.strand === 'Digital'),
    };

    const completedByStrand = { Coding: 0, Robotics: 0, Digital: 0 };

    data.students.forEach((student: any) => {
      let progressObj = student.progress;
      if (typeof progressObj === 'string') {
        try {
          progressObj = JSON.parse(progressObj);
        } catch (e) {
          progressObj = {};
        }
      }
      
      const completedWeeks = progressObj?.completedWeeks || {};
      Object.keys(completedWeeks).forEach(lessonId => {
        if (completedWeeks[lessonId]) {
          const lesson = CURRICULUM_LESSONS.find(l => l.id === lessonId);
          if (lesson && (lesson.strand === 'Coding' || lesson.strand === 'Robotics' || lesson.strand === 'Digital')) {
            completedByStrand[lesson.strand as 'Coding' | 'Robotics' | 'Digital'] += 1;
          }
        }
      });
    });

    const numStudents = data.students.length;
    
    const getPercentage = (strand: 'Coding' | 'Robotics' | 'Digital') => {
      const totalLessons = lessonsByStrand[strand].length;
      if (totalLessons === 0) return 0;
      const totalPossible = totalLessons * numStudents;
      return Math.min(100, Math.round((completedByStrand[strand] / totalPossible) * 100));
    };

    return {
      Coding: getPercentage('Coding'),
      Robotics: getPercentage('Robotics'),
      Digital: getPercentage('Digital'),
      totalRelevant: relevantLessons.length,
    };
  }, [data?.students]);

  const handleSaveWeights = () => {
    if (totalWeight !== 100) {
      return;
    }
    localStorage.setItem('school_assessment_weights', JSON.stringify(weights));
    setSuccessMsg('Weights updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetWeights = () => {
    const defaultWeights = {
      test: 45,
      'practical test': 30,
      classwork: 15,
      home: 10,
    };
    setWeights(defaultWeights);
    localStorage.setItem('school_assessment_weights', JSON.stringify(defaultWeights));
    setSuccessMsg('Reset to default weights!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const loadData = async () => {
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
  };

  useEffect(() => {
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
    { label: 'Tests & Exams', href: '/dashboard/teacher/tests', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Capture Marks', href: '/dashboard/teacher/assessments', icon: <Target className="w-5 h-5" />, color: 'text-rose-600 bg-rose-100' },
    { label: 'Assign Homework', href: '/dashboard/teacher/assignments', icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'New Announcement', href: '/dashboard/teacher/announcements', icon: <Megaphone className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100', variant: 'primary' },
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
            <DashboardCard title="CAPS Strands Analysis">
              <div className="space-y-4">
                {/* Algorithms & Coding */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      Algorithms & Coding
                    </span>
                    <span className="text-xs font-black text-indigo-600">{strandProgress.Coding}%</span>
                  </div>
                  <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${strandProgress.Coding}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Patterns, Grid Coding, Logical Sequences</p>
                </div>

                {/* Robotics & Automation */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-rose-500" />
                      Robotics & Automation
                    </span>
                    <span className="text-xs font-black text-rose-600">{strandProgress.Robotics}%</span>
                  </div>
                  <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${strandProgress.Robotics}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Mechanical Systems, Electrical, Microcontrollers</p>
                </div>

                {/* Digital Skills & Citizenship */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      Digital Skills & Citizenship
                    </span>
                    <span className="text-xs font-black text-emerald-600">{strandProgress.Digital}%</span>
                  </div>
                  <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${strandProgress.Digital}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Safe Device Use, Digital Concepts, e-Communication</p>
                </div>
              </div>
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

          <DashboardCard title="Class Register">
            {data.students && data.students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Grade</th>
                      <th className="px-4 py-3 font-medium">Joined Date</th>
                      <th className="px-4 py-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.students.map((student: any) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          Grade {student.grade || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                            <Link 
                              href={`/dashboard/teacher/student/${student.id}`}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Analytics"
                            >
                              <LineChart className="w-5 h-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                title="No Students" 
                description="There are no students registered in your classes yet."
                icon={<Users className="h-10 w-10 text-slate-300" />}
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

          <DashboardCard 
            title="Assessment Weights Setup"
            action={
              <button
                onClick={() => {
                  setIsExpanded(!isExpanded);
                  setConfirmState('none');
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors font-extrabold text-[11px] bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Hide Setup
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Expand Setup
                  </>
                )}
              </button>
            }
          >
            <div className="p-4 space-y-4">
              {successMsg && (
                <div className="p-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {successMsg}
                </div>
              )}

              {!isExpanded ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between text-[11px] bg-slate-50/50 border border-slate-100/80 rounded-xl p-2.5">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      T: {weights.test}% • P: {weights['practical test']}% • C: {weights.classwork}% • H: {weights.home}%
                    </span>
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-indigo-600 hover:text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100/80 px-2 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Set custom weighting for different assessment categories. The sum of all categories must be exactly <strong>100%</strong>.
                  </p>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Tests / Exams
                        </span>
                        <span className="text-rose-600 font-extrabold">{weights.test}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={weights.test} 
                        onChange={(e) => {
                          setWeights({ ...weights, test: parseInt(e.target.value) || 0 });
                          setConfirmState('none');
                        }}
                        className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Practical Tests
                        </span>
                        <span className="text-purple-600 font-extrabold">{weights['practical test']}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={weights['practical test']} 
                        onChange={(e) => {
                          setWeights({ ...weights, 'practical test': parseInt(e.target.value) || 0 });
                          setConfirmState('none');
                        }}
                        className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Classwork
                        </span>
                        <span className="text-blue-600 font-extrabold">{weights.classwork}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={weights.classwork} 
                        onChange={(e) => {
                          setWeights({ ...weights, classwork: parseInt(e.target.value) || 0 });
                          setConfirmState('none');
                        }}
                        className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Homework
                        </span>
                        <span className="text-emerald-600 font-extrabold">{weights.home}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={weights.home} 
                        onChange={(e) => {
                          setWeights({ ...weights, home: parseInt(e.target.value) || 0 });
                          setConfirmState('none');
                        }}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {confirmState === 'none' ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-black">
                          Total:{' '}
                          <span className={totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}>
                            {totalWeight}%
                          </span>
                          {totalWeight !== 100 && (
                            <span className="block text-[9px] font-bold text-rose-500">Must equal 100%</span>
                          )}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setConfirmState('reset')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                          >
                            Reset Defaults
                          </button>
                          <button
                            onClick={() => setConfirmState('save')}
                            disabled={totalWeight !== 100}
                            className={`px-3 py-1.5 font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer ${
                              totalWeight === 100 
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Save Weights
                          </button>
                        </div>
                      </div>
                    ) : confirmState === 'save' ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1">
                        <div className="flex gap-2 items-start text-amber-800">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-[11px] font-extrabold leading-tight">Confirm Weight Changes</p>
                            <p className="text-[10px] font-bold leading-normal text-amber-700 mt-0.5">
                              Are you sure you want to change assessment weights? All student report averages will be updated instantly.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmState('none')}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleSaveWeights();
                              setConfirmState('none');
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Yes, Save Weights
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-1">
                        <div className="flex gap-2 items-start text-rose-800">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                          <div>
                            <p className="text-[11px] font-extrabold leading-tight">Reset to Defaults</p>
                            <p className="text-[10px] font-bold leading-normal text-rose-700 mt-0.5">
                              Are you sure you want to reset all weights to standard defaults (Tests: 45%, Practical: 30%, Classwork: 15%, Homework: 10%)?
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmState('none')}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleResetWeights();
                              setConfirmState('none');
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all shadow-xs cursor-pointer"
                          >
                            Yes, Reset Weights
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
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
