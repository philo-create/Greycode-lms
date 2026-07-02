import { createClient } from '@supabase/supabase-js';

// The user may have accidentally pasted both lines into the URL field in AI Studio Secrets
let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (rawUrl.includes(' ')) {
  const parts = rawUrl.split(/\s+/);
  rawUrl = parts[0];
  const keyPart = parts.find(p => p.includes('PUBLISHABLE_KEY=') || p.includes('ANON_KEY='));
  if (keyPart) {
    rawKey = keyPart.split('=')[1] || rawKey;
  }
}

export const supabaseUrl = rawUrl.trim();
export const supabaseAnonKey = rawKey.trim();

// We only initialize if the URL and Key are actually provided to prevent crash loops
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;
