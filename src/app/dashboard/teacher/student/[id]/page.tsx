'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { scaleOldProgressScore, getSubjectsForGrade, normalizeUserProgress, CURRICULUM_LESSONS, SUBJECT_STRANDS } from '@/curriculumData';
import { saveStudentProgress } from '@/lib/db';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { 
  ArrowLeft, Brain, Target, TrendingUp, Clock, CheckCircle2, 
  AlertCircle, Award, Sparkles, BookOpen, ClipboardCheck, 
  Plus, Calendar, Calculator, Heart, Trash2, Cpu
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { DeepDiveAIReport } from '@/components/DeepDiveAIReport';

function getCapsLevel(percent: number) {
  if (percent >= 80) return { level: 7, name: 'Outstanding Achievement', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  if (percent >= 70) return { level: 6, name: 'Meritorious Achievement', color: 'bg-teal-100 text-teal-800 border-teal-200' };
  if (percent >= 60) return { level: 5, name: 'Substantial Achievement', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  if (percent >= 50) return { level: 4, name: 'Adequate Achievement', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  if (percent >= 40) return { level: 3, name: 'Moderate Achievement', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  if (percent >= 30) return { level: 2, name: 'Elementary Achievement', color: 'bg-orange-100 text-orange-800 border-orange-200' };
  return { level: 1, name: 'Not Achieved', color: 'bg-rose-100 text-rose-800 border-rose-200' };
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

export default function StudentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const currentWeights = getAssessmentWeights();

  const [student, setStudent] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom LMS states
  const [activeTab, setActiveTab] = useState<'lms' | 'robotics'>('lms');
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAnalyticsSubject, setSelectedAnalyticsSubject] = useState<string | null>(null);
  
  // Mark Form fields
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState<'home' | 'classwork' | 'test' | 'practical test'>('classwork');
  const [score, setScore] = useState<number | ''>('');
  const [outOf, setOutOf] = useState<number | ''>(10);
  const [feedback, setFeedback] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  // Defined activities for single student page
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [deleteMarkConfirmId, setDeleteMarkConfirmId] = useState<string | null>(null);
  const [classPeers, setClassPeers] = useState<any[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('caps_defined_activities_v2');
      let currentActivities = [];
      if (stored) {
        try {
          currentActivities = JSON.parse(stored);
          setActivities(currentActivities);
          if (student?.grade) {
            const filtered = currentActivities.filter((a: any) => a.grade === student.grade);
            if (filtered.length > 0) {
              setSelectedActivityId(filtered[0].id);
            }
          }
        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      }
      setActivitiesLoaded(true);
      
      // Auto-cleanup orphaned marks from the database if they were deleted from activities
      if (student && student.progress && student.progress.subjectGrades) {
        let changed = false;
        const validActivityIds = new Set(currentActivities.map((a: any) => a.id));
        const newSubjectGrades = { ...student.progress.subjectGrades };
        
        for (const subject in newSubjectGrades) {
          const list = newSubjectGrades[subject] || [];
          const filtered = list.filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
          if (filtered.length !== list.length) {
            newSubjectGrades[subject] = filtered;
            changed = true;
          }
        }
        
        if (changed) {
          const newProgress = { ...student.progress, subjectGrades: newSubjectGrades };
          saveStudentProgress(student.id, newProgress).then(() => {
             console.log('Cleaned up orphaned marks from database');
          });
          // Note: local student state will be updated by the memo, or we can let it be
        }
      }
    }
  }, [student?.grade, student?.id]); // Note: intentionally omitting student.progress to avoid loops, this just runs on mount/grade change

  useEffect(() => {
    if (selectedActivityId) {
      const act = activities.find(a => a.id === selectedActivityId);
      if (act) {
        setSelectedSubject(act.subject);
        setAssessmentName(act.name);
        setAssessmentType(act.type);
        setOutOf(act.outOf);
        setDate(act.date);
      }
    }
  }, [selectedActivityId, activities]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch student profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();

        if (profileErr) throw profileErr;
        
        const normalized = normalizeUserProgress(profile.progress || {});
        setStudent({ ...profile, progress: normalized });

        const { data: scData } = await supabase
          .from('students_classes')
          .select('class_id')
          .eq('student_id', studentId)
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
            // using grade peers below instead
          }
        }
        
        if (profile?.grade) {
          let peersQuery = supabase
            .from('profiles')
            .select('id, progress')
            .eq('role', 'learner')
            .eq('grade', profile.grade);
            
          if (profile.school_id) {
            peersQuery = peersQuery.eq('school_id', profile.school_id);
          }
          
          const { data: gradePeers } = await peersQuery;
          if (gradePeers) {
            setClassPeers(gradePeers);
          }
        }

        // Process robotics progress into analytics data
        let history: any[] = [];
        let calculatedStars = 0;
        
        if (normalized) {
          const starsEarned = normalized.starsEarned || {};
          const marksPossible = normalized.marksPossible || {};
          const completedWeeks = normalized.completedWeeks || {};
          
          for (const key of Object.keys(completedWeeks)) {
            if (completedWeeks[key]) {
              const rawScore = starsEarned[key] || 0;
              const rawPossible = marksPossible[key] || 0;
              const { stars, possible } = scaleOldProgressScore(key, rawScore, rawPossible, normalized);
              calculatedStars += stars;
              const percent = possible > 0 ? Math.round((stars / possible) * 100) : 100;
              
              const parts = key.split('-');
              let name = key;
              if (parts.length >= 3) {
                name = `Term ${parts[1].replace('T', '')} Wk ${parts[2].replace('W', '')}`;
              }
              
              history.push({
                id: key,
                name: name,
                score: percent,
                rawStars: stars,
                possible: possible
              });
            }
          }
        }
        
        history.sort((a, b) => a.id.localeCompare(b.id));
        setProgressData(history);
        setTotalStars(calculatedStars);
        
      } catch (err: any) {
        console.error(err);
        setError('Could not load student analytics');
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      loadData();
    }
  }, [studentId]);

  // Get CAPS subjects for this student's grade safely
  const subjects = React.useMemo(() => student ? getSubjectsForGrade(student.grade) : [], [student]);
  const subjectGrades = React.useMemo(() => {
    const raw = student?.progress?.subjectGrades || {};
    if (!activitiesLoaded) return raw;
    
    const validActivityIds = new Set(activities.map(a => a.id));
    const cleaned: Record<string, any[]> = {};
    
    for (const [subject, grades] of Object.entries(raw)) {
      cleaned[subject] = (grades as any[]).filter(g => 
        !g.activityId || validActivityIds.has(g.activityId)
      );
    }
    return cleaned;
  }, [student, activities, activitiesLoaded]);

  // Compute stats per subject using CAPS weighting
  const getSubjectStats = React.useCallback((subjectName: string) => {
    const list = subjectGrades[subjectName] || [];
    if (subjectName === 'Coding and Robotics') {
      // Treat automated coding progress as practical tests (weight 30%)
      const autoAssessments = progressData.map(p => ({
        score: p.score,
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
  }, [subjectGrades, progressData]);

  // CAPS Coding & Robotics Strands analysis data
  const roboticsRadarData = React.useMemo(() => {
    const strandScores = {
      Coding: { total: 0, count: 0 },
      Robotics: { total: 0, count: 0 },
      Digital: { total: 0, count: 0 }
    };

    if (student?.progress) {
      const starsEarned = student.progress.starsEarned || {};
      const marksPossible = student.progress.marksPossible || {};
      const completedWeeks = student.progress.completedWeeks || {};
      
      Object.keys(completedWeeks).forEach(key => {
        if (completedWeeks[key]) {
          const lesson = CURRICULUM_LESSONS.find(l => l.id === key);
          if (lesson && (lesson.strand === 'Coding' || lesson.strand === 'Robotics' || lesson.strand === 'Digital')) {
            const rawScore = starsEarned[key] || 0;
            const rawPossible = marksPossible[key] || 0;
            const { stars, possible } = scaleOldProgressScore(key, rawScore, rawPossible, student.progress);
            const percent = possible > 0 ? Math.round((stars / possible) * 100) : 100;
            
            strandScores[lesson.strand as 'Coding' | 'Robotics' | 'Digital'].total += percent;
            strandScores[lesson.strand as 'Coding' | 'Robotics' | 'Digital'].count += 1;
          }
        }
      });
    }

    return [
      {
        subject: 'Algorithms & Coding',
        A: strandScores.Coding.count > 0 ? Math.round(strandScores.Coding.total / strandScores.Coding.count) : 0,
        fullMark: 100
      },
      {
        subject: 'Robotics & Automation',
        A: strandScores.Robotics.count > 0 ? Math.round(strandScores.Robotics.total / strandScores.Robotics.count) : 0,
        fullMark: 100
      },
      {
        subject: 'Digital Skills & Citizenship',
        A: strandScores.Digital.count > 0 ? Math.round(strandScores.Digital.total / strandScores.Digital.count) : 0,
        fullMark: 100
      }
    ];
  }, [student]);

  // Subject specific memoized calculations for dynamic view
  const subjectChartData = React.useMemo(() => {
    if (!selectedAnalyticsSubject) return [];
    
    // Get list of marks
    const list = [...(subjectGrades[selectedAnalyticsSubject] || [])];
    
    // For Coding and Robotics, if there's no manual mark, merge automated progressData
    if (selectedAnalyticsSubject === 'Coding and Robotics' && list.length === 0) {
      const autoAssessments = progressData.map(p => ({
        name: p.name,
        score: p.score,
        outOf: 100,
        date: new Date().toISOString()
      }));
      const combined = [...list, ...autoAssessments];
      return combined.map((item, index) => ({
        name: item.name || `Assoc ${index + 1}`,
        score: Math.round((item.score / item.outOf) * 100),
        date: item.date ? new Date(item.date).toLocaleDateString() : ''
      }));
    }
    
    // Sort marks list chronologically by date
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return list.map((item, index) => ({
      name: item.name || `Assoc ${index + 1}`,
      score: Math.round((item.score / item.outOf) * 100),
      date: item.date ? new Date(item.date).toLocaleDateString() : ''
    }));
  }, [selectedAnalyticsSubject, subjectGrades, progressData]);

  // CAPS Strands analysis data for any clicked subject
  const subjectRadarData = React.useMemo(() => {
    if (!selectedAnalyticsSubject) return [];
    
    const strands = SUBJECT_STRANDS[selectedAnalyticsSubject] || ['General Skills'];
    const marks = subjectGrades[selectedAnalyticsSubject] || [];
    
    // Special handling for Coding and Robotics: merge automated lesson progress too if needed
    let codingMarks = [...marks];
    if (selectedAnalyticsSubject === 'Coding and Robotics' && progressData.length > 0) {
      // Create automated marks mapped to their proper strand
      const autoMarks = progressData.map(p => {
        // Find corresponding curriculum lesson to find its strand
        const lesson = CURRICULUM_LESSONS.find(l => l.title === p.name);
        let strandName = 'Algorithms & Coding'; // default
        if (lesson) {
          if (lesson.strand === 'Coding') strandName = 'Algorithms & Coding';
          else if (lesson.strand === 'Robotics') strandName = 'Robotics & Automation';
          else if (lesson.strand === 'Digital') strandName = 'Digital Skills & Citizenship';
        }
        return {
          score: p.score,
          outOf: 100,
          strand: strandName
        };
      });
      codingMarks = [...codingMarks, ...autoMarks];
    }

    return strands.map(st => {
      // Find assessments that belong to this strand
      const strandMarks = codingMarks.filter((m: any) => {
        // If the mark has a pre-assigned strand from autoMarks
        if (m.strand) {
          return m.strand.toLowerCase() === st.toLowerCase();
        }
        // Otherwise look up defined activity
        const act = activities.find(a => a.id === m.activityId || a.name === m.name);
        if (act && act.strand) {
          return act.strand.toLowerCase() === st.toLowerCase();
        }
        // Fallback matching substring in name
        const n = (m.name || '').toLowerCase();
        if (st.toLowerCase().includes('number') && (n.includes('count') || n.includes('math') || n.includes('number') || n.includes('add') || n.includes('sub'))) return true;
        if (st.toLowerCase().includes('pattern') && (n.includes('pattern') || n.includes('shape') || n.includes('sequence'))) return true;
        if (st.toLowerCase().includes('reading') && (n.includes('read') || n.includes('phonics') || n.includes('sound') || n.includes('word'))) return true;
        if (st.toLowerCase().includes('writing') && (n.includes('write') || n.includes('spelling') || n.includes('handwriting'))) return true;
        if (st.toLowerCase().includes('listening') && (n.includes('listen') || n.includes('speak') || n.includes('oral'))) return true;
        return false;
      });

      let avgScore = 0;
      if (strandMarks.length > 0) {
        const totalPct = strandMarks.reduce((sum: number, m: any) => sum + Math.round((m.score / m.outOf) * 100), 0);
        avgScore = Math.round(totalPct / strandMarks.length);
      }

      return {
        subject: st,
        A: avgScore,
        fullMark: 100
      };
    });
  }, [selectedAnalyticsSubject, subjectGrades, activities, progressData]);

  const aiRecommendation = React.useMemo(() => {
    if (!selectedAnalyticsSubject) return '';
    
    // Get subject stats safely using weighted average
    const { avg } = getSubjectStats(selectedAnalyticsSubject);
    
    if (selectedAnalyticsSubject.includes('Language')) {
      if (avg >= 80) return `${student?.first_name} exhibits outstanding language acquisition. We recommend assigning creative writing journals or advanced phonetic reading books to challenge them.`;
      if (avg >= 50) return `${student?.first_name} shows reliable reading and comprehension progress. Regular practice in daily speech exercises and targeted spelling worksheets will solidify their performance.`;
      return `${student?.first_name} requires focused support with reading decodability and spelling. Daily shared phonics sessions and guided handwriting practice are highly recommended.`;
    }
    
    if (selectedAnalyticsSubject.includes('Mathematics')) {
      if (avg >= 80) return `${student?.first_name} demonstrates superb numeracy. Engage them with multi-step word problems, patterns, and geometric spatial tasks to further enrich their learning.`;
      if (avg >= 50) return `${student?.first_name} has built a solid computational foundation. Suggest additional shape, measurement, and data handling drills to improve problem-solving speed.`;
      return `Targeted arithmetic remediation is recommended for ${student?.first_name}. Use tactile aids like counters, blocks, and pattern charts to visually model numbers and relationships.`;
    }
    
    if (selectedAnalyticsSubject.includes('Life Skills')) {
      if (avg >= 80) return `${student?.first_name} shows excellent engagement in classroom topics and creative projects. Continue cultivating their leadership skills and physical education routines.`;
      if (avg >= 50) return `${student?.first_name} exhibits good personal and social understanding. Guide them to explore more visual arts and collaborative play activities.`;
      return `${student?.first_name} would benefit from structured social development tasks. Collaborate with parents to establish consistent study and self-reflection habits.`;
    }
    
    if (selectedAnalyticsSubject.includes('Robotics') || selectedAnalyticsSubject.includes('Coding')) {
      if (avg >= 80) return `${student?.first_name} shows excellent logical thinking. Direct them toward block programming challenges and automated sequence creation in coding maps.`;
      if (avg >= 50) return `${student?.first_name} is performing well in sequencing. Standard practice with step-by-step algorithms and loop functions will continue to lift their score.`;
      return `${student?.first_name} needs additional focus on programming sequencing. Encourage unplugged grid navigation and step-by-step instruction worksheets.`;
    }
    
    // Fallback general recommendations
    if (avg >= 80) return `${student?.first_name} performs at an outstanding level in this subject. Keep them engaged with extension tasks and interactive digital assignments.`;
    if (avg >= 50) return `${student?.first_name} is on track with CAPS expectations. Support them with regular revision of core definitions and diagnostic workbook tasks.`;
    return `Additional teacher guidance is recommended to help ${student?.first_name} achieve the expected CAPS learning milestones for this subject area.`;
  }, [selectedAnalyticsSubject, student, getSubjectStats]);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading student analytics..." />
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || 'Student not found.'}
        </div>
      </DashboardLayout>
    );
  }

  // Form submission handler to save manual mark
  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !assessmentName || score === '' || outOf === '') return;

    try {
      const parsedScore = Number(score);
      const parsedOutOf = Number(outOf);
      
      const newAssessment = {
        id: `assessment-${Date.now()}`,
        activityId: selectedActivityId || undefined,
        name: assessmentName,
        type: assessmentType,
        score: parsedScore,
        outOf: parsedOutOf,
        date: new Date(date).toISOString(),
        feedback: feedback.trim() || undefined
      };

      // Filter out existing mark for the same activity or name to prevent duplication
      const existingList = subjectGrades[selectedSubject] || [];
      const filteredList = existingList.filter((g: any) => {
        if (selectedActivityId && g.activityId === selectedActivityId) return false;
        if (g.name === assessmentName) return false;
        return true;
      });

      const updatedSubjectGrades = {
        ...subjectGrades,
        [selectedSubject]: [
          ...filteredList,
          newAssessment
        ]
      };

      const updatedProgress = {
        ...student.progress,
        subjectGrades: updatedSubjectGrades
      };

      await saveStudentProgress(student.id, updatedProgress);

      // Local state update
      setStudent({
        ...student,
        progress: updatedProgress
      });

      // Reset form
      setScore('');
      setFeedback('');
      setShowMarkForm(false);
    } catch (err) {
      console.error('Error saving student mark:', err);
      alert('Failed to save student mark.');
    }
  };

  // Delete a manual mark
  const handleDeleteMark = async (subject: string, assessmentId: string) => {
    try {
      const updatedList = (subjectGrades[subject] || []).filter((a: any) => a.id !== assessmentId);
      const updatedSubjectGrades = {
        ...subjectGrades,
        [subject]: updatedList
      };

      const updatedProgress = {
        ...student.progress,
        subjectGrades: updatedSubjectGrades
      };

      await saveStudentProgress(student.id, updatedProgress);

      // Local state update
      setStudent({
        ...student,
        progress: updatedProgress
      });
    } catch (err) {
      console.error('Error deleting student mark:', err);
    }
  };

  // Overall average across ALL subjects
  const overallSubjectStats = subjects.map(s => ({ name: s, ...getSubjectStats(s) }));
  const subjectsWithMarks = overallSubjectStats.filter(s => s.count > 0);
  const overallLmsAverage = subjectsWithMarks.length > 0
    ? Math.round(subjectsWithMarks.reduce((sum, s) => sum + s.avg, 0) / subjectsWithMarks.length)
    : 0;

  // Coding average
  const codingAverage = progressData.length > 0 
    ? Math.round(progressData.reduce((acc, curr) => acc + curr.score, 0) / progressData.length)
    : 0;

  // Skills Distribution data for Radar based on ALL CAPS subjects
  const timelineData = Object.entries(subjectGrades)
    .flatMap(([subject, marks]) => (marks as any[]).map(m => ({
      ...m,
      subject,
      percent: Math.round((m.score / m.outOf) * 100),
      dateObj: new Date(m.date)
    })))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .map(d => ({
      name: d.name,
      date: new Date(d.date).toLocaleDateString(),
      percent: d.percent,
      subject: d.subject
    }));

  const radarSkillsData = subjects.map(s => {
    const stats = getSubjectStats(s);
    return {
      subject: s,
      A: stats.count > 0 ? stats.avg : (s === 'Coding and Robotics' && codingAverage > 0 ? codingAverage : 0),
      fullMark: 100
    };
  });


  
  // Real class comparison
  const validActivityIds = new Set(activities.map(a => a.id));

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
      const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
      if (peerList.length > 0) {
        const peerAvg = calculateWeightedAverage(peerList);
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
       const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
       if (peerList.length > 0) {
          const peerAvg = calculateWeightedAverage(peerList);
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
    <DashboardLayout allowedRoles={['teacher']}>
      {/* Header section with profile */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{student.avatar || '🎓'}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-slate-500 text-sm font-semibold flex items-center gap-1.5">
                Grade {student.grade || 'R'} • South African LMS Profile
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start md:self-auto shadow-inner">
          <button
            onClick={() => {
              setActiveTab('lms');
              setSelectedAnalyticsSubject(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'lms' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            LMS Subjects Records
          </button>
          <button
            onClick={() => {
              setActiveTab('robotics');
              setSelectedAnalyticsSubject(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'robotics' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Coding & Robotics Analytics
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Overall Subject Avg"
          value={subjectsWithMarks.length > 0 ? `${overallLmsAverage}%` : 'N/A'}
          icon={<Calculator className="w-6 h-6" />}
          color="indigo"
          trend={overallLmsAverage >= 80 ? 'positive' : overallLmsAverage < 50 ? 'negative' : 'neutral'}
          trendValue={overallLmsAverage >= 80 ? 'Outstanding' : overallLmsAverage < 50 ? 'Needs Support' : 'On Track'}
        />
        <StatCard
          title="Subjects Enrolled"
          value={subjects.length}
          icon={<BookOpen className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Manual Marks Capture"
          value={Object.values(subjectGrades).flat().length}
          icon={<ClipboardCheck className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title={activeTab === 'lms' ? "Overall CAPS Level" : "Coding Star Level"}
          value={activeTab === 'lms' 
            ? (subjectsWithMarks.length > 0 ? `Level ${getCapsLevel(overallLmsAverage).level}` : 'N/A')
            : `${totalStars} Stars`
          }
          icon={activeTab === 'lms' ? <Award className="w-6 h-6" /> : <StarIcon className="w-6 h-6" />}
          color="purple"
          trend={activeTab === 'lms' && subjectsWithMarks.length > 0 ? 'positive' : undefined}
          trendValue={activeTab === 'lms' && subjectsWithMarks.length > 0 ? getCapsLevel(overallLmsAverage).name : undefined}
        />
      </div>

      {activeTab === 'lms' ? (
        selectedAnalyticsSubject ? (
          /* Detailed Subject Analytics Panel */
          <div className="space-y-8 animate-in fade-in duration-300 w-full col-span-full">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedAnalyticsSubject(null)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 transition-all cursor-pointer flex items-center justify-center"
                  title="Go back to list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    {selectedAnalyticsSubject} Analytics
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-indigo-100">
                      Detailed View
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">CAPS performance indicators and diagnostic metrics for {student?.first_name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubject(selectedAnalyticsSubject);
                  setShowMarkForm(true);
                  setSelectedAnalyticsSubject(null); // Go back to record a mark
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Record New Assessment
              </button>
            </div>

            {/* Subject Specific stats */}
            {(() => {
              const { avg, count } = getSubjectStats(selectedAnalyticsSubject);
              const capsInfo = getCapsLevel(avg);
              const marksList = subjectGrades[selectedAnalyticsSubject] || [];
              const lastMark = marksList.length > 0 ? marksList[marksList.length - 1] : null;

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Subject Average"
                      value={count > 0 || (selectedAnalyticsSubject === 'Coding and Robotics' && progressData.length > 0) ? `${selectedAnalyticsSubject === 'Coding and Robotics' && count === 0 ? codingAverage : avg}%` : 'N/A'}
                      icon={<Calculator className="w-6 h-6" />}
                      color="indigo"
                      trend={avg >= 80 ? 'positive' : avg < 50 ? 'negative' : 'neutral'}
                      trendValue={avg >= 80 ? 'Outstanding' : avg < 50 ? 'Needs Support' : 'On Track'}
                    />
                    <StatCard
                      title="CAPS Level"
                      value={count > 0 || (selectedAnalyticsSubject === 'Coding and Robotics' && progressData.length > 0) ? `Level ${capsInfo.level}` : 'N/A'}
                      icon={<Award className="w-6 h-6" />}
                      color="emerald"
                      trend={count > 0 ? 'positive' : undefined}
                      trendValue={capsInfo.name}
                    />
                    <StatCard
                      title="Assessments Conducted"
                      value={count}
                      icon={<ClipboardCheck className="w-6 h-6" />}
                      color="amber"
                    />
                    <StatCard
                      title="Most Recent Mark"
                      value={lastMark ? `${Math.round((lastMark.score / lastMark.outOf) * 100)}%` : 'N/A'}
                      icon={<TrendingUp className="w-6 h-6" />}
                      color="purple"
                      trend={lastMark ? 'neutral' : undefined}
                      trendValue={lastMark ? lastMark.name : undefined}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Trend Graph */}
                    <div className="lg:col-span-2">
                      <DashboardCard title={`${selectedAnalyticsSubject} Performance Trend`}>
                        {subjectChartData.length > 0 ? (
                          <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={subjectChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                                  dy={10}
                                />
                                <YAxis 
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: '#64748b', fontSize: 11 }}
                                  domain={[0, 100]}
                                  tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: number) => [`${value}%`, 'Score']}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="score" 
                                  stroke="#6366f1" 
                                  strokeWidth={3}
                                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                  activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <EmptyState 
                            title="No Performance Data" 
                            description="No manual assessments have been registered yet to map performance progression."
                            icon={<TrendingUp className="h-10 w-10 text-slate-300" />}
                          />
                        )}
                      </DashboardCard>
                    </div>

                    {/* Radar Chart for CAPS strands */}
                    <div>
                      <DashboardCard title="CAPS Strands Analysis">
                        <div className="h-[300px] w-full flex items-center justify-center">
                          {subjectRadarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectRadarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.4} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No strand data available.</p>
                          )}
                        </div>
                      </DashboardCard>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Assessments Table/List */}
                    <div className="lg:col-span-2">
                      <DashboardCard title="Subject Marksheets & Assessments History">
                        {marksList.length > 0 ? (
                          <div className="divide-y divide-slate-100 space-y-4">
                            {marksList.map((item: any, i: number) => {
                              const percent = Math.round((item.score / item.outOf) * 100);
                              return (
                                <div key={item.id || i} className="pt-4 first:pt-0 flex justify-between items-start gap-4">
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-extrabold text-slate-700 text-xs truncate">{item.name}</h4>
                                      {getTypeBadge(item.type)}
                                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {item.feedback && (
                                      <p className="text-xs text-slate-500 italic font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                                        &ldquo;{item.feedback}&rdquo;
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                      <span className="font-black text-slate-800 text-sm">
                                        {item.score} / {item.outOf}
                                      </span>
                                      <span className="block text-[10px] text-indigo-600 font-extrabold uppercase">
                                        {percent}%
                                      </span>
                                    </div>
                                    {deleteMarkConfirmId === item.id ? (
                                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2 py-1 rounded-xl animate-in fade-in zoom-in-95 duration-200 shrink-0">
                                        <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Sure?</span>
                                        <button
                                          onClick={() => {
                                            handleDeleteMark(selectedAnalyticsSubject, item.id);
                                            setDeleteMarkConfirmId(null);
                                          }}
                                          className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setDeleteMarkConfirmId(null)}
                                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteMarkConfirmId(item.id)}
                                        className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors shrink-0"
                                        title="Delete mark record"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-xs text-slate-400 italic">No manual assessments have been registered for this subject yet.</p>
                            <button
                              onClick={() => {
                                setSelectedSubject(selectedAnalyticsSubject);
                                setShowMarkForm(true);
                                setSelectedAnalyticsSubject(null);
                              }}
                              className="mt-3 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                            >
                              + Capture First Assessment
                            </button>
                          </div>
                        )}
                      </DashboardCard>
                    </div>

                    {/* AI Diagnostics Card */}
                    <div>
                      <DashboardCard title="Diagnostic & CAPS Recommendations" color="indigo">
                        <div className="space-y-4">
                          <DeepDiveAIReport
                            studentName={student?.first_name || 'Student'}
                            subjectName={selectedAnalyticsSubject}
                            marks={marksList}
                            progressData={selectedAnalyticsSubject === 'Coding and Robotics' ? progressData : []}
                            role="teacher"
                            initialBasicRecommendation={aiRecommendation}
                          />

                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mt-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-2">Subject Performance Zone</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full ${avg >= 80 ? 'bg-emerald-500 animate-pulse' : avg >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                              <span className="text-xs font-black text-slate-700">
                                {avg >= 80 ? 'Exceptional Milestones' : avg >= 50 ? 'On-Track Development' : 'Intense Diagnostic Focus'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </DashboardCard>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Subjects and Marks List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
              <div>
                <h2 className="font-extrabold text-slate-800 text-lg">South African CAPS Subjects</h2>
                <p className="text-xs text-slate-400 font-medium">Record and track grade reporting targets</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSubject(subjects[0] || '');
                  setShowMarkForm(!showMarkForm);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-100"
              >
                <Plus className="w-4 h-4" /> Record New Mark
              </button>
            </div>

            {/* Weighted Assessment CAPS Info Banner */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight">Weighted Assessment Averages</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Subject averages calculate automatically based on your school's custom weights:
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

            {/* Quick Inline Mark Capture Form */}
            {showMarkForm && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-2xl p-6 shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Capture Mark for {student.first_name}
                </h3>
                
                {activities.filter(a => a.grade === student.grade).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-amber-800">No Defined Activities Found for Grade {student.grade}</p>
                    <p className="text-[11px] text-amber-600 mt-1 max-w-md mx-auto">
                      To prevent a situation where some students have activities while others don't, you must create a class-wide activity first.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/teacher/assessments')}
                      className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Go to Capture Marks Console & Create Activity
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveMark} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                        Select Defined Activity (Grade {student.grade})
                      </label>
                      <select
                        value={selectedActivityId}
                        onChange={e => setSelectedActivityId(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                      >
                        {activities.filter(a => a.grade === student.grade).map(act => (
                          <option key={act.id} value={act.id}>
                            [{act.subject}] {act.name} (Max: {act.outOf})
                          </option>
                        ))}
                      </select>
                    </div>

                    {(() => {
                      const act = activities.find(a => a.id === selectedActivityId);
                      if (!act) return null;
                      return (
                        <>
                          {/* Activity Details Display */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Subject</span>
                              <span className="font-extrabold text-slate-700">{act.subject}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Assessment Type</span>
                              <div className="mt-0.5">{getTypeBadge(act.type)}</div>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Max Possible</span>
                              <span className="font-extrabold text-slate-700">{act.outOf} Marks</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Date Conducted</span>
                              <span className="font-extrabold text-slate-700">{new Date(act.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                                Learner Score
                              </label>
                              <input
                                required
                                type="number"
                                min={0}
                                max={act.outOf}
                                placeholder={`e.g. 15 (max ${act.outOf})`}
                                value={score}
                                onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                                Observations & Diagnostic Commentary
                              </label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Showed great improvement, identified phonics patterns correctly."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-all resize-none"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowMarkForm(false)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5"
                            >
                              Save Grade Record
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </form>
                )}
              </div>
            )}

            {/* Subject Detail Sections */}
            <div className="space-y-4">
              {subjects.map(subject => {
                const { avg, count } = getSubjectStats(subject);
                const capsInfo = getCapsLevel(avg);
                const marksList = subjectGrades[subject] || [];

                // Custom subject styling
                const getSubjectIcon = (s: string) => {
                  if (s.toLowerCase().includes('language')) return <BookOpen className="w-5 h-5 text-indigo-500" />;
                  if (s.toLowerCase().includes('mathematics')) return <Calculator className="w-5 h-5 text-emerald-500" />;
                  if (s.toLowerCase().includes('life skills') || s.toLowerCase().includes('well-being')) return <Heart className="w-5 h-5 text-rose-500" />;
                  return <Cpu className="w-5 h-5 text-purple-500" />;
                };

                return (
                  <div key={subject} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                    
                    {/* Subject Header */}
                    <div 
                      onClick={() => setSelectedAnalyticsSubject(subject)}
                      className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100 cursor-pointer hover:bg-indigo-50/20 group transition-all"
                      title={`Click to view detailed ${subject} analytics`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0 group-hover:border-indigo-200 transition-colors">
                          {getSubjectIcon(subject)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            {subject}
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {count} Recorded assessment{count !== 1 && 's'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        {count > 0 || (subject === 'Coding and Robotics' && progressData.length > 0) ? (
                          <>
                            <div className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${capsInfo.color}`}>
                              CAPS Level {capsInfo.level}: {capsInfo.name}
                            </div>
                            <span className="text-2xl font-black text-slate-800">
                              {subject === 'Coding and Robotics' && count === 0 ? codingAverage : avg}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic bg-slate-100 px-3 py-1 rounded-lg">
                            No Grades Registered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Marks List */}
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
                                    <p className="text-xs text-slate-500 italic font-medium bg-slate-50 p-2.5 rounded-lg max-w-md">
                                      &ldquo;{item.feedback}&rdquo;
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <span className="font-black text-slate-800 text-sm">
                                      {item.score} / {item.outOf}
                                    </span>
                                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase">
                                      {percent}%
                                    </span>
                                  </div>
                                  {deleteMarkConfirmId === item.id ? (
                                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2 py-1 rounded-xl animate-in fade-in zoom-in-95 duration-200 shrink-0">
                                      <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Sure?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteMark(subject, item.id);
                                          setDeleteMarkConfirmId(null);
                                        }}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeleteMarkConfirmId(null)}
                                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteMarkConfirmId(item.id)}
                                      className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors shrink-0"
                                      title="Delete mark record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : subject === 'Coding and Robotics' && progressData.length > 0 ? (
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 py-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                          <span>Student is actively learning on the Coding Map. Average level complete is <b>{codingAverage}%</b>.</span>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-400 italic">No manual assessments have been registered for this subject yet.</p>
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setShowMarkForm(true);
                            }}
                            className="mt-3 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            + Capture First Assessment
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Class Comparison */}
            {classComparisonData.length > 0 && (
              <div className="mt-6">
                <DashboardCard title="Class Average Comparison" color="indigo">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
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
                </DashboardCard>
              </div>
            )}
            
            <div className="mt-6">
              <DashboardCard title="Overall AI Diagnostics" color="indigo">
                <DeepDiveAIReport
                  studentName={student?.first_name || 'Student'}
                  subjectName="All Subjects Overview"
                  marks={Object.entries(subjectGrades).flatMap(([subj, marksArr]) => 
                    (marksArr as any[]).map(m => ({ ...m, subject: subj }))
                  )}
                  progressData={progressData}
                  role="teacher"
                />
              </DashboardCard>
            </div>
          </div>

          {/* Sidebar CAPS Guidance & Radar Distribution */}
          <div className="space-y-6">
            <DashboardCard title="Curriculum Distribution">
              <div className="h-[280px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarSkillsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Student" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

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


            <DashboardCard title="CAPS Level Descriptions" color="slate">
              <div className="space-y-3">
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
                    <div key={l} className={`flex justify-between items-center px-3 py-2 border rounded-xl ${color}`}>
                      <span className="text-xs font-extrabold uppercase">Level {l}: {desc}</span>
                      <span className="text-xs font-black">{scoreRange}</span>
                    </div>
                  );
                })}
              </div>
            </DashboardCard>
          </div>

        </div>
      )) : (
        /* Original Coding & Robotics view */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Trend Graph */}
            <div className="lg:col-span-2">
              <DashboardCard title="Coding Lessons Performance Trend">
                {progressData.length > 0 ? (
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          domain={[0, 100]}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${value}%`, 'Score']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState 
                    title="No Data Available" 
                    description="This student hasn't completed any lessons yet."
                    icon={<TrendingUp className="h-10 w-10 text-slate-300" />}
                  />
                )}
              </DashboardCard>
            </div>

            {/* Radar Chart for CAPS Coding & Robotics Strands */}
            <div>
              <DashboardCard title="CAPS Strands Analysis">
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={roboticsRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DashboardCard title="Assessments & Digital Map Activities">
              {progressData.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {[...progressData].reverse().map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center mr-4 ${
                          item.score >= 80 ? 'bg-emerald-100 text-emerald-600' :
                          item.score >= 50 ? 'bg-amber-100 text-amber-600' :
                          'bg-rose-100 text-rose-600'
                        }`}>
                          {item.score >= 80 ? <Award className="w-5 h-5" /> :
                           item.score >= 50 ? <CheckCircle2 className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-500">
                            {item.rawStars} out of {item.possible} stars earned
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-lg ${
                          item.score >= 80 ? 'text-emerald-700' :
                          item.score >= 50 ? 'text-amber-700' :
                          'text-rose-700'
                        }`}>
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No Activities" 
                  description="No recent activities recorded."
                  icon={<ClipboardCheck className="h-10 w-10 text-slate-300" />}
                />
              )}
            </DashboardCard>

            <DashboardCard title="AI Intervention Suggestions" color="indigo">
              <div className="space-y-4">
                {codingAverage >= 80 ? (
                  <>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start">
                      <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-indigo-900 text-sm">Advanced Challenge</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                          {student.first_name} is performing exceptionally well. Consider assigning advanced reading materials or complex puzzle activities to keep them engaged.
                        </p>
                      </div>
                    </div>
                  </>
                ) : codingAverage >= 50 ? (
                  <>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start">
                      <Target className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900 text-sm">Targeted Practice</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          {student.first_name} has a solid foundation but could benefit from targeted practice in areas where they scored lower, particularly in Numeracy tasks.
                        </p>
                      </div>
                    </div>
                  </>
                ) : progressData.length > 0 ? (
                  <>
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start">
                      <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-rose-900 text-sm">Immediate Support Recommended</h4>
                        <p className="text-sm text-rose-700 mt-1">
                          {student.first_name} is currently struggling. Schedule a one-on-one session to review fundamental concepts and consider involving their parents.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-500 text-sm">
                    Complete some coding activities to unlock diagnostic recommendations.
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
