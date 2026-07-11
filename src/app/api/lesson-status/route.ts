import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');
  const grade = searchParams.get('grade');

  if (!schoolId) {
    return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Create a Supabase client with the SERVICE ROLE key to bypass RLS policies
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let query = supabaseAdmin
      .from('class_lesson_status')
      .select('lesson_id, status')
      .eq('school_id', schoolId);
      
    if (grade) {
      query = query.eq('grade', grade);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching lesson status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const statuses: Record<string, string> = {};
    if (data) {
      data.forEach((item: any) => {
        statuses[item.lesson_id] = item.status;
      });
    }

    return NextResponse.json({ statuses });
  } catch (err: any) {
    console.error("Exception fetching lesson status:", err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
