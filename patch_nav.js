const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const targetStr = `            {/* Learning View and static guides */}
            <nav className="space-y-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Learning View</p>
              
              <button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-4 h-4 flex items-center justify-center bg-slate-800 rounded shrink-0">
                  <span className="text-[10px]">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>

              <button`;

const newStr = `            <nav className="space-y-2 mb-8">
              <button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-4 h-4 flex items-center justify-center bg-slate-800 rounded shrink-0">
                  <span className="text-[10px]">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>
            </nav>

            {/* Learning View and static guides */}
            <nav className="space-y-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Learning View</p>
              
              <button`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/components/MainApp.tsx', content);
