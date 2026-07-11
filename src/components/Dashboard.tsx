"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star, Sparkles, Trophy, Play, CheckCircle, ChevronDown, Award, Check, Volume2, VolumeX, Maximize2, Minimize2, ChevronRight, Clock, Lock } from 'lucide-react';
import { CURRICULUM_LESSONS, GRADES } from '../curriculumData';
import { GradeType, Lesson, UserProgress, LessonStatus } from '../types';
import { updateLessonStatus } from '../lib/lesson-status-service';
import PatternActivity from './PatternActivity';
import CodingGridActivity from './CodingGridActivity';
import RoboticsActivity from './RoboticsActivity';
import DigitalConceptsActivity from './DigitalConceptsActivity';
import SpeakableText, { useSectionSpeech } from './SpeakableText';
import GradeRVisualBoard from './GradeRVisualBoard';
import Grade1Week2Workbook from './Grade1Week2Workbook';
import GradeR1Workbook from './GradeR1Workbook';
import MascotGirl from './MascotGirl';
import { getZolaImage } from '../zolaImages';

const getVocabularyForLesson = (lesson: Lesson) => {
  if (lesson.strand === 'Coding') {
    return [
      { word: 'Algorithm', meaning: 'A set of steps in the correct order that solves a problem or completes a task.' },
      { word: 'Sequence', meaning: 'The order that steps must follow — first, next, then, last. Order ALWAYS matters.' },
      { word: 'Block-by-Block', meaning: 'Each arrow instruction moves the character EXACTLY one block (not until the barrier like Grade R).' },
      { word: 'Arrow Card / Symbol', meaning: 'A symbol (→ ↑ ↓ ←) that represents one instruction — move one block in that direction.' },
      { word: 'START / STOP', meaning: 'Special markers that show where the code begins and where it ends.' }
    ];
  } else if (lesson.strand === 'Robotics') {
    return [
      { word: 'Robot', meaning: 'A machine created by humans that follows instruction cards to do tasks.' },
      { word: 'Sensor', meaning: 'An electronic device that lets the robot perceive light, colors, or obstacles.' },
      { word: 'Actuator', meaning: 'Moving parts like levers, wheels, or hinges that carry out physical work.' },
      { word: 'Elastic Energy', meaning: 'Stored potential energy from stretching or twisting materials like rubber bands.' }
    ];
  } else {
    return [
      { word: 'Information Technology (IT)', meaning: 'Electronic systems created to compute, store, transmit and present data.' },
      { word: 'Digital Footprint', meaning: 'The permanent digital trail left active when you navigate websites.' },
      { word: 'Device Input & Output', meaning: 'Input is what the user clicks or types; Output is what the screen or speakers show.' },
      { word: 'Netiquette', meaning: 'Practicing digital kindness, safety, and respect online at all times.' }
    ];
  }
};

const getKnowledgeForLesson = (lesson: Lesson) => {
  if (lesson.strand === 'Coding') {
    return {
      title: 'Our Coding Character: SSB — Sipho Super Bunny',
      desc: 'SSB is the character who follows your code on the grid. SSB can ONLY do exactly what your code says, just like a real robot. If the code is wrong, SSB goes to the wrong place. Your job is to debug (fix) the code!',
      steps: [
        { title: 'Step 1: Put on socks', desc: 'Socks must go first so shoes fit properly.' },
        { title: 'Step 2: Put on shoes', desc: 'Securely tie up shoelaces next.' },
        { title: 'Step 3: Pack your bag', desc: 'Gather tablets and curriculum guidebooks.' },
        { title: 'Step 4: Ready for school!', desc: 'Walk safely to your coding classroom.' }
      ],
      rule: 'KEY RULE: Each arrow = exactly ONE block. Turns are AUTOMATIC in Grade 1, but in Grade 2 we introduce Explicit Turning!'
    };
  } else if (lesson.strand === 'Robotics') {
    return {
      title: 'Friction, Joints and Mechanical Levers',
      desc: 'Robots are smart machines. Unlike standard toys, we can control how the joints rotate and how they manipulate objects physically under tension guidelines.',
      steps: [
        { title: 'Structure Frame', desc: 'Built safely using durable recycled boxes.' },
        { title: 'Joint Rotation', desc: 'Constructed pivots so limbs swing smoothly.' },
        { title: 'Force Catapult', desc: 'Launches balls using elastic potential rings.' },
        { title: 'Task Accomplished', desc: 'Robot holds, lifts, or matches target cards.' }
      ],
      rule: 'KEY RULE: Always double check string alignments to prevent mechanical binding.'
    };
  } else {
    return {
      title: 'Processing and Guarding Secret Codes',
      desc: 'Computing processors take text, pictures, or keyboard inputs, then convert them internally into coded numbers (like 1s and 0s) to perform instant display.',
      steps: [
        { title: 'Step 1: Keyboard Input', desc: 'User taps standard buttons or options.' },
        { title: 'Step 2: Processor Conversion', desc: 'Processor translates keys into byte patterns.' },
        { title: 'Step 3: Secure Protection', desc: 'Protects personal data from trace trackers.' },
        { title: 'Step 4: Display Output', desc: 'Shows decoded figures, emojis, or messages!' }
      ],
      rule: 'KEY RULE: Never enter full home locations or passcode passwords when online.'
    };
  }
};

interface Mascot {
  name: string;
  emoji: React.ReactNode;
  personality: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  textSpeech: string;
}

const getMascotForGrade = (grade: GradeType, lessonTitle: string): Mascot => {
  switch (grade) {
    case 'R':
      return {
        name: 'Zola the Tech Explorer',
        emoji: (
          <img 
            src={getZolaImage('waving')} 
            alt="Zola"
            referrerPolicy="no-referrer"
            className="w-14 h-14 object-contain rounded-xl"
          />
        ),
        personality: 'Playful & Creative',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-200',
        textSpeech: `Hooray! I am Zola! Today we are learning about ${lessonTitle}. Let's have fun and explore this together! Click the speak button to hear me read everything aloud!`
      };
    case '1':
      return {
        name: 'Zoe the Smart Coder',
        emoji: <MascotGirl grade="1" pose="waving" className="w-14 h-14" />,
        personality: 'Smart Tech-Savvy Helper',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        textSpeech: `Hi there! I am Zoe! Let's explore the adventure maps for ${lessonTitle}. We can make code repeat, solve logic puzzles, and discover technology together!`
      };
    case '2':
      return {
        name: 'Tandi the Tech Turtle',
        emoji: '🐢',
        personality: 'Geometric Explorer',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        textSpeech: `Hello explorers! I am Tandi. For ${lessonTitle}, remember that turning left and right rotates us in-place without moving us. Let's make precision steps!`
      };
    case '3':
      return {
        name: 'Leo the Learn-O-Bot',
        emoji: '🤖',
        personality: 'ASCII & Binary Expert',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
        borderColor: 'border-indigo-200',
        textSpeech: `System fully online. I am Leo the Learn-O-Bot. Let's study ${lessonTitle}. We will trace blocks, draw shapes, and map letters to computer binary ones and zeros.`
      };
    default:
      return {
        name: 'Curriculum Buddy',
        emoji: '🦁',
        personality: 'Wise Guide',
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-200',
        textSpeech: `Greetings! Let's enjoy practicing ${lessonTitle} today!`
      };
  }
};

interface JuniorLessonViewProps {
  activeStudentId: string;
  lesson: Lesson;
  progress: UserProgress;
  updateProgress: (weekKey: string, stars: number, marksPossible?: number) => void;
  checklistAnswers: Record<string, 'yes' | 'partly' | 'not'>;
  setChecklistAnswers: React.Dispatch<React.SetStateAction<Record<string, 'yes' | 'partly' | 'not'>>>;
  resetCounter: number;
  setResetCounter: React.Dispatch<React.SetStateAction<number>>;
  onNextLesson?: () => void;
  isSuperAdmin?: boolean;
  superAdminBypass?: boolean;
}

