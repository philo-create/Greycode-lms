const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

// 1. Update learningView type
content = content.replace(
  `const [learningView, setLearningView] = useState<'map' | 'progress' | 'workstation'>('map');`,
  `const [learningView, setLearningView] = useState<'map' | 'progress' | 'workstation' | 'learner-hub'>('learner-hub');`
);

// 2. Add import
if (!content.includes('import LearnerHubView')) {
  content = content.replace(
    `import TeacherDashboard from './TeacherDashboard';`,
    `import TeacherDashboard from './TeacherDashboard';\nimport LearnerHubView from './LearnerHubView';`
  );
}

// 3. Update the Main Dashboard button click handler and active state
const targetButton = `<button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent"
              >`;
const newButton = `<button
                onClick={() => setLearningView('learner-hub')}
                className={\`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold transition-all text-left border-l-2 cursor-pointer \${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }\`}
              >`;
content = content.replace(targetButton, newButton);

// 4. Update the render logic for learner-hub
// We'll insert it right before the workstation view check
const targetRender = `) : learningView === 'workstation' ? (`;
const newRender = `) : learningView === 'learner-hub' ? (
              <motion.div
                key="learner-hub-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-8 max-w-5xl mx-auto py-4 w-full"
              >
                <LearnerHubView />
              </motion.div>
            ) : learningView === 'workstation' ? (`;
content = content.replace(targetRender, newRender);

fs.writeFileSync('src/components/MainApp.tsx', content);
