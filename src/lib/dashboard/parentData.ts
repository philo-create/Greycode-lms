import { supabase } from '../supabase';

export async function getParentData(parentId: string) {
  if (!parentId) throw new Error('No parent ID provided');

  const defaultData = {
    children: [],
    recentProgress: [],
    overallAttendance: 92, // Placeholder
    upcomingAssessments: 2, // Placeholder
  };

  if (!supabase) {
    return defaultData;
  }

  try {
    let children: any[] = [];
    try {
      // Find parent profile to get their school
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('school_id, last_name')
        .eq('id', parentId)
        .maybeSingle();

      if (parentProfile?.school_id) {
        // Fetch student profiles in the same school as "children"
        const { data: studentProfiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, email, grade, progress')
          .eq('school_id', parentProfile.school_id)
          .in('role', ['student', 'learner']);

        if (!error && studentProfiles) {
          for (const student of studentProfiles) {
            const { data: scData } = await supabase
              .from('students_classes')
              .select('classes(grade, class_name)')
              .eq('student_id', student.id)
              .maybeSingle();

            children.push({
              id: student.id,
              profiles: {
                full_name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                email: student.email
              },
              classes: scData?.classes || (student.grade ? { grade: student.grade, class_name: `Grade ${student.grade}` } : null)
            });
          }
        }
      }
    } catch (e) {
      console.warn('Exception fetching children profiles:', e);
    }

    // If they have children, fetch their progress
    let childrenProgress: any[] = [];
    if (children && children.length > 0) {
      const childIds = children.map(c => c.id);
      
      try {
        const { data: progress, error } = await supabase
          .from('progress')
          .select('*, profiles:student_id(full_name), modules(title)')
          .in('student_id', childIds)
          .order('completed_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.warn('Failed to fetch progress:', error);
        } else {
          childrenProgress = (progress || []).map(p => ({
            ...p,
            lesson_title: (p as any).modules?.title || 'Interactive Lesson',
            student_name: (p as any).profiles?.full_name || 'Student',
            status: p.status,
            completed_at: p.completed_at || p.created_at
          }));
        }
      } catch (e) {
        console.warn('Exception fetching progress:', e);
      }
    }

    return {
      children,
      recentProgress: childrenProgress,
      overallAttendance: 92, // Placeholder
      upcomingAssessments: 2, // Placeholder
    };
  } catch (err) {
    console.error('Failed in getParentData, returning defaults:', err);
    return defaultData;
  }
}
