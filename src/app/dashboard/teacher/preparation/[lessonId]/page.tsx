
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import Dashboard from '@/components/Dashboard';
import { GradeType, UserProgress, StudentProfile, LessonStatus } from '@/types';
import { CURRICULUM_LESSONS } from '@/curriculumData';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchLessonStatuses } from '@/lib/lesson-status-service';

const mockTeacherStudent: StudentProfile = {
  id: 'teacher_mock',
  name: 'Teacher',
  role: 'teacher',
  grade: 'R',
  avatar: '👩‍🏫',
  pin: '0000',
  progress: {
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  }
};

export default function TeacherLessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  
  const lesson = CURRICULUM_LESSONS.find(l => l.id === lessonId);
  const selectedGrade = lesson ? lesson.grade : 'R';
  
  const [progress, setProgress] = useState<UserProgress>(mockTeacherStudent.progress);
  const [schoolId, setSchoolId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    async function initTeacherContext() {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoadingContext(false);
          return;
        }

        setTeacherId(session.user.id);

        // Fetch teacher profile to get assigned grades and school_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('grade, school_id')
          .eq('id', session.user.id)
          .single();

        // Fetch classes assigned to this teacher
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('grade, school_id')
          .eq('teacher_id', session.user.id);

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
          // Fetch lesson statuses for this school and grade
          const statuses = await fetchLessonStatuses(resolvedSchoolId, selectedGrade);
          setLessonStatuses(statuses);
        }
      } catch (err) {
        console.error('Error initializing teacher context in lesson preview:', err);
      } finally {
        setLoadingContext(false);
      }
    }

    initTeacherContext();
  }, [selectedGrade]);

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

  if (!lesson) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="p-8 text-center text-slate-500">Lesson not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/dashboard/teacher/preparation')} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h2 className="font-bold text-sm">Previewing: {lesson.title}</h2>
          </div>
          <div className="text-xs text-slate-400">Teacher Viewer</div>
        </div>
        
        <div className="min-h-[70vh]">
          {loadingContext ? (
            <div className="p-8 text-center text-slate-500">Loading lesson context...</div>
          ) : (
            <Dashboard 
              activeStudentId={mockTeacherStudent.id}
              grade={selectedGrade as GradeType}
              progress={progress}
              updateProgress={updateProgress}
              onExit={() => router.push('/dashboard/teacher/preparation')}
              initialLessonId={lessonId}
              isTeacherPreparation={true}
              schoolId={schoolId}
              teacherId={teacherId}
              lessonStatuses={lessonStatuses}
              setLessonStatuses={setLessonStatuses}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
