export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // 1. Locate the Supabase Service Role Key to bypass RLS and read Auth table
    const supabaseServiceKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ADMIN_KEY ||
      ''
    ).replace(/['"]/g, '').trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase URL or Anon Key is not configured' }, { status: 500 });
    }

    // 2. Authenticate the caller using their JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token' }, { status: 401 });
    }

    // 3. Fetch the caller's profile to verify admin role
    const { data: callerProfile, error: profileError } = await userClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile) {
      console.error('Failed to fetch caller profile:', profileError);
      return NextResponse.json({ error: 'Forbidden: Could not verify admin status' }, { status: 403 });
    }

    const callerRole = (callerProfile.role || '').toLowerCase();
    const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(callerRole);
    const isSchoolAdmin = callerRole === 'school_admin';

    if (!isSuperAdmin && !isSchoolAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to access this endpoint' }, { status: 403 });
    }

    // 4. Fetch all profiles
    let profilesQuery = userClient.from('profiles').select('*').order('created_at', { ascending: false });
    
    // If they are a school admin, restrict them to their school's profiles
    if (isSchoolAdmin && callerProfile.school_id) {
      profilesQuery = profilesQuery.eq('school_id', callerProfile.school_id);
    }

    const { data: profiles, error: fetchProfilesError } = await profilesQuery;
    if (fetchProfilesError) {
      console.error('Failed to fetch profiles:', fetchProfilesError);
      return NextResponse.json({ error: `Failed to fetch profiles: ${fetchProfilesError.message}` }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    // 5. If we have a service role key, fetch the corresponding auth users to sync email_confirmed status
    if (supabaseServiceKey) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        });

        // Fetch auth users from Supabase Auth
        const { data: { users: authUsers }, error: authListError } = await adminClient.auth.admin.listUsers({
          perPage: 1000
        });

        if (authListError) {
          console.warn('Failed to retrieve auth users for sync:', authListError);
        } else if (authUsers && authUsers.length > 0) {
          // Map auth users by their ID
          const authUsersMap = new Map<string, any>();
          authUsers.forEach(u => authUsersMap.set(u.id, u));

          // Run checks and auto-sync
          profiles.forEach((profile) => {
            const authUser = authUsersMap.get(profile.id);
            if (!authUser) return;

            // Attach email to profile for UI rendering
            profile.email = authUser.email;

            // Determine true confirmation state: they are confirmed if they have a confirmation date or have logged in
            const isConfirmedInAuth = !!(authUser.email_confirmed_at || authUser.confirmed_at || authUser.last_sign_in_at);
            
            // Always set it on the profile object returned to the UI
            profile.email_confirmed = isConfirmedInAuth;
          });
        }
      } catch (adminErr) {
        console.error('Error during administrative profile sync:', adminErr);
      }
    } else {
      console.warn('Supabase service role key not available for profile sync. Returning un-synced profiles.');
    }

    return NextResponse.json({ profiles });
  } catch (err: any) {
    console.error('API GET Users handler failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to list users' }, { status: 500 });
  }
}
