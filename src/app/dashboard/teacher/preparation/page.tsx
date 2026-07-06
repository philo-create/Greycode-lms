'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BookOpen, BookText, ArrowRight, Book, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { CURRICULUM_LESSONS } from '@/curriculumData';
import { fetchLessonStatuses } from '@/lib/lesson-status-service';
import { LessonStatus } from '@/types';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import { GradeType, UserProgress } from '@/types';

export default function TeacherPreparationPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  });
  const [teacherId, setTeacherId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});

  useEffect(() => {
    async function fetchLessons() {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch teacher profile to get assigned grades and school_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('grade, school_id')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setTeacherId(session.user.id);
          // We will fetch statuses when activeGrade changes, but we can do an initial fetch if grade is single
        }

        if (profileError) throw profileError;

        // Grades from profile (comma-separated)
        const profileGrades = profileData?.grade ? profileData.grade.split(',').map((g: string) => g.trim()) : [];

        // Fetch classes assigned to this teacher to get grades as fallback/addition
        const { data: teacherClasses, error: classesError } = await supabase
          .from('classes')
          .select('grade, school_id')
          .eq('teacher_id', session.user.id);

        if (classesError) throw classesError;

        const classGrades = teacherClasses?.map(c => c.grade) || [];
        
        // Resolve school_id with fallback to classes
        let resolvedSchoolId = profileData?.school_id || '';
        if (!resolvedSchoolId && teacherClasses) {
          const classWithSchool = teacherClasses.find(c => c.school_id);
          if (classWithSchool) {
            resolvedSchoolId = classWithSchool.school_id;
          }
        }
        if (resolvedSchoolId) {
          setSchoolId(resolvedSchoolId);
        }
        
        // Combine all unique grades
        const grades = Array.from(new Set([...profileGrades, ...classGrades])).sort((a, b) => {
          if (a === 'R') return -1;
          if (b === 'R') return 1;
          return a.localeCompare(b);
        });
        
        setAvailableGrades(grades);

        if (grades.length > 0) {
          // Use hardcoded CURRICULUM_LESSONS and filter by grade
          const filteredLessons = CURRICULUM_LESSONS.filter(lesson => grades.includes(lesson.grade));
          setLessons(filteredLessons);
        } else {
          setLessons([]);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  useEffect(() => {
    if (!schoolId || !activeGrade) return;
    async function loadStatuses() {
      try {
        const statuses = await fetchLessonStatuses(schoolId, activeGrade);
        setLessonStatuses(statuses);
      } catch (err) {
        console.error('Failed to load lesson statuses for teacher:', err);
      }
    }
    loadStatuses();
  }, [schoolId, activeGrade]);

  const handleUpdateProgress = (weekKey: string, starsEarned: number, marksPossible?: number) => {
    setProgress(prev => {
      const previousStarsForWeek = prev.starsEarned[weekKey] || 0;
      const newCompleted = { ...prev.completedWeeks, [weekKey]: true };
      const newStars = { ...prev.starsEarned, [weekKey]: Math.max(previousStarsForWeek, starsEarned) };
      const newPossible = { ...(prev.marksPossible || {}) };
      
      if (marksPossible !== undefined) {
        newPossible[weekKey] = Math.max(newPossible[weekKey] || marksPossible, marksPossible);
      } else if (newPossible[weekKey] === undefined) {
        newPossible[weekKey] = 3;
      }
      
      const newTotal = (Object.values(newStars) as number[]).reduce((sum, current) => sum + current, 0);
      
      const updatedProgress = {
        ...prev,
        completedWeeks: newCompleted,
        starsEarned: newStars,
        totalStars: newTotal,
        marksPossible: newPossible
      };

      if (supabase && teacherId) {
        supabase.from('profiles').update({ progress: updatedProgress }).eq('id', teacherId).then(({ error }) => {
          if (error) console.error('Failed to update teacher progress:', error);
        });
      }

      return updatedProgress;
    });
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading your preparation materials..." />
      </DashboardLayout>
    );
  }

  

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Preparation</h1>
          <p className="text-slate-500">View lessons and curriculum for your assigned grades</p>
        </div>
      </div>

      {!activeGrade ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Select a Grade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {availableGrades.length > 0 ? (
              availableGrades.map((grade) => {
                const lessonCount = lessons.filter(l => l.grade === grade).length;
                return (
                  <div 
                    key={grade} 
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group active:scale-95" 
                    onClick={() => setActiveGrade(grade)}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveGrade(grade)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-transform">
                        {grade}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Grade {grade}</h3>
                        <p className="text-sm text-slate-500">{lessonCount} Lessons available</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <DashboardCard>
                  <EmptyState 
                    title="No Grades Assigned"
                    description="You do not have any grades assigned to your profile."
                    icon={<BookOpen className="w-12 h-12 text-slate-300" />}
                  />
                </DashboardCard>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setActiveGrade(null)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Grades</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <Dashboard 
              activeStudentId={teacherId}
              teacherId={teacherId}
              grade={activeGrade as GradeType}
              progress={progress}
              updateProgress={handleUpdateProgress}
              onExit={() => setActiveGrade(null)}
              schoolId={schoolId}
              lessonStatuses={lessonStatuses}
              setLessonStatuses={setLessonStatuses}
              isTeacherPreparation={true}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
