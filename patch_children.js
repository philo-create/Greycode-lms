const fs = require('fs');
const file = 'src/app/api/auth/register-family/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        const { data: childData, error: childError } = await authClient.auth.admin.createUser({
          email: child.email,
          password: child.password,
          email_confirm: true,
          user_metadata: {
            first_name: child.firstName,
            last_name: child.lastName,
            school_id: child.schoolId || null,
              grade: child.grade,
              role: 'learner',
              enrollment_status: 'pending',
              parent_name: \`\${parent.firstName} \${parent.lastName}\`.trim(),
              parent_email: parent.email,
              parent_phone: parent.phone,
              parent_relationship: child.relationship || 'Parent'
            }
        });`;

const replaceStr = `        const { data: childData, error: childError } = await anonClient.auth.signUp({
          email: child.email,
          password: child.password,
          options: {
            data: {
              first_name: child.firstName,
              last_name: child.lastName,
              school_id: child.schoolId || null,
              grade: child.grade,
              role: 'learner',
              enrollment_status: 'pending',
              parent_name: \`\${parent.firstName} \${parent.lastName}\`.trim(),
              parent_email: parent.email,
              parent_phone: parent.phone,
              parent_relationship: child.relationship || 'Parent'
            }
          }
        });`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content);
