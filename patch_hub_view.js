const fs = require('fs');

// Patch LearnerHubView
let viewContent = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

viewContent = viewContent.replace(
  `export default function LearnerHubView() {`,
  `export default function LearnerHubView({ onSelectWorkstation }: { onSelectWorkstation?: () => void }) {`
);

viewContent = viewContent.replace(
  `onClick={() => router.push('/dashboard/learner/workstation')}`,
  `onClick={() => onSelectWorkstation ? onSelectWorkstation() : router.push('/dashboard/learner/workstation')}`
);

fs.writeFileSync('src/components/LearnerHubView.tsx', viewContent);

// Patch MainApp.tsx to pass the prop
let appContent = fs.readFileSync('src/components/MainApp.tsx', 'utf8');
appContent = appContent.replace(
  `<LearnerHubView />`,
  `<LearnerHubView onSelectWorkstation={() => setLearningView('workstation')} />`
);
fs.writeFileSync('src/components/MainApp.tsx', appContent);
