import { supabase } from '../supabase';
import { scaleOldProgressScore } from '../../curriculumData';

export async function getTeacherData(teacherId: string) {
  if (!teacherId) throw new Error('No teacher ID provided');

  if (!supabase) {
    return {
      stats: {
        classes: 0,
        learners: 0,
        capsAlignment: 82, // Placeholder
        averageCompletion: 68, // Placeholder
      },
      classes: [],
      todaysLessons: [],
      recentResults: [] // Placeholder for recent quiz results
    };
  }

  // Get the teacher's profile to retrieve school_id and grade
  const { data: teacherProfile } = await supabase
    .from('profiles')
    .select('school_id, grade')
    .eq('id', teacherId)
    .single();

  // Get classes assigned to this teacher
  let { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
    
  // If no classes are set in the classes table, dynamically generate class objects
  // based on the teacher's grade(s) so their scheduled lessons and filters work correctly.
  if (teacherProfile && (!classes || classes.length === 0)) {
    const teacherGrades = teacherProfile.grade ? teacherProfile.grade.split(',').map((g: string) => g.trim()) : [];
    classes = teacherGrades.map((g: string) => ({
      id: `class-${g}`,
      class_name: `Grade ${g} Class`,
      grade: g,
      teacher_id: teacherId,
      school_id: teacherProfile.school_id,
      created_at: new Date().toISOString()
    }));
  }

  // Find all student profiles who are registered as learners in the same school and grade(s)
  let studentProfiles: any[] = [];
  if (teacherProfile?.school_id) {
    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, progress, created_at, grade')
      .eq('role', 'learner')
      .eq('school_id', teacherProfile.school_id);
      
    const teacherGrades = teacherProfile.grade ? teacherProfile.grade.split(',').map((g: string) => g.trim()) : [];
    if (teacherGrades.length > 0) {
      query = query.in('grade', teacherGrades);
    }
    
    const { data: profiles } = await query;
    studentProfiles = profiles || [];
  }

  const studentIds = studentProfiles.map(p => p.id);
  const learnersCount = studentProfiles.length;

  let averageCompletion = 0;
  let averageScore = 0;
  let recentResults: any[] = [];
  let progressData: any[] = [];

  if (studentIds.length > 0) {
    const { data: progressTableData } = await supabase
      .from('progress')
      .select('status, score, completed_at, module_id, student_id, profiles(first_name, last_name)')
      .in('student_id', studentIds);
      
    if (progressTableData && progressTableData.length > 0) {
      progressData = progressTableData.map(p => ({
        student_id: p.student_id,
        status: p.status,
        score: p.score,
        completed_at: p.completed_at,
        module_id: p.module_id,
        profiles: p.profiles
      }));
    }

    if (progressData.length === 0 && studentProfiles.length > 0) {
      for (const p of studentProfiles) {
        const pProgress = p.progress as any;
        if (pProgress && typeof pProgress === 'object') {
          const completedWeeks = pProgress.completedWeeks || {};
          const starsEarned = pProgress.starsEarned || {};
          const marksPossible = pProgress.marksPossible || {};
          
          for (const key of Object.keys(completedWeeks)) {
            if (completedWeeks[key]) {
              const rawScore = starsEarned[key] || 0;
              const rawPossible = marksPossible[key] || 0;
              const { stars, possible } = scaleOldProgressScore(key, rawScore, rawPossible, pProgress);
              const scorePercent = possible > 0 ? Math.round((stars / possible) * 100) : 100;
              
              progressData.push({
                student_id: p.id,
                status: 'completed',
                score: scorePercent,
                completed_at: p.created_at || new Date().toISOString(),
                module_id: key,
                profiles: {
                  first_name: p.first_name,
                  last_name: p.last_name
                }
              });
            }
          }
        }
      }
    }
      
    if (progressData && progressData.length > 0) {
      const completedCount = progressData.filter(p => p.status === 'completed').length;
      // Total expected is student base * 10 expected lessons per term
      const totalExpected = studentIds.length * 10;
      averageCompletion = Math.min(100, Math.round((completedCount / totalExpected) * 100));
      
      const totalScore = progressData.reduce((sum, p) => sum + (p.score || 0), 0);
      averageScore = Math.round(totalScore / progressData.length);

      recentResults = progressData
        .filter(p => p.status === 'completed' && p.completed_at)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        .slice(0, 5)
        .map(p => ({
          learner: `${p.profiles?.first_name || 'Unknown'} ${p.profiles?.last_name || ''}`.trim(),
          score: p.score,
          date: p.completed_at
        }));
    }
  }

  // Get today's lessons (mock logic based on schedule, placeholder for now)
  const todaysLessons = classes ? classes.slice(0, 2) : [];

  return {
    stats: {
      classes: classes?.length || 0,
      learners: learnersCount,
      averageScore: averageScore,
      averageCompletion: averageCompletion,
    },
    classes: classes || [],
    students: studentProfiles || [],
    todaysLessons,
    recentResults
  };
}
