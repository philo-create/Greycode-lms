const fs = require('fs');
const file = 'src/app/dashboard/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<ActivityFeed activities=\{\[\s*\{ id: '1'.*?\n\s*\{ id: '2'.*?\n\s*\{ id: '3'.*?\n\s*\]\} \/>/g,
  '{data.recentSchools && data.recentSchools.length > 0 ? (\n              <ActivityFeed activities={data.recentSchools.map((s, i) => ({ id: s.id, title: "New School Onboarded", description: `${s.name} registered on the platform.`, time: new Date(s.created_at).toLocaleDateString(), icon: <Building2 className="w-5 h-5" />, color: "bg-indigo-100 text-indigo-600" }))} />\n            ) : (\n              <EmptyState title="No recent activity" description="Audit logs and system events will appear here." />\n            )}'
);

fs.writeFileSync(file, content);
