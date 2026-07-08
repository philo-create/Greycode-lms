export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { parent, children } = await req.json();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase URL or Anon Key is not configured' }, { status: 500 });
    }

    // Create a non-persistent client to avoid session issues
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;
    const authClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const createdUsers = [];
    const errors = [];

    // 1. Register Parent
    const { data: parentData, error: parentError } = await authClient.auth.admin.createUser({
      email: parent.email,
      password: parent.password,
      email_confirm: true,
      user_metadata: {
          first_name: parent.firstName,
          last_name: parent.lastName,
          role: 'parent',
          parent_phone: parent.phone,
          parent_email: parent.email,
        }
    });

    if (parentError) {
      return NextResponse.json({ error: `Parent registration failed: ${parentError.message}` }, { status: 400 });
    }

    if (parentData.user) {
      createdUsers.push(parentData.user);
    }

    // 2. Register Children
    if (children && children.length > 0) {
      for (const child of children) {
        const { data: childData, error: childError } = await authClient.auth.admin.createUser({
          email: child.email,
          password: child.password,
          email_confirm: true,
          user_metadata: {
            first_name: child.firstName,
            last_name: child.lastName,
            school_id: child.schoolId || null,
              grade: child.grade,
              role: 'learner',
              enrollment_status: 'pending',
              parent_name: `${parent.firstName} ${parent.lastName}`.trim(),
              parent_email: parent.email,
              parent_phone: parent.phone,
              parent_relationship: child.relationship || 'Parent'
            }
        });

        if (childError) {
          errors.push(`Failed to register ${child.firstName}: ${childError.message}`);
          continue;
        }

        if (childData.user) {
          createdUsers.push(childData.user);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        message: 'Family registration partially completed with errors.', 
        errors 
      }, { status: 207 });
    }

    return NextResponse.json({ success: true, message: 'Family registered successfully! You can now log in.' });

  } catch (err: any) {
    console.error('Family registration error:', err);
    return NextResponse.json({ error: err.message || 'Failed to register family' }, { status: 500 });
  }
}
