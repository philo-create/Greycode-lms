
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import Dashboard from '@/components/Dashboard';
import { GradeType, UserProgress, StudentProfile } from '@/types';
import { CURRICULUM_LESSONS } from '@/curriculumData';
import { ArrowLeft } from 'lucide-react';

const mockAdminStudent: StudentProfile = {
  id: 'super_admin_mock',
  name: 'Super Admin',
  role: 'super_admin',
  grade: 'R',
  avatar: '👑',
  pin: '0000',
  progress: {
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  }
};

export default function AdminLessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  
  const lesson = CURRICULUM_LESSONS.find(l => l.id === lessonId);
  const selectedGrade = lesson ? lesson.grade : 'R';
  
  const [progress, setProgress] = useState<UserProgress>(mockAdminStudent.progress);

  const updateProgress = (weekKey: string, starsEarned: number, marksPossible?: number) => {
    setProgress(prev => {
      const newCompleted = { ...prev.completedWeeks, [weekKey]: true };
      const newStars = { ...prev.starsEarned, [weekKey]: starsEarned };
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
      <DashboardLayout allowedRoles={['super_admin']}>
        <div className="p-8 text-center text-slate-500">Lesson not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h2 className="font-bold text-sm">Previewing: {lesson.title}</h2>
          </div>
          <div className="text-xs text-slate-400">Super Admin Viewer</div>
        </div>
        
        <div className="min-h-[70vh]">
          <Dashboard 
            activeStudentId={mockAdminStudent.id}
            grade={selectedGrade as GradeType}
            progress={progress}
            updateProgress={updateProgress}
            onExit={() => router.back()}
            initialLessonId={lessonId}
            isSuperAdmin={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
