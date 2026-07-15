import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (rawUrl.includes(' ')) {
      rawKey = rawUrl.split(/\s+/).find(p => p.includes('KEY='))?.split('=')[1] || rawKey;
    }
    const supabase = createClient(rawUrl, rawKey);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', '3f200e15-060f-45ce-a104-dc601dd9dde8').single();
    
    return NextResponse.json({ subjectGrades: profile?.progress?.subjectGrades });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
