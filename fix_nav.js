const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const target = `            </nav>

            {/* Learning View and static guides */}
            <nav className="space-y-2">`;

content = content.replace(target, '');
// And remove the first nav tag opening:
content = content.replace(`<nav className="space-y-2 mb-8">`, `<nav className="space-y-2">`);

fs.writeFileSync('src/components/MainApp.tsx', content);
