const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const targetStr = `            {/* Learning View and static guides */}
            <nav className="space-y-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Learning View</p>
              
              <button`;

const newStr = `            {/* Learning View and static guides */}
            <nav className="space-y-2">
              <button`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/MainApp.tsx', content);
