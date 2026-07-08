const fs = require('fs');
const file = 'src/app/api/auth/register-family/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    const createdUsers = [];
    const errors = [];

    // 1. Register Parent
    const { data: parentData, error: parentError } = await authClient.auth.admin.createUser({
      email: parent.email,
      password: parent.password,
      email_confirm: true,
      user_metadata: {
          first_name: parent.firstName,
          last_name: parent.lastName,
          role: 'parent',
          parent_phone: parent.phone,
          parent_email: parent.email,
        }
    });

    if (parentError) {
      return NextResponse.json({ error: \`Parent registration failed: \${parentError.message}\` }, { status: 400 });
    }

    if (parentData.user) {
      createdUsers.push(parentData.user);
    }`;

const replaceStr = `    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const createdUsers = [];
    const errors = [];

    // 1. Register Parent using anon client so they receive the verification email
    const { data: parentData, error: parentError } = await anonClient.auth.signUp({
      email: parent.email,
      password: parent.password,
      options: {
        data: {
          first_name: parent.firstName,
          last_name: parent.lastName,
          role: 'parent',
          parent_phone: parent.phone,
          parent_email: parent.email,
          enrollment_status: 'pending' // Added pending so they are not automatically approved
        }
      }
    });

    if (parentError) {
      return NextResponse.json({ error: \`Parent registration failed: \${parentError.message}\` }, { status: 400 });
    }

    if (parentData.user) {
      createdUsers.push(parentData.user);
    }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content);
