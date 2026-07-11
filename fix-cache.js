const fs = require('fs');
let content = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

// Force re-fetch of data instead of relying solely on cache
content = content.replace(
  `        if (!cachedData) {
          const learnerData = await getLearnerData(session.user.id);
          setData(learnerData);
          cachedData = learnerData;
        }
        setLoading(false);`,
  `        // Always fetch latest to get new assignments
        const learnerData = await getLearnerData(session.user.id);
        setData(learnerData);
        cachedData = learnerData;
        setLoading(false);`
);

fs.writeFileSync('src/components/LearnerHubView.tsx', content);
