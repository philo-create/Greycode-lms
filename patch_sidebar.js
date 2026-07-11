const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

// 1. School Logo and Grade Badge
const target1 = `            {/* School Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold tracking-tight text-sm">EduPortal</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Coding & Robotics</span>
              </div>
            </div>

            {/* Student Grade Badge (Highlighted Button) */}
            {activeStudent?.role === 'learner' && (
              <div className="mb-6">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-600 border border-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 cursor-default hover:bg-indigo-500 transition-colors">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    My Grade: {activeStudent.grade}
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                </button>
              </div>
            )}`;

const replace1 = `            {/* School Logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold tracking-tight text-base">EduPortal</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Coding & Robotics</span>
              </div>
            </div>

            {/* Student Grade Badge (Highlighted Button) */}
            {activeStudent?.role === 'learner' && (
              <div className="mb-8">
                <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-600 border border-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-default hover:bg-indigo-500 transition-colors">
                  <span className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5" />
                    My Grade: {activeStudent.grade}
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                </button>
              </div>
            )}`;
content = content.replace(target1, replace1);

// 2. Select Grade Group
const target2 = `            {/* Select Grade Nav Group (Hidden for Learners) */}
            {activeStudent?.role !== 'learner' && (
            <nav className="space-y-1 mb-8">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Select Grade</p>
              
              {/* Active / Current Grade Indicator */}
              <div className="relative">
                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-750 transition"
                  id="grade-current-dropdown"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {selectedGrade ? \`Grade \${selectedGrade}\` : 'Choose Grade'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Individual grade link selections */}
              <div className="py-2 space-y-1">
                {GRADES.filter(info => 
                  activeStudent.role !== 'learner' || 
                  info.value === activeStudent.grade
                ).map((info) => {
                  const isSelected = selectedGrade === info.value;
                  const currentCompletedCount = Object.keys(progress.completedWeeks).filter(k => k.startsWith(info.value)).length;
                  return (
                    <button
                      key={info.value}
                      id={\`sidebar-select-grade-\${info.value}\`}
                      onClick={() => {
                        setSelectedGrade(info.value as GradeType);
                        setLearningView('map');
                      }}
                      className={\`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all \${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }\`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{info.label}</span>
                      </span>
                      <span className={\`text-[9px] px-1.5 py-0.5 rounded font-mono \${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-500'}\`}>
                        {currentCompletedCount} Done
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
            )}`;

const replace2 = `            {/* Select Grade Nav Group (Hidden for Learners) */}
            {activeStudent?.role !== 'learner' && (
            <nav className="space-y-1 mb-10">
              <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-3 select-none px-1">Select Grade</p>
              
              {/* Active / Current Grade Indicator */}
              <div className="relative mb-3">
                <button 
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-750 transition"
                  id="grade-current-dropdown"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                    {selectedGrade ? \`Grade \${selectedGrade}\` : 'Choose Grade'}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </button>
              </div>

              {/* Individual grade link selections */}
              <div className="py-1 space-y-1.5">
                {GRADES.filter(info => 
                  activeStudent.role !== 'learner' || 
                  info.value === activeStudent.grade
                ).map((info) => {
                  const isSelected = selectedGrade === info.value;
                  const currentCompletedCount = Object.keys(progress.completedWeeks).filter(k => k.startsWith(info.value)).length;
                  return (
                    <button
                      key={info.value}
                      id={\`sidebar-select-grade-\${info.value}\`}
                      onClick={() => {
                        setSelectedGrade(info.value as GradeType);
                        setLearningView('map');
                      }}
                      className={\`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all \${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }\`}
                    >
                      <span className="flex items-center gap-3">
                        <span>{info.label}</span>
                      </span>
                      <span className={\`text-[10px] px-2 py-0.5 rounded font-mono \${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-500'}\`}>
                        {currentCompletedCount} Done
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
            )}`;
content = content.replace(target2, replace2);

// 3. Navigation
const target3 = `            <nav className="space-y-2 mb-8">
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

const replace3 = `            <nav className="space-y-2.5 mb-10">
              <button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                }\`}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-md shrink-0 shadow-sm">
                  <span className="text-xs">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>
            </nav>

            {/* Learning View and static guides */}
            <nav className="space-y-2.5">
              <button
                onClick={() => setLearningView('workstation')}
                className={\`w-full flex items-center gap-3.5 p-3 rounded-xl text-sm font-semibold transition-all text-left border-l-4 cursor-pointer \${
                  learningView === 'workstation'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
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
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
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
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                }\`}
                id="sidebar-progress-btn"
              >
                <Trophy className="w-5 h-5 shrink-0 ml-0.5" />
                <span>My Progress</span>
              </button>
            </nav>`;
content = content.replace(target3, replace3);

// 4. Student profile block at the bottom
const target4 = `          {/* Student Profile Block at the bottom - Switching accounts enabled */}
          <div className="pt-5 border-t border-slate-800 mt-auto flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-705 shrink-0 select-none shadow-xs">
                {activeStudent.avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{activeStudent.name}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                  Grade {activeStudent.grade} Learner
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10.5px] font-bold border border-slate-700/60 hover:border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>🔄 Switch Student</span>
              </button>
              <button
                className="w-9 h-9 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 hover:border-slate-700 transition cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>`;

const replace4 = `          {/* Student Profile Block at the bottom - Switching accounts enabled */}
          <div className="pt-6 border-t border-slate-800 mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shrink-0 select-none shadow-sm">
                {activeStudent.avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">{activeStudent.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                  Grade {activeStudent.grade} Learner
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <span className="text-sm">🔄</span>
                <span>Switch Student</span>
              </button>
              <button
                className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center justify-center shadow-sm active:scale-95 shrink-0"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>`;
content = content.replace(target4, replace4);

fs.writeFileSync('src/components/MainApp.tsx', content);
