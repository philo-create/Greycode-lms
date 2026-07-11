const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

// Replace standard icon button
content = content.replace(
  /<button\s+onClick=\{\(\) => setLearningView\('learner-hub'\)\}\s+className=\{`w-full flex items-center gap-3 p-2\.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \$\{[\s\S]*?\}\`\}\s+>\s+<div className="w-4 h-4 flex items-center justify-center bg-slate-800 rounded shrink-0">\s+<span className="text-\[10px\]">🏠<\/span>\s+<\/div>\s+<span>Main Dashboard<\/span>\s+<\/button>/g,
  `<button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-lg shrink-0 shadow-sm border border-slate-700/50">
                  <span className="text-sm">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>`
);

content = content.replace(
  /<button\s+onClick=\{\(\) => setLearningView\('workstation'\)\}\s+className=\{`w-full flex items-center gap-3 p-2\.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \$\{[\s\S]*?\}\`\}\s+>\s+<div className="w-4 h-4 flex items-center justify-center bg-slate-800 rounded shrink-0">\s+<span className="text-\[10px\]">🎨<\/span>\s+<\/div>\s+<span>Creative Workstation<\/span>\s+<\/button>/g,
  `<button
                onClick={() => setLearningView('workstation')}
                className={\`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'workstation'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-lg shrink-0 shadow-sm border border-slate-700/50">
                  <span className="text-sm">🎨</span>
                </div>
                <span>Creative Workstation</span>
              </button>`
);

content = content.replace(
  /<button\s+onClick=\{\(\) => setLearningView\('map'\)\}\s+className=\{`w-full flex items-center gap-3 p-2\.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \$\{[\s\S]*?\}\`\}\s+>\s+<Award className="w-4 h-4 shrink-0" \/>\s+<span>Curriculum Map<\/span>\s+<\/button>/g,
  `<button
                onClick={() => setLearningView('map')}
                className={\`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'map'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-transparent rounded-lg shrink-0">
                  <Award className="w-6 h-6 shrink-0" />
                </div>
                <span>Curriculum Map</span>
              </button>`
);

content = content.replace(
  /<button\s+onClick=\{\(\) => setLearningView\('progress'\)\}\s+className=\{`w-full flex items-center gap-3 p-2\.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \$\{[\s\S]*?\}\`\}\s+id="sidebar-progress-btn"\s+>\s+<Trophy className="w-4 h-4 shrink-0" \/>\s+<span>My Progress<\/span>\s+<\/button>/g,
  `<button
                onClick={() => setLearningView('progress')}
                className={\`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'progress'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
                id="sidebar-progress-btn"
              >
                <div className="w-7 h-7 flex items-center justify-center bg-transparent rounded-lg shrink-0">
                  <Trophy className="w-6 h-6 shrink-0" />
                </div>
                <span>My Progress</span>
              </button>`
);

fs.writeFileSync('src/components/MainApp.tsx', content);
