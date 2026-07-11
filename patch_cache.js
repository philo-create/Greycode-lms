const fs = require('fs');

let content = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

// Add cache variables outside the component
content = content.replace(
  `export default function LearnerHubView`,
  `let cachedData: any = null;
let cachedProfile: any = null;

export default function LearnerHubView`
);

// Update initial states
content = content.replace(
  `const [data, setData] = useState<any>(null);`,
  `const [data, setData] = useState<any>(cachedData);`
);
content = content.replace(
  `const [loading, setLoading] = useState(true);`,
  `const [loading, setLoading] = useState(!cachedData || !cachedProfile);`
);
content = content.replace(
  `const [profile, setProfile] = useState<any>(null);`,
  `const [profile, setProfile] = useState<any>(cachedProfile);`
);

// Update loadData function
const targetFetch = `        const { data: userProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
          
        setProfile(userProfile);

        const learnerData = await getLearnerData(session.user.id);
        setData(learnerData);`;

const newFetch = `        if (!cachedProfile) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile);
          cachedProfile = userProfile;
        }

        if (!cachedData) {
          const learnerData = await getLearnerData(session.user.id);
          setData(learnerData);
          cachedData = learnerData;
        }`;

content = content.replace(targetFetch, newFetch);

fs.writeFileSync('src/components/LearnerHubView.tsx', content);