function JuniorLessonView({
  activeStudentId,
  lesson,
  progress,
  updateProgress,
  checklistAnswers,
  setChecklistAnswers,
  resetCounter,
  setResetCounter,
  onNextLesson,
  isSuperAdmin,
  superAdminBypass
}: JuniorLessonViewProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'words' | 'play' | 'teacher'>('story');
  const mascotInfo = getMascotForGrade(lesson.grade, lesson.title);
  const weekKey = `${lesson.grade}-${lesson.term}-${lesson.week}`;
  const isCompleted = progress.completedWeeks[weekKey];

  const getWordEmoji = (word: string) => {
    const w = word.toLowerCase();
    if (w.includes('algorithm')) return '📜';
    if (w.includes('sequence')) return '🔗';
    if (w.includes('block')) return '📦';
    if (w.includes('arrow')) return '➡️';
    if (w.includes('start')) return '🚦';
    if (w.includes('robot')) return '🤖';
    if (w.includes('sensor')) return '👁️';
    if (w.includes('actuator')) return '⚙️';
    if (w.includes('elastic')) return '🪃';
    if (w.includes('information')) return '💻';
    if (w.includes('footprint')) return '👣';
    if (w.includes('input')) return '🔌';
    if (w.includes('netiquette')) return '💖';
    return '✨';
  };

  const isChecklistCompleted = (isSuperAdmin && superAdminBypass) ? true : [0, 1, 2, 3].every(idx => checklistAnswers[`${lesson.id}-${idx}`] === 'yes');

  return (
    <div className="space-y-5 text-left">
      {/* Visual Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
            activeTab === 'story'
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
              : 'text-slate-655 border-transparent hover:bg-slate-200/50'
          }`}
        >
          <span className="text-lg">{mascotInfo.emoji}</span>
          <span>Story Time</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('words')}
          className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
            activeTab === 'words'
              ? 'bg-sky-105 text-sky-905 border-sky-300 shadow-sm'
              : 'text-slate-655 border-transparent hover:bg-slate-200/50'
          }`}
        >
          <span className="text-lg">🌟</span>
          <span>Magic Words</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('play')}
          className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
            activeTab === 'play'
              ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-sm'
              : 'text-slate-655 border-transparent hover:bg-slate-200/50'
          }`}
        >
          <span className="text-lg">🎮</span>
          <span>Let's Play</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
            activeTab === 'teacher'
              ? 'bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
              : 'text-slate-555 border-transparent hover:bg-slate-200/50'
          }`}
        >
          <span className="text-lg">🔐</span>
          <span>For Teacher</span>
        </button>
      </div>

      {/* Tab Panels with Staggered Entrance and Motion */}
      <AnimatePresence mode="wait">
        {activeTab === 'story' && (
          <motion.div
            key="story-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Mascot Welcome Speech Bubble */}
            <div className={`p-5 rounded-2xl border ${mascotInfo.borderColor} ${mascotInfo.bgColor} flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm`}>
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-4xl shadow-sm animate-bounce shrink-0 select-none">
                {mascotInfo.emoji}
              </div>
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{mascotInfo.name}</h4>
                  <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border">
                    Grade {lesson.grade} Tour Guide
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs relative text-slate-700 space-y-2">
                  {/* Speech bubble arrow pointer */}
                  <div className="hidden sm:block absolute top-5 -left-2 w-4 h-4 bg-white border-l border-b border-slate-200 rotate-45"></div>
                  
                  <p className="text-xs leading-relaxed font-bold text-indigo-950">
                    <SpeakableText text={`Hi! Let's listen to my welcome message (tap below to read along):`} />
                  </p>
                  <p className="text-xs leading-relaxed italic text-slate-600 pl-4 border-l-2 border-indigo-200">
                    <SpeakableText text={mascotInfo.textSpeech} />
                  </p>
                </div>
              </div>
            </div>

            {/* Adventure Intro Card */}
            <div className="border border-amber-200 bg-amber-50/45 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h5 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                  Our Adventure Story
                </h5>
              </div>

              <div className="bg-white rounded-xl p-4 border border-amber-200 space-y-3">
                <p className="text-xs leading-relaxed text-slate-750 font-semibold">
                  {/* We divide the description into speakable phrases so it is short and easy for young kids */}
                  <SpeakableText text={`${lesson.description} Everything we practice today makes us super strong programmers!`} />
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-amber-800">
                  <SpeakableText text="Here is what we will do today:" />
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {lesson.highlights.map((h, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-amber-100 flex items-center gap-2.5 shadow-3xs hover:-translate-y-0.5 transition duration-150">
                      <span className="text-base select-none">⭐️</span>
                      <p className="text-xs text-slate-655 font-bold leading-normal">
                        <SpeakableText text={h} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'words' && (
          <motion.div
            key="words-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl">
              <p className="text-xs text-sky-850 font-bold flex items-center gap-2">
                <span>✨</span>
                <span>Click or Tap on a card below to listen to its magical coding meaning!</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getVocabularyForLesson(lesson).map((v, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3.5 shadow-sm hover:ring-2 hover:ring-sky-300 transition duration-150 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-3xl border border-sky-100 shrink-0 select-none">
                    {getWordEmoji(v.word)}
                  </div>
                  <div className="space-y-1 overflow-hidden flex-1 text-left">
                    <p className="font-extrabold text-sm text-indigo-950 font-sans tracking-tight">
                      <SpeakableText text={v.word} />
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      <SpeakableText text={v.meaning} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'play' && (
          <motion.div
            key="play-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Guide to the sandbox task */}
            <div className="bg-indigo-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎮</span>
                <div>
                  <h6 className="text-[10px] font-black uppercase text-indigo-200 tracking-wider">Interactive Playground</h6>
                  <p className="text-xs font-bold leading-normal text-slate-105 mt-0.5">
                    <SpeakableText text={`We need to: ${lesson.suggestedActivity}`} />
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetCounter(prev => prev + 1)}
                className="self-start sm:self-auto text-[10px] font-extrabold text-slate-100 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer flex items-center gap-1 shrink-0"
              >
                🔄 Restart Game
              </button>
            </div>

            {/* Sandbox iframe box */}
            <div className="border border-slate-200 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-2 bg-slate-50">
                {(lesson.grade === 'R' || lesson.grade === '1') ? (
                  <div key={`active-workbook-${activeStudentId}-${lesson.id}-${resetCounter}`}>
                    {lesson.id === '1-T1-W2' ? (
                      <Grade1Week2Workbook 
                        activeStudentId={activeStudentId}
                        activeStudentName={activeStudentName}
                        onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }} 
                        onNextLesson={onNextLesson}
                        isSuperAdmin={isSuperAdmin}
                        superAdminBypass={superAdminBypass}
                      />
                    ) : (
                      <GradeR1Workbook 
                        activeStudentId={activeStudentId}
                        activeStudentName={activeStudentName}
                        lesson={lesson}
                        onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }}
                        onNextLesson={onNextLesson}
                        isSuperAdmin={isSuperAdmin}
                        superAdminBypass={superAdminBypass}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {lesson.activityType === 'pattern' && (
                      <div key={`junior-pat-${lesson.id}-${resetCounter}`}>
                        <PatternActivity grade={lesson.grade} onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }} />
                      </div>
                    )}
                    {lesson.activityType === 'grid' && (
                      <div key={`junior-grd-${lesson.id}-${resetCounter}`}>
                        <CodingGridActivity grade={lesson.grade} lessonId={lesson.id} onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }} />
                      </div>
                    )}
                    {lesson.activityType === 'robotics' && (
                      <div key={`junior-rob-${lesson.id}-${resetCounter}`}>
                        <RoboticsActivity grade={lesson.grade} onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }} />
                      </div>
                    )}
                    {lesson.activityType === 'digital' && (
                      <div key={`junior-dig-${lesson.id}-${resetCounter}`}>
                        <DigitalConceptsActivity grade={lesson.grade} onComplete={(stars, possible) => {
                          updateProgress(weekKey, stars, possible);
                        }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Celebrate if complete */}
            {isCompleted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 space-y-1 shadow-3xs animate-fade-in">
                <p className="text-sm font-extrabold flex items-center justify-center gap-1.5">
                  <span>🏆</span> Well done, Super Explorer! You earned a Star Star! <span>⭐</span>
                </p>
                <p className="text-xs opacity-90 font-medium">Your parent or teacher can sign this lesson off in the "For Teacher" tab.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'teacher' && (
          <motion.div
            key="teacher-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Educator Guidelines */}
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
              <p className="text-xs text-slate-800 font-extrabold flex items-center gap-2">
                <span>🔐</span>
                <span>Parent & Teacher Assessment Dashboard</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                Observe the learner operating the game. Assess their proficiency using the observable skill checklists below to sign off on CAPS milestones.
              </p>
            </div>

            {/* Interactive Checklist Table */}
            <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden text-left">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-1.5 uppercase font-bold tracking-wider text-slate-655 text-[10px]">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>CAPS Grade {lesson.grade} Teacher Assessment Checklist</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
                      <th className="p-3 text-left">Observable Skill Descriptor</th>
                      <th className="p-3 shrink-0 w-20">Yes ✔</th>
                      <th className="p-3 shrink-0 w-20">Partly ◑</th>
                      <th className="p-3 shrink-0 w-20">Not Yet 〇</th>
                      <th className="p-2 shrink-0 w-16 text-center">CAPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[
                      `Can explain core terminology related to "${lesson.title}" orally.`,
                      `Correctly recalls that sequence commands move exactly one block at a time.`,
                      `Demonstrates capacity to debug syntax pathways and identify solution targets.`,
                      `Syllabus check of "${lesson.suggestedActivity}" physical guidelines.`
                    ].map((skillText, idx) => {
                      const ansKey = `${lesson.id}-${idx}`;
                      const currentAns = checklistAnswers[ansKey] || null;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-600 leading-snug">
                            {skillText}
                          </td>
                          
                          {/* Option Yes */}
                          <td className="p-3 text-center shrink-0">
                            <button
                              type="button"
                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'yes' }))}
                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                currentAns === 'yes'
                                  ? 'bg-emerald-500 border-emerald-600 text-white'
                                  : 'border-slate-200 hover:border-emerald-400 text-transparent hover:text-slate-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </td>

                          {/* Option Partly */}
                          <td className="p-3 text-center shrink-0">
                            <button
                              type="button"
                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'partly' }))}
                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border text-center ${
                                currentAns === 'partly'
                                  ? 'bg-amber-400 border-amber-500 text-slate-900 font-extrabold text-[10px]'
                                  : 'border-slate-200 hover:border-amber-400 text-transparent hover:text-slate-400'
                              }`}
                            >
                              ◑
                            </button>
                          </td>

                          {/* Option Not */}
                          <td className="p-3 text-center shrink-0">
                            <button
                              type="button"
                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'not' }))}
                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                currentAns === 'not'
                                  ? 'bg-slate-400 border-slate-500 text-white font-extrabold text-[8px]'
                                  : 'border-slate-200 hover:border-slate-400 text-transparent hover:text-slate-400'
                              }`}
                            >
                              ✕
                            </button>
                          </td>

                          <td className="p-2 text-center font-mono text-[9px] text-slate-400 font-bold shrink-0">
                            {lesson.capsCode[idx % lesson.capsCode.length] || 'C.1'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Core conceptual reference guides */}
            <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-4 space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 select-none">
                <span>🧠</span> Core Reference Lesson Guides
              </h5>
              {(() => {
                const info = getKnowledgeForLesson(lesson);
                return (
                  <div className="space-y-2.5">
                    <div>
                      <h6 className="font-bold text-xs text-indigo-950">{info.title}</h6>
                      <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">{info.desc}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {info.steps.map((st, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-200 text-left">
                          <span className="font-extrabold text-[9px] block text-slate-800">{st.title}</span>
                          <span className="text-[9px] text-slate-405 leading-snug">{st.desc}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] font-mono bg-slate-100 p-2 rounded text-slate-600 font-bold">{info.rule}</p>
                  </div>
                );
              })()}
            </div>

            {/* Lesson Completion Card */}
            <div className="border border-indigo-200 bg-indigo-50/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h6 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 leading-none select-none">
                  🛡️ Complete Sign-Off Status
                </h6>
                {isCompleted ? (
                  <p className="text-[11px] font-medium text-emerald-600 mt-1">
                    ✔ Completed! Dynamic progress records and school stars are secured.
                  </p>
                ) : isChecklistCompleted ? (
                  <p className="text-[11px] font-medium text-indigo-600 mt-1 animate-pulse">
                    🎉 All checklist points passed! Proceed to complete.
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">
                    🔒 Observe the student and tick "Yes ✔" to all 4 skills to unlock completion.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={!isChecklistCompleted}
                onClick={() => {
                  updateProgress(weekKey, 3, 3);
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 font-black shadow-sm'
                    : isChecklistCompleted
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Lesson Signed Off ✔</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-305" />
                    <span>Confirm Lesson Completion</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard({
  activeStudentId,
  activeStudentName,
  grade,
  progress,
  updateProgress,
  onExit,
  initialLessonId,
  isSuperAdmin,
  schoolId,
  lessonStatuses = {},
  setLessonStatuses,
  isTeacherPreparation = false,
  teacherId
}: {
  activeStudentId: string;
  activeStudentName?: string;
  grade: GradeType;
  progress: UserProgress;
  className?: string; // Adding optional className as per guidelines
  updateProgress: (weekKey: string, stars: number, possible?: number) => void;
  onExit: () => void;
  initialLessonId?: string;
  isSuperAdmin?: boolean;
  schoolId?: string;
  lessonStatuses?: Record<string, LessonStatus>;
  setLessonStatuses?: React.Dispatch<React.SetStateAction<Record<string, LessonStatus>>>;
  isTeacherPreparation?: boolean;
  teacherId?: string;
}) {
  const isGradeR = (grade as string) === 'R';
  const lessonsForGrade = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade);
  const [activeTerm, setActiveTerm] = useState<number>(1);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, 'yes' | 'partly' | 'not'>>({});
  const [fullscreenLesson, setFullscreenLesson] = useState<Lesson | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [superAdminBypass, setSuperAdminBypass] = useState<boolean>(!!isSuperAdmin);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialLessonId) {
      const lesson = CURRICULUM_LESSONS.find(l => l.id === initialLessonId);
      if (lesson) {
        setFullscreenLesson(lesson);
        setActiveTerm(lesson.term);
      }
    }
  }, [initialLessonId]);

  const expandedLesson = CURRICULUM_LESSONS.find(lvl => lvl.grade === grade && lvl.id === expandedWeek);

  // Active Lesson speech parts for regular view
  const expandedRecapParts = (isGradeR && expandedLesson) ? [
    "RECAP and Warm-up — Welcome back, Code Explorer!",
    `${expandedLesson.description} Everything we practice today helps us learn new skills!`,
    "Today you will:",
    ...expandedLesson.highlights
  ] : [];

  const expandedVocabParts = (isGradeR && expandedLesson) ? [
    "KEY VOCABULARY — Grade R Lesson Glossary",
    ...getVocabularyForLesson(expandedLesson).flatMap(v => [v.word, v.meaning])
  ] : [];

  const expandedKnowledgeInfo = expandedLesson ? getKnowledgeForLesson(expandedLesson) : null;
  const expandedKnowledgeParts = (isGradeR && expandedKnowledgeInfo) ? [
    "Core Conceptual Knowledge and Guides",
    expandedKnowledgeInfo.title,
    expandedKnowledgeInfo.desc,
    ...expandedKnowledgeInfo.steps.flatMap(s => [s.title, s.desc]),
    expandedKnowledgeInfo.rule
  ] : [];

  const expandedChecklistParts = (isGradeR && expandedLesson) ? [
    "ASSESSMENT CHECKLIST — Teacher Observation Checklist. Observable Skill Descriptors are:",
    `Can explain core terminology related to "${expandedLesson.title}" orally.`,
    `Correctly recalls that sequence commands move exactly one block at a time.`,
    `Demonstrates capacity to debug syntax pathways and identify solution targets.`,
    `Syllabus check of "${expandedLesson.suggestedActivity}" physical guidelines.`
  ] : [];

  const recapSpeech = useSectionSpeech(expandedRecapParts);
  const vocabSpeech = useSectionSpeech(expandedVocabParts);
  const knowledgeSpeech = useSectionSpeech(expandedKnowledgeParts);
  const checklistSpeech = useSectionSpeech(expandedChecklistParts);

  // Active Lesson speech parts for Fullscreen view
  const fsRecapParts = (isGradeR && fullscreenLesson) ? [
    "RECAP and Warm-up — Welcome back, Code Explorer!",
    `${fullscreenLesson.description} Everything we practice today helps us learn new skills!`,
    "Today you will:",
    ...fullscreenLesson.highlights
  ] : [];

  const fsVocabParts = (isGradeR && fullscreenLesson) ? [
    "KEY VOCABULARY — Grade R Lesson Glossary",
    ...getVocabularyForLesson(fullscreenLesson).flatMap(v => [v.word, v.meaning])
  ] : [];

  const fsKnowledgeInfo = fullscreenLesson ? getKnowledgeForLesson(fullscreenLesson) : null;
  const fsKnowledgeParts = (isGradeR && fsKnowledgeInfo) ? [
    "Core Conceptual Knowledge and Guides",
    fsKnowledgeInfo.title,
    fsKnowledgeInfo.desc,
    ...fsKnowledgeInfo.steps.flatMap(s => [s.title, s.desc]),
    fsKnowledgeInfo.rule
  ] : [];

  const fsChecklistParts = (isGradeR && fullscreenLesson) ? [
    "ASSESSMENT CHECKLIST — Teacher Observation Checklist. Observable Skill Descriptors are:",
    `Can explain core terminology related to "${fullscreenLesson.title}" orally.`,
    `Correctly recalls that sequence commands move exactly one block at a time.`,
    `Demonstrates capacity to debug syntax pathways and identify solution targets.`,
    `Syllabus check of "${fullscreenLesson.suggestedActivity}" physical guidelines.`
  ] : [];

  const fsRecapSpeech = useSectionSpeech(fsRecapParts);
  const fsVocabSpeech = useSectionSpeech(fsVocabParts);
  const fsKnowledgeSpeech = useSectionSpeech(fsKnowledgeParts);
  const fsChecklistSpeech = useSectionSpeech(fsChecklistParts);

  // Stop talking when switching screens or unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [grade, activeTerm]);

  const handleSpeakText = (text: string, speakId: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === speakId) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // kid-friendly speed
        utterance.pitch = 1.15; // sweet vocal tone
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        setSpeakingId(speakId);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech option is not fully supported in this browser. Try Chrome or Safari!");
    }
  };

  // Filter lessons for the currently chosen grade & term
  const gradeInfo = GRADES.find(g => g.value === grade);
  const termLessons = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade && lvl.term === activeTerm);

  // Lesson list tracking and helper controls for nested full-screen navigation
  const gradeLessons = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade);
  const currentIndex = fullscreenLesson ? gradeLessons.findIndex(lvl => lvl.id === fullscreenLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? gradeLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < gradeLessons.length - 1 ? gradeLessons[currentIndex + 1] : null;
  const isChecklistCompletedForLesson = (lessonId: string) => {
    if (isSuperAdmin && superAdminBypass) return true;
    return [0, 1, 2, 3].every(idx => checklistAnswers[`${lessonId}-${idx}`] === 'yes');
  };
  const isCurrentLessonChecklistCompleted = fullscreenLesson
    ? isChecklistCompletedForLesson(fullscreenLesson.id)
    : false;

  const handleSwitchLesson = (lesson: Lesson) => {
    setFullscreenLesson(lesson);
    setActiveTerm(lesson.term);
    setExpandedWeek(lesson.id);
    setResetCounter(prev => prev + 1);
    // Silent voice if switching lessons
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  const handleUnlockNextLesson = (lessonIdParam?: string) => {
    const lessonId = lessonIdParam || fullscreenLesson?.id || expandedWeek || '1-T1-W2';
    setChecklistAnswers(prev => ({
      ...prev,
      [`${lessonId}-0`]: 'yes',
      [`${lessonId}-1`]: 'yes',
      [`${lessonId}-2`]: 'yes',
      [`${lessonId}-3`]: 'yes'
    }));

    // Save progress to local user completed weeks
    const activeLvl = CURRICULUM_LESSONS.find(lvl => lvl.id === lessonId);
    if (activeLvl) {
      const weekKey = `${activeLvl.grade}-${activeLvl.term}-${activeLvl.week}`;
      updateProgress(weekKey, 3, 3);
    }
  };

  const handleGoToNextLesson = (lessonIdParam?: string) => {
    const lessonId = lessonIdParam || fullscreenLesson?.id || expandedWeek || '1-T1-W2';
    handleUnlockNextLesson(lessonId);

    // Switch/advance to the next lesson automatically
    const gradeLessons = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade);
    const currIdx = gradeLessons.findIndex(lvl => lvl.id === lessonId);
    if (currIdx !== -1 && currIdx < gradeLessons.length - 1) {
      const nextLvl = gradeLessons[currIdx + 1];
      setTimeout(() => {
        handleSwitchLesson(nextLvl);
      }, 350);
    }
  };

  // Calculations for CAPS grade rating scale based on Annexure B CAPS codes
  const totalWeeksForGrade = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade).length;
  const completedWeeksForGrade = CURRICULUM_LESSONS.filter(lvl => lvl.grade === grade).reduce((acc, current) => {
    const key = `${grade}-${current.term}-${current.week}`;
    return acc + (progress.completedWeeks[key] ? 1 : 0);
  }, 0);

  const percentage = totalWeeksForGrade > 0 ? Math.round((completedWeeksForGrade / totalWeeksForGrade) * 100) : 0;

  // Annexure B Reporting Rating Codes
  const getReportingRating = (pct: number) => {
    if (pct >= 80) return { code: 7, label: 'Outstanding achievement', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' };
    if (pct >= 70) return { code: 6, label: 'Meritorious achievement', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    if (pct >= 60) return { code: 5, label: 'Substantial achievement', color: 'bg-teal-50 border-emerald-200 text-teal-700' };
    if (pct >= 50) return { code: 4, label: 'Adequate achievement', color: 'bg-sky-50 border-sky-200 text-sky-700' };
    if (pct >= 40) return { code: 3, label: 'Moderate achievement', color: 'bg-amber-50 border-amber-200 text-amber-700' };
    if (pct >= 30) return { code: 2, label: 'Elementary achievement', color: 'bg-rose-50 border-rose-200 text-rose-700' };
    return { code: 1, label: 'Not achieved yet', color: 'bg-slate-50 border-slate-200 text-slate-500' };
  };

  const rating = getReportingRating(percentage);

  const getLessonStatus = (lessonId: string) => {
    const lessonStatus = (lessonStatuses || {})[lessonId];
    
    if (isTeacherPreparation) {
      const lesson = lessonsForGrade.find(l => l.id === lessonId);
      if (lesson && lesson.term === 1 && lesson.week === 1 && !lessonStatus) {
        return 'teacher_unlocked';
      }
      return lessonStatus || 'locked';
    } else {
      return lessonStatus || 'locked';
    }
  };

  const checkIsLessonLocked = (lessonId: string) => {
    if (isSuperAdmin && superAdminBypass) return false;
    const status = getLessonStatus(lessonId);
    
    if (isTeacherPreparation) {
      return status === 'locked' || status === 'pending_approval'; // teachers can't open locked or pending
    } else {
      return status !== 'unlocked_for_students';
    }
  };

  const handleToggleWeek = (id: string) => {
    if (checkIsLessonLocked(id)) {
      alert("This lesson is currently locked and requires admin approval.");
      return;
    }
    const isExpanding = expandedWeek !== id;
    setExpandedWeek(isExpanding ? id : null);
  };

  // Customized teacher advice based on current selected Grade
  const getTeacherAdvice = () => {
    switch (grade) {
      case 'R':
        return "Keep learning playful and unplugged! Build sequences using physical blocks or direct partner movements before trying the Arrow Grid simulation.";
      case '1':
        return "Practice repetition loops! Help children notice when they repeat a command three times, then introduce the loop block with number indicators beneath it.";
      case '2':
        return "Critical change: Grade 2 brings Explicit Turning! SIPHO no longer turns automatically, they must explicitly rotate left or right in-place before moving forward.";
      case '3':
        return "Explore ASCII binary strings! Draw coordinate boxes, configure Pen Down loops, and use colored beads to spell student initials in 8-bit binary patterns.";
      default:
        return "Follow the chronological lessons timeline sequentially. Use both virtual interactive simulation and our suggested offline activities block-by-block.";
    }
  };

  if (!isMounted) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full" id={`dashboard-grade-${grade}`}>
      {isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between mb-2">
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Super Admin Lesson Controls</h4>
            <p className="text-amber-600 text-xs mt-1">
              {superAdminBypass ? 'All lessons are unlocked. Assessment constraints are bypassed.' : 'Lessons follow standard locking rules based on assessment checks.'}
            </p>
          </div>
          <button
            onClick={() => setSuperAdminBypass(!superAdminBypass)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              superAdminBypass 
                ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' 
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {superAdminBypass ? '🔓 Bypass ON' : '🔒 Bypass OFF'}
          </button>
        </div>
      )}
      
      {/* Quick Stats Grid representing the 4 polished cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0" id="stats-grid">
        {/* Card 1: Progress percentage */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Curriculum Progress</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-900">{percentage}%</span>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mb-1">CAPS Aligned</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>

        {/* Card 2: Completed Lessons */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Completed Lessons</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-950">{completedWeeksForGrade}</span>
            <span className="text-sm text-slate-400">/ {totalWeeksForGrade} Weeks</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Active syllabus coverage metrics</p>
        </div>

        {/* Card 3: Avg. Quiz Score / Rating */}
        <div className={`p-5 rounded-2xl shadow-xs border transition-all ${rating.color}`}>
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider">Annexure B Rating</p>
            <span className="text-[9px] font-black uppercase bg-white/70 px-1.5 py-0.5 rounded-md">Code {rating.code}</span>
          </div>
          <p className="text-sm font-extrabold mt-1.5 line-clamp-1">{rating.label}</p>
          <p className="text-[10px] opacity-85 mt-2.5">Official report code translation</p>
        </div>

        {/* Card 4: Stars earned */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Total Cumulative Stars</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-950">{progress.starsEarned[`${grade}-${activeTerm}-1`] !== undefined ? '★ ' : ''}{progress.totalStars}</span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-bold">Classroom Goal</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Earn more stars in daily exercise widgets</p>
        </div>
      </div>



      {/* Curriculum Explorer & Info columns split */}
      <div className="flex gap-6 flex-1 overflow-hidden min-h-0" id="curriculum-explorer-split">
        {/* Left Column: Lesson Schedule Timeline Map */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {/* Header block with inline Term selection tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum Syllabus Map</h2>
              <p className="text-[11px] text-slate-500">Weeks 1 to 10 progression path for Selected Term</p>
            </div>

            {/* Compact select Term buttons styling group */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              {[1, 2, 3, 4].map((tNum) => {
                const isActive = activeTerm === tNum;
                return (
                  <button
                    key={tNum}
                    onClick={() => { setActiveTerm(tNum); setExpandedWeek(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isActive 
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/40' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
                    }`}
                  >
                    Term {tNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of weeks scrollbox */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3" id="weeks-scrollable-container">
            {termLessons.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No custom weekly lessons registered for Term {activeTerm} yet. Select another term.
              </div>
            ) : (
              termLessons.map((lesson) => {
                const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                const isCompleted = progress.completedWeeks[weekKey];
                const isWeekExpanded = expandedWeek === lesson.id;
                const isLessonLocked = checkIsLessonLocked(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`border rounded-xl transition duration-150 ${
                      isLessonLocked
                        ? 'border-slate-200 bg-slate-50/40 opacity-75 hover:bg-slate-50/60'
                        : isWeekExpanded 
                        ? 'border-indigo-400 bg-indigo-50/5 shadow-xs' 
                        : 'border-slate-200 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Collapsible item Header area */}
                    <div
                      onClick={() => handleToggleWeek(lesson.id)}
                      id={`week-row-${lesson.week}`}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer selection:bg-transparent"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-9 h-9 font-extrabold text-xs flex items-center justify-center rounded-lg leading-none border shrink-0 ${
                          isLessonLocked 
                            ? 'bg-slate-100/50 text-slate-400 border-slate-200/30' 
                            : 'bg-slate-100 text-slate-700 border-slate-200/50'
                        }`}>
                          W {lesson.week}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold text-xs md:text-sm ${isLessonLocked ? 'text-slate-500' : 'text-slate-950'}`}>{lesson.title}</h4>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              lesson.strand === 'Coding' 
                                ? 'bg-sky-50 border border-sky-100 text-sky-600' 
                                : lesson.strand === 'Robotics' 
                                ? 'bg-rose-50 border border-rose-100 text-rose-600' 
                                : 'bg-amber-50 border border-amber-100 text-amber-700'
                            }`}>
                              {lesson.strand}
                            </span>
                            {lesson.capsCode.map(code => (
                              <span key={code} className="text-[9px] font-mono text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 font-semibold">
                                {code}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-normal max-w-xl">
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isLessonLocked ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {getLessonStatus(lesson.id) === 'pending_approval' ? (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                <Lock className="w-2.5 h-2.5" />
                                Awaiting Unlock ⏳
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Lock className="w-2.5 h-2.5" />
                                Locked 🔒
                              </span>
                            )}
                          </div>
                        ) : isCompleted && (
                          <div className="flex items-center gap-1.5 animate-fade-in shrink-0">
                            <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {(progress.starsEarned[weekKey] || 0) <= 3 && (progress.marksPossible?.[weekKey] || 3) <= 3 
                                ? `${progress.starsEarned[weekKey] || 0}/3 STARS` 
                                : `${Math.round(((progress.starsEarned[weekKey] || 0) / (progress.marksPossible?.[weekKey] || 3)) * 100)}%`}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                              Done
                            </span>
                          </div>
                        )}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${isWeekExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Collapsible lesson documentation content */}
                    <AnimatePresence initial={false}>
                      {isWeekExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-200 p-5 bg-slate-50/50 space-y-5">
                            {/* 1. Grade Title Header Banner */}
                            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-xs border border-indigo-950/20 relative overflow-hidden flex flex-col items-center justify-center text-center gap-4">
                              <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none blur-md"></div>
                              <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                  Grade {lesson.grade} {lesson.strand === 'Coding' ? 'Algorithm Design & Coding' : lesson.strand === 'Robotics' ? 'Robotics & Automation' : 'Digital Infrastructure & Citizenship'} │ Term {lesson.term}
                                </p>
                                <h4 className="text-base font-black tracking-tight mt-1.5 leading-snug">
                                  Lesson {lesson.week} | {lesson.title}
                                </h4>
                                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">
                                  LEARNER NOTES • CAPS 2025 Aligned • Foundation Phase Coding
                                </p>
                              </div>
                              <button
                                onClick={() => setFullscreenLesson(lesson)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-tight transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-slate-950/30 shrink-0 cursor-pointer border border-white/10"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Expand Full Screen</span>
                              </button>
                            </div>

                            {(lesson.grade === 'R' || lesson.grade === '1') ? (
                              <div key={`col-workbook-${activeStudentId}-${lesson.id}-${resetCounter}`} className="pt-2">
                                {(() => {
                                  if (lesson.id === 'R-T1-W8' && grade === 'R') {
                                    const actIds = ['activity_1_red_blue', 'activity_2_device_frame', 'activity_3_led_circuit', 'activity_4_house_design'];
                                    const actNames = [
                                      'Pattern Creator 🔴🔵',
                                      'Shape Sorter Art 📐⏹️',
                                      'Glowing Circuitry 🔋💡',
                                      'Sipho\'s Shelter 🏠🤖'
                                    ];
                                    const completed: boolean[] = [];
                                    let completedCount = 0;
                                    actIds.forEach(actId => {
                                      const isDone = isMounted && localStorage.getItem(`w7_act_${activeStudentId || 'default'}_${actId}`) === 'true';
                                      completed.push(isDone);
                                      if (isDone) completedCount++;
                                    });

                                    if (completedCount < 4 && !(isSuperAdmin && superAdminBypass)) {
                                      return (
                                        <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl text-center space-y-4 max-w-2xl mx-auto my-4 shadow-inner">
                                          <span className="text-4xl block animate-bounce">🔒</span>
                                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Lesson 7 is Locked!</h3>
                                          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-semibold">
                                            To unlock the <span className="text-indigo-600 font-extrabold">Beaded Bracelet Designer</span> lesson, you must first complete all 4 creative workstation activities in your workspace!
                                          </p>
                                          
                                          {/* Checkbox checklist */}
                                          <div className="bg-white border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto text-left space-y-2.5">
                                            {actIds.map((actId, idx) => (
                                              <div key={actId} className="flex items-center gap-3 text-xs">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold text-[10px] ${completed[idx] ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
                                                  {completed[idx] ? '✓' : '✖'}
                                                </div>
                                                <span className={`font-extrabold ${completed[idx] ? 'text-emerald-700 line-through opacity-70' : 'text-slate-700'}`}>
                                                  {actNames[idx]}
                                                </span>
                                              </div>
                                            ))}
                                          </div>

                                          <div className="pt-2">
                                            <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider">Progress: {completedCount} / 4 tasks completed</p>
                                            <button
                                              onClick={() => {
                                                if ('speechSynthesis' in window) {
                                                  window.speechSynthesis.cancel();
                                                  const u = new SpeechSynthesisUtterance("Stop, technology champion! Please complete all 4 activities in the Creative Workstation first before you can proceed to the Lesson 7 design challenge!");
                                                  u.rate = 0.85;
                                                  window.speechSynthesis.speak(u);
                                                }
                                              }}
                                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-sm"
                                            >
                                              Workstation Guidance 🔊
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  }

                                  return lesson.id === '1-T1-W2' ? (
                                    <Grade1Week2Workbook 
                                      activeStudentId={activeStudentId}
                                      activeStudentName={activeStudentName}
                                      onComplete={(stars, possible) => {
                                        const weekKey = `${grade as string}-${lesson.term}-${lesson.week}`;
                                        updateProgress(weekKey, stars, possible);
                                        handleUnlockNextLesson('1-T1-W2');
                                      }} 
                                      onNextLesson={() => handleGoToNextLesson('1-T1-W2')}
                                      isSuperAdmin={isSuperAdmin}
                                      superAdminBypass={superAdminBypass}
                                    />
                                  ) : (
                                    <GradeR1Workbook 
                                      activeStudentId={activeStudentId}
                                      activeStudentName={activeStudentName}
                                      lesson={lesson}
                                      onComplete={(stars, possible) => {
                                        const weekKey = `${grade as string}-${lesson.term}-${lesson.week}`;
                                        updateProgress(weekKey, stars, possible);
                                        handleUnlockNextLesson(lesson.id);
                                      }}
                                      onNextLesson={() => handleGoToNextLesson(lesson.id)}
                                      isSuperAdmin={isSuperAdmin}
                                      superAdminBypass={superAdminBypass}
                                    />
                                  );
                                })()}
                              </div>
                            ) : (
                              <>
                                {/* 1.5 INDIVIDUAL MASCOT WITH AUDIO READ-OUT CONTROLS */}
                                {(() => {
                                  const mascotInst = getMascotForGrade(lesson.grade, lesson.title);
                              const isSpeaking = speakingId === lesson.id;
                              return (
                                <div className={`border ${mascotInst.borderColor} ${mascotInst.bgColor} rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left`}>
                                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-xs border border-slate-100 shrink-0 select-none animate-bounce">
                                    {mascotInst.emoji}
                                  </div>
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-extrabold text-sm text-slate-900">{mascotInst.name}</h5>
                                      <span className="text-[9px] font-bold text-slate-400 bg-white/60 px-2 py-0.5 rounded-full border border-slate-200">
                                        Grade {lesson.grade} Mascot • {mascotInst.personality}
                                      </span>
                                    </div>
                                    <p className="text-slate-655 text-xs leading-relaxed italic pr-2">
                                      "{mascotInst.textSpeech}"
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleSpeakText(`${mascotInst.textSpeech} Vocabulary focus includes: ${getVocabularyForLesson(lesson).map(v => v.word).join(', ')}.`, lesson.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                                          isSpeaking
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                                        }`}
                                      >
                                        {isSpeaking ? (
                                          <>
                                            <VolumeX className="w-3.5 h-3.5" />
                                            <span>⏹ Stop Talking</span>
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="w-3.5 h-3.5" />
                                            <span>🔊 Let Mascot Speak</span>
                                          </>
                                        )}
                                      </button>
                                      {isSpeaking && (
                                        <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-ping"></span>
                                          Talking loud to assist reading...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {isGradeR && (
                              <GradeRVisualBoard lessonId={lesson.id} />
                            )}

                            {/* 2. RECAP - What We Already Know */}
                            <div className="border border-amber-200/80 bg-amber-50/60 rounded-xl p-4 flex gap-3.5 text-left items-start relative overflow-hidden">
                              {isGradeR && (
                                <button
                                  type="button"
                                  onClick={recapSpeech.handleSpeak}
                                  className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                                    recapSpeech.isPlaying
                                      ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                                      : 'bg-amber-100 text-amber-800 ring-amber-250/50 hover:bg-amber-200/80'
                                  }`}
                                  title="Listen to the RECAP story"
                                >
                                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>{recapSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                                </button>
                              )}
                              <div className={`w-11 h-11 rounded-xl ${isGradeR ? 'bg-rose-50 border border-rose-200' : 'bg-purple-50 border border-purple-200'} flex items-center justify-center shrink-0 shadow-sm overflow-hidden select-none p-0.5`}>
                                {isGradeR ? (
                                  <img 
                                    src={getZolaImage('waving')} 
                                    alt="Zola"
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 object-contain rounded-lg"
                                  />
                                ) : (
                                  <MascotGirl grade="1" pose="waving" className="w-9 h-9" />
                                )}
                              </div>
                              <div className="space-y-3 flex-1">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                    {isGradeR ? recapSpeech.renderPart(0, "font-black uppercase tracking-wider text-amber-805") : "✨ RECAP & Warm-up — Welcome back, Code Explorer!"}
                                  </h5>
                                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                                    {isGradeR ? (
                                      recapSpeech.renderPart(1)
                                    ) : (
                                      `"${lesson.description} Everything we practice today helps to solidifying our baseline skills. There are no limits just rediscovery and confidence-building!"`
                                    )}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="font-bold text-[9px] uppercase tracking-wide text-amber-900">
                                    {isGradeR ? recapSpeech.renderPart(2) : "Today you will:"}
                                  </p>
                                  <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-500 font-medium select-none text-[11px]">
                                    {lesson.highlights.map((h, i) => (
                                      <li key={i}>
                                        {isGradeR ? recapSpeech.renderPart(3 + i) : h}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* 3. KEY VOCABULARY */}
                            <div className="border border-sky-100 bg-white rounded-xl shadow-xs overflow-hidden text-left relative">
                              <div className="bg-sky-50/80 px-4 py-2.5 border-b border-sky-100 flex items-center justify-between gap-1.5 uppercase font-bold tracking-wider text-sky-800 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                                  <span>
                                    {isGradeR ? vocabSpeech.renderPart(0) : `KEY VOCABULARY — Grade ${lesson.grade} Lesson Glossary`}
                                  </span>
                                </div>
                                {isGradeR && (
                                  <button
                                    type="button"
                                    onClick={vocabSpeech.handleSpeak}
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                                      vocabSpeech.isPlaying
                                        ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                                        : 'bg-sky-100 text-sky-850 ring-sky-205 hover:bg-sky-200'
                                    }`}
                                    title="Listen to the lesson glossary"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{vocabSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                                  </button>
                                )}
                              </div>
                              
                              <div className="divide-y divide-slate-100 text-xs">
                                {getVocabularyForLesson(lesson).map((v, i) => (
                                  <div key={i} className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1 hover:bg-slate-50/30">
                                    <span className="font-bold text-indigo-950 font-sans tracking-tight">
                                      {isGradeR ? vocabSpeech.renderPart(1 + i * 2) : v.word}
                                    </span>
                                    <span className="sm:col-span-2 text-slate-500 leading-relaxed font-normal">
                                      {isGradeR ? vocabSpeech.renderPart(2 + i * 2) : v.meaning}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 4. KNOWLEDGE - What We Remember */}
                            {(() => {
                              const info = getKnowledgeForLesson(lesson);
                              return (
                                <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-4 text-left space-y-3 relative overflow-hidden">
                                  <div className="flex items-center justify-between select-none">
                                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                      🧠 Core Conceptual Knowledge & Guides
                                    </h5>
                                    {isGradeR && (
                                      <button
                                        type="button"
                                        onClick={knowledgeSpeech.handleSpeak}
                                        className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                                          knowledgeSpeech.isPlaying
                                            ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                                            : 'bg-slate-105 text-slate-700 ring-slate-200 hover:bg-slate-200'
                                        }`}
                                        title="Hear core knowledge guide"
                                      >
                                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                        <span>{knowledgeSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                                      </button>
                                    )}
                                  </div>
                                  <div>
                                    <h6 className="font-bold text-xs text-indigo-950">
                                      {isGradeR ? knowledgeSpeech.renderPart(1) : info.title}
                                    </h6>
                                    <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                                      {isGradeR ? knowledgeSpeech.renderPart(2) : info.desc}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                                    {info.steps.map((st, i) => (
                                      <div key={i} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center space-y-1">
                                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[9px] flex items-center justify-center mx-auto border border-indigo-100/50">
                                          0{i+1}
                                        </span>
                                        <span className="font-extrabold text-[10px] block text-slate-800">
                                          {isGradeR ? knowledgeSpeech.renderPart(3 + i * 2) : st.title}
                                        </span>
                                        <span className="text-[9px] text-slate-450 line-clamp-2 leading-snug">
                                          {isGradeR ? knowledgeSpeech.renderPart(4 + i * 2) : st.desc}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <p className="text-[9px] font-mono bg-slate-100 text-slate-500 p-2 rounded-lg text-center font-bold">
                                    {isGradeR ? knowledgeSpeech.renderPart(3 + info.steps.length * 2) : info.rule}
                                  </p>
                                </div>
                              );
                            })()}

                            {/* 5. Embedded Interactive Activity Simulation */}
                            {lesson.activityType !== 'exploration' && (
                              <div className="border border-indigo-200 bg-white rounded-2xl shadow-xs overflow-hidden text-left">
                                <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 leading-snug">
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                                      <span>Lesson Sandbox • Practice block-by-block to earn a school star:</span>
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setResetCounter(prev => prev + 1)}
                                    className="text-[9px] font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                                  >
                                    🔄 Reset Activity
                                  </button>
                                </div>
                                <div className="p-1.5 bg-slate-50/50">
                                  {lesson.activityType === 'pattern' && (
                                    <div key={`${lesson.id}-${resetCounter}`}>
                                      <PatternActivity grade={grade} onComplete={(stars, possible) => {
                                        const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                        updateProgress(weekKey, stars, possible);
                                      }} />
                                    </div>
                                  )}
                                  {lesson.activityType === 'grid' && (
                                    <div key={`${lesson.id}-${resetCounter}`}>
                                      <CodingGridActivity grade={grade} lessonId={lesson.id} onComplete={(stars, possible) => {
                                        const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                        updateProgress(weekKey, stars, possible);
                                      }} />
                                    </div>
                                  )}
                                  {lesson.activityType === 'robotics' && (
                                    <div key={`${lesson.id}-${resetCounter}`}>
                                      <RoboticsActivity grade={grade} onComplete={(stars, possible) => {
                                        const weekKey = `${grade as string}-${lesson.term}-${lesson.week}`;
                                        updateProgress(weekKey, stars, possible);
                                      }} />
                                    </div>
                                  )}
                                  {lesson.activityType === 'digital' && (
                                    <div key={`${lesson.id}-${resetCounter}`}>
                                      {lesson.id === '1-T1-W2' ? (
                                        <Grade1Week2Workbook 
                                          activeStudentId={activeStudentId}
                                          activeStudentName={activeStudentName}
                                          onComplete={(stars, possible) => {
                                            const weekKey = `${grade as string}-${lesson.term}-${lesson.week}`;
                                            updateProgress(weekKey, stars, possible);
                                            handleUnlockNextLesson('1-T1-W2');
                                          }} 
                                          onNextLesson={() => handleGoToNextLesson('1-T1-W2')}
                                          isSuperAdmin={isSuperAdmin}
                                          superAdminBypass={superAdminBypass}
                                        />
                                      ) : (
                                        <DigitalConceptsActivity grade={grade} onComplete={(stars, possible) => {
                                          const weekKey = `${grade as string}-${lesson.term}-${lesson.week}`;
                                          updateProgress(weekKey, stars, possible);
                                        }} />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 6. ASSESSMENT CHECKLIST */}
                            <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden text-left relative">
                              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-1.5 uppercase font-bold tracking-wider text-slate-500 text-[10px] select-none">
                                <div className="flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-slate-450" />
                                  <span>ASSESSMENT CHECKLIST — Teacher Observation Checklist</span>
                                </div>
                                {isGradeR && (
                                  <button
                                    type="button"
                                    onClick={checklistSpeech.handleSpeak}
                                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                                      checklistSpeech.isPlaying
                                        ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                                        : 'bg-slate-200/50 text-slate-700 ring-slate-300 hover:bg-slate-250/80'
                                    }`}
                                    title="Listen to the assessment criteria"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{checklistSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                                  </button>
                                )}
                              </div>
                              
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-slate-100/50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
                                      <th className="p-3 text-left">Observable Skill Descriptor</th>
                                      <th className="p-3 shrink-0 w-20">Yes ✔</th>
                                      <th className="p-3 shrink-0 w-20">Partly ◑</th>
                                      <th className="p-3 shrink-0 w-20">Not Yet 〇</th>
                                      <th className="p-3 shrink-0 w-20 text-center">CAPS Code</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {[
                                      `Can explain core terminology related to "${lesson.title}" orally.`,
                                      `Correctly recalls that sequence commands move exactly one block at a time.`,
                                      `Demonstrates capacity to debug syntax pathways and identify solution targets.`,
                                      `Syllabus check of "${lesson.suggestedActivity}" physical guidelines.`
                                    ].map((skillText, idx) => {
                                      const ansKey = `${lesson.id}-${idx}`;
                                      const currentAns = checklistAnswers[ansKey] || null;

                                      return (
                                        <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                                          <td className="p-3 text-slate-600 leading-snug">
                                            {isGradeR ? checklistSpeech.renderPart(1 + idx) : skillText}
                                          </td>
                                          
                                          {/* Option Yes */}
                                          <td className="p-3 text-center shrink-0">
                                            <button
                                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'yes' }))}
                                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                                currentAns === 'yes'
                                                  ? 'bg-emerald-500 border-emerald-600 text-white'
                                                  : 'border-slate-200 hover:border-emerald-400 text-transparent hover:text-slate-400'
                                              }`}
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                            </button>
                                          </td>

                                          {/* Option Partly */}
                                          <td className="p-3 text-center shrink-0">
                                            <button
                                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'partly' }))}
                                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border text-center ${
                                                currentAns === 'partly'
                                                  ? 'bg-amber-400 border-amber-500 text-slate-900 font-extrabold text-[10px]'
                                                  : 'border-slate-200 hover:border-amber-400 text-transparent hover:text-slate-400'
                                              }`}
                                            >
                                              ◑
                                            </button>
                                          </td>

                                          {/* Option Not */}
                                          <td className="p-3 text-center shrink-0">
                                            <button
                                              onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'not' }))}
                                              className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                                currentAns === 'not'
                                                  ? 'bg-slate-400 border-slate-500 text-white font-extrabold text-[8px]'
                                                  : 'border-slate-200 hover:border-slate-400 text-transparent hover:text-slate-400'
                                              }`}
                                            >
                                              ✕
                                            </button>
                                          </td>

                                          <td className="p-3 text-center font-mono text-[9px] text-slate-400 font-bold shrink-0">
                                            {lesson.capsCode[idx % lesson.capsCode.length] || 'C.1'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* 7. LESSON COMPLETION */}
                            <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all">
                              <div className="space-y-1">
                                <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 selection:bg-transparent">
                                  🏆 Lesson Progress Status
                                </h5>
                                {isCompleted ? (
                                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 leading-normal">
                                    ✔ This lesson and activity are complete! Dynamic progress has been recorded in your profile.
                                  </p>
                                ) : isChecklistCompletedForLesson(lesson.id) ? (
                                  <p className="text-[11px] font-medium text-indigo-600 flex items-center gap-1 leading-normal">
                                    🎉 All 4 assessment items are checked! Direct click below to submit and mark complete.
                                  </p>
                                ) : (
                                  <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 leading-normal">
                                    🔒 Please tick "Yes ✔" to all 4 Assessment Checklist skills above to unlock lesson completion.
                                  </p>
                                )}
                              </div>

                              <button
                                disabled={!isChecklistCompletedForLesson(lesson.id)}
                                onClick={() => {
                                  const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                  updateProgress(weekKey, 3, 3);
                                }}
                                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-95 ${
                                  isCompleted
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm font-extrabold'
                                    : isChecklistCompletedForLesson(lesson.id)
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                }`}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Lesson Complete ✔</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-amber-305" />
                                    <span>Mark Lesson Complete</span>
                                  </>
                                )}
                              </button>
                            </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Teacher Spotlight advice and downloadable elements */}
        <div className="w-72 shrink-0 flex flex-col gap-5 overflow-y-auto" id="right-activities-column">
          {/* Spotlight banner container */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs flex flex-col justify-between border border-slate-950">
            <div>
              <p className="text-[9px] font-black tracking-widest text-indigo-400 uppercase mb-3 text-left">Curriculum Spotlight</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs ring-2 ring-indigo-500/30 p-1 shrink-0">
                  SM
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Dr. Sarah Miller</span>
                  <span className="text-[9px] text-slate-400 font-medium">CAPS Project Advisor</span>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-100/90 italic border-l-2 border-indigo-550 pl-3">
                "{getTeacherAdvice()}"
              </p>
            </div>
          </div>

          {/* Upcoming milestones */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex-1 shadow-xs text-left">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Term Assessments Milestones</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 w-8">
                  <span className="text-[9px] font-bold text-slate-450 uppercase leading-none">WEEK</span>
                  <span className="text-base font-black text-slate-800 leading-tight">04</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Practical Assessment</span>
                  <span className="text-[10px] text-slate-400">Class sequence game checks</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 w-8">
                  <span className="text-[9px] font-bold text-slate-450 uppercase leading-none">WEEK</span>
                  <span className="text-base font-black text-slate-800 leading-tight">08</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Hardware Sorting Quiz</span>
                  <span className="text-[10px] text-slate-400">Differentiating IT vs General Tech</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0 w-8">
                  <span className="text-[9px] font-bold text-slate-450 uppercase leading-none">WEEK</span>
                  <span className="text-base font-black text-slate-800 leading-tight">10</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Annexure B Reports</span>
                  <span className="text-[10px] text-slate-400">School marks submission review</span>
                </div>
              </div>
            </div>

            {/* Quick guide downloads files */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Downloads</h3>
              <div className="space-y-2">
                <a 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100 text-left cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-700">Official Grade Plan.pdf</span>
                  <span className="text-[9px] font-bold text-indigo-600">PDF</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100 text-left cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-700">Formula & Arrow guide.docx</span>
                  <span className="text-[9px] font-bold text-indigo-600">DOCX</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN IMMERSIVE LESSON MODE PORTAL */}
      <AnimatePresence>
        {fullscreenLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-50 z-50 flex flex-col w-screen h-screen overflow-hidden"
            id="fullscreen-lesson-container"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-50 w-full h-full flex flex-col overflow-hidden"
            >
              {/* Header block with visual status */}
              <div className="bg-slate-900 border-b border-slate-800 text-white p-5 flex flex-wrap items-center justify-between gap-4 select-none shrink-0 text-left">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">IMMERSED FULL-SCREEN WORKSHOP</p>
                    <h3 className="text-base font-black text-white">
                      Grade {fullscreenLesson.grade} • Week {fullscreenLesson.week}: {fullscreenLesson.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={!prevLesson}
                    onClick={() => prevLesson && handleSwitchLesson(prevLesson)}
                    className="text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <span>←</span>
                    <span className="hidden sm:inline">Previous Lesson</span>
                  </button>
                  {isTeacherPreparation ? (
                    (() => {
                      const currentLessonStatus = getLessonStatus(fullscreenLesson.id);
                      const isPendingApproval = currentLessonStatus === 'pending_approval';
                      const isCompleted = currentLessonStatus === 'unlocked_for_students' || progress.completedWeeks[`${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`];
                      return (
                        <button
                          disabled={isPendingApproval || isCompleted || !isCurrentLessonChecklistCompleted}
                          onClick={async () => {
                            const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                            updateProgress(weekKey, 3, 3);
                            if (schoolId) {
                              await updateLessonStatus(schoolId, grade, fullscreenLesson.id, 'pending_approval', teacherId);
                              if (setLessonStatuses) {
                                setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'pending_approval' }));
                              }
                            }
                          }}
                          className={`text-[11px] font-bold px-3 py-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                            isPendingApproval
                              ? 'bg-amber-500 text-white cursor-not-allowed opacity-90'
                              : isCompleted
                              ? 'bg-emerald-600 text-white cursor-not-allowed opacity-90'
                              : isCurrentLessonChecklistCompleted
                              ? 'bg-indigo-600 text-white hover:bg-indigo-750 shadow-md shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                          title={
                            isPendingApproval
                              ? "Awaiting Admin Approval"
                              : isCompleted
                              ? "Completed"
                              : !isCurrentLessonChecklistCompleted
                              ? "Complete the checklist"
                              : "Complete and Notify Admin"
                          }
                        >
                          <span>{isPendingApproval ? "Pending..." : isCompleted ? "Complete ✔" : "Complete & Notify"}</span>
                        </button>
                      );
                    })()
                  ) : (
                    <button
                      disabled={!nextLesson || !isCurrentLessonChecklistCompleted}
                      onClick={() => nextLesson && handleSwitchLesson(nextLesson)}
                      className="text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1"
                      title={!isCurrentLessonChecklistCompleted && nextLesson ? "Select 'Yes' for all 4 Assessment Checklist items to unlock this next lesson" : "Next Lesson"}
                    >
                      <span className="hidden sm:inline">Next Lesson</span>
                      <span>→</span>
                    </button>
                  )}
                  <div className="w-px h-5 bg-slate-800 mx-1"></div>
                  <button
                    onClick={() => setResetCounter(prev => prev + 1)}
                    className="text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition cursor-pointer active:scale-95"
                  >
                    🔄 Restart Simulation
                  </button>
                  <button
                    onClick={() => setFullscreenLesson(null)}
                    className="text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-505 px-4 py-2 rounded-xl transition cursor-pointer active:scale-95 border border-white/10"
                  >
                    ✕ Close Full Screen
                  </button>
                </div>
              </div>

              {/* Scrollable contents centered sheet matching original lesson formatting */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50">
                <div className="max-w-5xl mx-auto p-5 md:py-8 space-y-5">
                  {/* 1. Grade Title Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-xs border border-indigo-950/20 relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 max-w-5xl mx-auto w-full">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none blur-md"></div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        Grade {fullscreenLesson.grade} {fullscreenLesson.strand === 'Coding' ? 'Algorithm Design & Coding' : fullscreenLesson.strand === 'Robotics' ? 'Robotics & Automation' : 'Digital Infrastructure & Citizenship'} │ Term {fullscreenLesson.term}
                      </p>
                      <h4 className="text-base font-black tracking-tight mt-1.5 leading-snug">
                        Lesson {fullscreenLesson.week} | {fullscreenLesson.title}
                      </h4>
                      <p className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">
                        LEARNER NOTES • CAPS 2025 Aligned • Foundation Phase Coding
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-xl block select-none">
                        🌟 Full Immersive Mode
                      </span>
                    </div>
                  </div>

                  {(fullscreenLesson.grade === 'R' || fullscreenLesson.grade === '1') ? (
                    <div key={`fs-workbook-${activeStudentId}-${fullscreenLesson.id}-${resetCounter}`} className="space-y-5">
                      {(() => {
                        if (fullscreenLesson.id === 'R-T1-W8' && grade === 'R') {
                          const actIds = ['activity_1_red_blue', 'activity_2_device_frame', 'activity_3_led_circuit', 'activity_4_house_design'];
                          const actNames = [
                            'Pattern Creator 🔴🔵',
                            'Shape Sorter Art 📐⏹️',
                            'Glowing Circuitry 🔋💡',
                            'Sipho\'s Shelter 🏠🤖'
                          ];
                          const completed: boolean[] = [];
                          let completedCount = 0;
                          actIds.forEach(actId => {
                            const isDone = isMounted && localStorage.getItem(`w7_act_${activeStudentId || 'default'}_${actId}`) === 'true';
                            completed.push(isDone);
                            if (isDone) completedCount++;
                          });

                          if (completedCount < 4 && !(isSuperAdmin && superAdminBypass)) {
                            return (
                              <div className="p-8 bg-slate-800/40 border border-slate-700/60 rounded-3xl text-center space-y-4 max-w-2xl mx-auto my-6 shadow-2xl backdrop-blur-md">
                                <span className="text-5xl block animate-bounce">🔒</span>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Immersive Mode Locked!</h3>
                                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed font-semibold">
                                  You must complete all 4 creative workstation activities in your workspace before you can enter immersive mode for <span className="text-indigo-400 font-extrabold">Beaded Bracelet Designer</span>!
                                </p>
                                
                                {/* Checkbox checklist */}
                                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-xs mx-auto text-left space-y-2.5">
                                  {actIds.map((actId, idx) => (
                                    <div key={actId} className="flex items-center gap-3 text-xs">
                                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border font-bold text-[10px] ${completed[idx] ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-850 border-slate-750 text-slate-500'}`}>
                                        {completed[idx] ? '✓' : '✖'}
                                      </div>
                                      <span className={`font-extrabold ${completed[idx] ? 'text-emerald-500 line-through opacity-70' : 'text-slate-200'}`}>
                                        {actNames[idx]}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2">
                                  <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider">Progress: {completedCount} / 4 tasks completed</p>
                                  <button
                                    onClick={() => {
                                      if ('speechSynthesis' in window) {
                                        window.speechSynthesis.cancel();
                                        const u = new SpeechSynthesisUtterance("Stop, technology champion! Please complete all 4 activities in the Creative Workstation first before you can proceed to the Lesson 7 design challenge!");
                                        u.rate = 0.85;
                                        window.speechSynthesis.speak(u);
                                      }
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-sm"
                                  >
                                    Workstation Guidance 🔊
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        }

                        return fullscreenLesson.id === '1-T1-W2' ? (
                          <Grade1Week2Workbook 
                            activeStudentId={activeStudentId}
                            activeStudentName={activeStudentName}
                            onComplete={(stars, possible) => {
                              const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                              updateProgress(weekKey, stars, possible);
                              handleUnlockNextLesson('1-T1-W2');
                            }} 
                            onNextLesson={() => handleGoToNextLesson('1-T1-W2')}
                            isSuperAdmin={isSuperAdmin}
                            superAdminBypass={superAdminBypass}
                            isTeacherPreparation={isTeacherPreparation}
                            schoolId={schoolId}
                            teacherId={teacherId}
                            lessonStatuses={lessonStatuses}
                            setLessonStatuses={setLessonStatuses}
                          />
                        ) : (
                          <GradeR1Workbook 
                            activeStudentId={activeStudentId}
                            activeStudentName={activeStudentName}
                            lesson={fullscreenLesson}
                            onComplete={(stars, possible) => {
                              const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                              updateProgress(weekKey, stars, possible);
                              handleUnlockNextLesson(fullscreenLesson.id);
                            }}
                            onNextLesson={() => handleGoToNextLesson(fullscreenLesson.id)}
                            isSuperAdmin={isSuperAdmin}
                            superAdminBypass={superAdminBypass}
                            isTeacherPreparation={isTeacherPreparation}
                            schoolId={schoolId}
                            teacherId={teacherId}
                            lessonStatuses={lessonStatuses}
                            setLessonStatuses={setLessonStatuses}
                          />
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      {/* 1.5 INDIVIDUAL MASCOT WITH AUDIO READ-OUT CONTROLS */}
                      {(() => {
                        const mascotInst = getMascotForGrade(fullscreenLesson.grade, fullscreenLesson.title);
                    const isSpeaking = speakingId === `fs-${fullscreenLesson.id}`;
                    return (
                      <div className={`border ${mascotInst.borderColor} ${mascotInst.bgColor} rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left`}>
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-xs border border-slate-100 shrink-0 select-none animate-bounce">
                          {mascotInst.emoji}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-extrabold text-sm text-slate-900">{mascotInst.name}</h5>
                            <span className="text-[9px] font-bold text-slate-400 bg-white/60 px-2 py-0.5 rounded-full border border-slate-200">
                              Grade {fullscreenLesson.grade} Mascot • {mascotInst.personality}
                            </span>
                          </div>
                          <p className="text-slate-655 text-xs leading-relaxed italic pr-2">
                            "{mascotInst.textSpeech}"
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSpeakText(`${mascotInst.textSpeech} Vocabulary focus includes: ${getVocabularyForLesson(fullscreenLesson).map(v => v.word).join(', ')}.`, `fs-${fullscreenLesson.id}`)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                                isSpeaking
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              {isSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5" />
                                  <span>⏹ Stop Talking</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>🔊 Let Mascot Speak</span>
                                </>
                              )}
                            </button>
                            {isSpeaking && (
                              <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-ping"></span>
                                Talking loud to assist reading...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {isGradeR && (
                    <GradeRVisualBoard lessonId={fullscreenLesson.id} />
                  )}

                  {/* 2. RECAP - What We Already Know */}
                  <div className="border border-amber-200/80 bg-amber-50/60 rounded-xl p-4 flex gap-3.5 text-left items-start relative overflow-hidden">
                    {isGradeR && (
                      <button
                        type="button"
                        onClick={fsRecapSpeech.handleSpeak}
                        className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                          fsRecapSpeech.isPlaying
                            ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 ring-amber-250/50 hover:bg-amber-200/80'
                        }`}
                        title="Listen to the RECAP story"
                      >
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{fsRecapSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                      </button>
                    )}
                    <div className={`w-11 h-11 rounded-xl ${isGradeR ? 'bg-rose-50 border border-rose-200' : 'bg-purple-50 border border-purple-200'} flex items-center justify-center shrink-0 shadow-sm overflow-hidden select-none p-0.5`}>
                      {isGradeR ? (
                        <img 
                          src={getZolaImage('waving')} 
                          alt="Zola"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 object-contain rounded-lg"
                        />
                      ) : (
                        <MascotGirl grade="1" pose="waving" className="w-9 h-9" />
                      )}
                    </div>
                    <div className="space-y-3 flex-1">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-850">
                          {isGradeR ? fsRecapSpeech.renderPart(0, "font-black uppercase tracking-wider text-amber-805") : "✨ RECAP & Warm-up — Welcome back, Code Explorer!"}
                        </h5>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                          {isGradeR ? (
                            fsRecapSpeech.renderPart(1)
                          ) : (
                            `"${fullscreenLesson.description} Everything we practice today helps to solidifying our baseline skills. There are no limits just rediscovery and confidence-building!"`
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-bold text-[9px] uppercase tracking-wide text-amber-900">
                          {isGradeR ? fsRecapSpeech.renderPart(2) : "Today you will:"}
                        </p>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-500 font-medium select-none text-[11px]">
                          {fullscreenLesson.highlights.map((h, i) => (
                            <li key={i}>
                              {isGradeR ? fsRecapSpeech.renderPart(3 + i) : h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 3. KEY VOCABULARY */}
                  <div className="border border-sky-100 bg-white rounded-xl shadow-xs overflow-hidden text-left relative">
                    <div className="bg-sky-50/80 px-4 py-2.5 border-b border-sky-100 flex items-center justify-between gap-1.5 uppercase font-bold tracking-wider text-sky-800 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        <span>
                          {isGradeR ? fsVocabSpeech.renderPart(0) : `KEY VOCABULARY — Grade ${fullscreenLesson.grade} Lesson Glossary`}
                        </span>
                      </div>
                      {isGradeR && (
                        <button
                          type="button"
                          onClick={fsVocabSpeech.handleSpeak}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                            fsVocabSpeech.isPlaying
                              ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                              : 'bg-sky-100 text-sky-850 ring-sky-205 hover:bg-sky-200'
                          }`}
                          title="Listen to the glossary words"
                        >
                          <Volume2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{fsVocabSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="divide-y divide-slate-100 text-xs text-left">
                      {getVocabularyForLesson(fullscreenLesson).map((v, i) => (
                        <div key={i} className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-1 hover:bg-slate-50/30">
                          <span className="font-bold text-indigo-950 font-sans tracking-tight">
                            {isGradeR ? fsVocabSpeech.renderPart(1 + i * 2) : v.word}
                          </span>
                          <span className="sm:col-span-2 text-slate-550 leading-relaxed font-normal">
                            {isGradeR ? fsVocabSpeech.renderPart(2 + i * 2) : v.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. KNOWLEDGE - What We Remember */}
                  {(() => {
                    const info = getKnowledgeForLesson(fullscreenLesson);
                    return (
                      <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-4 text-left space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between select-none">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            🧠 Core Conceptual Knowledge & Guides
                          </h5>
                          {isGradeR && (
                            <button
                              type="button"
                              onClick={fsKnowledgeSpeech.handleSpeak}
                              className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                                fsKnowledgeSpeech.isPlaying
                                  ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                                  : 'bg-slate-105 text-slate-700 ring-slate-200 hover:bg-slate-200'
                              }`}
                              title="Hear core knowledge guide"
                            >
                              <Volume2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{fsKnowledgeSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                            </button>
                          )}
                        </div>
                        <div>
                          <h6 className="font-bold text-xs text-indigo-950">
                            {isGradeR ? fsKnowledgeSpeech.renderPart(1) : info.title}
                          </h6>
                          <p className="text-slate-500 text-[11px] leading-relaxed mt-1">
                            {isGradeR ? fsKnowledgeSpeech.renderPart(2) : info.desc}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                          {info.steps.map((st, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center space-y-1">
                              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[9px] flex items-center justify-center mx-auto border border-indigo-100/50">
                                0{i+1}
                              </span>
                              <span className="font-extrabold text-[10px] block text-slate-800">
                                {isGradeR ? fsKnowledgeSpeech.renderPart(3 + i * 2) : st.title}
                              </span>
                              <span className="text-[9px] text-slate-450 line-clamp-2 leading-snug">
                                {isGradeR ? fsKnowledgeSpeech.renderPart(4 + i * 2) : st.desc}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-[9px] font-mono bg-slate-100 text-slate-500 p-2 rounded-lg text-center font-bold">
                          {isGradeR ? fsKnowledgeSpeech.renderPart(3 + info.steps.length * 2) : info.rule}
                        </p>
                      </div>
                    );
                  })()}

                  {/* 5. Embedded Interactive Activity Simulation */}
                  {fullscreenLesson.activityType !== 'exploration' && (
                    <div className="border border-indigo-200 bg-white rounded-2xl shadow-xs overflow-hidden text-left">
                      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 leading-snug">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                            <span>Lesson Sandbox • Practice block-by-block to earn a school star:</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setResetCounter(prev => prev + 1)}
                          className="text-[9px] font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
                        >
                          🔄 Reset Activity
                        </button>
                      </div>
                      <div className="p-1.5 bg-slate-50/50">
                        {fullscreenLesson.activityType === 'pattern' && (
                          <div key={`fs-pat-${fullscreenLesson.id}-${resetCounter}`}>
                            <PatternActivity grade={grade} onComplete={(stars, possible) => {
                              const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                              updateProgress(weekKey, stars, possible);
                            }} />
                          </div>
                        )}
                        {fullscreenLesson.activityType === 'grid' && (
                          <div key={`fs-grd-${fullscreenLesson.id}-${resetCounter}`}>
                            <CodingGridActivity grade={grade} lessonId={fullscreenLesson.id} onComplete={(stars, possible) => {
                              const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                              updateProgress(weekKey, stars, possible);
                            }} />
                          </div>
                        )}
                        {fullscreenLesson.activityType === 'robotics' && (
                          <div key={`fs-rob-${fullscreenLesson.id}-${resetCounter}`}>
                            <RoboticsActivity grade={grade} onComplete={(stars, possible) => {
                              const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                              updateProgress(weekKey, stars, possible);
                            }} />
                          </div>
                        )}
                        {fullscreenLesson.activityType === 'digital' && (
                          <div key={`fs-dig-${fullscreenLesson.id}-${resetCounter}`}>
                            {fullscreenLesson.id === '1-T1-W2' ? (
                              <Grade1Week2Workbook 
                                activeStudentId={activeStudentId}
                                activeStudentName={activeStudentName}
                                onComplete={(stars, possible) => {
                                  const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                                  updateProgress(weekKey, stars, possible);
                                  handleUnlockNextLesson('1-T1-W2');
                                }} 
                                onNextLesson={() => handleGoToNextLesson('1-T1-W2')}
                                isSuperAdmin={isSuperAdmin}
                                superAdminBypass={superAdminBypass}
                              />
                            ) : (
                              <DigitalConceptsActivity grade={grade} onComplete={(stars, possible) => {
                                const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                                updateProgress(weekKey, stars, possible);
                              }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 6. ASSESSMENT CHECKLIST */}
                  <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden text-left relative">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-1.5 uppercase font-bold tracking-wider text-slate-500 text-[10px] select-none">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>ASSESSMENT CHECKLIST — Teacher Observation Checklist</span>
                      </div>
                      {isGradeR && (
                        <button
                          type="button"
                          onClick={fsChecklistSpeech.handleSpeak}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer ring-1 ${
                            fsChecklistSpeech.isPlaying
                              ? 'bg-rose-500 text-white ring-rose-300 animate-pulse'
                              : 'bg-slate-200/50 text-slate-700 ring-slate-300 hover:bg-slate-250/80'
                          }`}
                          title="Listen to the assessment criteria"
                        >
                          <Volume2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{fsChecklistSpeech.isPlaying ? "Stop" : "Read Section"}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto font-sans">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-100/50 border-b border-slate-200 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
                            <th className="p-3 text-left">Observable Skill Descriptor</th>
                            <th className="p-3 shrink-0 w-20">Yes ✔</th>
                            <th className="p-3 shrink-0 w-20">Partly ◑</th>
                            <th className="p-3 shrink-0 w-20">Not Yet 〇</th>
                            <th className="p-3 shrink-0 w-20 text-center">CAPS Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            `Can explain core terminology related to "${fullscreenLesson.title}" orally.`,
                            `Correctly recalls that sequence commands move exactly one block at a time.`,
                            `Demonstrates capacity to debug syntax pathways and identify solution targets.`,
                            `Syllabus check of "${fullscreenLesson.suggestedActivity}" physical guidelines.`
                          ].map((skillText, idx) => {
                            const ansKey = `${fullscreenLesson.id}-${idx}`;
                            const currentAns = checklistAnswers[ansKey] || null;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                                <td className="p-3 text-slate-600 leading-snug">
                                  {isGradeR ? fsChecklistSpeech.renderPart(1 + idx) : skillText}
                                </td>
                                
                                {/* Option Yes */}
                                <td className="p-3 text-center shrink-0">
                                  <button
                                    onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'yes' }))}
                                    className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                      currentAns === 'yes'
                                        ? 'bg-emerald-500 border-emerald-600 text-white'
                                        : 'border-slate-200 hover:border-emerald-400 text-transparent hover:text-slate-450'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </td>

                                {/* Option Partly */}
                                <td className="p-3 text-center shrink-0">
                                  <button
                                    onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'partly' }))}
                                    className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border text-center ${
                                      currentAns === 'partly'
                                        ? 'bg-amber-400 border-amber-500 text-slate-900 font-extrabold text-[10px]'
                                        : 'border-slate-200 hover:border-amber-400 text-transparent hover:text-slate-450'
                                    }`}
                                  >
                                    ◑
                                  </button>
                                </td>

                                {/* Option Not */}
                                <td className="p-3 text-center shrink-0">
                                  <button
                                    onClick={() => setChecklistAnswers(prev => ({ ...prev, [ansKey]: 'not' }))}
                                    className={`w-5 h-5 rounded-full inline-flex items-center justify-center transition border ${
                                      currentAns === 'not'
                                        ? 'bg-slate-400 border-slate-500 text-white font-extrabold text-[8px]'
                                        : 'border-slate-200 hover:border-slate-400 text-transparent hover:text-slate-450'
                                    }`}
                                  >
                                    ✕
                                  </button>
                                </td>

                                <td className="p-3 text-center font-mono text-[9px] text-slate-400 font-bold shrink-0">
                                  {fullscreenLesson.capsCode[idx % fullscreenLesson.capsCode.length] || 'C.1'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 7. LESSON COMPLETION */}
                  <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left transition-all">
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 selection:bg-transparent">
                        🏆 Lesson Progress Status
                      </h5>
                      {(() => {
                        const currentLessonStatus = getLessonStatus(fullscreenLesson.id);
                        const isPendingApproval = currentLessonStatus === 'pending_approval';

                        if (isPendingApproval) {
                          return (
                            <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1 leading-normal">
                              ⏳ Lesson marked complete! Awaiting super admin unlock for students.
                            </p>
                          );
                        }
                        if (progress.completedWeeks[`${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`]) {
                          return (
                            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 leading-normal">
                              ✔ This lesson and activity are complete! Dynamic progress has been recorded in your profile.
                            </p>
                          );
                        }
                        if (isChecklistCompletedForLesson(fullscreenLesson.id)) {
                          return (
                            <p className="text-[11px] font-medium text-indigo-600 flex items-center gap-1 leading-normal">
                              🎉 All 4 assessment items are checked! Direct click below to submit and mark complete.
                            </p>
                          );
                        }
                        return (
                          <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 leading-normal">
                            🔒 Please tick "Yes ✔" to all 4 Assessment Checklist skills above to unlock lesson completion.
                          </p>
                        );
                      })()}
                    </div>

                    {(() => {
                      const currentLessonStatus = getLessonStatus(fullscreenLesson.id);
                      const isPendingApproval = currentLessonStatus === 'pending_approval';
                      return (
                        <button
                          disabled={isPendingApproval || !isChecklistCompletedForLesson(fullscreenLesson.id)}
                          onClick={async () => {
                            const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                            updateProgress(weekKey, 3, 3);
                            
                            if (isTeacherPreparation && schoolId) {
                               await updateLessonStatus(schoolId, grade, fullscreenLesson.id, 'pending_approval', teacherId);
                               if (setLessonStatuses) {
                                 setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'pending_approval' }));
                               }
                            }
                          }}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-95 ${
                            isPendingApproval
                              ? 'bg-amber-55 border border-amber-250 text-amber-700 shadow-xs cursor-not-allowed font-semibold'
                              : progress.completedWeeks[`${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`]
                              ? 'bg-emerald-50 border border-emerald-250 text-emerald-700 shadow-sm font-extrabold'
                              : isChecklistCompletedForLesson(fullscreenLesson.id)
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                              : 'bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {isPendingApproval ? (
                            <>
                              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                              <span>Awaiting Admin Unlock</span>
                            </>
                          ) : progress.completedWeeks[`${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`] ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span>Lesson Complete ✔</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-305" />
                              <span>Mark Lesson Complete</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* High-visibility Action Footer Bar requesting back-navigation */}
              <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-800 text-xs font-bold select-none flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    Interactive Full-Screen Navigation
                  </span>
                  {!isCurrentLessonChecklistCompleted && nextLesson ? (
                    <span className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 w-fit animate-pulse">
                      🔒 Complete Checklist (Select 'Yes ✔' for all 4 items) to Unlock Next Week
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Move between lesson weeks for Grade {grade} or go back to select another page.
                    </span>
                  )}
                </div>
                
                {/* 3-button flow cluster requested by the user */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    disabled={!prevLesson}
                    onClick={() => prevLesson && handleSwitchLesson(prevLesson)}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-extrabold text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                  >
                    ← Previous Week
                  </button>

                  <button
                    onClick={() => setFullscreenLesson(null)}
                    className="w-full sm:w-auto px-7 py-3 bg-slate-900 hover:bg-slate-850 text-white font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/10"
                    id="select-new-page-btn"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Select New Page / Roadmap</span>
                  </button>

                  {isTeacherPreparation ? (
                    (() => {
                      const currentLessonStatus = getLessonStatus(fullscreenLesson.id);
                      const isPendingApproval = currentLessonStatus === 'pending_approval';
                      const isCompleted = currentLessonStatus === 'unlocked_for_students' || progress.completedWeeks[`${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`];
                      
                      return (
                        <button
                          disabled={isPendingApproval || isCompleted || !isCurrentLessonChecklistCompleted}
                          onClick={async () => {
                            const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                            updateProgress(weekKey, 3, 3);
                            
                            if (schoolId) {
                              await updateLessonStatus(schoolId, grade, fullscreenLesson.id, 'pending_approval', teacherId);
                              if (setLessonStatuses) {
                                setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'pending_approval' }));
                              }
                            }
                          }}
                          className={`w-full sm:w-auto px-7 py-3 font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                            isPendingApproval
                              ? 'bg-amber-500 text-white shadow-amber-500/20 cursor-not-allowed opacity-90'
                              : isCompleted
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-not-allowed opacity-90'
                              : isCurrentLessonChecklistCompleted
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                          title={
                            isPendingApproval
                              ? "Awaiting Admin Approval"
                              : isCompleted
                              ? "Lesson Complete & Approved"
                              : !isCurrentLessonChecklistCompleted
                              ? "Complete the observation checklist first"
                              : "Submit lesson completion and notify admin"
                          }
                        >
                          {isPendingApproval ? (
                            <>
                              <Clock className="w-4 h-4 text-white animate-pulse" />
                              <span>Awaiting Admin Unlock</span>
                            </>
                          ) : isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span>Lesson Completed ✔</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-305" />
                              <span>Complete and Notify Admin</span>
                            </>
                          )}
                        </button>
                      );
                    })()
                  ) : (
                    <button
                      disabled={!nextLesson || !isCurrentLessonChecklistCompleted}
                      onClick={() => nextLesson && handleSwitchLesson(nextLesson)}
                      className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                      title={!isCurrentLessonChecklistCompleted && nextLesson ? "Complete the observation checklist items with 'Yes' to proceed" : "Next Lesson Week"}
                    >
                      <span>Next Lesson Week</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
