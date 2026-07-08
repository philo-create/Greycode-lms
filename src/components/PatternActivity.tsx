"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { GradeType } from '../types';
import SpeakableText from './SpeakableText';
import ColoringCanvas from './ColoringCanvas';

interface PatternLevel {
  id: string;
  grade: GradeType;
  title: string;
  instructions: string;
  sequenceList: React.ReactNode[];
  options: string[];
  correctAnswer: string;
  feedbackSuccess: string;
}

const getOptionOrnament = (opt: string) => {
  if (opt === 'Red Color') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-rose-500 border border-rose-600 shrink-0 shadow-xs" />
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Yellow Color') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-amber-400 border border-amber-500 shrink-0 shadow-xs" />
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Blue Color') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-blue-500 border border-blue-600 shrink-0 shadow-xs" />
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Red Triangle') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-rose-50 border border-rose-200 text-rose-500 rounded-lg shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-rose-500 stroke-rose-500">
            <polygon points="12,3 21,20 3,20" />
          </svg>
        </span>
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Blue Circle') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-500 rounded-full shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-blue-500 stroke-blue-500">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </span>
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Red Circle') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-rose-50 border border-rose-200 text-rose-500 rounded-full shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-rose-500 stroke-rose-500">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </span>
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Yellow Circle') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-500 rounded-full shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-500 stroke-amber-500">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </span>
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt === 'Yellow Star') {
    return (
      <span className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-500 rounded-lg shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-500 stroke-amber-500">
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        </span>
        <span className="text-slate-800 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt.includes('then')) {
    const parts = opt.split('then').map(p => p.trim());
    return (
      <span className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5">
          {parts.map((p, idx) => (
            <span key={idx} className="w-7 h-7 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-black rounded-lg">
              {p}
            </span>
          ))}
        </span>
        <span className="text-slate-700 font-bold">{opt}</span>
      </span>
    );
  }
  if (opt.includes('Blue') || opt.includes('Yellow') || opt.includes('Pink')) {
    const prefix = opt.substring(0, 3); // "A: " or "B: " etc.
    const colorNames = opt.substring(3).split('-');
    const colorMap: Record<string, string> = {
      'Blue': 'bg-sky-500 ring-sky-300',
      'Yellow': 'bg-yellow-400 ring-yellow-200',
      'Pink': 'bg-pink-400 ring-pink-200'
    };
    return (
      <span className="flex items-center gap-2.5">
        <span className="text-slate-800 font-black">{prefix}</span>
        <span className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl">
          {colorNames.map((color, idx) => (
            <span key={idx} className={`w-4 h-4 rounded-full ring-2 ${colorMap[color] || 'bg-slate-400 ring-slate-200'} shadow-sm`} />
          ))}
        </span>
      </span>
    );
  }
  if (opt.startsWith('A:') || opt.startsWith('B:') || opt.startsWith('C:')) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-indigo-600 font-black text-sm">{opt.substring(0, 3)}</span>
        <span className="text-slate-800 font-bold text-sm tracking-wide">{opt.substring(3)}</span>
      </span>
    );
  }
  return null;
};

