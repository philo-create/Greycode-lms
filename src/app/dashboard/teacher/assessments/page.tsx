'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { supabase } from '@/lib/supabase';
import { getTeacherData } from '@/lib/dashboard/teacherData';
import { getSubjectsForGrade, SUBJECT_STRANDS } from '@/curriculumData';
import { saveStudentProgress } from '@/lib/db';
import { 
  ClipboardList, Plus, Search, User, BookOpen, Target, Calendar, 
  CheckCircle, Sparkles, Star, AlertCircle, Trash2, Table, 
  UserCheck, Layers, FileSpreadsheet, Save, Info, RefreshCw, ChevronRight
} from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { LoadingState } from '@/components/dashboard/LoadingState';

export interface DefinedActivity {
  id: string;
  name: string;
  type: 'home' | 'classwork' | 'test' | 'practical test';
  subject: string;
  outOf: number;
  date: string;
  grade: string;
  strand?: string;
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

export default function TeacherAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherGrades, setTeacherGrades] = useState<string[]>([]);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'activities' | 'bulk' | 'single'>('activities');
  
  // Defined Activities list
  const [activities, setActivities] = useState<DefinedActivity[]>([]);
  const [activitySearch, setActivitySearch] = useState('');
  
  // Create Activity form states
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState<'home' | 'classwork' | 'test' | 'practical test'>('classwork');
  const [newActivitySubject, setNewActivitySubject] = useState('');
  const [newActivityStrand, setNewActivityStrand] = useState('');
  const [newActivityOutOf, setNewActivityOutOf] = useState<number | ''>(10);
  const [newActivityDate, setNewActivityDate] = useState(new Date().toISOString().substring(0, 10));
  const [newActivityGrade, setNewActivityGrade] = useState('');
  
  // Bulk entry states
  const [selectedBulkActivityId, setSelectedBulkActivityId] = useState<string>('');
  const [bulkMarks, setBulkMarks] = useState<Record<string, { score: number | ''; feedback: string }>>({});
  const [unsavedBulkIds, setUnsavedBulkIds] = useState<Record<string, boolean>>({});
  
  // Single student entry states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedSingleActivityId, setSelectedSingleActivityId] = useState<string>('');
  const [singleScore, setSingleScore] = useState<number | ''>('');
  const [singleFeedback, setSingleFeedback] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  // General feedback messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load students, grades & defined activities on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const teacherData = await getTeacherData(session.user.id);
        if (teacherData && teacherData.students) {
          // Load local student profiles from localStorage for syncing
          let localStudents: any[] = [];
          if (typeof window !== 'undefined') {
            const storedLocal = localStorage.getItem('caps_student_profiles_v1');
            if (storedLocal) {
              try {
                localStudents = JSON.parse(storedLocal);
              } catch (e) {
                console.error('Error parsing local student profiles:', e);
              }
            }
          }

          const parsedStudents = await Promise.all(teacherData.students.map(async (student: any) => {
            let dbProg = student.progress || {};
            if (typeof dbProg === 'string') {
              try {
                dbProg = JSON.parse(dbProg);
              } catch (e) {
                dbProg = {};
              }
            }

            // Sync with local student progress if any
            const localStud = localStudents.find((ls: any) => ls.id === student.id);
            let localProg = localStud?.progress || {};
            if (typeof localProg === 'string') {
              try {
                localProg = JSON.parse(localProg);
              } catch (e) {
                localProg = {};
              }
            }

            // Merge logic
            let mergedProgress = { ...dbProg };
            let hasMergeChanges = false;

            // Merge subjectGrades
            const localSubjectGrades = localProg.subjectGrades || {};
            const dbSubjectGrades = dbProg.subjectGrades || {};
            const mergedSubjectGrades = { ...dbSubjectGrades };

            Object.keys(localSubjectGrades).forEach((subject) => {
              const localList = localSubjectGrades[subject] || [];
              const dbList = dbSubjectGrades[subject] || [];
              
              const combinedMap = new Map();
              dbList.forEach((g: any) => {
                if (g && g.activityId) combinedMap.set(g.activityId, g);
              });
              
              localList.forEach((g: any) => {
                if (g && g.activityId && !combinedMap.has(g.activityId)) {
                  combinedMap.set(g.activityId, g);
                  hasMergeChanges = true;
                }
              });
              
              mergedSubjectGrades[subject] = Array.from(combinedMap.values());
            });

            // Merge attendance
            const localAttendance = localProg.attendance || {};
            const dbAttendance = dbProg.attendance || {};
            const mergedAttendance = { ...dbAttendance };

            Object.keys(localAttendance).forEach((date) => {
              if (localAttendance[date] && !dbAttendance[date]) {
                mergedAttendance[date] = localAttendance[date];
                hasMergeChanges = true;
              }
            });

            // Combine anything else
            if (hasMergeChanges) {
              mergedProgress = {
                ...mergedProgress,
                subjectGrades: mergedSubjectGrades,
                attendance: mergedAttendance
              };
              // Persist the merged progress to the database securely via our new server-side API!
              try {
                await saveStudentProgress(student.id, mergedProgress);
              } catch (err) {
                console.error('Failed to save merged student progress to DB:', err);
              }
            }

            return { ...student, progress: mergedProgress };
          }));

          setStudents(parsedStudents);
          
          // Deduplicate teacher grades
          const gradesSet = new Set<string>();
          parsedStudents.forEach((s: any) => {
            if (s.grade) gradesSet.add(s.grade);
          });
          const grades = Array.from(gradesSet);
          setTeacherGrades(grades);
          
          if (grades.length > 0) {
            setNewActivityGrade(grades[0]);
            const firstGradeSubjects = getSubjectsForGrade(grades[0]);
            setNewActivitySubject(firstGradeSubjects[0] || '');
          }

          if (parsedStudents.length > 0) {
            setSelectedStudent(parsedStudents[0]);
            const firstStudentSubjects = getSubjectsForGrade(parsedStudents[0].grade);
            setSelectedSubject(firstStudentSubjects[0] || '');
          }

          // LOAD DEFINED ACTIVITIES FROM CLOUD DATABASE (TEACHER PROFILE)
          const { data: teacherProfile } = await supabase
            .from('profiles')
            .select('progress')
            .eq('id', session.user.id)
            .single();

          let dbActivities: DefinedActivity[] = [];
          let tProg = teacherProfile?.progress || {};
          if (typeof tProg === 'string') {
            try {
              tProg = JSON.parse(tProg);
            } catch (e) {}
          }
          if (tProg && typeof tProg === 'object' && Array.isArray(tProg.definedActivities)) {
            dbActivities = [...tProg.definedActivities];
          }

          // Reconstruct activities from student subjectGrades or student definedActivities as robust fallback
          const activityIds = new Set(dbActivities.map(a => a.id));
          
          parsedStudents.forEach((student: any) => {
            const sProg = student.progress || {};
            // Check student definedActivities list if any
            if (Array.isArray(sProg.definedActivities)) {
              sProg.definedActivities.forEach((act: any) => {
                if (act && act.id && !activityIds.has(act.id)) {
                  dbActivities.push(act);
                  activityIds.add(act.id);
                }
              });
            }
            
            // Check student actual grades
            const subjectGrades = sProg.subjectGrades || {};
            Object.entries(subjectGrades).forEach(([subjectName, gradesList]: [string, any]) => {
              if (Array.isArray(gradesList)) {
                gradesList.forEach((g: any) => {
                  if (g && g.activityId && !activityIds.has(g.activityId)) {
                    const reconstructed: DefinedActivity = {
                      id: g.activityId,
                      name: g.name || 'Unnamed Activity',
                      type: g.type || 'classwork',
                      subject: subjectName,
                      strand: g.strand || 'General Skills',
                      outOf: g.outOf || 10,
                      date: g.date ? new Date(g.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                      grade: student.grade || '3'
                    };
                    dbActivities.push(reconstructed);
                    activityIds.add(g.activityId);
                  }
                });
              }
            });
          });

          // ALWAYS load local storage activities as well and merge them
          let localActivities: DefinedActivity[] = [];
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('caps_defined_activities_v2');
            if (stored) {
              try {
                localActivities = JSON.parse(stored);
              } catch (e) {
                console.error('Error parsing stored activities', e);
              }
            }
          }

          // Merge local activities into dbActivities if they don't exist
          let mergedActivities = [...dbActivities];
          const mergedIds = new Set(mergedActivities.map(a => a.id));

          localActivities.forEach(localAct => {
            if (localAct && localAct.id && !mergedIds.has(localAct.id)) {
              mergedActivities.push(localAct);
              mergedIds.add(localAct.id);
            }
          });

          // If still empty, use initial seed activities
          if (mergedActivities.length === 0) {
            mergedActivities = [
              {
                id: 'act-seed-1',
                name: 'Mathematics Counting Test 1',
                type: 'test',
                subject: 'Mathematics',
                strand: 'Numbers, Operations & Relationships',
                outOf: 20,
                date: new Date().toISOString().substring(0, 10),
                grade: '3'
              },
              {
                id: 'act-seed-2',
                name: 'Grid Map Navigation Practical',
                type: 'practical test',
                subject: 'Coding and Robotics',
                strand: 'Algorithms & Coding',
                outOf: 15,
                date: new Date().toISOString().substring(0, 10),
                grade: '3'
              },
              {
                id: 'act-seed-3',
                name: 'Phonics Homework Week 2',
                type: 'home',
                subject: 'Home Language',
                strand: 'Reading & Phonics',
                outOf: 10,
                date: new Date().toISOString().substring(0, 10),
                grade: 'R'
              }
            ];
          }

          setActivities(mergedActivities);
          if (mergedActivities.length > 0) {
            setSelectedBulkActivityId(mergedActivities[0].id);
            setSelectedSingleActivityId(mergedActivities[0].id);
          }

          // Write the merged activities list back to BOTH local storage and cloud database to keep them in 100% sync!
          if (typeof window !== 'undefined') {
            localStorage.setItem('caps_defined_activities_v2', JSON.stringify(mergedActivities));
          }

          try {
            const updatedProgress = {
              ...tProg,
              definedActivities: mergedActivities
            };
            await supabase
              .from('profiles')
              .update({ progress: updatedProgress })
              .eq('id', session.user.id);
          } catch (err) {
            console.error('Error saving merged activities to database:', err);
          }
        }
      } catch (err) {
        console.error('Error loading students or activities for assessments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update subject when grade changes in Activity setup
  useEffect(() => {
    if (newActivityGrade) {
      const subs = getSubjectsForGrade(newActivityGrade);
      setNewActivitySubject(subs[0] || '');
    }
  }, [newActivityGrade]);

  // Update strand when subject changes in Activity setup
  useEffect(() => {
    if (newActivitySubject) {
      const strands = SUBJECT_STRANDS[newActivitySubject] || ['General Skills'];
      setNewActivityStrand(strands[0] || '');
    }
  }, [newActivitySubject]);

  // Synchronize Bulk Entry Marks when selectedActivity changes
  useEffect(() => {
    const act = activities.find(a => a.id === selectedBulkActivityId);
    if (act) {
      const initialMarks: Record<string, { score: number | ''; feedback: string }> = {};
      const relevantStudents = students.filter(s => s.grade === act.grade);
      
      relevantStudents.forEach(s => {
        const grades = s.progress?.subjectGrades?.[act.subject] || [];
        const matchingMark = grades.find((g: any) => g.activityId === act.id || g.name === act.name);
        
        if (matchingMark) {
          initialMarks[s.id] = {
            score: matchingMark.score,
            feedback: matchingMark.feedback || ''
          };
        } else {
          initialMarks[s.id] = {
            score: '',
            feedback: ''
          };
        }
      });
      setBulkMarks(initialMarks);
      setUnsavedBulkIds({});
    }
  }, [selectedBulkActivityId, activities, students]);

  // Synchronize Single Student Entry details when selected student or activity changes
  useEffect(() => {
    if (selectedStudent && selectedSingleActivityId) {
      const act = activities.find(a => a.id === selectedSingleActivityId);
      if (act) {
        // Auto-select subject corresponding to selected activity
        setSelectedSubject(act.subject);
        
        const grades = selectedStudent.progress?.subjectGrades?.[act.subject] || [];
        const matchingMark = grades.find((g: any) => g.activityId === act.id || g.name === act.name);
        
        if (matchingMark) {
          setSingleScore(matchingMark.score);
          setSingleFeedback(matchingMark.feedback || '');
        } else {
          setSingleScore('');
          setSingleFeedback('');
        }
      }
    }
  }, [selectedStudent, selectedSingleActivityId, activities]);

  // Save Activities helper
  const updateActivitiesList = async (updatedList: DefinedActivity[]) => {
    setActivities(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('caps_defined_activities_v2', JSON.stringify(updatedList));
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('progress')
        .eq('id', session.user.id)
        .single();

      const currentProgress = teacherProfile?.progress || {};
      const updatedProgress = {
        ...currentProgress,
        definedActivities: updatedList
      };

      await supabase
        .from('profiles')
        .update({ progress: updatedProgress })
        .eq('id', session.user.id);
    } catch (err) {
      console.error('Error saving activities to database:', err);
    }
  };

  // Create new activity handler
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim() || !newActivitySubject || !newActivityOutOf || !newActivityGrade || !newActivityStrand) {
      setErrorMsg('Please complete all fields (including the CAPS strand) to create an activity.');
      return;
    }

    const newAct: DefinedActivity = {
      id: `activity-${Date.now()}`,
      name: newActivityName.trim(),
      type: newActivityType,
      subject: newActivitySubject,
      strand: newActivityStrand,
      outOf: Number(newActivityOutOf),
      date: newActivityDate,
      grade: newActivityGrade
    };

    const updated = [newAct, ...activities];
    updateActivitiesList(updated);
    
    // Auto-select the newly created activity
    setSelectedBulkActivityId(newAct.id);
    setSelectedSingleActivityId(newAct.id);
    
    // Clear form
    setNewActivityName('');
    setSuccessMsg(`Activity "${newAct.name}" successfully defined for Grade ${newAct.grade}!`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Delete activity handler
  const handleDeleteActivity = async (id: string, name: string) => {
    const updated = activities.filter(a => a.id !== id);
    updateActivitiesList(updated);
    
    if (selectedBulkActivityId === id && updated.length > 0) {
      setSelectedBulkActivityId(updated[0].id);
    }
    if (selectedSingleActivityId === id && updated.length > 0) {
      setSelectedSingleActivityId(updated[0].id);
    }
    
    // Also remove this activity's scores from all students' progress
    try {
      setIsSubmitting(true);
      let anyUpdated = false;
      const updatedStudents = [...students];
      
      for (let i = 0; i < updatedStudents.length; i++) {
        const student = updatedStudents[i];
        if (!student.progress || !student.progress.subjectGrades) continue;
        
        let studentChanged = false;
        const newSubjectGrades = { ...student.progress.subjectGrades };
        
        for (const subject in newSubjectGrades) {
          const list = newSubjectGrades[subject] || [];
          const filtered = list.filter((g: any) => g.activityId !== id && g.name !== name);
          if (filtered.length !== list.length) {
            newSubjectGrades[subject] = filtered;
            studentChanged = true;
          }
        }
        
        if (studentChanged) {
          anyUpdated = true;
          const newProgress = { ...student.progress, subjectGrades: newSubjectGrades };
          updatedStudents[i] = { ...student, progress: newProgress };
          await saveStudentProgress(student.id, newProgress);
        }
      }
      
      if (anyUpdated) {
        setStudents(updatedStudents);
        setSuccessMsg(`Deleted activity definition for "${name}" and removed associated scores from learners.`);
      } else {
        setSuccessMsg(`Deleted activity definition for "${name}".`);
      }
    } catch (err: any) {
      console.error('Failed to remove activity from students:', err);
      setErrorMsg('Activity deleted, but failed to remove scores from some students.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 4000);
    }
  };

  // Save single student mark handler
  const handleSaveSingleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const act = activities.find(a => a.id === selectedSingleActivityId);
    if (!selectedStudent || !act || singleScore === '') {
      setErrorMsg('Please select a student, activity, and enter a valid score.');
      return;
    }

    if (Number(singleScore) > act.outOf) {
      setErrorMsg(`Score cannot exceed maximum possible marks (${act.outOf}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const newAssessment = {
        id: `assessment-${Date.now()}`,
        activityId: act.id,
        name: act.name,
        type: act.type,
        score: Number(singleScore),
        outOf: act.outOf,
        date: new Date(act.date).toISOString(),
        feedback: singleFeedback.trim() || undefined
      };

      const currentSubjectGrades = selectedStudent.progress?.subjectGrades || {};
      const subjectGradesList = currentSubjectGrades[act.subject] || [];
      
      // Filter out previous mark for this same activity
      const filteredList = subjectGradesList.filter((g: any) => g.activityId !== act.id && g.name !== act.name);
      
      const updatedSubjectGrades = {
        ...currentSubjectGrades,
        [act.subject]: [...filteredList, newAssessment]
      };

      const updatedProgress = {
        ...selectedStudent.progress,
        subjectGrades: updatedSubjectGrades
      };

      await saveStudentProgress(selectedStudent.id, updatedProgress);

      // Update student in our local list state
      const updatedStudents = students.map(s => {
        if (s.id === selectedStudent.id) {
          return { ...s, progress: updatedProgress };
        }
        return s;
      });
      setStudents(updatedStudents);
      setSelectedStudent({ ...selectedStudent, progress: updatedProgress });

      setSuccessMsg(`Saved mark for ${selectedStudent.first_name}: ${singleScore}/${act.outOf}`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error saving student mark:', err);
      setErrorMsg('Failed to save assessment mark to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Excel-style save handler
  const handleSaveBulkMarks = async () => {
    const act = activities.find(a => a.id === selectedBulkActivityId);
    if (!act) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const relevantStudents = students.filter(s => s.grade === act.grade);
      const updatedStudents = [...students];

      let savedCount = 0;

      for (const student of relevantStudents) {
        const mark = bulkMarks[student.id];
        // Only save if there's a score provided
        if (!mark || mark.score === '') continue;

        if (Number(mark.score) > act.outOf) {
          setErrorMsg(`Error: Mark for ${student.first_name} exceeds max score of ${act.outOf}. Fix and save again.`);
          setIsSubmitting(false);
          return;
        }

        const newAssessment = {
          id: `assessment-${Date.now()}-${student.id}`,
          activityId: act.id,
          name: act.name,
          type: act.type,
          score: Number(mark.score),
          outOf: act.outOf,
          date: new Date(act.date).toISOString(),
          feedback: mark.feedback.trim() || undefined
        };

        const currentSubjectGrades = student.progress?.subjectGrades || {};
        const subjectGradesList = currentSubjectGrades[act.subject] || [];
        
        // Remove prior duplicate matching marks
        const filteredList = subjectGradesList.filter((g: any) => g.activityId !== act.id && g.name !== act.name);

        const updatedSubjectGrades = {
          ...currentSubjectGrades,
          [act.subject]: [...filteredList, newAssessment]
        };

        const updatedProgress = {
          ...student.progress,
          subjectGrades: updatedSubjectGrades
        };

        await saveStudentProgress(student.id, updatedProgress);

        // Update locally in temporary list
        const idx = updatedStudents.findIndex(s => s.id === student.id);
        if (idx !== -1) {
          updatedStudents[idx] = { ...updatedStudents[idx], progress: updatedProgress };
        }
        savedCount++;
      }

      setStudents(updatedStudents);
      setUnsavedBulkIds({});
      setSuccessMsg(`Successfully saved/synchronized marks for ${savedCount} student(s) in "${act.name}"!`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Error saving bulk marks:', err);
      setErrorMsg('Failed to process bulk marksheet save.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to change individual row in bulk marks state
  const handleBulkMarkChange = (studentId: string, field: 'score' | 'feedback', value: any) => {
    setBulkMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
    setUnsavedBulkIds(prev => ({
      ...prev,
      [studentId]: true
    }));
  };

  // Filter defined activities search
  const filteredActivities = activities.filter(act => {
    return act.name.toLowerCase().includes(activitySearch.toLowerCase()) || 
           act.subject.toLowerCase().includes(activitySearch.toLowerCase()) ||
           act.grade.toLowerCase().includes(activitySearch.toLowerCase());
  });

  // Filter student list search
  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return fullName.includes(studentSearchQuery.toLowerCase()) || 
           (s.grade || '').toLowerCase().includes(studentSearchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['teacher']}>
        <LoadingState message="Loading assessments console..." />
      </DashboardLayout>
    );
  }

  // Selected Bulk Activity
  const selectedBulkActivity = activities.find(a => a.id === selectedBulkActivityId);
  const bulkStudentsList = selectedBulkActivity ? students.filter(s => s.grade === selectedBulkActivity.grade) : [];

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Target className="w-8 h-8 text-indigo-600 animate-pulse" />
          Capture Marks Console
        </h1>
        <p className="text-slate-500 mt-1">
          Create curriculum-aligned activities first, then capture grades using fast Bulk Excel marksheet or Single entry.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        <button
          onClick={() => { setActiveTab('activities'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'activities'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Manage Class Activities
          <span className="bg-indigo-900/40 text-white px-1.5 py-0.5 rounded-md text-[10px] font-black ml-1">
            {activities.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('bulk'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'bulk'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          2. Bulk Marksheet (Excel Format)
        </button>
        <button
          onClick={() => { setActiveTab('single'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'single'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          3. Single Learner Entry
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main workspaces */}

      {/* TAB 1: MANAGE ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
            <div className="mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" />
                Define New Activity
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Define the assessment name and parameters before marking, ensuring alignment.
              </p>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Target Grade</label>
                <select
                  value={newActivityGrade}
                  onChange={e => setNewActivityGrade(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  {teacherGrades.map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                  {teacherGrades.length === 0 && (
                    <>
                      <option value="R">Grade R</option>
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Subject Area</label>
                <select
                  value={newActivitySubject}
                  onChange={e => setNewActivitySubject(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  {getSubjectsForGrade(newActivityGrade || '3').map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">CAPS Strand / Focus Area</label>
                <select
                  value={newActivityStrand}
                  onChange={e => setNewActivityStrand(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  {(SUBJECT_STRANDS[newActivitySubject] || ['General Skills']).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Assessment / Activity Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Multiplication & Division Quiz"
                  value={newActivityName}
                  onChange={e => setNewActivityName(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Assessment Type</label>
                  <select
                    value={newActivityType}
                    onChange={e => setNewActivityType(e.target.value as any)}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="classwork">Classwork</option>
                    <option value="home">Home</option>
                    <option value="test">Test</option>
                    <option value="practical test">Practical Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Total Max Marks</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={newActivityOutOf}
                    onChange={e => setNewActivityOutOf(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Date Conducted</label>
                <input
                  required
                  type="date"
                  value={newActivityDate}
                  onChange={e => setNewActivityDate(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Class Activity
              </button>
            </form>
          </div>

          {/* Directory of activities */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Class Activities Directory</h3>
                  <p className="text-xs text-slate-400">Review or delete defined student assessment templates</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:bg-white w-full md:w-60"
                  />
                </div>
              </div>

              {(() => {
                const activityTypesGroupConfig = [
                  { key: 'test', label: 'Tests', color: 'text-rose-700 bg-rose-50 border-rose-100' },
                  { key: 'practical test', label: 'Practical Tests', color: 'text-purple-700 bg-purple-50 border-purple-100' },
                  { key: 'classwork', label: 'Classwork', color: 'text-blue-700 bg-blue-50 border-blue-100' },
                  { key: 'home', label: 'Homework', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' }
                ];

                if (filteredActivities.length === 0) {
                  return (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                      <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-extrabold text-slate-700">No Matching Activities</p>
                      <p className="text-xs text-slate-400 mt-1">Try broadening your search or define a new activity on the left.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {activityTypesGroupConfig.map(typeGroup => {
                      const groupActs = filteredActivities.filter(a => a.type === typeGroup.key);
                      if (groupActs.length === 0) return null;

                      return (
                        <div key={typeGroup.key} className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${typeGroup.color}`}>
                              {typeGroup.label}
                            </span>
                            <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                              {groupActs.length}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                            {groupActs.map(act => {
                              // Count how many students have marks entered
                              const gradedCount = students.filter(s => {
                                if (s.grade !== act.grade) return false;
                                const studentGrades = s.progress?.subjectGrades?.[act.subject] || [];
                                return studentGrades.some((g: any) => g.activityId === act.id || g.name === act.name);
                              }).length;

                              const totalStudentsInGrade = students.filter(s => s.grade === act.grade).length;
                              const completionPercentage = totalStudentsInGrade > 0 ? (gradedCount / totalStudentsInGrade) * 100 : 0;

                              return (
                                <div 
                                  key={act.id} 
                                  className="p-4 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase shrink-0 text-center min-w-[64px] border border-slate-200/40">
                                      Grade {act.grade}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-extrabold text-slate-800 text-xs truncate">{act.name}</h4>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500 font-bold">
                                        <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
                                          <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                                          {act.subject}
                                        </span>
                                        {act.strand && (
                                          <>
                                            <span className="text-slate-300">•</span>
                                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                              {act.strand}
                                            </span>
                                          </>
                                        )}
                                        <span className="text-slate-300">•</span>
                                        <span className="bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">Out of {act.outOf}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
                                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                          {act.date}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100/60">
                                    {/* Progress bar / completion badge */}
                                    <div className="flex items-center gap-3">
                                      <div className="text-left">
                                        <div className="text-[10px] font-black text-slate-700 flex items-center justify-end gap-1.5">
                                          <span className={`w-1.5 h-1.5 rounded-full ${gradedCount === totalStudentsInGrade ? 'bg-emerald-500' : gradedCount > 0 ? 'bg-amber-400' : 'bg-slate-300'}`} />
                                          {gradedCount} / {totalStudentsInGrade} Marked
                                        </div>
                                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 hidden md:block">
                                          <div 
                                            className={`h-full transition-all duration-500 ${gradedCount === totalStudentsInGrade ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                                            style={{ width: `${completionPercentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {deleteConfirmId === act.id ? (
                                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2 py-1.5 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                          <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Confirm Delete?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteActivity(act.id, act.name);
                                              setDeleteConfirmId(null);
                                            }}
                                            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                          >
                                            No
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setSelectedBulkActivityId(act.id);
                                              setActiveTab('bulk');
                                            }}
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[9px] px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                          >
                                            <FileSpreadsheet className="w-3 h-3 shrink-0" />
                                            Marksheet
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmId(act.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                                            title="Delete Activity Definition"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}


      {/* TAB 2: BULK EXCEL MARKSHEET */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Bulk Marksheet Editor
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select an activity, then fill out learner scores and comments in a rapid Excel-style spreadsheet.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Select Activity:</label>
              <select
                value={selectedBulkActivityId}
                onChange={e => setSelectedBulkActivityId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 min-w-[220px]"
              >
                {activities.map(a => (
                  <option key={a.id} value={a.id}>[G{a.grade}] {a.name} ({a.subject})</option>
                ))}
                {activities.length === 0 && (
                  <option value="">No Activities Available</option>
                )}
              </select>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-extrabold text-slate-700">No Defined Activities Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                To capture grades, you must first define a Class Activity to establish standard curriculum metrics.
              </p>
              <button
                onClick={() => setActiveTab('activities')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Define an Activity Now
              </button>
            </div>
          ) : !selectedBulkActivity ? (
            <p className="text-xs text-slate-400 italic text-center py-8">Please select an activity from the dropdown to continue.</p>
          ) : (
            <div className="space-y-6">
              {/* Activity Info Banner */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-indigo-900 text-xs flex items-center gap-2">
                      {selectedBulkActivity.name}
                      {getTypeBadge(selectedBulkActivity.type)}
                    </h4>
                    <p className="text-[10px] text-indigo-700 font-medium mt-0.5">
                      Subject: <strong className="font-extrabold">{selectedBulkActivity.subject}</strong> • Grade: <strong className="font-extrabold">{selectedBulkActivity.grade}</strong> • Max Score: <strong className="font-extrabold">{selectedBulkActivity.outOf} Marks</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500 font-bold">
                  <div>Conducted: {selectedBulkActivity.date}</div>
                  <div>Class size: {bulkStudentsList.length} learners</div>
                </div>
              </div>

              {/* SpreadSheet table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner bg-slate-50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black border-b border-slate-200">
                      <th className="p-3 w-12 text-center">Avatar</th>
                      <th className="p-3 min-w-[180px]">Student Name</th>
                      <th className="p-3 w-32 text-center">Grade State</th>
                      <th className="p-3 w-40">Learner Score (out of {selectedBulkActivity.outOf})</th>
                      <th className="p-3">Observations & Feedback Comments</th>
                      <th className="p-3 w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {bulkStudentsList.map((student, i) => {
                      const hasMarkDefined = bulkMarks[student.id]?.score !== '';
                      const isUnsaved = unsavedBulkIds[student.id];
                      const scoreValue = bulkMarks[student.id]?.score ?? '';
                      const feedbackValue = bulkMarks[student.id]?.feedback ?? '';

                      const isScoreInvalid = scoreValue !== '' && Number(scoreValue) > selectedBulkActivity.outOf;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center text-xl">{student.avatar || '🎓'}</td>
                          <td className="p-3 font-extrabold text-slate-800">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase">
                              Grade {student.grade}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={selectedBulkActivity.outOf}
                                placeholder={`0-${selectedBulkActivity.outOf}`}
                                value={scoreValue}
                                onChange={e => handleBulkMarkChange(
                                  student.id, 
                                  'score', 
                                  e.target.value === '' ? '' : Number(e.target.value)
                                )}
                                className={`w-full font-black text-center text-slate-700 bg-slate-50 border px-3 py-2 rounded-lg focus:outline-none focus:bg-white focus:ring-1 transition-all ${
                                  isScoreInvalid 
                                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50' 
                                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                                }`}
                              />
                              {isScoreInvalid && (
                                <span className="absolute -bottom-3.5 left-0 text-[8px] text-rose-600 font-extrabold">
                                  Exceeds {selectedBulkActivity.outOf}!
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Add feedback like: Showing excellent spelling improvement"
                              value={feedbackValue}
                              onChange={e => handleBulkMarkChange(student.id, 'feedback', e.target.value)}
                              className="w-full text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                          </td>
                          <td className="p-3 text-center">
                            {isUnsaved ? (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                Unsaved
                              </span>
                            ) : hasMarkDefined ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 justify-center w-fit mx-auto">
                                <CheckCircle className="w-2.5 h-2.5" /> Graded
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {bulkStudentsList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          No students found registered in Grade {selectedBulkActivity.grade}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action save bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    To record progress, enter marks in cells. Changes are saved when you click the sync button.
                  </span>
                </div>

                <button
                  onClick={handleSaveBulkMarks}
                  disabled={isSubmitting || bulkStudentsList.length === 0}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing Marks...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save All Class Marks
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* TAB 3: SINGLE LEARNER ENTRY */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student list sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">LMS Learners</h3>
                <div className="relative">
                  <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-4 w-4 text-slate-400 self-center my-auto" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={e => setStudentSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs transition-colors"
                    placeholder="Search learners or grades..."
                  />
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const isSelected = selectedStudent?.id === student.id;
                  const marksCount = Object.values(student.progress?.subjectGrades || {}).flat().length;
                  
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setSuccessMsg('');
                        setErrorMsg('');
                      }}
                      className={`w-full text-left p-4 flex items-center justify-between transition-all ${
                        isSelected ? 'bg-indigo-50/70 border-r-4 border-indigo-600' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{student.avatar || '🎓'}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs">{student.first_name} {student.last_name}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold mt-1 inline-block uppercase">
                            Grade {student.grade}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {marksCount} mark(s)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form + student log */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedStudent ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                Select a student from the sidebar to record marks.
              </div>
            ) : (
              <>
                {/* Student header and active activity picker */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedStudent.avatar || '🎓'}</span>
                      <div>
                        <h2 className="font-black text-slate-800 text-base">
                          {selectedStudent.first_name} {selectedStudent.last_name}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Grade {selectedStudent.grade} Student
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-full">
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                        Select Activity Template (Grade {selectedStudent.grade})
                      </label>
                      <select
                        value={selectedSingleActivityId}
                        onChange={e => setSelectedSingleActivityId(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      >
                        {activities.filter(a => a.grade === selectedStudent.grade).map(act => (
                          <option key={act.id} value={act.id}>
                            [{act.subject}] {act.name} (Max: {act.outOf})
                          </option>
                        ))}
                        {activities.filter(a => a.grade === selectedStudent.grade).length === 0 && (
                          <option value="">No Activities Available for Grade {selectedStudent.grade}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                {activities.filter(a => a.grade === selectedStudent.grade).length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-amber-800">No Defined Activities Found for Grade {selectedStudent.grade}</p>
                    <p className="text-[11px] text-amber-600 mt-1 max-w-md mx-auto">
                      Please go to the <strong>Manage Class Activities</strong> tab and define an activity with grade {selectedStudent.grade} first.
                    </p>
                  </div>
                ) : (
                  (() => {
                    const act = activities.find(a => a.id === selectedSingleActivityId);
                    if (!act) return null;
                    return (
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-indigo-500" />
                              Log Grade Mark
                            </h3>
                            <p className="text-xs text-slate-400">Record mark based on selected activity details</p>
                          </div>
                          {getTypeBadge(act.type)}
                        </div>

                        <form onSubmit={handleSaveSingleMark} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Subject Area</span>
                              <span className="font-extrabold text-slate-700">{act.subject}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Date Conducted</span>
                              <span className="font-extrabold text-slate-700">{act.date}</span>
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
                                value={singleScore}
                                onChange={e => setSingleScore(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                                Max Possible Marks
                              </label>
                              <input
                                disabled
                                type="text"
                                value={`${act.outOf} Marks`}
                                className="w-full text-xs font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                              Observations & Teacher Feedback (Optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Provide support or diagnostic commentary..."
                              value={singleFeedback}
                              onChange={e => setSingleFeedback(e.target.value)}
                              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                            >
                              <Save className="w-4 h-4" /> Save Learner Mark
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })()
                )}

                {/* Grade Logs in subject */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-sm mb-4">Grade Log: {selectedSubject}</h3>
                  {(() => {
                    const currentMarks = selectedStudent?.progress?.subjectGrades?.[selectedSubject] || [];
                    if (currentMarks.length > 0) {
                      return (
                        <div className="divide-y divide-slate-100">
                          {currentMarks.map((item: any, i: number) => {
                            const percent = Math.round((item.score / item.outOf) * 100);
                            return (
                              <div key={item.id || i} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-slate-700 text-xs">{item.name}</h4>
                                    {getTypeBadge(item.type)}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(item.date).toLocaleDateString()}
                                  </span>
                                  {item.feedback && (
                                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic mt-1.5">
                                      &ldquo;{item.feedback}&rdquo;
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-slate-800 text-sm">
                                    {item.score} / {item.outOf}
                                  </span>
                                  <span className="block text-[10px] text-indigo-600 font-extrabold mt-0.5">
                                    {percent}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 italic">No grade marks logged in {selectedSubject} yet.</p>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

