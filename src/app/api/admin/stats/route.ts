export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabaseServiceKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ADMIN_KEY ||
      ''
    ).replace(/['"]/g, '').trim();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token' }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await userClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const callerRole = (callerProfile.role || '').toLowerCase();
    const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(callerRole);

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const [
      { count: schoolsCount },
      { count: learnersCount },
      { count: teachersCount },
      { count: classesCount },
      { data: recentSchools }
    ] = await Promise.all([
      adminClient.from('schools').select('*', { count: 'exact', head: true }),
      adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'learner'),
      adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      adminClient.from('classes').select('*', { count: 'exact', head: true }),
      adminClient.from('schools').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    let capsProgress = 65;
    let practicalAssessments = 42;

    try {
      const { data: progressTableList } = await adminClient
        .from('progress')
        .select('status, score');

      let progressList: any[] = progressTableList || [];
      if (progressList.length === 0) {
        const { data: studentProfiles } = await adminClient
          .from('profiles')
          .select('id, progress')
          .eq('role', 'learner');

        if (studentProfiles && studentProfiles.length > 0) {
          for (const p of studentProfiles) {
            const pProgress = p.progress as any;
            if (pProgress && typeof pProgress === 'object') {
              const completedWeeks = pProgress.completedWeeks || {};
              const starsEarned = pProgress.starsEarned || {};
              for (const key of Object.keys(completedWeeks)) {
                if (completedWeeks[key]) {
                  progressList.push({
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
        const completed = progressList.filter(p => p.status === 'completed').length;
        const actualLearners = learnersCount || 1;
        const totalExpected = actualLearners * 10;
        capsProgress = Math.min(100, Math.max(10, Math.round((completed / totalExpected) * 100)));

        const withScore = progressList.filter(p => p.status === 'completed' && p.score > 0).length;
        practicalAssessments = Math.min(100, Math.max(5, Math.round((withScore / totalExpected) * 100)));
      }
    } catch (e) {
      console.warn('Error computing dynamic admin progress metrics:', e);
    }

    return NextResponse.json({
      stats: {
        schools: schoolsCount || 0,
        learners: learnersCount || 0,
        teachers: teachersCount || 0,
        classes: classesCount || 0
      },
      recentSchools: recentSchools || [],
      capsProgress,
      practicalAssessments
    });

  } catch (err: any) {
    console.error('API GET Admin Stats failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to get stats' }, { status: 500 });
  }
}
