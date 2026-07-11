import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasServiceKey2: !!process.env.SUPABASE_SERVICE_KEY,
    hasServiceKey3: !!process.env.SUPABASE_SECRET_KEY,
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
