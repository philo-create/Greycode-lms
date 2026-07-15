'use client';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { getSubjectsForGrade, normalizeUserProgress, scaleOldProgressScore } from '@/curriculumData';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { 
  ArrowLeft, Star, Award, BookOpen, Clock, Heart, 
  Calculator, Cpu, Calendar, ClipboardCheck, AlertCircle, TrendingUp 
} from 'lucide-react';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import Link from 'next/link';
import { DeepDiveAIReport } from '@/components/DeepDiveAIReport';

function getCapsLevel(percent: number) {
  if (percent >= 80) return { level: 7, name: 'Outstanding Achievement', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' };
  if (percent >= 70) return { level: 6, name: 'Meritorious Achievement', color: 'bg-teal-50 text-teal-800 border-teal-100' };
  if (percent >= 60) return { level: 5, name: 'Substantial Achievement', color: 'bg-blue-50 text-blue-800 border-blue-100' };
  if (percent >= 50) return { level: 4, name: 'Adequate Achievement', color: 'bg-indigo-50 text-indigo-800 border-indigo-100' };
  if (percent >= 40) return { level: 3, name: 'Moderate Achievement', color: 'bg-amber-50 text-amber-800 border-amber-100' };
  if (percent >= 30) return { level: 2, name: 'Elementary Achievement', color: 'bg-orange-50 text-orange-800 border-orange-100' };
  return { level: 1, name: 'Not Achieved', color: 'bg-rose-50 text-rose-800 border-rose-100' };
}

export function getTypeBadge(type?: string) {
  const t = (type || 'classwork').toLowerCase();
  switch (t) {
    case 'home':
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase rounded shrink-0">Home</span>;
    case 'test':
      return <span className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 text-[9px] font-black uppercase rounded shrink-0">Test</span>;
    case 'practical test':
      return <span className="bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 text-[9px] font-black uppercase rounded shrink-0">Practical Test</span>;
    default:
      return <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 text-[9px] font-black uppercase rounded shrink-0">Classwork</span>;
  }
}

const DEFAULT_WEIGHTS: Record<string, number> = {
  test: 45,
  'practical test': 30,
  classwork: 15,
  home: 10,
};

export function getAssessmentWeights() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('school_assessment_weights');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing assessment weights:', e);
      }
    }
  }
  return DEFAULT_WEIGHTS;
}

export function calculateWeightedAverage(list: any[]) {
  if (!list || list.length === 0) return 0;

  const weights = getAssessmentWeights();

  // Group assessments by type
  const groups: Record<string, any[]> = {};
  list.forEach(item => {
    const type = (item.type || 'classwork').toLowerCase();
    let typeKey = 'classwork';
    if (type.includes('practical')) {
      typeKey = 'practical test';
    } else if (type.includes('test') || type.includes('exam')) {
      typeKey = 'test';
    } else if (type.includes('home')) {
      typeKey = 'home';
    } else {
      typeKey = 'classwork';
    }
    if (!groups[typeKey]) groups[typeKey] = [];
    groups[typeKey].push(item);
  });

  let totalActiveWeight = 0;
  let weightedSum = 0;

  Object.entries(groups).forEach(([type, items]) => {
    const sumPercent = items.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0);
    const avgPercent = sumPercent / items.length;
    
    const weight = weights[type] !== undefined ? weights[type] : (DEFAULT_WEIGHTS[type] || 15);
    totalActiveWeight += weight;
    weightedSum += avgPercent * weight;
  });

  if (totalActiveWeight === 0) return 0;
  return Math.round(weightedSum / totalActiveWeight);
}

