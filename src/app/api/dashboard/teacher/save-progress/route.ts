import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { studentId, progress } = await request.json();

    if (!studentId || !progress) {
      return NextResponse.json({ error: 'Missing studentId or progress' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create a Supabase client with the SERVICE ROLE key to bypass RLS policies
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Update the profile's progress column in PostgreSQL
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ progress })
      .eq('id', studentId);

    if (error) {
      console.error("Error updating student progress via Admin client:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exception updating student progress:", err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
