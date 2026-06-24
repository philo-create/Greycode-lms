import React, { useEffect, useState } from 'react';
import { RoleSidebar, UserRole } from './RoleSidebar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LoadingState } from './LoadingState';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching profile:', error);
        router.push('/');
        return;
      }

      setProfile(data);
      setRole(data.role as UserRole);

      if (allowedRoles && !allowedRoles.includes(data.role as UserRole)) {
        // Redirect to their proper dashboard if they access the wrong one
        const base = '/dashboard';
        const rolePaths: Record<string, string> = {
          'super_admin': `${base}/admin`,
          'school_admin': `${base}/school`,
          'teacher': `${base}/teacher`,
          'facilitator': `${base}/facilitator`,
          'learner': `${base}/learner`,
          'parent': `${base}/parent`,
        };
        router.push(rolePaths[data.role] || '/');
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [router, allowedRoles]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <RoleSidebar role={role} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome back, {profile.full_name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-slate-500">Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border-2 border-indigo-200">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
