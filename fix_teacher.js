const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', 'utf8');

// Add classPeers state if missing
if (!code.includes('const [classPeers, setClassPeers] = useState<any[]>([])')) {
  code = code.replace(/const \[student, setStudent\] = useState<any>\(null\);/, 
    'const [student, setStudent] = useState<any>(null);\n  const [classPeers, setClassPeers] = useState<any[]>([]);');
}

// Ensure the class query is there. The teacher code might not have had `scData` at all, or maybe it did.
// Let's check how teacher code loads data.
