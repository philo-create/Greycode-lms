const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const targetNavBlock = `            <nav className="space-y-2">
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
              <button
                onClick={() => setLearningView('workstation')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'workstation'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-4 h-4 flex items-center justify-center bg-slate-800 rounded shrink-0">
                  <span className="text-[10px]">🎨</span>
                </div>
                <span>Creative Workstation</span>
              </button>
              <button
                onClick={() => setLearningView('map')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'map'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Curriculum Map</span>
              </button>
              <button
                onClick={() => setLearningView('progress')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'progress'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
                id="sidebar-progress-btn"
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span>My Progress</span>
              </button>
            </nav>`;

const newNavBlock = `            <nav className="space-y-2">
              <button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-md shrink-0 shadow-sm">
                  <span className="text-xs">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>
              <button
                onClick={() => setLearningView('workstation')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'workstation'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-md shrink-0 shadow-sm">
                  <span className="text-xs">🎨</span>
                </div>
                <span>Creative Workstation</span>
              </button>
              <button
                onClick={() => setLearningView('map')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'map'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >
                <Award className="w-5 h-5 shrink-0 ml-0.5" />
                <span>Curriculum Map</span>
              </button>
              <button
                onClick={() => setLearningView('progress')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'progress'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
                id="sidebar-progress-btn"
              >
                <Trophy className="w-5 h-5 shrink-0 ml-0.5" />
                <span>My Progress</span>
              </button>
            </nav>`;

content = content.replace(targetNavBlock, newNavBlock);
fs.writeFileSync('src/components/MainApp.tsx', content);