export default function PatternActivity({ grade, onComplete, isUnlocked, disableInitialSpeech, speakText: overrideSpeakText }: { grade: GradeType; onComplete: (stars: number, possible?: number) => void; isUnlocked?: boolean; disableInitialSpeech?: boolean; speakText?: (text: string) => void }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completed, setCompleted] = useState(false);
  const initialSpeechDoneRef = React.useRef(false);

  // Level 2 special coloring states
  const [w1SelectedCrayon, setW1SelectedCrayon] = useState<string | null>(null);
  const [w1ActiveColor, setW1ActiveColor] = useState<string | null>(null);
  const [w1HasPainted, setW1HasPainted] = useState(false);
  const [w1Feedback, setW1Feedback] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const speakText = (text: string) => {
    if (overrideSpeakText) {
      overrideSpeakText(text);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en')) || null;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log(e);
    }
  };

  const playPop = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.log(e);
    }
  };

  // Grade-Specific Levels for Pattern Recognition
  const levels: PatternLevel[] = [
    {
      id: 'R-pattern-1',
      grade: 'R',
      title: 'Simple Color Repeats (C.6)',
      instructions: 'Which color circle comes next in Sipho’s repeating sequence?',
      sequenceList: [
        <div key="1" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold select-none text-base">●</div>,
        <div key="2" className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold select-none text-base">●</div>,
        <div key="3" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold select-none text-base">●</div>,
        <div key="4" className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold select-none text-base">●</div>,
        <div key="5" className="w-12 h-12 border-2 border-dashed border-slate-400 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 font-bold text-base select-none">?</div>,
      ],
      options: ['Blue Circle', 'Red Circle', 'Yellow Circle'],
      correctAnswer: 'Blue Circle',
      feedbackSuccess: 'Wonderful! You spotted the repeating Blue-Red (ABAB) color pattern!'
    },
    {
      id: 'R-pattern-2',
      grade: 'R',
      title: 'Solid Shape Coloring (C.10)',
      instructions: "Superb job completing Level 1! For Level 2, let's complete our alternating pattern sequence: Red, Yellow, Red, Yellow! Pick the correct crayon color from our tray and use your mouse or finger to manually color our shape with a solid color!",
      sequenceList: [],
      options: [],
      correctAnswer: 'Red Crayon',
      feedbackSuccess: 'Spectacular! You selected the Red crayon, continuing our Red and Yellow repeating pattern, and manual-colored the shape solid!'
    },
    {
      id: '1-pattern-1',
      grade: '1',
      title: 'Term 1 Skipping Number Patterns (C.6)',
      instructions: 'Complete the pattern of steps by filling in the missing sequential numbers!',
      sequenceList: [
        <div key="1" className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg">5</div>,
        <div key="2" className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg">6</div>,
        <div key="3" className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg">7</div>,
        <div key="4" className="w-12 h-12 border-2 border-dashed border-emerald-400 bg-slate-50 flex items-center justify-center text-emerald-600 font-black text-lg">_</div>,
        <div key="5" className="w-12 h-12 border-2 border-dashed border-emerald-400 bg-slate-50 flex items-center justify-center text-emerald-600 font-black text-lg">_</div>,
        <div key="6" className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg">10</div>,
      ],
      options: ['8 then 9', '9 then 8', '7 then 8'],
      correctAnswer: '8 then 9',
      feedbackSuccess: 'Meritorious! The pattern rule is adding +1 sequentially (5, 6, 7, 8, 9, 10).'
    },
    {
      id: '2-pattern-1',
      grade: '2',
      title: 'Bracelet Color Matching (C.7)',
      instructions: 'Which color bracelet choice corresponds to the same straight-line data order: Blue-Yellow-Pink-Blue-Yellow-Pink?',
      sequenceList: [
        <div key="1" className="w-10 h-10 bg-sky-500 rounded-full shadow-sm"></div>,
        <div key="2" className="w-10 h-10 bg-yellow-400 rounded-full shadow-sm"></div>,
        <div key="3" className="w-10 h-10 bg-pink-400 rounded-full shadow-sm"></div>,
        <div key="4" className="w-10 h-10 bg-sky-500 rounded-full shadow-sm"></div>,
        <div key="5" className="w-10 h-10 bg-yellow-400 rounded-full shadow-sm"></div>,
        <div key="6" className="w-10 h-10 bg-pink-400 rounded-full shadow-sm"></div>,
      ],
      options: [
        'A: Blue-Pink-Yellow-Blue-Pink-Yellow',
        'B: Blue-Yellow-Pink-Blue-Yellow-Pink',
        'C: Pink-Blue-Yellow-Pink-Blue-Yellow'
      ],
      correctAnswer: 'B: Blue-Yellow-Pink-Blue-Yellow-Pink',
      feedbackSuccess: 'Awesome! You accurately matched the cyclic order of the data pattern!'
    },
    {
      id: '3-pattern-1',
      grade: '3',
      title: 'Pattern Code Translation (C.6)',
      instructions: 'Translate the smiley pattern into a thumbs pattern: ☺ ☹ ☺ ☺ ☹ ☺ (Happy-Sad-Happy-Happy-Sad-Happy)',
      sequenceList: [
        <div key="1" className="text-3xl font-bold text-slate-800">☺</div>,
        <div key="2" className="text-3xl font-bold text-slate-800">☹</div>,
        <div key="3" className="text-3xl font-bold text-slate-800">☺</div>,
        <div key="4" className="text-3xl font-bold text-slate-800">☺</div>,
        <div key="5" className="text-3xl font-bold text-slate-800">☹</div>,
        <div key="6" className="text-3xl font-bold text-slate-800">☺</div>,
      ],
      options: ['A: 👍 👎 👍 👍 👎 👍', 'B: 👎 👍 👎 👍 👍 👎', 'C: 👍 👍 👎 👍 👍 👎'],
      correctAnswer: 'A: 👍 👎 👍 👍 👎 👍',
      feedbackSuccess: 'Outstanding achievement! Translating icons while preserving the structural sequence is vital for compiled codes.'
    }
  ];

  // Filter levels for the currently chosen grade
  const gradeLevels = levels.filter(lvl => lvl.grade === grade);
  const activeLevel = gradeLevels[currentLevel] || gradeLevels[0];

  useEffect(() => {
    if (isUnlocked === false) {
      return;
    }
    if (activeLevel && activeLevel.instructions) {
      // Skip the very first speech if disableInitialSpeech is true
      if (currentLevel === 0 && disableInitialSpeech && !initialSpeechDoneRef.current) {
        initialSpeechDoneRef.current = true;
        return;
      }
      const timer = setTimeout(() => {
        speakText(activeLevel.instructions);
      }, 500);
      initialSpeechDoneRef.current = true;
      return () => clearTimeout(timer);
    }
  }, [currentLevel, activeLevel?.id, isUnlocked, disableInitialSpeech]);

  const handleOptionSelect = (option: string) => {
    if (checked) return;
    setSelectedOption(option);
  };

   const handleCheck = () => {
    if (activeLevel.id === 'R-pattern-2') {
      if (!w1SelectedCrayon) {
        setW1Feedback('Please select a crayon color from our tray first before you start coloring!');
        speakText('Please select a crayon color from our tray first before you start coloring!');
        return;
      }
      if (!w1HasPainted) {
        setW1Feedback('Click and drag on the circle to manually color it solid before you submit!');
        speakText('Click and drag on the circle to manually color it solid before you submit!');
        return;
      }
      setChecked(true);
      if (w1SelectedCrayon === 'Red') {
        setSuccess(true);
        playChime();
        const msg = 'Spectacular! You selected the Red crayon to complete our Red and Yellow repeating pattern, manually colored the circle, and completed Level 2!';
        setW1Feedback(msg);
        speakText(msg);
      } else {
        setSuccess(false);
        playPop();
        const msg = `Oops! That is close, but your ${w1SelectedCrayon} crayon does not continue our alternating pattern. Look closely: Red, Yellow, Red, Yellow... What comes next? Yes, Red! Click Retry, select the Red crayon, and color the circle Red!`;
        setW1Feedback(msg);
        speakText(msg);
      }
      return;
    }

    if (!selectedOption) return;
    setChecked(true);
    if (selectedOption === activeLevel.correctAnswer) {
      setSuccess(true);
      playChime();
      speakText("Wonderful! You spotted the repeating Blue and Red color pattern! Click the Continue button to try Level 2!");
    } else {
      setSuccess(false);
      playPop();
      speakText("Oops! That is not quite right because the circle does not match our repeating pattern. Look closely at Sipho's sequence: Blue, Red, Blue, Red. What comes after Red? Click Retry and give it another shot, you can do it!");
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setChecked(false);
    setSuccess(false);

    if (currentLevel + 1 < gradeLevels.length) {
      setCurrentLevel(prev => prev + 1);
    } else {
      setCompleted(true);
      onComplete(3); // Reward 3 stars
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setChecked(false);
    setSuccess(false);
    if (activeLevel.id === 'R-pattern-2') {
      setW1SelectedCrayon(null);
      setW1ActiveColor(null);
      setW1HasPainted(false);
      setW1Feedback('');
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8" id="pattern-module">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
            Pattern Recognition (Strand C.6)
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">{activeLevel?.title}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
          <Sparkles className="w-4 h-4 fill-amber-500" />
          <span>Level {currentLevel + 1} / {gradeLevels.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={activeLevel.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Playful Instruction Banner */}
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text={activeLevel.instructions} className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            {activeLevel.id === 'R-pattern-2' ? (
              <div className="space-y-4" id="level-2-coloring-container">
                <div className="flex justify-center items-center gap-2.5 p-3 bg-white border border-slate-100 rounded-xl mx-auto shadow-4xs max-w-xs">
                  <div className="w-8 h-8 rounded-full bg-red-500 border border-red-600 shadow-4xs flex items-center justify-center text-white font-extrabold text-xs">🔴</div>
                  <div className="w-8 h-8 rounded-full bg-amber-400 border border-amber-500 shadow-4xs flex items-center justify-center text-white font-extrabold text-xs">🟡</div>
                  <div className="w-8 h-8 rounded-full bg-red-500 border border-red-600 shadow-4xs flex items-center justify-center text-white font-extrabold text-xs">🔴</div>
                  <div className="w-8 h-8 rounded-full bg-amber-400 border border-amber-500 shadow-4xs flex items-center justify-center text-white font-extrabold text-xs">🟡</div>
                  
                  <div className="text-slate-400 font-extrabold text-xs">➡️</div>
                  
                  <div
                    className={`w-8 h-8 rounded-full border-2 shadow-4xs flex items-center justify-center font-extrabold text-[10px] transition-all duration-300 ${
                      w1ActiveColor === 'Red' ? 'bg-red-500 border-red-600 text-white' :
                      w1ActiveColor === 'Orange' ? 'bg-orange-500 border-orange-600 text-white' :
                      w1ActiveColor === 'Yellow' ? 'bg-amber-400 border-amber-500 text-white' :
                      w1ActiveColor === 'Green' ? 'bg-green-500 border-green-600 text-white' :
                      w1ActiveColor === 'Blue' ? 'bg-sky-500 border-sky-600 text-white' :
                      w1ActiveColor === 'Purple' ? 'bg-purple-500 border-purple-600 text-white' :
                      w1ActiveColor === 'Pink' ? 'bg-pink-500 border-pink-600 text-white' :
                      'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {w1ActiveColor ? (
                      w1ActiveColor === 'Red' ? '🔴' : 
                      w1ActiveColor === 'Yellow' ? '🟡' : 
                      w1ActiveColor === 'Orange' ? '🍊' :
                      w1ActiveColor === 'Green' ? '🟢' :
                      w1ActiveColor === 'Blue' ? '🔵' :
                      w1ActiveColor === 'Purple' ? '🟣' : '🌸'
                    ) : '?'}
                  </div>
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <ColoringCanvas
                    key={retryCount}
                    imageSrc={`data:image/svg+xml,${encodeURIComponent("<svg width='240' height='180' xmlns='http://www.w3.org/2000/svg'><circle cx='120' cy='90' r='60' stroke='#cbd5e1' stroke-width='6' fill='none'/><text x='120' y='95' font-family='sans-serif' font-size='16' font-weight='bold' fill='#94a3b8' text-anchor='middle'>Color Me!</text></svg>")}`}
                    altText="Circle pattern shape"
                    hidePalette={true}
                    canvasWidth={240}
                    canvasHeight={180}
                    externalActiveColor={
                      w1SelectedCrayon === 'Red' ? '#ef4444' :
                      w1SelectedCrayon === 'Orange' ? '#f97316' :
                      w1SelectedCrayon === 'Yellow' ? '#fbbf24' :
                      w1SelectedCrayon === 'Green' ? '#22c55e' :
                      w1SelectedCrayon === 'Blue' ? '#0ea5e9' :
                      w1SelectedCrayon === 'Purple' ? '#a855f7' :
                      w1SelectedCrayon === 'Pink' ? '#ec4899' : '#000000'
                    }
                    onColor={() => {
                      if (!w1SelectedCrayon) {
                         setW1Feedback('Click a crayon color button first before you paint the circle solid!');
                         speakText('Click a crayon color button first before you paint the circle solid!');
                         return;
                      }
                      setW1HasPainted(true);
                      setW1ActiveColor(w1SelectedCrayon);
                    }}
                  />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 bg-rose-100/50 border border-rose-200 rounded-full max-w-sm mx-auto">
                    <span className="text-[10px] font-extrabold tracking-wide text-rose-800 uppercase pl-1 select-none">
                      🖍️ Choose Crayon:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { name: 'Red', hex: 'Red', bg: 'bg-red-500' },
                        { name: 'Orange', hex: 'Orange', bg: 'bg-orange-500' },
                        { name: 'Yellow', hex: 'Yellow', bg: 'bg-amber-400' },
                        { name: 'Green', hex: 'Green', bg: 'bg-green-500' },
                        { name: 'Blue', hex: 'Blue', bg: 'bg-sky-500' },
                        { name: 'Purple', hex: 'Purple', bg: 'bg-purple-500' },
                        { name: 'Pink', hex: 'Pink', bg: 'bg-pink-500' }
                      ].map((color) => {
                        const isCrayonSel = w1SelectedCrayon === color.hex;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => {
                              setW1SelectedCrayon(color.hex);
                              setW1Feedback('');
                              playChime();
                            }}
                            className={`w-6 h-6 rounded-full ${color.bg} transition-all duration-155 ${
                              isCrayonSel ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110 shadow-md' : 'opacity-80 hover:opacity-100 cursor-pointer hover:scale-105'
                            }`}
                            title={color.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {!checked && w1Feedback && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold text-center mt-2 max-w-sm mx-auto">
                    📢 {w1Feedback}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Interactive Visual Sequence Track */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-center gap-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-slate-800/40 text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded-bl">
                    unplugged track
                  </div>
                  {activeLevel.sequenceList.map((node, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-1 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center min-w-[3.5rem] min-h-[3.5rem] shadow"
                      >
                        {node}
                      </motion.div>
                      {i < activeLevel.sequenceList.length - 1 && (
                        <span className="text-white/20 text-xl font-black">→</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Answer Options Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {activeLevel.options.map((option) => {
                    const isSelected = selectedOption === option;
                    let cardStyle = "border-slate-200 hover:border-indigo-400 hover:bg-slate-50";
                    if (isSelected) cardStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20";
                    if (checked) {
                      if (option === activeLevel.correctAnswer) {
                        cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20";
                      } else if (isSelected) {
                        cardStyle = "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500/10";
                      } else {
                        cardStyle = "opacity-40 border-slate-100 text-slate-400";
                      }
                    }

                    return (
                      <button
                        key={option}
                        disabled={checked}
                        onClick={() => handleOptionSelect(option)}
                        id={`opt-${option.replace(/[^a-zA-Z0-9]/g, '')}`}
                        className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all duration-150 flex items-center justify-between cursor-pointer ${cardStyle}`}
                      >
                        <span>{getOptionOrnament(option) || option}</span>
                        {checked && option === activeLevel.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Checked Outcomes Feedback Banner */}
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border ${
                  success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4`}
              >
                <div>
                  <h4 className="font-bold text-sm md:text-base flex items-center gap-2">
                    {success ? "🌟 Accurate!" : "❌ Let's try again!"}
                  </h4>
                  <p className="text-xs md:text-sm mt-1">
                    {activeLevel.id === 'R-pattern-2'
                      ? w1Feedback
                      : (success ? activeLevel.feedbackSuccess : "That answer doesn't match the current sequence pattern rule.")}
                  </p>
                </div>
                {!success && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
              </motion.div>
            )}

            {/* Check/Next button navigation bar */}
            <div className="flex items-center justify-end border-t border-slate-100 pt-5 mt-6">
              {!checked ? (
                <button
                  disabled={activeLevel.id === 'R-pattern-2' ? (!w1SelectedCrayon || !w1HasPainted) : !selectedOption}
                  onClick={handleCheck}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                    (activeLevel.id === 'R-pattern-2' ? (w1SelectedCrayon && w1HasPainted) : selectedOption)
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {activeLevel.id === 'R-pattern-2' ? "Done Coloring! 🎨✨" : "Check Pattern Answers"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!success}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow hover:shadow-lg transition cursor-pointer ${
                    success ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 space-y-4"
          >
            <div className="inline-flex p-4 bg-amber-50 rounded-full border border-amber-200 text-amber-500 shadow mb-2">
              <Award className="w-12 h-12 stroke-[2]" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">You are a Pattern Master!</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Inspirational work! You completed all the pattern completion exercises and earned **3 Stars** to unlock further modules.
            </p>
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentLevel(0);
                  setCompleted(false);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow cursor-pointer"
              >
                Replay Exercises
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
