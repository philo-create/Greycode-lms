const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const sql = `
    DROP POLICY IF EXISTS "School staff can view class_lesson_status" ON public.class_lesson_status;
    
    CREATE POLICY "School staff can view class_lesson_status"
    ON public.class_lesson_status FOR SELECT
    USING (
      public.is_super_admin()
      OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    );
  `;
  const { data, error } = await supabaseAdmin.rpc('run_sql', { sql });
  console.log("Patching RLS:", data, error);
}
run();
