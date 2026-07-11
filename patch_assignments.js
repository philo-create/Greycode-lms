const fs = require('fs');
const file = 'src/app/dashboard/teacher/assignments/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update fetchAssignments
code = code.replace(
  "if (error && error.code !== '42P01') {",
  "if (error && error.code !== '42P01' && error.code !== 'PGRST205') {"
);

// Add missingTable state
if (!code.includes('const [missingTable, setMissingTable]')) {
  code = code.replace(
    'const [isCreating, setIsCreating] = useState(false);',
    'const [isCreating, setIsCreating] = useState(false);\n  const [missingTable, setMissingTable] = useState(false);'
  );
}

// Update error handling in fetch
code = code.replace(
  "if (error && error.code !== '42P01' && error.code !== 'PGRST205') {\n        console.error('Error fetching assignments:', error);\n      } else if (data) {",
  `if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          setMissingTable(true);
        } else {
          console.error('Error fetching assignments:', error);
        }
      } else if (data) {`
);

// Update error handling in create
code = code.replace(
  "if (error) throw error;",
  `if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          setMissingTable(true);
          throw new Error('Table missing');
        }
        throw error;
      }`
);

// Inject missing table banner
const banner = `
      {missingTable && (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="text-lg font-bold flex items-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2" /> Database Setup Required
          </h3>
          <p className="mb-4 text-rose-700">
            The <strong>assignments</strong> table is missing from your Supabase database. 
            To enable assignments and homework, please run the following SQL command in your Supabase SQL Editor:
          </p>
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {\`CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for teachers" ON public.assignments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));
CREATE POLICY "Enable update for teachers" ON public.assignments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));
CREATE POLICY "Enable delete for teachers" ON public.assignments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')));\`}
            </pre>
          </div>
          <button 
            onClick={() => setMissingTable(false)}
            className="mt-4 px-4 py-2 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
`;

code = code.replace(
  "{isCreating && (",
  banner + "\n      {isCreating && ("
);

// Ensure AlertCircle is imported
if (!code.includes('AlertCircle')) {
  code = code.replace(
    "import { Plus, BookOpen, Clock, Calendar, CheckCircle, Trash2 } from 'lucide-react';",
    "import { Plus, BookOpen, Clock, Calendar, CheckCircle, Trash2, AlertCircle } from 'lucide-react';"
  );
}

fs.writeFileSync(file, code);
