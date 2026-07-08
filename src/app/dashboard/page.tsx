
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      if (!supabase) {
        console.warn('Supabase is not configured.');
        router.push('/');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      let userRole = '';

      // 1. Fetch only role first. This avoids 42703 column_not_found error on email_confirmed if it doesn't exist.
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching profile for routing, attempting fallback and self-heal:', JSON.stringify(error || { message: 'No data returned' }));
        
        // Fallback to JWT user metadata
        const meta = session.user.user_metadata || {};
        userRole = meta.role || 'learner';

        // Background Self-heal: Upsert the missing profile row so they have one in the public.profiles database
        try {
          const fallbackRole = meta.role || 'learner';
          const baseProfile = {
            id: session.user.id,
            first_name: meta.first_name || meta.full_name?.split(' ')[0] || 'User',
            last_name: meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
            role: fallbackRole,
            school_id: (meta.school_id && meta.school_id !== "") ? meta.school_id : null,
            grade: meta.grade || null,
            enrollment_status: ['student', 'learner'].includes(fallbackRole.toLowerCase()) ? 'pending' : 'approved'
          };

          const { error: retryErr } = await supabase.from('profiles').upsert(baseProfile, { onConflict: 'id' });
          if (retryErr) {
            console.error('Self-healing fallback upsert failed:', retryErr);
          } else {
            console.log('Successfully self-healed/created missing profile row for user:', session.user.id);
          }
        } catch (selfHealErr) {
          console.warn('Profile self-healing exception:', selfHealErr);
        }
      } else {
        userRole = data.role;
      }

      const rolePaths: Record<string, string> = {
        'super_admin': '/dashboard/admin',
        'school_admin': '/dashboard/school',
        'teacher': '/dashboard/teacher',
        'facilitator': '/dashboard/facilitator',
        'learner': '/dashboard/learner',
        'parent': '/dashboard/parent',
      };

      const normalizedRole = (userRole as string)?.toLowerCase();
      router.push(rolePaths[normalizedRole] || '/');
    }

    routeUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingState message="Setting up your workspace..." />
    </div>
  );
}
