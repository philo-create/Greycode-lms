const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', 'utf8');

const additionalCharts = `
            <DashboardCard title="Subject Averages">
              <div className="h-[280px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={radarSkillsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="A" name="Average %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <DashboardCard title="Performance Timeline">
              <div className="h-[280px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="percent" name="Score %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
`;

code = code.replace('</RadarChart>\n                </ResponsiveContainer>\n              </div>\n            </DashboardCard>', '</RadarChart>\n                </ResponsiveContainer>\n              </div>\n            </DashboardCard>\n' + additionalCharts);

fs.writeFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', code);
