'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingState } from '@/components/dashboard/LoadingState';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching profile for routing:', error);
        router.push('/');
        return;
      }

      const rolePaths: Record<string, string> = {
        'super_admin': '/dashboard/admin',
        'school_admin': '/dashboard/school',
        'teacher': '/dashboard/teacher',
        'facilitator': '/dashboard/facilitator',
        'learner': '/dashboard/learner',
        'parent': '/dashboard/parent',
      };

      router.push(rolePaths[data.role] || '/');
    }

    routeUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingState message="Setting up your workspace..." />
    </div>
  );
}
