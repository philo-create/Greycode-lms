const fs = require('fs');
let content = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

const target = `        if (!cachedData) {
          const learnerData = await getLearnerData(session.user.id);
          setData(learnerData);
          cachedData = learnerData;
        }`;

const replacement = `        // Always fetch to ensure assignments are up-to-date
        const learnerData = await getLearnerData(session.user.id);
        setData(learnerData);
        cachedData = learnerData;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/LearnerHubView.tsx', content);
  console.log('Cache bypassed successfully');
} else {
  console.log('Target block not found, already patched?');
}
