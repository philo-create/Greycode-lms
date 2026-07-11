'use client';
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ArrowLeft, Star, Award, BookOpen, Clock } from 'lucide-react';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import Link from 'next/link';

export default function StudentProgress({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();

        setStudent(profile);

        const { data: prog } = await supabase
          .from('progress')
          .select('*, modules(title)')
          .eq('student_id', params.id)
          .order('completed_at', { ascending: false });

        if (prog && prog.length > 0) {
          setProgress(prog.map(p => ({
            ...p,
            lesson_title: p.modules?.title || 'Interactive Lesson'
          })));
        } else if (profile?.progress && typeof profile.progress === 'object') {
          // Fallback to json progress
          const pProgress = profile.progress as any;
          const completedWeeks = pProgress.completedWeeks || {};
          const starsEarned = pProgress.starsEarned || {};
          const fallbackProg = [];
          for (const key of Object.keys(completedWeeks)) {
            if (completedWeeks[key]) {
              fallbackProg.push({
                id: `${profile.id}-${key}`,
                status: 'completed',
                score: starsEarned[key] || 3,
                completed_at: profile.created_at || new Date().toISOString(),
                lesson_title: `Lesson ${key}`,
              });
            }
          }
          setProgress(fallbackProg);
        } else {
          setProgress([]);
        }

        // Get student's class mapping to find the grade/school
        const { data: scData } = await supabase
          .from('students_classes')
          .select('classes(grade, school_id)')
          .eq('student_id', params.id)
          .maybeSingle();

        const targetGrade = profile?.grade || scData?.classes?.grade;
        const targetSchool = profile?.school_id || scData?.classes?.school_id;

        let studentAssignments: any[] = [];
        if (targetGrade) {
          let query = supabase
            .from('assignments')
            .select('*')
            .eq('grade', targetGrade)
            .order('due_date', { ascending: true });

          if (targetSchool) {
            query = query.eq('school_id', targetSchool);
          } else {
            query = query.is('school_id', null);
          }

          const { data: assignmentsData } = await query;
          if (assignmentsData) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            studentAssignments = assignmentsData.filter((a: any) => {
              const dueDate = new Date(a.due_date);
              return dueDate >= now;
            });
          }
        }
        setAssignments(studentAssignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['parent']}>
        <LoadingState message="Loading student progress..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['parent']}>
      <div className="mb-6">
        <Link href="/dashboard/parent" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student'}</h1>
            <p className="text-slate-500 mt-1">Grade {student?.grade || 'R'} • Progress Report</p>
          </div>
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl">
            {(student?.full_name || student?.first_name || 'S').charAt(0)}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <DashboardCalendar assignments={assignments} role="learner" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Completed Lessons</h2>
          {progress.length > 0 ? (
            <div className="space-y-4">
              {progress.map((p, i) => (
                <div key={p.id || i} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{p.lesson_title}</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(p.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-bold text-sm">
                    {p.score || 3}
                    <Star className="w-4 h-4 ml-1 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
              No lessons completed yet.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Overview</h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Lessons Completed</p>
              <div className="flex items-center text-2xl font-bold text-slate-800">
                <BookOpen className="w-6 h-6 text-indigo-500 mr-2" />
                {progress.length}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Stars Earned</p>
              <div className="flex items-center text-2xl font-bold text-slate-800">
                <Star className="w-6 h-6 text-amber-500 mr-2" />
                {progress.reduce((acc, curr) => acc + (curr.score || 3), 0)}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Achievements</p>
              <div className="flex items-center text-2xl font-bold text-slate-800">
                <Award className="w-6 h-6 text-emerald-500 mr-2" />
                {Math.floor(progress.length / 3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
