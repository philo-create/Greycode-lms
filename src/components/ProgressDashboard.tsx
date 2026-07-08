"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Target,
  GraduationCap
} from 'lucide-react';
import { GradeType, UserProgress, StudentProfile } from '../types';
import { CURRICULUM_LESSONS } from '../curriculumData';

interface ProgressDashboardProps {
  activeStudent: StudentProfile;
  progress: UserProgress;
  onSelectLesson: (grade: GradeType, term: number, week: number) => void;
}

export default function ProgressDashboard({ 
  activeStudent, 
  progress, 
  onSelectLesson 
}: ProgressDashboardProps) {
  // Tabs to select which grade progress to view, defaulting to student's current grade
  const [selectedTabGrade, setSelectedTabGrade] = useState<GradeType>(activeStudent.grade);

  // Group lessons of selected grade by Term
  const lessonsForGrade = CURRICULUM_LESSONS.filter(lvl => lvl.grade === selectedTabGrade);
  
  // Arrange in terms 1, 2, 3, 4
  const terms = [1, 2, 3, 4];

  // Calculate stats
  const totalWeeksForGrade = lessonsForGrade.length;
  const completedWeeksForGrade = lessonsForGrade.filter(lvl => {
    const key = `${selectedTabGrade}-${lvl.term}-${lvl.week}`;
    return progress.completedWeeks[key];
  }).length;

  const percentage = totalWeeksForGrade > 0 
    ? Math.round((completedWeeksForGrade / totalWeeksForGrade) * 100) 
    : 0;

  // Let's count stars for this grade
  const starsEarnedForGrade = lessonsForGrade.reduce((acc, lvl) => {
    const key = `${selectedTabGrade}-${lvl.term}-${lvl.week}`;
    return acc + (progress.starsEarned[key] || 0);
  }, 0);

  const maxStarsForGrade = totalWeeksForGrade * 3;

  return (
    <div className="space-y-6 w-full font-sans" id="progress-dashboard-container">
      
      {/* Welcome & Motivational Hero Block */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-lg select-none">
              {activeStudent.avatar}
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Trophy className="w-3 h-3 fill-slate-950" />
                  Active Student
                </span>
                <span className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">
                  Grade {activeStudent.grade} Portal
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1 tracking-tight">
                {activeStudent.name}&apos;s Learning Tracker
              </h2>
              <p className="text-xs text-slate-300 max-w-md mt-1 font-medium">
                Keep unlocking star trophies by finishing unplugged coding sheets, coloring algorithms, and tech challenge lessons!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0 backdrop-blur-xs">
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
              <span className="text-xl font-black text-indigo-300">{completedWeeksForGrade} <span className="text-xs font-normal text-slate-400">/ {totalWeeksForGrade} wk</span></span>
            </div>
            <div className="w-px h-8 bg-white/15"></div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stars Scored</span>
              <span className="text-xl font-black text-amber-400 flex items-center gap-1 justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {starsEarnedForGrade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Progress Circle & Completion percentage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-3xs">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
              <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#4f46e5" fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * valBounded(percentage)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900">{percentage}%</span>
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">Curriculum Complete</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
              Overall lesson completion level across standard Foundation Phase syllabus matrices.
            </p>
          </div>
        </div>

        {/* Global Stars collected badge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-3xs">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
            <Trophy className="w-6 h-6 fill-amber-550 text-amber-500" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">Classroom Star Score</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
              Earned <b className="text-slate-700 font-extrabold">{progress.totalStars} Stars</b> overall in total school challenges across all grades.
            </p>
          </div>
        </div>

        {/* Grade Level Badge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-3xs">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-tight">Grade Enrollment</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
              Enrolled in CAPS <b className="text-slate-700 font-extrabold">Grade {activeStudent.grade}</b>. 
              {activeStudent.role !== 'learner' && " You can preview other grades' lesson roadmap below!"}
            </p>
          </div>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="border-b border-slate-250 pb-px flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5" id="grade-tabs-container">
          {(['R', '1', '2', '3'] as GradeType[]).filter(g => 
            activeStudent.role !== 'learner' || 
            g === activeStudent.grade
          ).map((gradeType) => {
            const isActive = selectedTabGrade === gradeType;
            return (
              <button
                key={gradeType}
                type="button"
                onClick={() => setSelectedTabGrade(gradeType)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition active:scale-95 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
                }`}
              >
                Grade {gradeType}
              </button>
            );
          })}
        </div>
        
        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold select-none">
          Showing {lessonsForGrade.length} CAPS Challenges
        </div>
      </div>

      {/* Term-by-Term Challenge Grid */}
      <div className="space-y-8">
        {terms.map((termNumber) => {
          const termLessons = lessonsForGrade.filter(lvl => lvl.term === termNumber);
          if (termLessons.length === 0) return null;

          return (
            <div key={termNumber} className="space-y-3" id={`term-section-${termNumber}`}>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-850 font-black rounded-lg text-[10px] uppercase tracking-wider">
                  Term {termNumber}
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Grid listing lesson weeks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {termLessons.map((lesson) => {
                  const weekKey = `${selectedTabGrade}-${lesson.term}-${lesson.week}`;
                  const isCompleted = progress.completedWeeks[weekKey];
                  const score = progress.starsEarned[weekKey] || 0;

                  return (
                    <div 
                      key={lesson.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                        isCompleted 
                          ? 'bg-emerald-50/25 border-emerald-150 shadow-2xs hover:border-emerald-250' 
                          : 'bg-white border-slate-200 hover:border-slate-350 shadow-3xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-[10px] text-slate-400 uppercase font-mono bg-slate-100 px-1.5 py-0.5 rounded leading-none shrink-0 border border-slate-200/50">
                              Week {lesson.week}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 select-none ${
                              lesson.strand === 'Coding' 
                                ? 'bg-sky-50 border border-sky-100 text-sky-600' 
                                : lesson.strand === 'Robotics' 
                                ? 'bg-rose-50 border border-rose-100 text-rose-600' 
                                : 'bg-amber-50 border border-amber-100 text-amber-700'
                            }`}>
                              {lesson.strand}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-xs md:text-sm tracking-tight leading-snug">
                            {lesson.title}
                          </h5>
                          <p className="text-[11px] text-slate-450 line-clamp-2 leading-relaxed">
                            {lesson.description}
                          </p>
                        </div>

                        {/* Exact Star Rating Display */}
                        <div className="flex flex-col items-center justify-center gap-1.5 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl shrink-0 min-w-[80px]">
                          <div className="flex items-center gap-0.5" title={`${score} / ${progress.marksPossible?.[weekKey] || 3}`}>
                            {[1, 2, 3].map((starIdx) => {
                              // If they have marksPossible, map it to 3 stars. Otherwise just use absolute score.
                              const marks = progress.marksPossible?.[weekKey] || 3;
                              const percentage = marks > 0 ? (score / marks) : 0;
                              let earnedStars = 0;
                              if (percentage >= 0.99) earnedStars = 3;
                              else if (percentage >= 0.5) earnedStars = 2;
                              else if (percentage > 0) earnedStars = 1;

                              const isEarned = isCompleted && starIdx <= (score <= 3 && marks <= 3 ? score : earnedStars);

                              return (
                                <Star 
                                  key={starIdx} 
                                  className={`w-3.5 h-3.5 ${
                                    isEarned 
                                      ? 'text-amber-500 fill-amber-500' 
                                      : 'text-slate-200 fill-slate-100'
                                  }`} 
                                />
                              );
                            })}
                          </div>
                          {isCompleted ? (
                            <span className="text-[9px] font-extrabold text-amber-600 font-mono leading-none tracking-widest">
                              {score <= 3 && (progress.marksPossible?.[weekKey] || 3) <= 3 
                                ? `${score}/3 STARS` 
                                : `${Math.round((score / (progress.marksPossible?.[weekKey] || 3)) * 100)}%`}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 font-mono leading-none uppercase">
                              Unrated
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-150/60 pt-2.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full uppercase">
                              <CheckCircle className="w-3 h-3 text-emerald-500 fill-white" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-550 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                              Not Started
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectLesson(selectedTabGrade, lesson.term, lesson.week)}
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1.5 hover:underline active:scale-95 transition cursor-pointer"
                        >
                          <span>Launch Challenge</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// Bounded value function for SVG progress safety
function valBounded(val: number) {
  return Math.min(100, Math.max(0, val));
}
