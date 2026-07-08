"use client";
import { localStore } from '../lib/localStore';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotGirl from './MascotGirl';
import ColoringCanvas from './ColoringCanvas';
// @ts-ignore
const mascotSuccessImg = '/assets/images/mascot_success_1781367071934.jpg';
// @ts-ignore
const laptopColoringImg = '/assets/images/laptop_coloring_1781368252058.jpg';
// @ts-ignore
const computerColoringImg = '/assets/images/computer_coloring_1781368268068.jpg';
// @ts-ignore
const treeColoringImg = '/assets/images/tree_coloring_1781378254000.jpg';
// @ts-ignore
const carColoringImg = '/assets/images/car_coloring_1781378269045.jpg';
// @ts-ignore
const actionPlayImg = '/assets/images/user_play_card_1781375108647.jpg';
// @ts-ignore
const actionTalkImg = '/assets/images/user_talk_card_1781375123550.jpg';
// @ts-ignore
const actionLearnImg = '/assets/images/user_learn_card_1781375138753.jpg';
// @ts-ignore
const actionListenImg = '/assets/images/user_listen_card_1781375154733.jpg';
import { 
  Laptop, 
  Tv, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Check, 
  Trophy, 
  Play, 
  Sparkles, 
  Smile, 
  HelpCircle,
  FileText,
  Bookmark,
  Heart,
  ArrowRight,
  User,
  Activity,
  ArrowRightLeft,
  Award,
  Lock,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { LessonStatus } from '../types';
import { updateLessonStatus } from '../lib/lesson-status-service';

interface Grade1Week2WorkbookProps {
  activeStudentId?: string;
  onComplete: (stars: number, possible?: number) => void;
  onNextLesson?: () => void;
  isSuperAdmin?: boolean;
  superAdminBypass?: boolean;
  isTeacherPreparation?: boolean;
  schoolId?: string;
  teacherId?: string;
  lessonStatuses?: Record<string, LessonStatus>;
  setLessonStatuses?: React.Dispatch<React.SetStateAction<Record<string, LessonStatus>>>;
}

export default function Grade1Week2Workbook({ 
  activeStudentId, 
  onComplete, 
  onNextLesson,
  isSuperAdmin = false,
  superAdminBypass = false,
  isTeacherPreparation = false,
  schoolId = '',
  teacherId = '',
  lessonStatuses = {},
  setLessonStatuses
}: Grade1Week2WorkbookProps) {
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  // --- INTERACTIVE STATE: SECTION 1 (Let's Remember) ---
  const [traceName1, setTraceName1] = useState('');
  const [traceName2, setTraceName2] = useState('');
  const [section1Success, setSection1Success] = useState(false);

  // --- INTERACTIVE STATE: SECTION 3 (Activities) ---
  // Activity 1: Circle the computing device (Backpack, Teddy Bear, Laptop, Ball)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  // Activity 2: Tick what a device can help you do (Read, Swim, Sleep, Learn)
  const [ticks, setTicks] = useState({
    read: false,
    swim: false,
    sleep: false,
    learn: false,
  });

  // Activity 3: Color only the computing device (Computer, Tree, Car)
  const [coloredItem, setColoredItem] = useState<string | null>(null);
  const [triedTree, setTriedTree] = useState(false);
  const [triedCar, setTriedCar] = useState(false);
  const [activity3Color, setActivity3Color] = useState('#fbbf24'); // default Amber

  // Activity 4: Trace & Write yourself
  const [writtenWord, setWrittenWord] = useState('');

  // --- REFLECTION STATE ---
  const [reflectionFace, setReflectionFace] = useState<string | null>(null);
  const [submittedAll, setSubmittedAll] = useState(false);
  const [showHomeworkWarning, setShowHomeworkWarning] = useState(false);
  const [tourProgress, setTourProgress] = useState(0);

  const handleTourClick = (stepId: number, text: string) => {
    if (stepId <= tourProgress) {
      playChime();
      speakText(text);
      if (stepId === tourProgress && tourProgress < 4) {
        setTourProgress(prev => prev + 1);
      }
    } else {
      speakText("Oops! Please click the glowing item first to learn step by step.");
    }
  };

  const getTourClass = (stepId: number, baseColorClass: string, activeMatchText: string) => {
    const base = "relative overflow-hidden aspect-[140/200] rounded-2xl border shadow-sm transition cursor-pointer active:scale-95 flex flex-col items-center justify-center bg-white";
    if (stepId === tourProgress) {
      return `${base} border-amber-400 ring-4 ring-amber-400 animate-pulse scale-105 z-10 block`;
    } else if (stepId < tourProgress) {
      return `${base} ${baseColorClass} hover:shadow-md ${activeSpeech?.includes(activeMatchText) ? 'ring-4 ring-offset-2' : ''} block`;
    } else {
      return `${base} border-slate-200 opacity-50 grayscale hover:scale-100 cursor-not-allowed block`;
    }
  };

  // --- PAGE STATE AND HOMEWORK STATE ---
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [hwAnswers, setHwAnswers] = useState<Record<number, string>>({});
  const [hwSubmitted, setHwSubmitted] = useState<boolean>(() => {
    return localStore.getItem(`g1w2_hw_${activeStudentId || 'default'}_submitted`) === 'true';
  });
  const [hwScore, setHwScore] = useState<number | null>(() => {
    const val = localStorage.getItem(`g1w2_hw_${activeStudentId || 'default'}_score`);
    return val !== null ? parseInt(val, 10) : null;
  });

  // --- INTERACTIVE STATE: HOMEWORK PAGE 2 (structurally similar to classwork) ---
  const [hwSelectedDevice, setHwSelectedDevice] = useState<string | null>(() => {
    return localStorage.getItem(`g1w2_hw_${activeStudentId || 'default'}_selected_device`);
  });
  const [hwTicks, setHwTicks] = useState<{ cartoons: boolean; water: boolean; games: boolean; sandwiches: boolean }>(() => {
    const val = localStorage.getItem(`g1w2_hw_${activeStudentId || 'default'}_ticks`);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        // fallback
      }
    }
    return {
      cartoons: false,
      water: false,
      games: false,
      sandwiches: false,
    };
  });
  const [hwColoredItem, setHwColoredItem] = useState<string | null>(() => {
    return localStorage.getItem(`g1w2_hw_${activeStudentId || 'default'}_colored_item`);
  });
  const [hwCrayonColor, setHwCrayonColor] = useState('#0ea5e9'); // default Sky Blue or Pink
  const [hwWrittenWord, setHwWrittenWord] = useState<string>(() => {
    return localStorage.getItem(`g1w2_hw_${activeStudentId || 'default'}_written_word`) || '';
  });

  // Sound and Speech Synthesis Helpers
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (activeSpeech === text) {
      setActiveSpeech(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.2;
    utterance.onend = () => setActiveSpeech(null);
    utterance.onerror = () => setActiveSpeech(null);
    setActiveSpeech(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeech(null);
  };

  const playChime = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const playPop = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const playBoop = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Validators for Activity Pages
  const checkSection1 = () => {
    const s1 = traceName1.trim().toLowerCase();
    const s2 = traceName2.trim().toLowerCase();
    if ((s1 === 'laptop' || s1.includes('lap')) && (s2 === 'computer' || s2.includes('comp') || s2.includes('desk'))) {
      setSection1Success(true);
      playChime();
      speakText("Wonderful memory! Laptop and computer are right!");
    } else {
      playPop();
      speakText("Keep looking closely at the outlines! 1 is a laptop, 2 is a computer.");
    }
  };

  const handleTickToggle = (key: 'read' | 'swim' | 'sleep' | 'learn') => {
    playPop();
    setTicks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFinishWorkbook = () => {
    if (!hwSubmitted) {
      playPop();
      setShowHomeworkWarning(true);
      speakText("Stop, technology champion! You must complete and submit your Tech Challenge on Page 2 first before we can certify this lesson and proceed!");
      return;
    }
    playChime();
    setSubmittedAll(true);
    onComplete(3, 3);
    speakText("Yippee! Gold star earned! You did a fantastic job tracing, colouring, and selecting computing devices!");
  };

  return (
    <div className="space-y-5 w-full text-left" id="grade1-l1-workbook-root">
      
      {/* HELLO CODE EXPLORER CARD */}
      <div className="bg-amber-50/60 border border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl shadow-xs text-left">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 select-none animate-bounce flex items-center justify-center bg-purple-50 border border-purple-200 rounded-2xl p-1">
            <MascotGirl grade="1" pose="waving" className="w-14 h-14" />
          </div>
          <div>
            <h4 className="font-extrabold text-indigo-950 text-base">Hello, Code Explorer!</h4>
            <p className="text-xs text-slate-700 font-bold mt-0.5">
              Welcome to <span className="text-emerald-600 font-black">Lesson 1</span>. Today is going to be <span className="text-rose-500 font-black">SO</span> much fun!
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => speakText("Hello, Code Explorer! Welcome to Lesson 1. Today is going to be SO much fun!")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read to Me</span>
          </button>
        </div>
      </div>

      {/* PAGE TABS SELECTOR */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-2 w-full max-w-md">
        <button
          type="button"
          onClick={() => {
            playPop();
            setCurrentPage(1);
            speakText("Opening Page 1: Workbook Discovery Guide activities.");
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-center font-black text-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
            currentPage === 1 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Page 1: Discovery Guide</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playPop();
            if (!submittedAll && !hwSubmitted && !(isSuperAdmin && superAdminBypass)) {
              setShowHomeworkWarning(true);
              speakText("Wait champion! You must complete the Discovery Guide Study on Page 1 first.");
              return;
            }
            setCurrentPage(2);
            speakText("Opening Page 2: Tech Challenge Check. Remember, you keep working and tap Submit My Work once to see your score!");
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-center font-black text-xs transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 relative ${
            currentPage === 2 
              ? 'bg-pink-600 text-white shadow-md' 
              : 'text-slate-650 hover:bg-slate-200'
          } ${(!submittedAll && !hwSubmitted && !(isSuperAdmin && superAdminBypass)) ? 'opacity-50' : ''}`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Page 2: Tech Challenge</span>
          {(!submittedAll && !hwSubmitted && !(isSuperAdmin && superAdminBypass)) && <span className="ml-1">🔒</span>}
          {(!hwSubmitted && (submittedAll || hwSubmitted)) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-white"></span>
          )}
        </button>
      </div>

      {currentPage === 1 ? (
        /* WORKBOOK LIVE CARDS PANEL */
        <div className="space-y-5 pb-8" id="discovery-guide-scroll-container">
          
          {/* ========================================================== */}
          {/* SECTION 1 - LET'S REMEMBER */}
          {/* ========================================================== */}
          <motion.div
            key="sec-1"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6 bg-white p-6 md:p-8 rounded-xl border-l-4 border-l-purple-600 border border-purple-100/80 shadow-xs w-full"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs select-none inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <span>1. Let's Remember</span>
            </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-indigo-950 flex items-center justify-between">
                  <span>Can you color and type the names of these devices?</span>
                  <button 
                    type="button" 
                    onClick={() => speakText("Section 1: Let's Remember. Can you color and type the names of these devices? Fill in the blanks below the pictures! Number 1 is a laptop computer, and number 2 is a desktop computer.")}
                    className="p-1 px-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] uppercase font-black rounded-lg flex items-center gap-1 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Type the correct name on the lines! 💡 Hint: Write <strong>laptop</strong> and <strong>computer</strong> to color and type successfully!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Device 1 - Laptop */}
                <div className="bg-white border-2 border-dashed border-sky-200 rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-3xs relative group hover:border-sky-400 transition-colors">
                  <div className="text-[10px] font-black uppercase text-indigo-600 absolute top-3 left-3 bg-indigo-50 px-2 py-0.5 rounded">
                    Device #1
                  </div>
                  
                  {/* Interactive Laptop Coloring Board (using real high-res outline image) */}
                  <ColoringCanvas imageSrc={laptopColoringImg.src || laptopColoringImg} altText="Laptop coloring outline" />

                  {/* Device Name Label underneath image for Grade 1 reading support */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#d97706]/85">DEVICE:</span>
                    <h5 className="text-xl font-black text-indigo-950 uppercase tracking-normal">LAPTOP COOLER</h5>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                      <span className="text-[10px] text-indigo-500 font-extrabold italic">Type "laptop" inside this box below:</span>
                      <div className="flex items-center gap-1 text-slate-800 font-extrabold text-xs justify-center">
                        <span className="text-slate-400">✏️</span>
                        <input
                          type="text"
                          placeholder="Type 'laptop' here..."
                          value={traceName1}
                          onChange={(e) => {
                            setTraceName1(e.target.value);
                            if (e.target.value.toLowerCase().trim() === 'laptop') playChime();
                          }}
                          className="border-b-2 border-indigo-400 outline-none text-center font-black bg-transparent w-36 px-1 uppercase text-xs tracking-wider focus:border-indigo-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                    
                    {traceName1.toLowerCase().trim() === 'laptop' ? (
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center justify-center gap-1 animate-pulse bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100">
                        ⭐ Correct! typed laptop!
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1 bg-sky-50 py-1.5 px-2.5 rounded-xl border border-sky-100">
                        <span className="text-[9px] text-sky-700 font-extrabold uppercase tracking-wide">Copy these letters:</span>
                        <div className="flex gap-1">
                          {"LAPTOP".split("").map((letter, idx) => (
                            <span key={idx} className="w-6 h-6 rounded-md bg-white border border-sky-300 shadow-2xs flex items-center justify-center font-black text-xs text-sky-850 select-none">
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device 2 - Desktop Computer */}
                <div className="bg-white border-2 border-dashed border-sky-200 rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-3xs relative group hover:border-sky-400 transition-colors">
                  <div className="text-[10px] font-black uppercase text-indigo-600 absolute top-3 left-3 bg-indigo-50 px-2 py-0.5 rounded">
                    Device #2
                  </div>
                  
                  {/* Interactive Desktop Computer Coloring Board (using real high-res outline image) */}
                  <ColoringCanvas imageSrc={computerColoringImg.src || computerColoringImg} altText="Desktop Computer coloring outline" />

                  {/* Device Name Label underneath image for Grade 1 reading support */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#d97706]/85">DEVICE:</span>
                    <h5 className="text-xl font-black text-indigo-950 uppercase tracking-normal">COMPUTER</h5>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                      <span className="text-[10px] text-indigo-500 font-extrabold italic">Type "computer" inside this box below:</span>
                      <div className="flex items-center gap-1 text-slate-800 font-extrabold text-xs justify-center">
                        <span className="text-slate-400">✏️</span>
                        <input
                          type="text"
                          placeholder="Type 'computer' here..."
                          value={traceName2}
                          onChange={(e) => {
                            setTraceName2(e.target.value);
                            if (e.target.value.toLowerCase().trim() === 'computer') playChime();
                          }}
                          className="border-b-2 border-indigo-400 outline-none text-center font-black bg-transparent w-36 px-1 uppercase text-xs tracking-wider focus:border-indigo-600 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {traceName2.toLowerCase().trim() === 'computer' ? (
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center justify-center gap-1 animate-pulse bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100">
                        ⭐ Correct! typed computer!
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1 bg-sky-50 py-1.5 px-2.5 rounded-xl border border-sky-100">
                        <span className="text-[9px] text-sky-700 font-extrabold uppercase tracking-wide">Copy these letters:</span>
                        <div className="flex gap-1">
                          {"COMPUTER".split("").map((letter, idx) => (
                            <span key={idx} className="w-6 h-6 rounded-md bg-white border border-sky-300 shadow-2xs flex items-center justify-center font-black text-xs text-sky-850 select-none">
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Validate Section Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={checkSection1}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs md:text-sm rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer max-w-xs w-full text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-5 h-5" />
                  <span>Submit Pre-Quiz</span>
                </button>
              </div>

              {/* Congratulations box */}
              {section1Success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 animate-bounce">
                  <span className="text-xl inline-block mr-1">🎉</span> 
                  <span className="font-extrabold text-xs md:text-sm">Excellent typing! Let's go ahead to SECTION 2 to find out how they work!</span>
                </div>
              )}

              {/* Layout Footer Note */}
              <div className="bg-[#fff9f2] border-2 border-orange-250 rounded-2xl p-4 flex items-center gap-4 text-left shadow-2xs">
                <div className="w-16 h-16 shrink-0 select-none animate-bounce flex items-center justify-center bg-purple-50 border border-purple-200 rounded-2xl p-1">
                  <MascotGirl grade="1" pose="waving" className="w-14 h-14" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-md select-none inline-block">
                    GREAT JOB! ✨
                  </span>
                  <p className="text-xs md:text-sm text-slate-800 font-extrabold leading-relaxed">
                    "great job! You already know lots of clever devices. Today we find out HOW they work!"
                  </p>
                </div>
              </div>
            </motion.div>


            {/* ========================================================== */}
            {/* SECTION 2 - OUR BIG WORD TODAY */}
            {/* ========================================================== */}
            <motion.div
              key="sec-2"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 bg-white p-6 md:p-8 rounded-xl border-l-4 border-l-amber-500 border border-amber-100/80 shadow-xs w-full"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs select-none inline-flex items-center gap-1.5">
                <span className="text-sm">🗣️</span>
                <span>2. Our Big Word Today</span>
              </div>

              <div className="space-y-2.5 bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-3xl p-6 relative overflow-hidden text-center shadow-lg">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 tracking-widest bg-amber-500/20 px-2.5 py-1 rounded border border-amber-300/30">
                  Vocabulary focus
                </span>
                <p className="text-xs font-semibold text-indigo-200 mt-2">
                  "We are going to learn ONE very important word today. Say it out loud with me:"
                </p>
                <div className="py-4 font-sans select-all selection:bg-amber-400">
                  <h3 className="text-3xl md:text-4.5xl font-black text-amber-400 tracking-tight leading-none uppercase filter drop-shadow-xs animate-pulse">
                    COMPUTING DEVICE
                  </h3>
                </div>
                
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      speakText("Our big word today is: Computing Device! Say it out loud: Computing Device.");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Loud and Clear Shoutout!</span>
                  </button>
                </div>
              </div>

              {/* Informative Grid: What is a Computing Device? */}
              <div className="bg-emerald-50/20 border-2 border-emerald-400/30 rounded-3xl p-6 space-y-4">
                <h4 className="font-sans text-emerald-900 font-black text-base md:text-lg flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-emerald-500 text-white text-xs rounded-full">❓</span>
                  <span>What is a Computing Device?</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-4 transition-all hover:translate-x-1 duration-150">
                    <span className="text-4xl filter drop-shadow-3xs select-none mt-1">🤖</span>
                    <div className="space-y-0.5 mt-1.5">
                      <p className="text-xs md:text-sm font-bold text-slate-800 leading-normal">
                        A computing device is a <strong className="text-emerald-700">clever machine</strong> that helps us do things.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 transition-all hover:translate-x-1 duration-150">
                    <span className="text-4xl filter drop-shadow-3xs select-none mt-1">🔢</span>
                    <div className="space-y-0.5 mt-1.5">
                      <p className="text-xs md:text-sm font-bold text-slate-800 leading-normal">
                        It can work with information like <span className="text-indigo-600 font-extrabold">words</span>, <span className="text-emerald-600 font-extrabold">pictures</span>, <span className="text-rose-500 font-extrabold">numbers</span>, and <span className="text-amber-500 font-extrabold">sound</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 transition-all hover:translate-x-1 duration-150">
                    <span className="text-4xl filter drop-shadow-3xs select-none mt-1">⚙️</span>
                    <div className="space-y-0.5 mt-1.5">
                      <p className="text-xs md:text-sm font-bold text-slate-800 leading-normal">
                        Computing devices have <span className="text-sky-600 font-black">screens</span>, <span className="text-indigo-600 font-black">buttons</span>, and <span className="text-purple-600 font-black">special parts inside</span> that make them work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 4 columns: A computing device can help you... */}
              <div className="space-y-4 pt-1">
                <h4 className="font-black text-slate-800 text-sm md:text-base text-center uppercase tracking-wide">
                  ✨ A computing device can help you... ✨
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Play Card */}
                  <button
                    type="button"
                    onClick={() => handleTourClick(0, "A computing device can help you play games and have fun!")}
                    className={getTourClass(0, "border-emerald-300", "play games")}
                  >
                    <img 
                      src={actionPlayImg.src || actionPlayImg} 
                      alt="Play Games & fun" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-fill rounded-2xl" 
                    />
                  </button>

                  {/* Talk Card */}
                  <button
                    type="button"
                    onClick={() => handleTourClick(1, "A computing device can help you talk, call, and message friends!")}
                    className={getTourClass(1, "border-sky-300", "talk, call")}
                  >
                    <img 
                      src={actionTalkImg.src || actionTalkImg} 
                      alt="Talk Call & message" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-fill rounded-2xl" 
                    />
                  </button>

                  {/* Learn Card */}
                  <button
                    type="button"
                    onClick={() => handleTourClick(2, "A computing device can help you learn, complete school worksheets, and watch lessons!")}
                    className={getTourClass(2, "border-purple-300", "learn, complete")}
                  >
                    <img 
                      src={actionLearnImg.src || actionLearnImg} 
                      alt="Learn school worksheets & videos" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-fill rounded-2xl" 
                    />
                  </button>

                  {/* Listen Card */}
                  <button
                    type="button"
                    onClick={() => handleTourClick(3, "A computing device can help you listen to upbeat music, sound limits, and story cards!")}
                    className={getTourClass(3, "border-rose-300", "listen to")}
                  >
                    <img 
                      src={actionListenImg.src || actionListenImg} 
                      alt="Listen Music & stories" 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-fill rounded-2xl" 
                    />
                  </button>
                </div>
              </div>

              {/* Interactive flow chart diagram: Input, Processing, Output, Communication */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="text-center font-black text-xs uppercase tracking-wider text-slate-500">
                  ⚡ Interactive Computer Flow Map
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Step 1: Input */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      speakText("Input! We give the computer instructions. Click or check items.");
                    }}
                    className="bg-white border hover:border-indigo-400 p-4 rounded-2xl text-center space-y-2 shadow-3xs flex flex-col items-center"
                  >
                    <div className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                      1. INPUT
                    </div>
                    <span className="text-3xl">📝</span>
                    <p className="font-bold text-xs text-slate-800">We give instructions</p>
                  </button>

                  {/* Step 2: Processing */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      speakText("Processing! The computer brain thinks and follows the instructions.");
                    }}
                    className="bg-white border hover:border-indigo-400 p-4 rounded-2xl text-center space-y-2 shadow-3xs flex flex-col items-center"
                  >
                    <div className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded animate-pulse">
                      2. PROCESSING
                    </div>
                    <span className="text-3xl animate-bounce">🧠</span>
                    <p className="font-bold text-xs text-slate-800">The computer thinks</p>
                  </button>

                  {/* Step 3: Output */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      speakText("Output! The screen shows us results like shining gold stars!");
                    }}
                    className="bg-white border hover:border-indigo-400 p-4 rounded-2xl text-center space-y-2 shadow-3xs flex flex-col items-center"
                  >
                    <div className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                      3. OUTPUT
                    </div>
                    <span className="text-3xl">🖥️⭐</span>
                    <p className="font-bold text-xs text-slate-800">Shows the results</p>
                  </button>

                  {/* Step 4: Communication */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      speakText("Communication! We can talk to people and share information.");
                    }}
                    className="bg-white border hover:border-indigo-400 p-4 rounded-2xl text-center space-y-2 shadow-3xs flex flex-col items-center"
                  >
                    <div className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      4. TALK
                    </div>
                    <span className="text-3xl">🧑‍💻👋</span>
                    <p className="font-bold text-xs text-slate-800">We share with friends</p>
                  </button>
                </div>

                <div className="text-center font-bold text-purple-800 text-xs py-1 flex items-center justify-center gap-1.5 leading-none">
                  <span>💜</span>
                  <span>"Computing devices make our life easier, smarter and more fun! 😊"</span>
                </div>
              </div>
            </motion.div>


            {/* ========================================================== */}
            {/* SECTION 3 - ACTIVITIES BOARD */}
            {/* ========================================================== */}
            <motion.div
              key="sec-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 bg-white p-6 md:p-8 rounded-xl border-l-4 border-l-sky-500 border border-sky-100/80 shadow-xs w-full"
            >
              <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs select-none inline-flex items-center gap-1.5">
                <span className="text-sm">🎯</span>
                <span>3. Activities Board</span>
              </div>

              {/* Subtitle Audio controls wrapper */}
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-bold">📢 Tap and solve every worksheet activity step to unlock completion gold stars!</span>
                <button
                  type="button"
                  onClick={() => speakText("Section 3: Activity Board. Complete all four activities! 1. Circle is Laptop. 2. Tick book and learn. 3. Colour the Computer. 4. Trace word to finish.")}
                  className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1 transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Guide</span>
                </button>
              </div>

              {/* ------------------------------------------- */}
              {/* ACTIVITY 1: Circle the computing device */}
              {/* ------------------------------------------- */}
              <div className="bg-white border-2 border-dashed border-sky-300 rounded-3xl p-5 space-y-4 shadow-3xs">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-white bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  <h4 className="font-black text-slate-900 text-xs md:text-sm">Circle the computing device.</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Item A: Backpack */}
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedDevice('backpack');
                      speakText("Oops! Backpack is for carrying books, not a clever machine.");
                    }}
                    className={`bg-slate-50 border p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                      selectedDevice === 'backpack' ? 'ring-4 ring-rose-400 border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-5xl select-none filter drop-shadow-3xs">🎒</span>
                    <span className="font-black text-xs text-slate-700">Backpack</span>
                    {selectedDevice === 'backpack' && (
                      <span className="absolute top-2 right-2 text-rose-500 font-black text-[10px]">❌ Try Again!</span>
                    )}
                  </button>

                  {/* Item B: Teddy Bear */}
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedDevice('teddy');
                      speakText("Warm and fuzzy teddy bear is a lovely toy, but doesn't have a screen or software!");
                    }}
                    className={`bg-slate-50 border p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                      selectedDevice === 'teddy' ? 'ring-4 ring-rose-400 border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-5xl select-none filter drop-shadow-3xs">🧸</span>
                    <span className="font-black text-xs text-slate-700">Teddy Bear</span>
                    {selectedDevice === 'teddy' && (
                      <span className="absolute top-2 right-2 text-rose-500 font-black text-[10px]">❌ Try Again!</span>
                    )}
                  </button>

                  {/* Item C: Laptop (CORRECT!) */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      setSelectedDevice('laptop');
                      speakText("Correct! Wonderful! The laptop is a true computing device screen output machine!");
                    }}
                    className={`bg-slate-50 border p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                      selectedDevice === 'laptop' ? 'ring-4 ring-emerald-500 border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-5xl select-none filter drop-shadow-3xs animate-bounce">💻</span>
                    <span className="font-black text-xs text-slate-700">Laptop</span>
                    {selectedDevice === 'laptop' && (
                      <span className="absolute top-2 right-2 text-emerald-600 font-black text-xs bg-emerald-100 rounded p-1">⭕ CORRECT!</span>
                    )}
                  </button>

                  {/* Item D: Beach Ball */}
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedDevice('ball');
                      speakText("A beach ball is so fun to kick on the grass, but it's not a computer!");
                    }}
                    className={`bg-slate-50 border p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                      selectedDevice === 'ball' ? 'ring-4 ring-rose-400 border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-5xl select-none filter drop-shadow-3xs">⚽</span>
                    <span className="font-black text-xs text-slate-700">Ball</span>
                    {selectedDevice === 'ball' && (
                      <span className="absolute top-2 right-2 text-rose-500 font-black text-[10px]">❌ Try Again!</span>
                    )}
                  </button>
                </div>
              </div>

              {/* ------------------------------------------- */}
              {/* ACTIVITY 2: Tick what a device can help you do */}
              {/* ------------------------------------------- */}
              <div className="bg-white border-2 border-dashed border-emerald-300 rounded-3xl p-5 space-y-4 shadow-3xs">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-white bg-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  <h4 className="font-black text-slate-900 text-xs md:text-sm">Tick what a computing device can help you do.</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Read a book */}
                  <button
                    type="button"
                    onClick={() => handleTickToggle('read')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none cursor-pointer ${
                      ticks.read ? 'bg-indigo-50 border-indigo-400 text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-4xl">📖</span>
                    <span>Read a book</span>
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                      ticks.read ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {ticks.read && <Check className="w-4 h-4 stroke-[4]" />}
                    </div>
                  </button>

                  {/* Swim */}
                  <button
                    type="button"
                    onClick={() => handleTickToggle('swim')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none cursor-pointer ${
                      ticks.swim ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-4xl">🏊</span>
                    <span>Swim</span>
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                      ticks.swim ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {ticks.swim && <span className="font-extrabold text-[9px]">NO!</span>}
                    </div>
                  </button>

                  {/* Sleep */}
                  <button
                    type="button"
                    onClick={() => handleTickToggle('sleep')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none cursor-pointer ${
                      ticks.sleep ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-4xl">🛌</span>
                    <span>Sleep</span>
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                      ticks.sleep ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {ticks.sleep && <span className="font-extrabold text-[9px]">NO!</span>}
                    </div>
                  </button>

                  {/* Learn */}
                  <button
                    type="button"
                    onClick={() => handleTickToggle('learn')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none cursor-pointer ${
                      ticks.learn ? 'bg-indigo-50 border-indigo-400 text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-4xl">🧑‍💻</span>
                    <span>Learn</span>
                    <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                      ticks.learn ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {ticks.learn && <Check className="w-4 h-4 stroke-[4]" />}
                    </div>
                  </button>
                </div>

                <div className="text-[11px] text-center font-bold text-slate-505">
                  {ticks.read && ticks.learn && !ticks.swim && !ticks.sleep ? (
                    <span className="text-emerald-600 block animate-bounce">🏆 Super! Ticks are completely correct! Computer helps you read books and learn!</span>
                  ) : (
                    <span className="text-slate-500 italic">Tick only Read a book and Learn. Swim and Sleep are things you do with your muscles and eyes offline!</span>
                  )}
                </div>
              </div>

              {/* ------------------------------------------- */}
              {/* ACTIVITY 3: Colour ONLY the computing device */}
              {/* ------------------------------------------- */}
              <div className="bg-white border-2 border-dashed border-fuchsia-300 rounded-3xl p-5 space-y-5 shadow-3xs animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-fuchsia-105/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-black text-white bg-fuchsia-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    <h4 className="font-black text-slate-900 text-xs md:text-sm">Colour ONLY the computing device.</h4>
                  </div>
                  
                  {/* Unified Crayon Color Selector */}
                  <div className="flex flex-wrap items-center gap-2 px-3 py-1 bg-fuchsia-50/70 border border-fuchsia-100 rounded-full max-w-sm self-start sm:self-auto">
                    <span className="text-[10px] font-extrabold tracking-wide text-fuchsia-800 uppercase pl-1 select-none">
                      🖍️ Choose Crayon:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { name: 'Red', hex: '#ef4444', bg: 'bg-ef4444 bg-red-500' },
                        { name: 'Orange', hex: '#f97316', bg: 'bg-f97316 bg-orange-500' },
                        { name: 'Amber/Yellow', hex: '#fbbf24', bg: 'bg-fbbf24 bg-amber-400' },
                        { name: 'Green', hex: '#22c55e', bg: 'bg-22c55e bg-green-500' },
                        { name: 'Sky Blue', hex: '#0ea5e9', bg: 'bg-0ea5e9 bg-sky-500' },
                        { name: 'Purple', hex: '#a855f7', bg: 'bg-a855f7 bg-purple-500' },
                        { name: 'Pink', hex: '#ec4899', bg: 'bg-ec4899 bg-pink-500' },
                      ].map((color) => {
                        const isSelected = activity3Color === color.hex;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => {
                              setActivity3Color(color.hex);
                              playChime();
                            }}
                            className={`w-5 h-5 rounded-full ${color.bg} transition-all duration-155 ${
                              isSelected ? 'scale-125 ring-2 ring-fuchsia-500 ring-offset-1 shadow-md' : 'hover:scale-110 active:scale-95'
                            } cursor-pointer`}
                            title={color.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  {/* Computer Outline / Colored */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-full bg-white p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[9.5rem] border-fuchsia-200">
                      <ColoringCanvas 
                        imageSrc={computerColoringImg.src || computerColoringImg} 
                        altText="Desktop Computer coloring outline"
                        externalActiveColor={activity3Color}
                        hidePalette={true}
                        onColor={() => {
                          if (coloredItem !== 'computer') {
                            setColoredItem('computer');
                            playChime();
                            speakText("Splendid! You are colouring the desktop computer! Keep painting to make it beautiful.");
                          }
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800">Computer</span>
                  </div>

                  {/* Tree */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-full bg-white p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[9.5rem] border-fuchsia-200">
                      <ColoringCanvas 
                        imageSrc={treeColoringImg.src || treeColoringImg} 
                        altText="Tree coloring outline"
                        externalActiveColor={activity3Color}
                        hidePalette={true}
                        onColor={() => {
                          if (!triedTree) {
                            setTriedTree(true);
                            playPop();
                            speakText("Wait! Trees are beautiful living things from nature, but they are not computing devices. Let's click the little reset button to keep the tree clean and find the computing device!");
                          }
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800">Tree</span>
                    {triedTree && (
                      <span className="text-[10px] text-rose-600 font-extrabold max-w-[200px] text-center bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                        ⚠️ Nature, not a dev! Click 🔄 to clear.
                      </span>
                    )}
                  </div>

                  {/* Car */}
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-full bg-white p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[9.5rem] border-fuchsia-200">
                      <ColoringCanvas 
                        imageSrc={carColoringImg.src || carColoringImg} 
                        altText="Car coloring outline"
                        externalActiveColor={activity3Color}
                        hidePalette={true}
                        onColor={() => {
                          if (!triedCar) {
                            setTriedCar(true);
                            playPop();
                            speakText("Hold on! A car is for transport, but it's not a smart computing device. Let's click the little reset button to keep the car clean and find the computing device!");
                          }
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-800">Car</span>
                    {triedCar && (
                      <span className="text-[10px] text-rose-600 font-extrabold max-w-[200px] text-center bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                        ⚠️ Transport, not a dev! Click 🔄 to clear.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ------------------------------------------- */}
              {/* ACTIVITY 4: Look at the spelling, then write it yourself */}
              {/* ------------------------------------------- */}
              <div className="bg-white border-2 border-dashed border-orange-300 rounded-3xl p-5 space-y-4 shadow-3xs">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-black text-white bg-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                    <h4 className="font-black text-slate-900 text-xs md:text-sm">Look at the spelling, then write it yourself.</h4>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => speakText("Activity 4: Look at the spelling of the words computing device, then write it precisely in the handwriting box below. We want to test how well you remember the correct letter order!")}
                    className="p-1 px-2.5 bg-orange-105 bg-orange-100 hover:bg-orange-200 text-orange-900 text-[10px] uppercase font-black rounded-lg flex items-center gap-1 transition shrink-0 select-none cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Speak</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/40 rounded-2xl border">
                  
                  {/* Visual Reference Area */}
                  <div className="space-y-3 text-left">
                    <span className="text-[10px] uppercase font-black tracking-wide text-amber-800">Learn to spell:</span>
                    
                    {/* Dashed bg layout letter-by-letter */}
                    <div className="bg-white p-4 border rounded-xl flex flex-col items-center justify-center min-h-[4rem] border-orange-200 gap-2">
                      <div className="flex flex-col items-center gap-2.5 w-full">
                        <div className="flex flex-wrap gap-1 justify-center max-w-full">
                          {"COMPUTING DEVICE".split("").map((letter, idx) => (
                            <span 
                              key={idx} 
                              className={`rounded-md shadow-2xs flex items-center justify-center font-black text-[10px] select-none ${
                                letter === " " 
                                  ? "w-3.5 h-6 px-1 opacity-0" 
                                  : "w-5.5 h-6 bg-amber-50 border border-amber-300 text-amber-900"
                              }`}
                            >
                              {letter}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold italic">Check how "COMPUTING DEVICE" is spelled above!</p>
                  </div>

                  {/* Write Yourself Area */}
                  <div className="space-y-3 text-left">
                    <span className="text-[10px] uppercase font-black tracking-wide text-indigo-850">Now write it yourself:</span>
                    
                    <div className={`bg-white p-3.5 border rounded-xl min-h-[4rem] flex flex-col justify-between transition-colors duration-150 ${
                      writtenWord.length > 0 && !"computing device".startsWith(writtenWord.toLowerCase())
                        ? 'border-rose-400 bg-rose-50/20' 
                        : 'border-indigo-200'
                    } space-y-2`}>
                      
                      {/* Interactive wiggling/shaking input on error */}
                      <motion.div
                        animate={writtenWord.length > 0 && !"computing device".startsWith(writtenWord.toLowerCase()) ? {
                          x: [-4, 4, -4, 4, 0],
                        } : {}}
                        transition={{ duration: 0.3 }}
                        className="w-full relative"
                      >
                        <input
                          type="text"
                          placeholder="Write word here: computing..."
                          value={writtenWord}
                          onChange={(e) => {
                            const val = e.target.value;
                            const currentTarget = "computing device";
                            const isNewPrefixValid = currentTarget.startsWith(val.toLowerCase());
                            
                            // Play pop or boop sounds
                            if (val.length > 0 && !isNewPrefixValid) {
                              // If they just entered an error key
                              if (!writtenWord || currentTarget.startsWith(writtenWord.toLowerCase())) {
                                playBoop();
                                speakText("Oh oh! That letter is incorrect. Check the letters above or tape on Erase to try again!");
                              }
                            }
                            
                            setWrittenWord(val);
                            if (val.toLowerCase().trim() === currentTarget) {
                              playChime();
                              speakText("Incredible job! You wrote and spelled computing device perfectly!");
                            }
                          }}
                          className={`w-full text-center border-b-2 outline-none font-mono text-xs md:text-sm bg-transparent border-dashed py-1.5 transition-colors ${
                            writtenWord.length > 0 && !"computing device".startsWith(writtenWord.toLowerCase())
                              ? 'border-rose-500 text-rose-700 font-extrabold'
                              : 'border-indigo-550 focus:border-indigo-700'
                          }`}
                        />
                      </motion.div>

                      {/* Display helper feedback based on current input */}
                      {(() => {
                        const targetSpelling = "computing device";
                        const processedInput = writtenWord.toLowerCase();
                        const isMatched = targetSpelling.startsWith(processedInput);
                        const isFullyCorrect = processedInput.trim() === targetSpelling;

                        if (writtenWord.length === 0) {
                          return (
                            <span className="text-[10px] text-slate-400 text-center font-bold">
                              Write "computing device" precisely in the box.
                            </span>
                          );
                        }

                        if (isFullyCorrect) {
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black text-emerald-600 self-center animate-bounce flex items-center gap-1">
                                ✨ Splendid copying! Word spelled perfectly!
                              </span>
                            </div>
                          );
                        }

                        if (isMatched) {
                          return (
                            <span className="text-[10px] text-indigo-650 text-center font-extrabold flex items-center justify-center gap-1">
                              <span>✍️ Great job! Next letter is:</span>
                              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-indigo-100 text-indigo-800 rounded border border-indigo-200 uppercase">
                                {targetSpelling[processedInput.length] === ' ' ? 'Space ␣' : targetSpelling[processedInput.length]}
                              </kbd>
                            </span>
                          );
                        }

                        // We have an incorrect spelling/typo! Let's display friendly diagnostics
                        let lastCorrectIndex = 0;
                        while (
                          lastCorrectIndex < processedInput.length && 
                          targetSpelling.startsWith(processedInput.substring(0, lastCorrectIndex + 1))
                        ) {
                          lastCorrectIndex++;
                        }
                        
                        const correctPrefix = writtenWord.substring(0, lastCorrectIndex);
                        const wrongChar = writtenWord.substring(lastCorrectIndex, lastCorrectIndex + 1);
                        const expectedChar = targetSpelling[lastCorrectIndex];

                        return (
                          <div className="flex flex-col items-center gap-2 p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-700 font-bold transition-all text-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-rose-600 uppercase tracking-wide font-black">
                                ⚠️ Typo found! Let's fix it!
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  let spellLetter = expectedChar;
                                  if (expectedChar === ' ') spellLetter = "a space";
                                  const text = `You typed ${correctPrefix || 'at the beginning'}, then wrote ${wrongChar}. But the next letter should be ${spellLetter}. Let's erase and correct it!`;
                                  speakText(text);
                                }}
                                className="p-0.5 px-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[9px] uppercase font-bold rounded-md flex items-center gap-1 transition shrink-0 select-none cursor-pointer"
                                title="Hear spelling help voice"
                              >
                                <Volume2 className="w-2.5 h-2.5" />
                                <span>Voice Clue</span>
                              </button>
                            </div>
                            <div className="leading-relaxed">
                              You typed <span className="font-mono bg-white px-1 py-0.5 rounded border text-rose-850 font-extrabold">{correctPrefix || '[Start]'}</span> but then wrote <span className="font-mono bg-rose-100 px-1 py-0.5 rounded border border-rose-300 text-rose-900 font-extrabold">"{wrongChar}"</span> instead of <kbd className="font-mono bg-emerald-100 border border-emerald-300 text-emerald-900 px-1.5 py-0.5 rounded uppercase font-black">{expectedChar === ' ' ? 'Space ␣' : expectedChar}</kbd>!
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playPop();
                                setWrittenWord('');
                                speakText("Let's start fresh! You can do it!");
                              }}
                              className="text-[9px] bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 mt-0.5"
                            >
                              🔄 Erase & Start Over
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              </div>

              {/* Global Activity completion evaluation */}
              {selectedDevice === 'laptop' && coloredItem === 'computer' && (
                <div className="bg-[#e1fbe1] border-2 border-emerald-400 p-5 rounded-3xl text-center space-y-3">
                  <h4 className="font-extrabold text-xs md:text-sm text-emerald-900">
                    🎉 Splendidly Done, Clever Student!
                  </h4>
                  <p className="text-xs text-slate-700 font-bold max-w-md mx-auto leading-relaxed">
                    You have selected the correct device, completed the ticks, colored the screens, and traced vocabulary. Ready to wrap up?
                  </p>
                  <div className="flex justify-center pt-1 animate-pulse">
                    <button
                      type="button"
                      onClick={handleFinishWorkbook}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs transition duration-150 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                      <span>UNLOCK GRADE 1 WEEK 2 BADGE NOW!</span>
                    </button>
                  </div>
                </div>
              )}

            </motion.div>


            {/* ========================================================== */}
            {/* SECTION 4 - WRAP UP & REFLECTION */}
            {/* ========================================================== */}
            <motion.div
              key="sec-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 bg-white p-6 md:p-8 rounded-xl border-l-4 border-l-teal-500 border border-teal-100/80 shadow-xs w-full"
            >
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs select-none inline-flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span>4. Wrap-Up & Reflection</span>
              </div>

              {/* Perfect final achievement banner */}
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                {/* Decorative sparks */}
                <span className="absolute top-2 right-4 text-3xl animate-pulse">🚀⭐</span>

                <div className="space-y-3 flex-1 text-center md:text-left z-10">
                  <h3 className="text-xl md:text-2xl font-black">Well done, Code Explorer!</h3>
                  <p className="text-xs md:text-sm text-indigo-200 font-bold max-w-xl mx-auto md:mx-0 leading-relaxed">
                    You are now a computing device expert! We discovered screens, processors, inputs, outputs, and safety guidelines together. See you in Lesson 2!
                  </p>

                  <div className="flex justify-center md:justify-start pt-1">
                    {submittedAll ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-500/25 text-emerald-300 border border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase">
                        <span>🏆 Lesson 1 Workbook Certified</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : !hwSubmitted ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setShowHomeworkWarning(true);
                            speakText("Stop, technology champion! You must complete and submit your Tech Challenge on Page 2 first before we can certify this lesson and proceed!");
                          }}
                          className="px-5 py-2.5 bg-slate-250 text-slate-500 hover:bg-slate-300 border border-slate-300 font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Finalise and Sign Workbook (Locked)</span>
                        </button>
                        <p className="text-[10px] font-black text-rose-500 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          Complete Page 2's Tech Challenge first! 🔒
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishWorkbook}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 animate-pulse cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Finalise and Sign Workbook</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Celebration Mascot Girl (Cream/White Sticker Badge keeping it Bright, Static, and High-Resolution) */}
                <div className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center select-none z-10 p-2">
                  <MascotGirl grade="1" pose="clapping" className="w-[90%] h-[90%]" />
                </div>
              </div>

              {/* Reflection faces */}
              <div className="bg-[#e1f5f5] p-6 border border-teal-200 rounded-3xl space-y-5 text-center">
                <h4 className="font-sans font-black text-[#004d4d] text-base md:text-lg">
                  How did I do today? Colour in your face! 🎨😀
                </h4>
                <p className="text-xs text-[#065f46] font-bold">
                  Tap on how well you understood today's lessons with computing devices:
                </p>

                {showHomeworkWarning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl border-2 border-dashed border-rose-250 bg-rose-50 text-rose-950 text-xs font-bold space-y-1.5 max-w-sm mx-auto relative text-center"
                  >
                    <button 
                      type="button"
                      onClick={() => setShowHomeworkWarning(false)}
                      className="absolute top-1.5 right-2 text-rose-400 hover:text-rose-700 font-extrabold text-xs cursor-pointer select-none"
                    >
                      ✕
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-rose-600 font-black">
                      <span>⚠️ Action Required</span>
                    </div>
                    <p className="leading-relaxed">
                      Please go to <strong className="font-black text-pink-600">Page 2: Tech Challenge</strong> at the top, complete all 4 worksheets, and submit for grading to unlock lesson progress!
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                  
                  {/* Option 1: Excellent */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      setReflectionFace('happy');
                      if (hwSubmitted) {
                        speakText("Yippee! You understood perfectly! Today you are an absolute technology hero.");
                        onComplete(hwScore ?? 3, 3);
                      } else {
                        setShowHomeworkWarning(true);
                        speakText("Stop, technology champion! You must complete and submit your Tech Challenge on Page 2 first before we can proceed to the next lesson!");
                      }
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 shadow-3xs transition-all relative cursor-pointer active:scale-95 ${
                      reflectionFace === 'happy' ? 'bg-[#caf1df] border-emerald-400 text-[#0f5132] ring-2 ring-emerald-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-5xl select-none animate-bounce">😀</span>
                    <span className="font-black text-xs leading-none">I understand!</span>
                  </button>

                  {/* Option 2: Need Practice */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      setReflectionFace('practice');
                      speakText("No worries at all! Repetition makes us super programers. Play the device sandbox game again!");
                      if (!hwSubmitted) {
                        setShowHomeworkWarning(true);
                      }
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 shadow-3xs transition-all relative cursor-pointer active:scale-95 ${
                      reflectionFace === 'practice' ? 'bg-[#fff3cd] border-warning text-[#664d03] ring-2 ring-warning/35' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-5xl select-none">😐</span>
                    <span className="font-black text-xs leading-none">I need practice</span>
                  </button>

                  {/* Option 3: Help */}
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      setReflectionFace('help');
                      speakText("That is totally okay! Learning is a progress staircase. Ask your parent or teacher helper to work with your arrows alongside Sipho rabbit!");
                      if (!hwSubmitted) {
                        setShowHomeworkWarning(true);
                      }
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 shadow-3xs transition-all relative cursor-pointer active:scale-95 ${
                      reflectionFace === 'help' ? 'bg-[#f8d7da] border-rose-300 text-[#842029] ring-2 ring-rose-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-5xl select-none">🙁</span>
                    <span className="font-black text-xs leading-none">I need help</span>
                  </button>
                </div>
              </div>

            </motion.div>

          </div>
        ) : (
        /* TECH CHALLENGE LIVE PANEL (One-chance test reflecting class activities) */
        <div className="space-y-6 pb-8" id="tech-challenge-live-panel">
          
          {/* HEADER BANNER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 z-10 text-center md:text-left">
              <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/30 tracking-wider inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" /> Live Tech Challenge
              </span>
              <h3 className="text-xl md:text-2xl font-black font-sans">Grade 1 Week 2 Tech Challenge</h3>
              <p className="text-xs text-rose-50 font-bold max-w-lg leading-relaxed">
                Show us what you learned about computing devices! Complete these 4 activities similar to our classroom worksheets. Remember, you keep working and tap <span className="underline decoration-wavy font-black">SUBMIT MY WORK</span> once to see your final score!
              </p>
            </div>
            <button
              type="button"
              onClick={() => speakText("This is your Page 2 Tech Challenge! Solve all four worksheets: circle the smartphone, tick watch cartoons and play games, paint the tablet, and type clever computer. You only get one chance to submit and see your score!")}
              className="px-4 py-2.5 bg-white text-rose-600 font-extrabold rounded-xl text-xs shadow-md shadow-rose-950/20 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Challenge Guide</span>
            </button>
          </motion.div>

          {/* WARNING MESSAGE BOX */}
          {!hwSubmitted && (
            <div className="bg-yellow-50 border border-yellow-250 rounded-2xl p-4 flex items-center gap-3 text-slate-800 text-xs font-bold shadow-3xs">
              <span className="text-xl animate-bounce">⚠️</span>
              <p>
                <strong>Important Student Rule:</strong> Set your answers on all 4 activities below. Once you click <strong>"SUBMIT MY WORK & SEE SCORE"</strong>, your score is graded instantly! Good luck computing champion! 😊
              </p>
            </div>
          )}

          {/* QUESTIONS & INTERACTIVE WORKSHEETS LIST */}
          <div className="space-y-6">
            
            {/* ------------------------------------------- */}
            {/* ACTIVITY 1: Circle the computing device */}
            {/* ------------------------------------------- */}
            <div 
              className={`bg-white border p-5 md:p-6 rounded-2xl shadow-3xs space-y-3 relative overflow-hidden transition-all duration-150 ${
                hwSubmitted
                  ? 'border-slate-150'
                  : hwSelectedDevice
                    ? 'border-pink-300 bg-pink-50/5'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-white bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  <h4 className="font-black text-slate-900 text-xs md:text-sm">Circle the computing device.</h4>
                </div>
                <button
                  type="button"
                  onClick={() => speakText("Challenge Activity 1: Circle the computing device. Is it a banana, a book, a smartphone, or a plastic bucket?")}
                  className="p-1 px-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] uppercase font-black rounded-lg flex items-center gap-1 transition select-none cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak</span>
                </button>
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">Tap your secret choice to select it!</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                {/* Option A: Banana */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwSelectedDevice('banana');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                    hwSelectedDevice === 'banana' 
                      ? 'ring-4 ring-pink-500 border-pink-500 bg-pink-55/10' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-5xl select-none filter drop-shadow-3xs">🍌</span>
                  <span className="font-black text-xs text-slate-700">Banana</span>
                </button>

                {/* Option B: Book */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwSelectedDevice('book');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                    hwSelectedDevice === 'book' 
                      ? 'ring-4 ring-pink-500 border-pink-500 bg-pink-55/10' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-5xl select-none filter drop-shadow-3xs">📕</span>
                  <span className="font-black text-xs text-slate-700">Book</span>
                </button>

                {/* Option C: Smartphone (Correct!) */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwSelectedDevice('smartphone');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                    hwSelectedDevice === 'smartphone' 
                      ? 'ring-4 ring-pink-500 border-pink-500 bg-pink-55/10' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  } ${hwSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="text-5xl select-none filter drop-shadow-3xs">📱</span>
                  <span className="font-black text-xs text-slate-700">Smartphone</span>
                </button>

                {/* Option D: Bucket */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwSelectedDevice('bucket');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                    hwSelectedDevice === 'bucket' 
                      ? 'ring-4 ring-pink-500 border-pink-500 bg-pink-55/10' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-5xl select-none filter drop-shadow-3xs">🪣</span>
                  <span className="font-black text-xs text-slate-700">Bucket</span>
                </button>
              </div>

              {/* Submission visual correction overlay */}
              {hwSubmitted && (
                <div className="mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    {hwSelectedDevice === 'smartphone' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        You circled Smartphone! (100% CORRECT)
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-5 h-5 text-rose-500" />
                        You circled {hwSelectedDevice || 'nothing'} (Incorrect)
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] uppercase font-black">
                    Answer: Smartphone 📱
                  </span>
                </div>
              )}
            </div>

            {/* ------------------------------------------- */}
            {/* ACTIVITY 2: Tick what a device can help you do */}
            {/* ------------------------------------------- */}
            <div 
              className={`bg-white border p-5 md:p-6 rounded-2xl shadow-3xs space-y-3 relative overflow-hidden transition-all duration-150 ${
                hwSubmitted
                  ? 'border-slate-150'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-white bg-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  <h4 className="font-black text-slate-900 text-xs md:text-sm">Tick what a computing device can help you do.</h4>
                </div>
                <button
                  type="button"
                  onClick={() => speakText("Challenge Activity 2: Tick what a device can help you do: Watch cartoons? Drink water? Play virtual games? Eat yummy pizza?")}
                  className="p-1 px-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] uppercase font-black rounded-lg flex items-center gap-1 transition select-none cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak</span>
                </button>
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">Tick only the smart things computers do!</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                {/* Watch Cartoons (Correct) */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwTicks(prev => ({ ...prev, cartoons: !prev.cartoons }));
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none ${
                    hwTicks.cartoons ? 'bg-pink-50/50 border-pink-400 text-pink-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-4xl">📺</span>
                  <span>Watch cartoons</span>
                  <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                    hwTicks.cartoons ? 'bg-pink-600 border-pink-700 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {hwTicks.cartoons && <Check className="w-4 h-4 stroke-[4]" />}
                  </div>
                </button>

                {/* Drink Water (Incorrect) */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwTicks(prev => ({ ...prev, water: !prev.water }));
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none ${
                    hwTicks.water ? 'bg-pink-50/50 border-pink-400 text-pink-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-4xl">🥤</span>
                  <span>Drink water</span>
                  <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                    hwTicks.water ? 'bg-pink-600 border-pink-700 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {hwTicks.water && <Check className="w-4 h-4 stroke-[4]" />}
                  </div>
                </button>

                {/* Play Games (Correct) */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwTicks(prev => ({ ...prev, games: !prev.games }));
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none ${
                    hwTicks.games ? 'bg-pink-50/50 border-pink-400 text-pink-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-4xl">🎮</span>
                  <span>Play games</span>
                  <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                    hwTicks.games ? 'bg-pink-600 border-pink-700 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {hwTicks.games && <Check className="w-4 h-4 stroke-[4]" />}
                  </div>
                </button>

                {/* Eat Pizza (Incorrect) */}
                <button
                  type="button"
                  disabled={hwSubmitted}
                  onClick={() => {
                    playPop();
                    setHwTicks(prev => ({ ...prev, sandwiches: !prev.sandwiches }));
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-colors text-xs font-black select-none ${
                    hwTicks.sandwiches ? 'bg-pink-50/50 border-pink-400 text-pink-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                  } ${hwSubmitted ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span className="text-4xl">🍕</span>
                  <span>Eat pizza</span>
                  <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center mt-1 transition ${
                    hwTicks.sandwiches ? 'bg-pink-600 border-pink-700 text-white' : 'bg-white border-slate-300'
                  }`}>
                    {hwTicks.sandwiches && <Check className="w-4 h-4 stroke-[4]" />}
                  </div>
                </button>
              </div>

              {/* Submission visual correction overlay */}
              {hwSubmitted && (
                <div className="mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    {(hwTicks.cartoons && hwTicks.games && !hwTicks.water && !hwTicks.sandwiches) ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Ticks are 100% Correct!
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-5 h-5 text-rose-500" />
                        Incorrect configuration.
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] uppercase font-black">
                    Correct: Watch cartoons & Play games only
                  </span>
                </div>
              )}
            </div>

            {/* ------------------------------------------- */}
            {/* ACTIVITY 3: Look at the spelling, then write it yourself */}
            {/* ------------------------------------------- */}
            <div 
              className={`bg-white border p-5 md:p-6 rounded-2xl shadow-3xs space-y-3 relative overflow-hidden transition-all duration-150 ${
                hwSubmitted
                  ? 'border-slate-150'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-black text-white bg-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  <h4 className="font-black text-slate-900 text-xs md:text-sm">Look at the spelling, then write it yourself.</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => speakText("Challenge Activity 4: Look at the spelling of the phrase clever computer, then write it precisely in the handwriting box below. We will grade your spelling accuracy!")}
                  className="p-1 px-2.5 bg-orange-100 hover:bg-orange-200 text-orange-900 text-[10px] uppercase font-black rounded-lg flex items-center gap-1 transition shrink-0 select-none cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Speak</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/40 rounded-2xl border">
                {/* Visual Reference Area */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] uppercase font-black tracking-wide text-amber-800">Learn to spell:</span>
                  
                  {/* Dashed bg layout letter-by-letter */}
                  <div className="bg-white p-4 border rounded-xl flex flex-col items-center justify-center min-h-[4rem] border-orange-200 gap-2">
                    <div className="flex flex-col items-center gap-2.5 w-full animate-pulse">
                      <div className="flex flex-wrap gap-1 justify-center max-w-full">
                        {"CLEVER COMPUTER".split("").map((letter, idx) => (
                          <span 
                            key={idx} 
                            className={`rounded-md shadow-2xs flex items-center justify-center font-black text-[10px] select-none ${
                              letter === " " 
                                ? "w-3.5 h-6 px-1 opacity-0" 
                                : "w-5.5 h-6 bg-pink-50 border border-pink-200 text-pink-900"
                            }`}
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold italic">Reference: "CLEVER COMPUTER"</p>
                </div>

                {/* Write Yourself Area */}
                <div className="space-y-3 text-left">
                  <span className="text-[10px] uppercase font-black tracking-wide text-indigo-850">Now write it yourself:</span>
                  
                  <div className="bg-white p-3.5 border border-indigo-200 rounded-xl min-h-[4rem] flex flex-col justify-center space-y-2">
                    <input
                      type="text"
                      disabled={hwSubmitted}
                      placeholder="Type clever computer here..."
                      value={hwWrittenWord}
                      onChange={(e) => {
                        setHwWrittenWord(e.target.value);
                      }}
                      className="w-full text-center border-b-2 outline-none font-mono text-xs md:text-sm bg-transparent border-dashed py-1.5 focus:border-indigo-600 uppercase text-slate-800 font-black tracking-wider placeholder:text-slate-350"
                    />
                  </div>
                </div>
              </div>

              {/* Submission visual correction overlay */}
              {hwSubmitted && (
                <div className="mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    {hwWrittenWord.trim().toLowerCase() === 'clever computer' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Perfect Spelling! (100% CORRECT)
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-5 h-5 text-rose-500" />
                        Spelled: "{hwWrittenWord || '[Nothing]'}" (Incorrect)
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] uppercase font-black">
                    Correct: CLEVER COMPUTER
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* MASTER SUBMIT SCREEN / SCORECARD */}
          {!hwSubmitted ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                Completed all 3 Tech Challenge tasks?
              </h3>
              
              {(!hwSelectedDevice || hwWrittenWord.trim().length === 0) ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 font-bold italic">
                    Fill in your answers and color selection on all sheets to unlock grades!
                  </p>
                  <button
                    type="button"
                    disabled={true}
                    className="px-6 py-3 bg-slate-300 text-slate-500 font-black rounded-2xl text-xs flex items-center gap-1.5 mx-auto cursor-not-allowed opacity-65 font-sans"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Solve All Activities to Hand in Tech Challenge</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-pulse">
                  <p className="text-xs text-rose-500 font-extrabold">
                    🚀 ALL WORKSHEETS COMPLETE! Click the button below to grade your Tech Challenge! This will lock in your final score.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playChime();
                      
                      // Compute score
                      let score = 0;
                      
                      // Activity 1
                      if (hwSelectedDevice === 'smartphone') score++;
                      
                      // Activity 2
                      if (hwTicks.cartoons && hwTicks.games && !hwTicks.water && !hwTicks.sandwiches) score++;
                      
                      // Activity 3 (formerly 4)
                      if (hwWrittenWord.trim().toLowerCase() === 'clever computer') score++;
                      
                      setHwScore(score);
                      setHwSubmitted(true);
                      localStorage.setItem(`g1w2_hw_${activeStudentId || 'default'}_submitted`, 'true');
                      localStorage.setItem(`g1w2_hw_${activeStudentId || 'default'}_score`, String(score));
                      localStorage.setItem(`g1w2_hw_${activeStudentId || 'default'}_selected_device`, hwSelectedDevice || '');
                      localStorage.setItem(`g1w2_hw_${activeStudentId || 'default'}_ticks`, JSON.stringify(hwTicks));
                      localStorage.setItem(`g1w2_hw_${activeStudentId || 'default'}_written_word`, hwWrittenWord);
                      
                      // Speeches
                      if (score === 3) {
                        speakText("Wow! Perfect score of three out of three! You locked in your Tech Challenge with absolute perfection! Gold crown for you!");
                      } else {
                        speakText(`Tech Challenge submitted! You scored ${score} out of 3 correctly. Learning builds step-by-step!`);
                      }
                    }}
                    className="px-8 py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl text-xs shadow-md shadow-pink-600/20 flex items-center gap-1.5 mx-auto transition-transform hover:scale-105 active:scale-[0.98] cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>SUBMIT MY WORK & SEE SCORE! 🚀</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl text-center space-y-4 border-2 shadow-lg relative overflow-hidden ${
                (hwScore ?? 0) >= 3 
                  ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/20 border-emerald-400" 
                  : "bg-gradient-to-br from-amber-500/10 to-orange-500/20 border-amber-300"
              }`}
            >
              <div className="absolute top-2 right-2 text-4xl opacity-15">🏆</div>
              <h4 className="font-extrabold text-lg md:text-xl text-indigo-950 flex items-center justify-center gap-2">
                {((hwScore ?? 0) >= 3) ? "🌟 TECH CHALLENGE GRADING SUCCESS! 🌟" : "👍 WORK COMPLETED! 👍"}
              </h4>
              
              {/* Star Rating based on Score */}
              <div className="flex justify-center gap-1.5 py-1">
                {[1, 2, 3].map((starIdx) => {
                  const isActive = starIdx <= (hwScore ?? 0);
                  return (
                    <span 
                      key={starIdx} 
                      className={`text-3xl transition-all duration-300 transform ${isActive ? 'scale-125 animate-bounce' : 'grayscale opacity-30 select-none'}`}
                    >
                      ⭐
                    </span>
                  );
                })}
              </div>

              <p className="text-xs md:text-sm text-slate-700 font-extrabold max-w-md mx-auto leading-relaxed">
                {(hwScore === 3) && "🏆 PERFECT 3 out of 3 SCORE! Outstanding! You are officially an absolute Grandmaster Computing Device Hero! Gold crown for you! 👑"}
                {(hwScore === 2) && "🌟 AMAZING 2 out of 3 SCORE! Superb Job! You got almost perfect marks and know computing devices inside and out! 🚀"}
                {(hwScore === 1 || hwScore === 0) && "💪 Keep practicing! You got a starting step correct! Learning builds step-by-step! 😊"}
              </p>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto space-y-1">
                <div className="flex justify-between font-black text-[10px] text-slate-500 uppercase px-1">
                  <span>Score Meter:</span>
                  <span>{hwScore} / 3 Correct</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300 shadow-2xs">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      (hwScore ?? 0) >= 2 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${((hwScore ?? 0)/3) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setCurrentPage(1);
                    speakText("Let's go back and read the discovery handbook lessons again!");
                  }}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs hover:bg-indigo-700 active:scale-95 transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Go back to Discovery Guide Study</span>
                </button>
                {onNextLesson && (
                  isTeacherPreparation ? (
                    (() => {
                      const currentStatus = lessonStatuses['1-T1-W2'] || 'locked';
                      const isPending = currentStatus === 'pending_approval';
                      const isApproved = currentStatus === 'unlocked_for_students';
                      
                      return (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={async () => {
                            playChime();
                            onComplete(hwScore ?? 3, 3);
                            if (schoolId) {
                              await updateLessonStatus(schoolId, '1', '1-T1-W2', 'pending_approval', teacherId);
                              if (setLessonStatuses) {
                                setLessonStatuses(prev => ({ ...prev, ['1-T1-W2']: 'pending_approval' }));
                              }
                            }
                          }}
                          className={`px-5 py-2.5 font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer inline-flex items-center gap-1.5 ${
                            isPending
                              ? 'bg-amber-500 text-white cursor-not-allowed opacity-95'
                              : isApproved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>
                            {isPending 
                              ? 'Awaiting Admin Unlock ⏳' 
                              : isApproved 
                              ? 'Complete & Approved ✔' 
                              : 'Complete and Notify Admin 🚀'}
                          </span>
                        </button>
                      );
                    })()
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playChime();
                        onComplete(hwScore ?? 3, 3);
                        onNextLesson();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition shadow-md cursor-pointer inline-flex items-center gap-1.5 animate-bounce"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Continue to Next Lesson 🚀</span>
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* Friendly digital progress indicator footer */}
      <div className="py-6 text-center text-xs font-extrabold text-slate-400 tracking-wider border-t border-slate-200">
        ⚡ Sipho's Coding Hub • Continuous Learner Workbook • Grade 1 Term 1
      </div>

    </div>
  );
}
