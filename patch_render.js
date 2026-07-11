const fs = require('fs');
let content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const targetRender = `<AnimatePresence mode="wait">
            {learningView === 'workstation' ? (`;

const newRender = `<AnimatePresence mode="wait">
            {learningView === 'learner-hub' ? (
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
