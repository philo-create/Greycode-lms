const fs = require('fs');
const file = 'src/app/api/dashboard/parent/route.ts';
let code = fs.readFileSync(file, 'utf8');

const targetString = `          console.log('Pushing child:', student);
          children.push({
            id: student.id,
            profiles: {
              full_name: student.full_name || \`\${student.first_name || ''} \${student.last_name || ''}\`.trim(),
              email: ''
            },`;

const replaceString = `          // Fetch student email
          const { data: authData } = await supabase.auth.admin.getUserById(student.id);
          const studentEmail = authData?.user?.email || '';
          
          console.log('Pushing child:', student);
          children.push({
            id: student.id,
            profiles: {
              full_name: student.full_name || \`\${student.first_name || ''} \${student.last_name || ''}\`.trim(),
              email: studentEmail
            },`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
