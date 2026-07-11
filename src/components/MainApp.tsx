"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */



import { localStore, getStudentWorkbookStates } from '../lib/localStore';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, GraduationCap, Trophy, Sparkles, Award, ChevronDown, Settings, LayoutDashboard, Palette } from 'lucide-react';
import { GRADES } from '../curriculumData';
import { GradeType, UserProgress, StudentProfile, LessonStatus } from '../types';
import { fetchLessonStatuses } from '../lib/lesson-status-service';
import Dashboard from './Dashboard';
import LoginGate from './LoginGate';
import ProgressDashboard from './ProgressDashboard';
import TeacherDashboard from './TeacherDashboard';
import LearnerHubView from './LearnerHubView';
import CreativeWorkstationApp from './CreativeWorkstationApp';

import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeType | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  });
  const [learningView, setLearningView] = useState<'map' | 'progress' | 'workstation' | 'learner-hub'>('map');
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});

  useEffect(() => {
    async function loadStatuses() {
      if (!activeStudent?.school_id || !selectedGrade) return;
      const statuses = await fetchLessonStatuses(activeStudent.school_id, selectedGrade);
      setLessonStatuses(statuses);
    }
    loadStatuses();
  }, [activeStudent?.school_id, selectedGrade]);

  // We handle Supabase session in LoginGate, so if activeStudent is set, we are logged in.
  // When activeStudent is set, it means we fetched their profile successfully.
  
  useEffect(() => {
    if (activeStudent && activeStudent.email === 'mapilam2@gmail.com') {
      const hasReset = localStorage.getItem('reset_progress_mapilam_mainapp_v1');
      if (!hasReset) {
        // Clear all workstation and workbook related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('gr_wb_') || key.startsWith('w7_act_') || key.startsWith('g1w2_hw_') || key.startsWith('w7_started_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Clear DB progress
        import('../lib/supabase').then(async ({ supabase }) => {
          if (supabase) {
            const emptyProgress = { completedWeeks: {}, starsEarned: {}, totalStars: 0, marksPossible: {} };
            await supabase.from('profiles').update({ progress: emptyProgress }).eq('id', activeStudent.id);
            await supabase.from('progress').delete().eq('student_id', activeStudent.id);
          }
        });

        localStorage.setItem('reset_progress_mapilam_mainapp_v1', 'true');
        window.location.reload();
      }
    }
  }, [activeStudent]);

  const handleLogin = (student: StudentProfile) => {
    setActiveStudent(student);
    setProgress(student.progress);
    setSelectedGrade(student.grade);
  };

  const handleLogout = async () => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase?.auth.signOut();
    });
    setActiveStudent(null);
    setSelectedGrade(null);
  };

  const updateProgress = (weekKey: string, starsEarned: number, marksPossible?: number) => {
    if (!activeStudent) return;

    setProgress(prev => {
      const previousStarsForWeek = prev.starsEarned[weekKey] || 0;
      const newCompleted = { ...prev.completedWeeks, [weekKey]: true };
      const newStars = { ...prev.starsEarned, [weekKey]: Math.max(previousStarsForWeek, starsEarned) };
      
      const newPossible = { ...(prev.marksPossible || {}) };
      if (marksPossible !== undefined) {
        newPossible[weekKey] = Math.max(newPossible[weekKey] || marksPossible, marksPossible);
      } else if (newPossible[weekKey] === undefined) {
        newPossible[weekKey] = 3; // Fallback so we always have a denominator if undefined
      }

      const newTotal = (Object.values(newStars) as number[]).reduce((sum, current) => sum + current, 0);

      const workbookStates = getStudentWorkbookStates(activeStudent.id);

      const updated = {
        completedWeeks: newCompleted,
        starsEarned: newStars,
        totalStars: newTotal,
        marksPossible: newPossible,
        workbookStates
      };

      // 1. Sync list profiles in Supabase
      import('../lib/db').then(({ saveStudentProgress }) => {
        saveStudentProgress(activeStudent.id, updated).catch(err => {
          console.error('Failed to sync progress to Supabase:', err);
        });
      });

      // 2. Sync active student profile state
      setActiveStudent(prevActive => prevActive ? { ...prevActive, progress: updated } : null);

      return updated;
    });
  };

  if (!activeStudent) {
    return (
      <div className="flex min-h-screen w-full bg-slate-100 justify-center items-center p-4 overflow-y-auto" id="login-container">
        <LoginGate onLogin={handleLogin} />
      </div>
    );
  }

  if (activeStudent.role === 'teacher') {
    return <TeacherDashboard activeTeacher={activeStudent} onLogout={handleLogout} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden" id="main-container">
      {/* Left Navigation Rail */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0 font-sans" id="left-sidebar">
        <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* School Logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold tracking-tight text-base">EduPortal</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Coding & Robotics</span>
              </div>
            </div>

            {/* Student Grade Badge (Highlighted Button) */}
            {activeStudent?.role === 'learner' && (
              <div className="mb-8">
                <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-600 border border-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-default hover:bg-indigo-500 transition-colors">
                  <span className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5" />
                    My Grade: {activeStudent.grade}
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>
                </button>
              </div>
            )}

            {/* Select Grade Nav Group (Hidden for Learners) */}
            {activeStudent?.role !== 'learner' && (
            <nav className="space-y-1 mb-8">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Select Grade</p>
              
              {/* Active / Current Grade Indicator */}
              <div className="relative">
                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-750 transition"
                  id="grade-current-dropdown"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {selectedGrade ? `Grade ${selectedGrade}` : 'Choose Grade'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Individual grade link selections */}
              <div className="py-2 space-y-1">
                {GRADES.filter(info => 
                  activeStudent.role !== 'learner' || 
                  info.value === activeStudent.grade
                ).map((info) => {
                  const isSelected = selectedGrade === info.value;
                  const currentCompletedCount = Object.keys(progress.completedWeeks).filter(k => k.startsWith(info.value)).length;

                  return (
                    <button
                      key={info.value}
                      id={`sidebar-select-grade-${info.value}`}
                      onClick={() => {
                        setSelectedGrade(info.value as GradeType);
                        setLearningView('map');
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{info.label}</span>
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-500'}`}>
                        {currentCompletedCount} Done
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
            )}

            <nav className="space-y-2">
              <button
                onClick={() => setLearningView('learner-hub')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer ${
                  learningView === 'learner-hub'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-lg shrink-0 shadow-sm border border-slate-700/50">
                  <span className="text-sm">🏠</span>
                </div>
                <span>Main Dashboard</span>
              </button>

              <button
                onClick={() => setLearningView('workstation')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer ${
                  learningView === 'workstation'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-slate-800/80 rounded-lg shrink-0 shadow-sm border border-slate-700/50">
                  <span className="text-sm">🎨</span>
                </div>
                <span>Creative Workstation</span>
              </button>

              <button
                onClick={() => setLearningView('map')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer ${
                  learningView === 'map'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center bg-transparent rounded-lg shrink-0">
                  <Award className="w-6 h-6 shrink-0" />
                </div>
                <span>Curriculum Map</span>
              </button>

              <button
                onClick={() => setLearningView('progress')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-sm font-bold transition-all text-left border-l-4 cursor-pointer ${
                  learningView === 'progress'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
                }`}
                id="sidebar-progress-btn"
              >
                <div className="w-7 h-7 flex items-center justify-center bg-transparent rounded-lg shrink-0">
                  <Trophy className="w-6 h-6 shrink-0" />
                </div>
                <span>My Progress</span>
              </button>
            </nav>
          </div>

          {/* Student Profile Block at the bottom - Switching accounts enabled */}
          <div className="pt-6 border-t border-slate-800 mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700 shrink-0 select-none shadow-sm">
                {activeStudent.avatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">{activeStudent.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                  Grade {activeStudent.grade} Learner
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <span className="text-sm">🔄</span>
                <span>Switch Student</span>
              </button>
              <button
                className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center justify-center shadow-sm active:scale-95 shrink-0"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight" id="top-header-title">
              {learningView === 'workstation'
                ? `${activeStudent.name}'s Creative Workstation`
                : learningView === 'progress' 
                ? `${activeStudent.name}'s Academic Progress Tracker` 
                : selectedGrade 
                ? `Grade ${selectedGrade} - Learning Classroom` 
                : 'Educational Portal Dashboard'}
            </h1>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold rounded uppercase tracking-wider">
                CAPS 2025 ALIGNED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Combined Star counts */}
            <div className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full text-xs" id="nav-star-pill">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{progress.totalStars} Stars Earned</span>
            </div>

            {activeStudent.role !== 'learner' && selectedGrade && (
              <button
                onClick={() => {
                  setSelectedGrade(null);
                  setLearningView('map');
                }}
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition active:scale-95"
              >
                Change Grade
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div id="main-scroll-content" className="p-8 flex-1 overflow-y-auto flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {learningView === 'learner-hub' ? (
              <motion.div
                key="learner-hub-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-8 max-w-5xl mx-auto py-4 w-full"
              >
                <LearnerHubView onSelectWorkstation={() => setLearningView('workstation')} />
              </motion.div>
            ) : learningView === 'workstation' ? (
              <motion.div
                key="workstation-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full pb-8"
              >
                <CreativeWorkstationApp activeStudentId={activeStudent.id} />
              </motion.div>
            ) : learningView === 'progress' ? (
              <motion.div
                key="progress-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-8 max-w-5xl mx-auto py-4 w-full"
              >
                <ProgressDashboard 
                  activeStudent={activeStudent}
                  progress={progress}
                  onSelectLesson={(gradeVal, termVal, weekVal) => {
                    setSelectedGrade(gradeVal);
                    setLearningView('map');
                  }}
                />
              </motion.div>
            ) : !selectedGrade ? (
              <motion.div
                key="grade-picker"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-8 max-w-4xl mx-auto py-4"
              >
                {/* Introduction Hero Section */}
                <div className="text-center max-w-2xl mx-auto space-y-4 py-8">
                  <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100/50 text-indigo-600 rounded-2xl shadow-sm">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                    CAPS School Coding & Robotics Workspace
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Interactive educational simulation portal designed for <b>Foundation Phase students</b>. Select an academic grade from the left rail or below to explore lessons, complete unplugged block-by-block coding exercises, and earn star trophies.
                  </p>
                </div>

                {/* Grid cards for Grades R, 1, 2, 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {GRADES.filter(info => 
                    activeStudent.role !== 'learner' || 
                    info.value === activeStudent.grade
                  ).map((info) => {
                    const currentCompletedCount = Object.keys(progress.completedWeeks).filter(k => k.startsWith(info.value)).length;
                    
                    return (
                      <motion.div
                        key={info.value}
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        id={`grade-card-${info.value}`}
                        onClick={() => {
                          setSelectedGrade(info.value as GradeType);
                          setLearningView('map');
                        }}
                        className={`border rounded-2xl p-6 flex flex-col justify-between h-[14rem] cursor-pointer shadow-xs hover:shadow-md transition-all ${info.color}`}
                      >
                        <div className="space-y-2">
                          <span className="text-xl font-bold block text-slate-900">{info.label}</span>
                          <p className="text-[11px] text-slate-500 leading-normal">{info.description}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200/50 pt-4 mt-2">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
                            Completed: {currentCompletedCount} wk
                          </div>
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs shadow-xs text-slate-600 group-hover:text-indigo-600 font-bold border border-slate-100">
                            →
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Achievements panel */}
                {progress.totalStars > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-md mx-auto text-center space-y-2">
                    <div className="inline-flex p-2 bg-amber-50 rounded-full text-amber-500 mb-1">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800">Your Classroom Achievements</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Amazing progress! You have completed multiple terms and collected <b className="text-slate-800">{progress.totalStars} Stars</b>. Keep up the magnificent coding journey!
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grade-dashboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <Dashboard
                  activeStudentId={activeStudent.id}
                  grade={selectedGrade}
                  progress={progress}
                  updateProgress={updateProgress}
                  onExit={() => setSelectedGrade(null)}
                  schoolId={activeStudent.school_id}
                  lessonStatuses={lessonStatuses}
                  setLessonStatuses={setLessonStatuses}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
