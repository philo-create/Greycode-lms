const fs = require('fs');

const routes = [
  'src/app/api/platform/profiles/route.ts',
  'src/app/api/platform/profiles/update/route.ts',
  'src/app/api/platform/profiles/remove/route.ts',
  'src/app/api/auth/register-family/route.ts'
];

for (const file of routes) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';")) {
      content = "export const dynamic = 'force-dynamic';\n" + content;
      fs.writeFileSync(file, content);
      console.log('Patched', file);
    }
  }
}
