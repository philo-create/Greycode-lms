const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/parent/student/[id]/page.tsx', 'utf8');

// Add classPeers state if missing
if (!code.includes('const [classPeers, setClassPeers] = useState<any[]>([])')) {
  code = code.replace(/const \[assignments, setAssignments\] = useState<any\[\]>\(\[\]\);/, 
    'const [assignments, setAssignments] = useState<any[]>([]);\n  const [classPeers, setClassPeers] = useState<any[]>([]);');
}

fs.writeFileSync('src/app/dashboard/parent/student/[id]/page.tsx', code);
