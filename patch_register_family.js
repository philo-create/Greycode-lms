const fs = require('fs');
const file = 'src/app/api/auth/register-family/route.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace createClient logic
content = content.replace(
  'const authClient = createClient(supabaseUrl, supabaseAnonKey, {',
  'const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;\n    const authClient = createClient(supabaseUrl, serviceKey, {'
);

// Replace parent signup
content = content.replace(
  /const { data: parentData, error: parentError } = await authClient\.auth\.signUp\(\{\s+email: parent\.email,\s+password: parent\.password,\s+options: \{\s+data: \{([\s\S]*?)\}\s+\}\s+\}\);/,
  `const { data: parentData, error: parentError } = await authClient.auth.admin.createUser({
      email: parent.email,
      password: parent.password,
      email_confirm: true,
      user_metadata: {$1}
    });`
);

// Replace child signup
content = content.replace(
  /const { data: childData, error: childError } = await authClient\.auth\.signUp\(\{\s+email: child\.email,\s+password: child\.password,\s+options: \{\s+data: \{\s+first_name: child\.firstName,\s+last_name: child\.lastName,\s+school_id: child\.schoolId,([\s\S]*?)\}\s+\}\s+\}\);/,
  `const { data: childData, error: childError } = await authClient.auth.admin.createUser({
          email: child.email,
          password: child.password,
          email_confirm: true,
          user_metadata: {
            first_name: child.firstName,
            last_name: child.lastName,
            school_id: child.schoolId || null,$1}
        });`
);

// Replace message
content = content.replace(
  "message: 'Family registered successfully! Please check emails for verification.'",
  "message: 'Family registered successfully! You can now log in.'"
);

fs.writeFileSync(file, content);
