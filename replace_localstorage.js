const fs = require('fs');
['src/components/GradeR1Workbook.tsx', 'src/components/Grade1Week2Workbook.tsx', 'src/lib/db.ts', 'src/components/MainApp.tsx', 'src/components/LoginGate.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import \{ localStore \} from '..\/lib\/localStore';\\nimport React/g, "import { localStore } from '../lib/localStore';\nimport React");
    content = content.replace(/import \{ localStore \} from '\.\/localStore';\\nimport \{ supabase \}/g, "import { localStore } from './localStore';\nimport { supabase }");
    fs.writeFileSync(file, content);
  }
});
