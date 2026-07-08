'use client';

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

  const allowedRolesKey = allowedRoles?.join(',') || '';

  useEffect(() => {
    async function checkAuth() {
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        console.error('Error fetching profile:', error); await supabase.auth.signOut();
        router.push('/');
        return;
      }

      setProfile(data);
      setRole(data.role as UserRole);

      // Sync user_metadata with database profile role & attributes to ensure RLS policies work correctly
      const metadata = session.user.user_metadata || {};
      if (
        metadata.role !== data.role || 
        metadata.school_id !== data.school_id ||
        metadata.grade !== data.grade ||
        metadata.first_name !== data.first_name ||
        metadata.last_name !== data.last_name
      ) {
        console.log('Syncing user auth metadata with profile table data to align RLS context...');
        try {
          await supabase.auth.updateUser({
            data: { 
              role: data.role,
              school_id: data.school_id,
              grade: data.grade,
              first_name: data.first_name,
              last_name: data.last_name
            }
          });
          // Force refresh the session to get a new JWT containing the updated metadata immediately
          await supabase.auth.refreshSession();
          console.log('Auth user metadata synced and session refreshed successfully.');
        } catch (syncErr) {
          console.warn('Failed to sync auth user metadata:', syncErr);
        }
      }

      const normalizedRole = (data.role as string)?.toLowerCase();
      const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());

      if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(normalizedRole)) {
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
        router.push(rolePaths[normalizedRole] || '/');
        return;
      }

      setLoading(false);
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allowedRolesKey]);

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
