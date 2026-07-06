'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BookOpen, CheckCircle, Lock, Unlock, School, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { CURRICULUM_LESSONS } from '@/curriculumData';
import { LessonStatus, GradeType, UserProgress } from '@/types';
import { fetchLessonStatuses, updateLessonStatus } from '@/lib/lesson-status-service';
import Dashboard from '@/components/Dashboard';

export default function AdminCurriculumPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [schoolStatuses, setSchoolStatuses] = useState<Record<string, LessonStatus>>({});
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [gradeViewModes, setGradeViewModes] = useState<Record<string, 'list' | 'interactive'>>({});
  const [progress, setProgress] = useState<UserProgress>({
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  });

  const updateProgress = (weekKey: string, starsEarned: number, marksPossible?: number) => {
    setProgress(prev => {
      const newCompleted = { ...prev.completedWeeks, [weekKey]: true };
      const newStars = { ...prev.starsEarned, [weekKey]: Math.max(prev.starsEarned[weekKey] || 0, starsEarned) };
      const newPossible = { ...prev.marksPossible, [weekKey]: marksPossible || 3 };
      const newTotal = Object.values(newStars).reduce((sum, current) => sum + current, 0);

      return {
        ...prev,
        completedWeeks: newCompleted,
        starsEarned: newStars,
        totalStars: newTotal,
        marksPossible: newPossible
      };
    });
  };

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      try {
        const { data: schoolsData, error } = await supabase.from('schools').select('*').order('name');
        if (error) throw error;
        setSchools(schoolsData || []);
      } catch (err) {
        console.error('Error fetching schools:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const loadSchoolCurriculum = async (school: any) => {
    setSelectedSchool(school);
    const statuses = await fetchLessonStatuses(school.id);
    setSchoolStatuses(statuses);
  };

  const handleApprove = async (lessonId: string, grade: string) => {
    if (!selectedSchool) return;
    
    await updateLessonStatus(selectedSchool.id, grade, lessonId, 'unlocked_for_students');
    
    const currentIndex = CURRICULUM_LESSONS.findIndex(l => l.id === lessonId);
    if (currentIndex !== -1 && currentIndex + 1 < CURRICULUM_LESSONS.length) {
      const nextLesson = CURRICULUM_LESSONS[currentIndex + 1];
      await updateLessonStatus(selectedSchool.id, grade, nextLesson.id, 'teacher_unlocked');
    }

    const statuses = await fetchLessonStatuses(selectedSchool.id);
    setSchoolStatuses(statuses);
  };

  const getStatusBadge = (status: LessonStatus | undefined, isWeek1: boolean) => {
    if (!status && isWeek1) {
       return <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full flex items-center gap-1"><Unlock className="w-3 h-3"/> Teacher Unlocked (Default)</span>;
    }
    if (!status || status === 'locked') {
      return <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full flex items-center gap-1"><Lock className="w-3 h-3"/> Locked</span>;
    }
    if (status === 'teacher_unlocked') {
      return <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full flex items-center gap-1"><Unlock className="w-3 h-3"/> Teacher Unlocked</span>;
    }
    if (status === 'pending_approval') {
      return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3"/> Pending Approval</span>;
    }
    if (status === 'unlocked_for_students') {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved for Students</span>;
    }
  };

  const grades = ['R', '1', '2', '3'];

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['super_admin']}>
        <LoadingState message="Loading curriculum tools..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Curriculum Approvals</h1>
          <p className="text-slate-500">Manage lesson unlocks for each school</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Schools</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {schools.map(school => (
              <button
                key={school.id}
                onClick={() => loadSchoolCurriculum(school)}
                className={`w-full flex items-center gap-3 p-4 text-left transition ${selectedSchool?.id === school.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{school.name}</h3>
                  <p className="text-xs text-slate-500">Manage Curriculum</p>
                </div>
              </button>
            ))}
            {schools.length === 0 && (
               <div className="p-8 text-center text-slate-500 text-sm">No schools found.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!selectedSchool ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-64">
               <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
               <h3 className="text-lg font-bold text-slate-600">Select a School</h3>
               <p className="text-slate-400">Choose a school from the list to view and approve lesson unlocks.</p>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">{selectedSchool.name} Curriculum</h2>
                   <p className="text-sm text-slate-500">Approve prepared lessons to unlock them for students.</p>
                 </div>
              </div>

              {grades.map(grade => {
                 const gradeLessons = CURRICULUM_LESSONS.filter(l => l.grade === grade);
                 if (gradeLessons.length === 0) return null;
                 
                 const pendingCount = gradeLessons.filter(l => schoolStatuses[l.id] === 'pending_approval').length;
                 
                 return (
                   <div key={grade} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <button 
                       onClick={() => setExpandedGrade(expandedGrade === grade ? null : grade)}
                       className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition"
                     >
                       <div className="flex items-center gap-3">
                         <span className="w-8 h-8 bg-indigo-100 text-indigo-700 font-black rounded-lg flex items-center justify-center">
                           {grade}
                         </span>
                         <h3 className="font-bold text-slate-800">Grade {grade}</h3>
                       </div>
                       {pendingCount > 0 && (
                         <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full flex items-center gap-1 animate-pulse">
                           {pendingCount} Pending Approval
                         </span>
                       )}
                     </button>
                     
                     {expandedGrade === grade && (
                       <div className="border-t border-slate-200">
                          {/* Tabs for switching views */}
                          <div className="flex border-b border-slate-200 bg-slate-50/50 px-4">
                            <button
                              onClick={() => setGradeViewModes(prev => ({ ...prev, [grade]: 'interactive' }))}
                              className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                                (gradeViewModes[grade] || 'interactive') === 'interactive'
                                  ? 'border-indigo-600 text-indigo-600'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              🗺️ Interactive Student Map (Super Admin)
                            </button>
                            <button
                              onClick={() => setGradeViewModes(prev => ({ ...prev, [grade]: 'list' }))}
                              className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                                gradeViewModes[grade] === 'list'
                                  ? 'border-indigo-600 text-indigo-600'
                                  : 'border-transparent text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              📋 Quick Approval List
                            </button>
                          </div>

                          {(gradeViewModes[grade] || 'interactive') === 'interactive' ? (
                            <div className="p-4 bg-slate-50/20 min-h-[500px]">
                              <Dashboard 
                                activeStudentId="super_admin_mock"
                                grade={grade as GradeType}
                                progress={progress}
                                updateProgress={updateProgress}
                                onExit={() => setExpandedGrade(null)}
                                isSuperAdmin={true}
                                schoolId={selectedSchool.id}
                                lessonStatuses={schoolStatuses}
                                setLessonStatuses={setSchoolStatuses}
                              />
                            </div>
                          ) : (
                            <div className="p-4 divide-y divide-slate-100">
                         {gradeLessons.map(lesson => {
                           const status = schoolStatuses[lesson.id];
                           const isWeek1 = lesson.term === 1 && lesson.week === 1;
                           const isPending = status === 'pending_approval';
                           
                           return (
                             <div key={lesson.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div>
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className="text-xs font-bold text-slate-400">TERM {lesson.term} • WEEK {lesson.week}</span>
                                   {getStatusBadge(status, isWeek1)}
                                 </div>
                                 <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                               </div>
                               
                               {isPending && (
                                 <button
                                   onClick={() => handleApprove(lesson.id, grade)}
                                   className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                                 >
                                   Approve & Unlock Next
                                 </button>
                               )}
                             </div>
                           );
                         })}
                            </div>
                          )}
                        </div>
                      )}
                   </div>
                 );
              })}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
