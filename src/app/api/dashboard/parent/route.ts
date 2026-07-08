export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parentId = url.searchParams.get('parentId');
  console.log('API /api/dashboard/parent called with parentId:', parentId);
  
  if (!parentId) {
    return NextResponse.json({ error: 'Missing parentId' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  try {
    let children: any[] = [];
    const { data: parentProfile } = await supabase
      .from('profiles')
      .select('school_id, last_name, parent_email')
      .eq('id', parentId)
      .maybeSingle();

    if (parentProfile?.parent_email) {
      const { data: studentProfiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, grade, progress')
        .eq('parent_email', parentProfile.parent_email)
        .eq('role', 'learner');

      if (!error && studentProfiles) {
        for (const student of studentProfiles) {
          const { data: scData } = await supabase
            .from('students_classes')
            .select('classes(grade, class_name)')
            .eq('student_id', student.id)
            .maybeSingle();

          console.log('Pushing child:', student);
          children.push({
            id: student.id,
            profiles: {
              full_name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
              email: ''
            },
            grade: student.grade,
            classes: scData?.classes || (student.grade ? { grade: student.grade, class_name: `Grade ${student.grade}` } : null)
          });
        }
      }
    }

    let childrenProgress: any[] = [];
    if (children && children.length > 0) {
      const childIds = children.map(c => c.id);
      
      const { data: progress, error } = await supabase
        .from('progress')
        .select('*, profiles:student_id(full_name), modules(title)')
        .in('student_id', childIds)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (!error) {
        childrenProgress = (progress || []).map(p => ({
          ...p,
          lesson_title: (p as any).modules?.title || 'Interactive Lesson',
          student_name: (p as any).profiles?.full_name || 'Student',
          status: p.status,
          completed_at: p.completed_at || p.created_at
        }));
      }

      if (childrenProgress.length === 0) {
        const { data: studentProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, progress, created_at')
          .in('id', childIds);
          
        if (studentProfiles && studentProfiles.length > 0) {
          for (const p of studentProfiles) {
            const pProgress = p.progress as any;
            if (pProgress && typeof pProgress === 'object') {
              const completedWeeks = pProgress.completedWeeks || {};
              const starsEarned = pProgress.starsEarned || {};
              for (const key of Object.keys(completedWeeks)) {
                if (completedWeeks[key]) {
                  childrenProgress.push({
                    id: `${p.id}-${key}`,
                    student_id: p.id,
                    status: 'completed',
                    score: starsEarned[key] || 3,
                    completed_at: p.created_at || new Date().toISOString(),
                    lesson_title: `Lesson ${key}`,
                    student_name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
                  });
                }
              }
            }
          }
        }
        childrenProgress = childrenProgress
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          .slice(0, 10);
      }
    }

    let overallAttendance = 92;
    let upcomingAssessments = 2;
    if (children && children.length > 0) {
      const childIds = children.map(c => c.id);
      const { data: progressTableList } = await supabase
        .from('progress')
        .select('status, score, student_id')
        .in('student_id', childIds);
        
      let progressList: any[] = progressTableList || [];
      if (progressList.length === 0) {
        const { data: studentProfiles } = await supabase
          .from('profiles')
          .select('id, progress')
          .in('id', childIds);
          
        if (studentProfiles && studentProfiles.length > 0) {
          for (const p of studentProfiles) {
            const pProgress = p.progress as any;
            if (pProgress && typeof pProgress === 'object') {
              const completedWeeks = pProgress.completedWeeks || {};
              const starsEarned = pProgress.starsEarned || {};
              for (const key of Object.keys(completedWeeks)) {
                if (completedWeeks[key]) {
                  progressList.push({
                    student_id: p.id,
                    status: 'completed',
                    score: starsEarned[key] || 3,
                  });
                }
              }
            }
          }
        }
      }
      
      if (progressList && progressList.length > 0) {
        const completedCount = progressList.filter(p => p.status === 'completed').length;
        overallAttendance = Math.min(100, Math.max(75, Math.round((completedCount / progressList.length) * 100)));
        const totalExpectedModules = children.length * 10;
        upcomingAssessments = Math.max(0, totalExpectedModules - completedCount);
      } else {
        overallAttendance = 95;
        upcomingAssessments = children.length * 2;
      }
    }

    return NextResponse.json({
      children,
      recentProgress: childrenProgress,
      overallAttendance,
      upcomingAssessments,
    });
  } catch (err) {
    console.error('Failed to load parent data via API:', err);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}
