"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, ArrowLeft, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentProfile } from '../types';
import { getStudentProfiles } from '../lib/db';

interface TeacherDashboardProps {
  activeTeacher: StudentProfile;
  onLogout: () => void;
}

export default function TeacherDashboard({ activeTeacher, onLogout }: TeacherDashboardProps) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStudentProfiles();
        // filter out teachers
        setStudents(data.filter(s => s.role !== 'teacher' && s.role !== 'admin'));
      } catch (err) {
        console.error("Failed to load student profiles", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = useMemo(() => {
    return students.map(s => ({
      name: s.name,
      stars: s.progress?.totalStars || 0,
      completed: Object.keys(s.progress?.completedWeeks || {}).length
    })).sort((a, b) => b.stars - a.stars);
  }, [students]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 font-sans p-6 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold tracking-tight text-sm">Greycode</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Teacher Portal</span>
          </div>
        </div>
        
        <nav className="space-y-2 mt-4 flex-1">
          <button className="w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500">
            <Users className="w-4 h-4" />
            <span>My Classroom</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/30">
            <BookOpen className="w-4 h-4" />
            <span>Assessments</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
              👩‍🏫
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{activeTeacher.name}</span>
              <span className="text-[9px] text-slate-400 uppercase">Teacher</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700/60 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3 h-3" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 space-y-8">
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900">Classroom Overview</h1>
          <p className="text-slate-500 text-sm">Manage your students and view their progress.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {students.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Stars Earned per Student</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="stars" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-200">Student Name</th>
                    <th className="px-6 py-4 border-b border-slate-200">Grade</th>
                    <th className="px-6 py-4 border-b border-slate-200">Stars Earned</th>
                    <th className="px-6 py-4 border-b border-slate-200">Completed Modules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                        <span className="text-xl">{student.avatar || '🦁'}</span>
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">Grade {student.grade || 'R'}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono">{student.progress?.totalStars || 0}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono">
                        {Object.keys(student.progress?.completedWeeks || {}).length}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No students found in your classroom yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
