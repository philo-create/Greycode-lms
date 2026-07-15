export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID to delete is required' }, { status: 400 });
    }

    // Attempt to locate a service role key under various common environment variable names
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

    // 1. Authenticate the caller using their JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Create a client bound to the requesting user's session by passing the Bearer token in headers
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

    // Fetch the authenticated user using getUser(token)
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token' }, { status: 401 });
    }

    // Prevent deleting oneself
    if (user.id === userId) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete your own admin account' }, { status: 403 });
    }

    // 2. Fetch the caller's profile to verify their role
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
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to delete users' }, { status: 403 });
    }

    // If school admin, we need to check if the target user belongs to the same school
    if (isSchoolAdmin) {
      const { data: targetProfile, error: targetError } = await userClient
        .from('profiles')
        .select('school_id')
        .eq('id', userId)
        .single();

      if (targetError || !targetProfile) {
        console.warn('Target user profile check error:', targetError);
        return NextResponse.json({ error: 'Target user profile not found or access denied' }, { status: 404 });
      }

      if (targetProfile.school_id !== callerProfile.school_id) {
        return NextResponse.json({ error: 'Forbidden: You can only delete users belonging to your school' }, { status: 403 });
      }
    }

    // Preemptive dependent cleaner helper function to resolve any potential foreign key blocks
    const cleanDependentRecords = async (clientInstance: any) => {
      console.log(`Preemptively cleaning dependent records for target user: ${userId}`);
      
      // 1. Delete from progress
      try {
        const { error: pErr } = await clientInstance.from('progress').delete().eq('student_id', userId);
        if (pErr) console.warn('Non-blocking: Progress deletion returned error code:', pErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during progress cleanup:', e);
      }

      // 2. Delete from students_classes mapping
      try {
        const { error: scErr } = await clientInstance.from('students_classes').delete().eq('student_id', userId);
        if (scErr) console.warn('Non-blocking: students_classes deletion returned error code:', scErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during students_classes cleanup:', e);
      }

      // 3. Clear teacher association from classes table
      try {
        const { error: cErr } = await clientInstance.from('classes').update({ teacher_id: null }).eq('teacher_id', userId);
        if (cErr) console.warn('Non-blocking: classes teacher update returned error code:', cErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during classes teacher cleanup:', e);
      }

      // 4. Delete from assignments created by this teacher
      try {
        const { error: aErr } = await clientInstance.from('assignments').delete().eq('teacher_id', userId);
        if (aErr) console.warn('Non-blocking: assignments deletion returned error code:', aErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during assignments cleanup:', e);
      }

      // 5. Delete from class_lesson_status managed by this teacher
      try {
        const { error: clsErr } = await clientInstance.from('class_lesson_status').delete().eq('teacher_id', userId);
        if (clsErr) console.warn('Non-blocking: class_lesson_status deletion returned error code:', clsErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during class_lesson_status cleanup:', e);
      }

      // 6. Clear prepared_by association in school_lesson_status
      try {
        const { error: slsErr } = await clientInstance.from('school_lesson_status').update({ prepared_by: null }).eq('prepared_by', userId);
        if (slsErr) console.warn('Non-blocking: school_lesson_status update returned error code:', slsErr);
      } catch (e) {
        console.warn('Non-blocking: Exception during school_lesson_status cleanup:', e);
      }
    };

    // 3. Perform deletion with appropriate privileges
    if (!supabaseServiceKey) {
      console.warn('No SUPABASE_SERVICE_ROLE_KEY found. Deleting profile directly via caller session (Auth user will remain).');
      
      // Clear references first via userClient
      await cleanDependentRecords(userClient);

      // Delete from profiles table directly using userClient (authenticated as the admin caller)
      const { error: deleteProfileError } = await userClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteProfileError) {
        console.error('Failed to delete profile directly:', deleteProfileError);
        return NextResponse.json({ error: `Failed to delete profile: ${deleteProfileError.message}` }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Profile deleted successfully. (Note: Auth user remains since no SUPABASE_SERVICE_ROLE_KEY was configured).' });
    }

    console.log(`Using Service Role Key to delete auth user: ${userId}`);
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    // Clear any references first using the RLS-bypassing adminClient
    await cleanDependentRecords(adminClient);

    // Now delete the public.profiles record
    const { error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (deleteProfileError) {
      console.error('Profile deletion failed:', deleteProfileError);
      return NextResponse.json({ 
        error: `Failed to permanently delete user database record: ${deleteProfileError.message}. Please verify if this user has dependent records or if you have sufficient permissions.` 
      }, { status: 500 });
    }

    // Finally, delete the auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      const errMsg = deleteAuthError.message || '';
      const isUserNotFound = 
        errMsg.toLowerCase().includes('user not found') || 
        errMsg.toLowerCase().includes('not found') || 
        deleteAuthError.status === 404;

      if (!isUserNotFound) {
        console.error('Failed to delete auth user:', deleteAuthError);
        return NextResponse.json({ error: `Failed to delete auth user: ${deleteAuthError.message}` }, { status: 500 });
      } else {
        console.warn('Auth user not found during deletion (already deleted from Auth). Continuing as success.');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API User delete handler failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
