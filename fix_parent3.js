const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/parent/student/[id]/page.tsx', 'utf8');

code = code.replace(/import \{ BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer \} from 'recharts';/g, "");
code = code.replace(/'use client';\n+/g, "'use client';\n");

code = "'use client';\nimport { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';\n" + code.replace(/'use client';/g, "");

fs.writeFileSync('src/app/dashboard/parent/student/[id]/page.tsx', code.trim());
