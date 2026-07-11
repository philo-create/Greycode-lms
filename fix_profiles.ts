import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const userClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: `Unauthorized: ${userError?.message || 'Invalid token'}` }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await userClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !callerProfile) {
      return NextResponse.json({ error: 'Forbidden: Could not verify admin status' }, { status: 403 });
    }

    const callerRole = (callerProfile.role || '').toLowerCase();
    const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(callerRole);
    const isSchoolAdmin = callerRole === 'school_admin';

    if (!isSuperAdmin && !isSchoolAdmin) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Try service role client directly if available
    let profiles = [];
    if (supabaseServiceKey) {
      try {
        const adminClient = createClient(supabaseUrl!, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        
        // Fetch profiles
        let pQuery = adminClient.from('profiles').select('*').order('created_at', { ascending: false });
        if (isSchoolAdmin && callerProfile.school_id) {
          pQuery = pQuery.eq('school_id', callerProfile.school_id);
        }
        const { data: pData } = await pQuery;
        
        if (pData) {
          // Fetch auth users
          const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
          const authUsers = authData?.users || [];
          const authUsersMap = new Map();
          authUsers.forEach((u: any) => authUsersMap.set(u.id, u));
          
          profiles = pData.map(profile => {
            const authUser = authUsersMap.get(profile.id);
            return {
              ...profile,
              email: authUser?.email || profile.email,
              email_confirmed: authUser ? !!(authUser.email_confirmed_at || authUser.confirmed_at || authUser.last_sign_in_at) : false
            };
          });
          
          return NextResponse.json({ profiles, debug: { mode: 'admin', keyLength: supabaseServiceKey.length } }, { headers: { 'Cache-Control': 'no-store' } });
        }
      } catch (err) {
        console.error('Admin client error:', err);
      }
    }

    // Fallback to user client if admin client failed or no service key
    let pQuery = userClient.from('profiles').select('*').order('created_at', { ascending: false });
    if (isSchoolAdmin && callerProfile.school_id) {
      pQuery = pQuery.eq('school_id', callerProfile.school_id);
    }
    const { data: userProfiles } = await pQuery;
    
    return NextResponse.json({ 
      profiles: userProfiles || [], 
      debug: { mode: 'user', keyFound: !!supabaseServiceKey } 
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
