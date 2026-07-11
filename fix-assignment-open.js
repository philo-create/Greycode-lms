const fs = require('fs');
let content = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

// Add selectedAssignment state
content = content.replace(
  `  const [loading, setLoading] = useState(!cachedData || !cachedProfile);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(cachedProfile);`,
  `  const [loading, setLoading] = useState(!cachedData || !cachedProfile);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(cachedProfile);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);`
);

// Replace button and add onClick handler
content = content.replace(
  /<button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold transition-colors">\s*Start Assignment\s*<\/button>/g,
  `<button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Open
                  </button>`
);

// Add the modal before the closing div
const modalCode = `
      {selectedAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedAssignment(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">{selectedAssignment.title}</h3>
                <p className="text-slate-500 font-medium">{selectedAssignment.subject}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-2">Instructions</h4>
              <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedAssignment.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">
                Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
              </span>
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/m, "    </div>\n" + modalCode);

fs.writeFileSync('src/components/LearnerHubView.tsx', content);
