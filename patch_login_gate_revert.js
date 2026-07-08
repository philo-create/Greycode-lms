const fs = require('fs');
const file = 'src/components/LoginGate.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  ".eq('id', userId)\n        .maybeSingle();",
  ".eq('id', userId)\n        .single();"
);

fs.writeFileSync(file, content);