export default function StudentProgress({ params }: { params: { id: string } }) {
  const currentWeights = getAssessmentWeights();
  const [student, setStudent] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classPeers, setClassPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (profile) {
          const normalized = normalizeUserProgress(profile.progress || {});
          setStudent({ ...profile, progress: normalized });

          // Process robotics progress
          let fallbackProg: any[] = [];
          if (normalized) {
            const completedWeeks = normalized.completedWeeks || {};
            const starsEarned = normalized.starsEarned || {};
            const marksPossible = normalized.marksPossible || {};
            
            for (const key of Object.keys(completedWeeks)) {
              if (completedWeeks[key]) {
                const rawScore = starsEarned[key] || 0;
                const rawPossible = marksPossible[key] || 0;
                const { stars, possible } = scaleOldProgressScore(key, rawScore, rawPossible, normalized);
                const percent = possible > 0 ? Math.round((stars / possible) * 100) : 100;

                const parts = key.split('-');
                let title = `Lesson ${key}`;
                if (parts.length >= 3) {
                  title = `Term ${parts[1].replace('T', '')} Week ${parts[2].replace('W', '')}`;
                }

                fallbackProg.push({
                  id: `${profile.id}-${key}`,
                  status: 'completed',
                  score: stars,
                  percent: percent,
                  completed_at: profile.created_at || new Date().toISOString(),
                  lesson_title: title,
                });
              }
            }
          }
          setProgressData(fallbackProg);
        }

        // Get student's class mapping to find assignments
        const { data: scData } = await supabase
          .from('students_classes')
          .select('class_id, classes(grade, school_id)')
          .eq('student_id', params.id)
          .maybeSingle();

        if (scData?.class_id) {
          const { data: classMembers } = await supabase
            .from('students_classes')
            .select('student_id')
            .eq('class_id', scData.class_id);
          
          if (classMembers && classMembers.length > 0) {
            const studentIds = classMembers.map((m: any) => m.student_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, progress')
              .in('id', studentIds);
            // Doing grade peers below
          }
        }
        
        const targetGrade = profile?.grade || scData?.classes?.grade;
        const targetSchool = profile?.school_id || scData?.classes?.school_id;

        if (profile?.grade) {
          let peersQuery = supabase
            .from('profiles')
            .select('id, progress')
            .eq('role', 'learner')
            .eq('grade', profile.grade);
          
          if (targetSchool) {
            peersQuery = peersQuery.eq('school_id', targetSchool);
          }
          
          const { data: gradePeers } = await peersQuery;

          if (gradePeers) {
            setClassPeers(gradePeers);
          }
        }

        let studentAssignments: any[] = [];
        if (targetGrade) {
          let query = supabase
            .from('assignments')
            .select('*')
            .eq('grade', targetGrade)
            .order('due_date', { ascending: true });

          if (targetSchool) {
            query = query.eq('school_id', targetSchool);
          } else {
            query = query.is('school_id', null);
          }

          const { data: assignmentsData } = query ? await query : { data: null };
          if (assignmentsData) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            studentAssignments = assignmentsData.filter((a: any) => {
              const dueDate = new Date(a.due_date);
              return dueDate >= now;
            });
          }
        }
        setAssignments(studentAssignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['parent']}>
        <LoadingState message="Loading student progress report..." />
      </DashboardLayout>
    );
  }

  // Get CAPS subjects for student
  const subjects = student ? getSubjectsForGrade(student.grade) : [];
  const subjectGrades = student?.progress?.subjectGrades || {};

  // Compute stats per subject using CAPS weighting
  const getSubjectStats = (subjectName: string) => {
    const list = subjectGrades[subjectName] || [];
    
    if (subjectName === 'Coding and Robotics') {
      // Treat automated coding progress as practical tests (weight 30%)
      const autoAssessments = progressData.map(p => ({
        score: p.percent || 0,
        outOf: 100,
        type: 'practical test'
      }));
      const combined = [...list, ...autoAssessments];
      if (combined.length === 0) return { avg: 0, count: 0 };
      const avg = calculateWeightedAverage(combined);
      return { avg, count: combined.length };
    }

    if (list.length === 0) return { avg: 0, count: 0 };
    const avg = calculateWeightedAverage(list);
    return {
      avg,
      count: list.length
    };
  };

  // Overall average across ALL subjects with marks
  const overallSubjectStats = subjects.map(s => ({ name: s, ...getSubjectStats(s) }));
  const subjectsWithMarks = overallSubjectStats.filter(s => s.count > 0);
  const overallLmsAverage = subjectsWithMarks.length > 0
    ? Math.round(subjectsWithMarks.reduce((sum, s) => sum + s.avg, 0) / subjectsWithMarks.length)
    : 0;


  
  // Real class comparison
  const classComparisonData = subjects.map(s => {
    const stats = getSubjectStats(s);
    let studentAvg = stats.count > 0 ? stats.avg : 0;
    
    if (s === 'Coding and Robotics' && studentAvg === 0 && progressData.length > 0) {
        studentAvg = Math.round(progressData.reduce((acc, curr) => acc + (curr.percent || curr.score || 0), 0) / progressData.length);
    }
    
    if (studentAvg === 0) return null;
    
    let totalPeerMarks = 0;
    let peerCount = 0;
    
    classPeers.forEach(peer => {
      if (peer.id === student?.id) return;
      const peerProg = normalizeUserProgress(peer.progress || {});
      const peerSubjectGrades = peerProg?.subjectGrades || {};
      const peerList = peerSubjectGrades[s] || [];
      if (peerList.length > 0) {
        const peerAvg = Math.round(peerList.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
        totalPeerMarks += peerAvg;
        peerCount++;
      }
    });
    
    let classAvg = studentAvg;
    if (peerCount > 0) {
      classAvg = Math.round((totalPeerMarks + studentAvg) / (peerCount + 1));
    }
    
    return {
      subject: s,
      Student: studentAvg,
      Class: classAvg
    };
  }).filter(Boolean);

  const studentOverallAvgFromComparison = classComparisonData.length > 0 
    ? Math.round(classComparisonData.reduce((sum, d) => sum + d.Student, 0) / classComparisonData.length)
    : 0;

  let totalStudents = Math.max(1, classPeers.length);
  
  let peerAverages: { id: string, avg: number }[] = [];
  let studentActualAvg = studentOverallAvgFromComparison;
  
  classPeers.forEach(peer => {
     let totalSubjectAverages = 0;
     let subjectCount = 0;
     const peerProg = normalizeUserProgress(peer.progress || {});
     const peerSubjectGrades = peerProg?.subjectGrades || {};
     
     subjects.forEach(s => {
       const peerList = peerSubjectGrades[s] || [];
       if (peerList.length > 0) {
          const peerAvg = Math.round(peerList.reduce((sum: number, item: any) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }
     });
     
     const finalAvg = subjectCount > 0 ? Math.round(totalSubjectAverages / subjectCount) : 0;
     peerAverages.push({ id: peer.id, avg: finalAvg });
     
     if (student && peer.id === student.id) {
         studentActualAvg = finalAvg;
     }
  });
  
  // Sort descending by average
  peerAverages.sort((a, b) => b.avg - a.avg);
  
  let simulatedRankNumber = 1;
  const studentRankIndex = peerAverages.findIndex(p => p.id === (student?.id));
  
  if (studentRankIndex >= 0) {
      simulatedRankNumber = studentRankIndex + 1;
  } else {
      // Fallback if student is somehow not in classPeers
      peerAverages.forEach(p => {
         if (p.avg > studentActualAvg) simulatedRankNumber++;
      });
  }

  const classOverallAvg = peerAverages.length > 0
    ? Math.round(peerAverages.reduce((sum, p) => sum + p.avg, 0) / peerAverages.length)
    : studentActualAvg;

  const simulatedTotalStudents = totalStudents;
  
  return (
    <DashboardLayout allowedRoles={['parent']}>
      <div className="mb-6">
        <Link href="/dashboard/parent" className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Student Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{student?.avatar || '🎓'}</span>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student'}
            </h1>
            <p className="text-slate-500 text-sm font-semibold">Grade {student?.grade || 'R'} • National CAPS Curriculum Progress</p>
          </div>
        </div>

        {subjectsWithMarks.length > 0 && (
          <div className="text-center md:text-right">
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Overall Average</span>
            <span className="text-3xl font-black text-indigo-600">{overallLmsAverage}%</span>
          </div>
        )}
      </div>

      <div className="mb-8">
        <DashboardCalendar assignments={assignments} role="learner" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subjects & Grade Card List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Subject Reports & Marks
          </h2>

          {/* Weighted Assessment CAPS Info Banner */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight">Weighted Assessment Averages</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Subject averages calculate automatically based on school's custom weights:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-white border border-slate-200/60 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-700 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                Tests: {currentWeights.test !== undefined ? currentWeights.test : DEFAULT_WEIGHTS.test}%
              </span>
              <span className="bg-white border border-slate-200/60 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-700 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                Practical: {currentWeights['practical test'] !== undefined ? currentWeights['practical test'] : DEFAULT_WEIGHTS['practical test']}%
              </span>
              <span className="bg-white border border-slate-200/60 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-700 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                Classwork: {currentWeights.classwork !== undefined ? currentWeights.classwork : DEFAULT_WEIGHTS.classwork}%
              </span>
              <span className="bg-white border border-slate-200/60 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-700 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                Homework: {currentWeights.home !== undefined ? currentWeights.home : DEFAULT_WEIGHTS.home}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map(subject => {
              const { avg, count } = getSubjectStats(subject);
              const capsInfo = getCapsLevel(avg);
              const marksList = subjectGrades[subject] || [];

              const getSubjectIcon = (s: string) => {
                if (s.toLowerCase().includes('language')) return <BookOpen className="w-5 h-5 text-indigo-500" />;
                if (s.toLowerCase().includes('mathematics')) return <Calculator className="w-5 h-5 text-emerald-500" />;
                if (s.toLowerCase().includes('life skills') || s.toLowerCase().includes('well-being')) return <Heart className="w-5 h-5 text-rose-500" />;
                return <Cpu className="w-5 h-5 text-purple-500" />;
              };

              return (
                <div key={subject} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Subject Summary Bar */}
                  <div className="p-5 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                        {getSubjectIcon(subject)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">{subject}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {count} Registered grade mark{count !== 1 && 's'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      {count > 0 || (subject === 'Coding and Robotics' && progressData.length > 0) ? (
                        <>
                          <div className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase ${capsInfo.color}`}>
                            CAPS Lvl {capsInfo.level}
                          </div>
                          <span className="text-xl font-black text-slate-800">{avg}%</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-400 italic bg-slate-100/55 px-2.5 py-1 rounded">
                          No Marks Logged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Marks list */}
                  <div className="p-5">
                    {marksList.length > 0 ? (
                      <div className="divide-y divide-slate-100 space-y-3">
                        {marksList.slice(-3).reverse().map((item: any, i: number) => {
                          const percent = Math.round((item.score / item.outOf) * 100);
                          return (
                            <div key={item.id || i} className="pt-3 first:pt-0 flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-slate-700 text-xs">{item.name}</h4>
                                  {getTypeBadge(item.type)}
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.feedback && (
                                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 italic mt-1 max-w-lg">
                                    Teacher Feedback: &ldquo;{item.feedback}&rdquo;
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-black text-slate-800 text-xs">{item.score} / {item.outOf}</span>
                                <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{percent}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : subject === 'Coding and Robotics' && progressData.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-xs text-slate-600 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/30 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-current shrink-0 animate-pulse" />
                          <span>Student is actively exploring lessons on the Coding & Robotics map. Here are the 3 most recent completed milestones:</span>
                        </div>
                        <div className="space-y-2">
                          {progressData.slice(-3).reverse().map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                              <span className="font-bold text-slate-700 text-xs">{p.lesson_title}</span>
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black text-[10px]">
                                {p.score} <Star className="w-3 h-3 fill-current" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-400 italic">No teacher feedback or marks registered for this subject yet.</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
          
          {/* Class Comparison */}
          {classComparisonData.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mt-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="font-black text-slate-800 text-sm">Class Average Comparison</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Overall Avg</span>
                    <span className="text-sm font-black text-indigo-700">{studentOverallAvgFromComparison}% <span className="text-xs text-indigo-400 font-medium">vs {classOverallAvg}%</span></span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Class Rank</span>
                    <span className="text-sm font-black text-emerald-700">{simulatedRankNumber} <span className="text-xs text-emerald-500 font-medium">of {simulatedTotalStudents}</span></span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="Student" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="Class" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Overall AI Diagnostics */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm mt-6">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Overall AI Diagnostics</h3>
            </div>
            <div className="p-5">
              <DeepDiveAIReport
                studentName={student?.first_name || 'Student'}
                subjectName="All Subjects Overview"
                marks={Object.entries(subjectGrades).flatMap(([subj, marksArr]) => 
                  (marksArr as any[]).map(m => ({ ...m, subject: subj }))
                )}
                progressData={progressData}
                role="parent"
              />
            </div>
          </div>
        </div>

        {/* CAPS Achievement Info Sidebar */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            National Standards
          </h2>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">South African Achievement Levels</p>
              <div className="space-y-2">
                {[7, 6, 5, 4, 3, 2, 1].map(l => {
                  let desc = '';
                  let scoreRange = '';
                  let color = '';
                  if (l === 7) { desc = 'Outstanding'; scoreRange = '80-100%'; color = 'text-emerald-700 bg-emerald-50 border-emerald-100'; }
                  else if (l === 6) { desc = 'Meritorious'; scoreRange = '70-79%'; color = 'text-teal-700 bg-teal-50 border-teal-100'; }
                  else if (l === 5) { desc = 'Substantial'; scoreRange = '60-69%'; color = 'text-blue-700 bg-blue-50 border-blue-100'; }
                  else if (l === 4) { desc = 'Adequate'; scoreRange = '50-59%'; color = 'text-indigo-700 bg-indigo-50 border-indigo-100'; }
                  else if (l === 3) { desc = 'Moderate'; scoreRange = '40-49%'; color = 'text-amber-700 bg-amber-50 border-amber-100'; }
                  else if (l === 2) { desc = 'Elementary'; scoreRange = '30-39%'; color = 'text-orange-700 bg-orange-50 border-orange-100'; }
                  else { desc = 'Not Achieved'; scoreRange = '0-29%'; color = 'text-rose-700 bg-rose-50 border-rose-100'; }

                  return (
                    <div key={l} className={`flex justify-between items-center px-3 py-1.5 border rounded-lg text-xs font-bold ${color}`}>
                      <span>Lvl {l}: {desc}</span>
                      <span>{scoreRange}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}