import { NextResponse } from "next/server";

export async function GET() {
  const keys = Object.keys(process.env);
  return NextResponse.json({ 
    envKeys: keys,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}
