import { localStore } from '../lib/localStore';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Check, 
  Trophy, 
  Sparkles, 
  Smile, 
  HelpCircle,
  FileText,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  BookOpen,
  Laptop,
  Tv,
  Gamepad,
  Activity,
  Award,
  Lock,
  Smartphone,
  Tablet,
  Watch,
  Droplet,
  ShieldCheck,
  Timer,
  UserCheck,
  Globe,
  Shield,
  Play,
  RotateCcw
} from 'lucide-react';
import { GradeType, Lesson } from '../types';
import PatternActivity from './PatternActivity';
import ColoringCanvas, { ColoringCanvasRef } from './ColoringCanvas';
import CodingGridActivity from './CodingGridActivity';
import RoboticsActivity from './RoboticsActivity';
import DigitalConceptsActivity, { ColorfulDesktop, ColorfulLaptop, ColorfulTablet, ColorfulSmartphone, ColorfulMicrowave, ColorfulSmartwatch } from './DigitalConceptsActivity';
import SequenceActivity from './SequenceActivity';
import CreativeDesignWorkshop from './CreativeDesignWorkshop';
import CreativeWorkstationApp from './CreativeWorkstationApp';
import MascotGirl from './MascotGirl';
import SpeakableText from './SpeakableText';
import { getZolaImage } from '../zolaImages';
import { playDrumAudio } from './GradeRVisualBoard';
// @ts-ignore
import regeneratedMascotImg from '../assets/images/regenerated_image_1781464132397.png';
// @ts-ignore
import regeneratedMascotImgW3 from '../assets/images/regenerated_image_1781594542737.png';
// @ts-ignore
import regeneratedMascotImgW2 from '../assets/images/regenerated_image_1781605049765.png';
// @ts-ignore
import regeneratedMascotImgW4 from '../assets/images/regenerated_image_1781782896714.png';
// @ts-ignore
import regeneratedMascotImgW5 from '../assets/images/regenerated_image_1781787379025.png';
// @ts-ignore
import regeneratedMascotImgW8 from '../assets/images/regenerated_image_1781975348509.png';
// @ts-ignore
import regeneratedMascotImgW7 from '../assets/images/regenerated_image_1782886931115.png';
// @ts-ignore
import regeneratedMascotImgW9 from '../assets/images/regenerated_image_1782888733687.png';
// @ts-ignore
import braceletDesignImg1 from '../assets/images/regenerated_image_1782800047094.jpg';
// @ts-ignore
import braceletDesignImg2 from '../assets/images/regenerated_image_1782800048375.jpg';
// @ts-ignore
import braceletDesignImg3 from '../assets/images/regenerated_image_1782800049266.jpg';
// @ts-ignore
import braceletDesignImg4 from '../assets/images/regenerated_image_1782800049988.jpg';


const isLenientMatch = (input: string, targetBigWord: string, targetTracePrompt?: string): boolean => {
  if (!input) return false;
  const cleanInput = input.trim().toUpperCase().replace(/[- ]/g, '');
  const cleanTarget = targetBigWord.toUpperCase().replace(/[- ]/g, '');
  const cleanTrace = targetTracePrompt ? targetTracePrompt.toUpperCase().replace(/[- ]/g, '') : '';

  if (cleanInput === cleanTarget) {
    return true;
  }
  if (cleanTrace && cleanInput === cleanTrace) {
    return true;
  }

  return false;
};

const DrumPadExplorer = ({ speakText, stepProgress = 0, onStepProgress }: { speakText: (txt: string) => void; stepProgress?: number; onStepProgress?: (p: number) => void; }) => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [hasKick, setHasKick] = useState(false);
  const [hasSnare, setHasSnare] = useState(false);

  const handlePlay = (type: 'kick' | 'snare') => {
    playDrumAudio(type);
    speakText(type === 'kick' ? "Boom" : "Clap");
    setActivePad(type);
    
    let newKick = hasKick;
    let newSnare = hasSnare;
    if (type === 'kick') newKick = true;
    if (type === 'snare') newSnare = true;
    
    setHasKick(newKick);
    setHasSnare(newSnare);
    
    // progress is 0 initially, 1 if one is pressed, 2 if both are pressed.
    if (onStepProgress) {
      if (newKick && newSnare) onStepProgress(2);
      else if (newKick || newSnare) onStepProgress(1);
    }
    
    setTimeout(() => setActivePad(null), 200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-900 to-fuchsia-900 rounded-3xl p-6 text-center transform transition relative overflow-hidden shadow-2xl border-4 border-fuchsia-400">
         {/* Decorative notes */}
         <div className="absolute top-2 left-4 text-white/20 text-4xl animate-bounce">🎵</div>
         <div className="absolute bottom-2 right-4 text-white/20 text-4xl animate-pulse">🎶</div>
         <div className="absolute top-6 right-8 text-white/20 text-2xl animate-[spin_3s_linear_infinite]">🎼</div>

        <span className="text-5xl block mb-2 relative z-10 drop-shadow-lg">🥁</span>
        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest relative z-10 drop-shadow-md">DJ Jam Session</h3>
        <p className="text-sm text-indigo-200 font-semibold mt-2 max-w-sm mx-auto relative z-10">
          Welcome to the main stage! Tap the pads below to create your very own beat!
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl flex justify-center gap-8 relative shadow-sm overflow-hidden border border-slate-200 border-t-slate-100">
        {/* Stage lighting effect */}
        <div className="absolute top-0 left-1/4 w-32 h-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-32 h-full bg-amber-400/10 blur-3xl pointer-events-none"></div>

        <button
          type="button"
          onClick={() => handlePlay('kick')}
          className={`relative group w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-b from-rose-400 to-rose-600 focus:outline-none text-white font-black text-lg flex flex-col items-center justify-center gap-2 shadow-[0_12px_0_rgb(159,18,57),0_15px_20px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_rgb(159,18,57),0_0px_0px_rgba(0,0,0,0)] active:translate-y-3 transition-all cursor-pointer ${
             activePad === 'kick' ? 'brightness-125 ring-4 ring-rose-300 ring-offset-4 ring-offset-slate-900' : ''
          }`}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-4xl drop-shadow-md transition-transform group-active:scale-90">🔴</span>
          <span className="tracking-widest relative z-10">DRUM</span>
          {activePad === 'kick' && <span className="absolute -top-8 text-rose-400 animate-ping font-extrabold text-sm tracking-widest">BOOM!</span>}
        </button>

        <button
          type="button"
          onClick={() => handlePlay('snare')}
          className={`relative group w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-b from-amber-300 to-amber-500 focus:outline-none text-amber-950 font-black text-lg flex flex-col items-center justify-center gap-2 shadow-[0_12px_0_rgb(180,83,9),0_15px_20px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_rgb(180,83,9),0_0px_0px_rgba(0,0,0,0)] active:translate-y-3 transition-all cursor-pointer ${
             activePad === 'snare' ? 'brightness-125 ring-4 ring-amber-200 ring-offset-4 ring-offset-slate-900' : ''
          }`}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-4xl drop-shadow-md transition-transform group-active:scale-90">👏</span>
          <span className="tracking-widest relative z-10">CLAP</span>
          {activePad === 'snare' && <span className="absolute -top-8 text-amber-400 animate-ping font-extrabold text-sm tracking-widest">CLAP!</span>}
        </button>
      </div>
    </div>
  );
};

function DrumSandboxStage({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  
  const targetPattern = ["🔴", "🟡", "🔴", "🟡"];

  useEffect(() => {
    // Standard template now handles the initial speech
  }, [level]);

  const handlePlayPattern = () => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= 4) {
        clearInterval(interval);
        return;
      }
      if (targetPattern[step] === "🔴") playDrumAudio('kick');
      else if (targetPattern[step] === "🟡") playDrumAudio('snare');
      step++;
    }, 600);
  };

  const addBeat = (beat: "🔴" | "🟡") => {
    if (success) return;
    
    if (beat === "🔴") playDrumAudio('kick');
    else if (beat === "🟡") playDrumAudio('snare');
    
    const newSeq = [...sequence, beat];
    setSequence(newSeq);
    
    if (newSeq.length === 4) {
      const isMatch = newSeq.every((v, i) => v === targetPattern[i]);
      if (isMatch) {
         setSuccess(true);
         speakText("Fantastic! You matched the pattern perfectly. You are a rhythm star!");
         if (onComplete) onComplete(3);
      } else {
         speakText("Oops, that rhythm doesn't quite match. Listen to the pattern again!");
         setTimeout(() => {
            setSequence([]);
         }, 1500);
      }
    }
  };

  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 min-h-[350px]">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-1 px-3 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xs">
          Level 1
        </span>
        <h4 className="text-sm sm:text-base font-black uppercase tracking-wide text-indigo-900">Match the Rhythm</h4>
      </div>

      <p className="text-slate-600 text-sm md:text-base font-medium bg-white/60 p-4 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-1 mb-6">
        💡 <span className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
        <SpeakableText text="Listen to the sound pattern by tapping Hear Pattern, then match it: Drum, Clap, Drum, Clap!" className="p-0 hover:bg-transparent text-slate-600 border-0" />
      </p>

      <div className="flex flex-col items-center gap-6 mt-4">
        <button
          type="button"
          onClick={handlePlayPattern}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm uppercase flex items-center gap-2 cursor-pointer transition shadow-md active:scale-95"
        >
          <Play className="w-4 h-4" /> 1. Hear the Target Pattern
        </button>

        <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-center">
          <h5 className="font-extrabold text-indigo-800 text-sm uppercase mb-3">2. Play it back:</h5>
          <div className="flex justify-center gap-3 h-16">
            {[0, 1, 2, 3].map((idx) => {
              const val = sequence[idx];
              return (
                <div key={`sbox-w8-slot-${idx}`} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-150 ${
                  val ? 'bg-fuchsia-50 border-fuchsia-400 shadow-inner scale-110' : 'bg-slate-50 border-slate-200 border-dashed'
                }`}>
                  {val === "🟡" ? "👏" : (val || "")}
                </div>
              );
            })}
          </div>
        </div>

        {!success ? (
           <div className="flex justify-center gap-6 mt-2 relative w-full overflow-hidden p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
             {/* Stage lighting effect */}
             <div className="absolute top-0 left-1/4 w-32 h-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
             <div className="absolute top-0 right-1/4 w-32 h-full bg-amber-400/10 blur-3xl pointer-events-none"></div>

            <button
              type="button"
              onClick={() => addBeat("🔴")}
              className="relative group w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-b from-rose-400 to-rose-600 focus:outline-none text-white font-black text-xs md:text-sm flex flex-col items-center justify-center gap-2 shadow-[0_12px_0_rgb(159,18,57),0_15px_20px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_rgb(159,18,57),0_0px_0px_rgba(0,0,0,0)] active:translate-y-3 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl drop-shadow-md transition-transform group-active:scale-90">🔴</span>
              <span className="tracking-widest relative z-10">DRUM</span>
            </button>
            <button
              type="button"
              onClick={() => addBeat("🟡")}
              className="relative group w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-b from-amber-300 to-amber-500 focus:outline-none text-amber-950 font-black text-xs md:text-sm flex flex-col items-center justify-center gap-2 shadow-[0_12px_0_rgb(180,83,9),0_15px_20px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_rgb(180,83,9),0_0px_0px_rgba(0,0,0,0)] active:translate-y-3 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl drop-shadow-md transition-transform group-active:scale-90">👏</span>
              <span className="tracking-widest relative z-10">CLAP</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500 text-white rounded-2xl p-4 font-black flex items-center gap-2 animate-bounce mt-4 shadow-lg">
            <span className="text-2xl">✨</span>
            <p>Rhythm Matched Perfectly! You earned a star!</p>
          </div>
        )}

        {sequence.length > 0 && !success && (
          <button
            type="button"
            onClick={() => setSequence([])}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider underline cursor-pointer mt-2"
          >
            Clear and start over
          </button>
        )}
      </div>
    </div>
  );
}

interface GradeR1WorkbookProps {
  lesson: Lesson;
  activeStudentId?: string;
  onComplete: (stars: number, possible?: number) => void;
  onNextLesson?: () => void;
  isSuperAdmin?: boolean;
  superAdminBypass?: boolean;
}

interface Question {
  q: string;
  opts: string[];
  correct: number;
  hint: string;
  beadColors?: string[];
}

interface LessonWorkbookData {
  mascotSpeech: string;
  bigWord: string;
  tracePrompt: string;
  questions: Question[];
}

// Config object mapping lesson IDs to their custom guide & quiz data
const LESSON_WORKBOOK_DATA: Record<string, LessonWorkbookData> = {
  'R-T1-W2': {
    mascotSpeech: "Hey there, pattern explorer! Let's find repeating colors like Red, Blue, Red, Blue. Can you follow my sequence rule?",
    bigWord: "PATTERN",
    tracePrompt: "P-A-T-T-E-R-N",
    questions: [
      { q: "Which of these is a simple repeating colour pattern?", opts: ["🔴🔵🔴🔵", "🔴🔴🔴🔵🔵", "🔴🟡🔵🟢"], correct: 0, hint: "Look for neat alternation: Red, Blue, Red, Blue." }
    ]
  },
  'R-T1-W3': {
    mascotSpeech: "Hello! There are amazing electronic devices all around the world! Let's learn about them and how they help us every day.",
    bigWord: "DEVICE",
    tracePrompt: "D-E-V-I-C-E",
    questions: [
      { q: "Which tool do people around the world use to talk to someone far away?", opts: ["A smartphone 📱", "A television 📺", "A radio 📻"], correct: 0, hint: "A smartphone can make calls across the globe." },
      { q: "Which of these is an electronic device you might find at home?", opts: ["An apple 🍎", "A smart TV 📺", "A tree 🌲"], correct: 1, hint: "Electronic devices at home plug into the wall or use batteries!" },
      { q: "What does a desktop computer or laptop help us do?", opts: ["Play cool school games and learn! 💻", "Chop some vegetables 🥦", "Wash our hands 🧼"], correct: 0, hint: "Computers help us learn, play games, and work!" }
    ]
  },
  'R-T1-W4': {
    mascotSpeech: "Computers and robots need steps in the correct order! Let's arrange picture stories: what happens first, next, and last?",
    bigWord: "STORY",
    tracePrompt: "S-T-O-R-Y",
    questions: [
      { q: "What makes a good picture story?", opts: ["Events in the right order 🔢", "A messy room 🪐", "A type of robot 🤖"], correct: 0, hint: "A story means arranging events in the correct order!" },
      { q: "Every story has a...", opts: ["Beginning, Middle, and End 🟢🟡🔴", "Top and Bottom ⬆️⬇️", "Left and Right ⬅️➡️"], correct: 0, hint: "Think about Start, Next, and Finish!" },
      { q: "If you want to grow a plant, what is the BEGINNING step?", opts: ["Pick tomatoes 🍅", "Water the plants 🚿", "Plant seeds 🌱"], correct: 2, hint: "First, you must put the seeds in the ground." }
    ]
  },
  'R-T1-W5': {
    mascotSpeech: "Hop hop! Let's use ARROW CARDS to guide Sipho Super Bunny to the tasty carrots. One arrow moves me forward until I hit a wall!",
    bigWord: "ARROW CODE",
    tracePrompt: "A-R-R-O-W",
    questions: [
      { q: "An arrow pointing UP ⬆️ tells our character to move in which direction?", opts: ["Go Upwards ⬆️", "Go Left ⬅️", "Stop moving 🛑"], correct: 0, hint: "UP arrow is vertical motion heading north." },
      { q: "If we guide the bunny, what is our tasty target?", opts: ["A bone 🦴", "A carrot 🥕", "A water cup 🥤"], correct: 1, hint: "Sipho the bunny loves sweet orange carrots." },
      { q: "How far does Sipho move when given one arrow card?", opts: ["Until hitting a wall 🧱", "Moves 10 blocks 🏃", "Loops forever 🔄"], correct: 0, hint: "One arrow will move Sipho continuously until he bumps into a wall." }
    ]
  },
  'R-T1-W6': {
    mascotSpeech: "System online! I am a robot helper. Humans build me and tell me exactly what to do using code cards.",
    bigWord: "ROBOT",
    tracePrompt: "R-O-B-O-T",
    questions: [
      { q: "Do humans build robots to help us with work?", opts: ["YES 👍", "NO 👎"], correct: 0, hint: "Yes! Clever humans engineer and build robot helpers." },
      { q: "Does a robot think and dream just like a real person?", opts: ["YES 👍", "NO 👎"], correct: 1, hint: "No! Robots do not have real brains; they only follow computer instructions." },
      { q: "Do helper robots clean the floors for us automatically?", opts: ["YES 👍", "NO 👎"], correct: 0, hint: "Yes! Robot vacuum cleaners can sweep up and clean the floor by themselves." }
    ]
  },
  'R-T1-W7': {
    mascotSpeech: "Remember the arrow cards we used to guide the bunny? They are a type of code card! We use these symbols to give instructions. Let's use a set of instructions to guide Baby Bot to its milk bottle!",
    bigWord: "INSTRUCTIONS",
    tracePrompt: "C-O-D-E",
    questions: [
      { q: "What do we call a group of code cards?", opts: ["A set of instructions 📝", "A magic spell 🪄", "A storybook 📖"], correct: 0, hint: "A set of instructions tells the computer what to do." },
      { q: "When following a direction arrow code card, the robot will...", opts: ["Move until it hits an object or wall 🧱", "Move exactly one step 🐾", "Spin in circles 🌀"], correct: 0, hint: "It keeps moving until it is blocked." },
      { q: "If Baby Bot misses the bottle, what do we do?", opts: ["Debug and test another set of instructions 🛠️", "Give up completely 😭", "Break the maze 💥"], correct: 0, hint: "We test a different set of instructions." }
    ]
  },
  'R-T1-W8': {
    mascotSpeech: "Today, you are going to design your own bracelet using a repeating color pattern with round beads. Your bracelet design will be graded to earn up to 10 stars!",
    bigWord: "BRACELET",
    tracePrompt: "B-E-A-D-S",
    questions: [
      { q: "Does this beautiful bracelet follow a perfect alternating pattern: Red, Yellow, Red, Yellow?", opts: ["YES 👍", "NO 👎"], correct: 0, hint: "Look at the colors! They alternate perfectly: Red, Yellow, Red, Yellow...", beadColors: ["🔴", "🟡", "🔴", "🟡", "🔴", "🟡"] },
      { q: "Does this bracelet follow a perfect alternating pattern: Blue, Green, Blue, Green?", opts: ["YES 👍", "NO 👎"], correct: 1, hint: "Look carefully! The fourth bead is Yellow instead of Green, so the pattern is broken!", beadColors: ["🔵", "🟢", "🔵", "🟡", "🔵", "🟢"] },
      { q: "Does this bracelet follow a perfect alternating pattern: Red, Blue, Red, Blue?", opts: ["YES 👍", "NO 👎"], correct: 0, hint: "Look at the sequence! It alternates Red, Blue, Red, Blue correctly from start to finish.", beadColors: ["🔴", "🔵", "🔴", "🔵", "🔴", "🔵"] }
    ]
  },
  'R-T1-W9': {
    mascotSpeech: "Rhythms are patterns we can hear and feel! Drum, Clap, Drum, Clap. Let's make happy rhythm patterns!",
    bigWord: "RHYTHM",
    tracePrompt: "R-H-Y-T-H-M",
    questions: [
      { q: "If the pattern is: DRUM 🥁, CLAP 👏, DRUM 🥁, CLAP 👏... what comes next?", opts: ["DRUM 🥁", "CLAP 👏", "JUMP 🦘"], correct: 0, hint: "After a CLAP, we start the pattern over with a DRUM!" },
      { q: "Which of these is a repeating sound pattern?", opts: ["DRUM, DRUM, DRUM, DRUM 🥁", "DRUM, CLAP, DRUM, CLAP 🎶", "DRUM, sneeze, giggle, yawn 🥱"], correct: 1, hint: "DRUM, CLAP repeating is a perfect sound pattern!" },
      { q: "Can we make repeating patterns using drum pads and claps?", opts: ["YES! 🥁 Drumming & Clapping", "NO 🤐 Only by jumping"], correct: 0, hint: "We can use drums and claps to make fun sound patterns!" }
    ]
  },
  'R-T1-W1': {
    mascotSpeech: "It is very important to keep our devices safe! Let's learn about washing hands, keeping food away, and being gentle.",
    bigWord: "SAFETY",
    tracePrompt: "S-A-F-E",
    questions: [
      { q: "What should we do before using a tablet or computer?", opts: ["Wash and dry our hands 🧼", "Eat sticky candy 🍬", "Play in the mud 🌱"], correct: 0, hint: "Clean and dry hands keep devices working perfectly!" },
      { q: "Can we have a glass of water right next to our device?", opts: ["Yes, the device might get thirsty!", "No, water can spill and break it! 🚫🥤", "Only if it is juice."], correct: 1, hint: "Keep liquids far away to protect the electronics." },
      { q: "How should we treat our school devices?", opts: ["Throw them when we are done", "Hold them gently and be careful 🧸", "Leave them outside in the sun"], correct: 1, hint: "Always be gentle with delicate devices!" }
    ]
  },
  'R-T1-W10': {
    mascotSpeech: "Awesome job, little champion! We finished all Term 1 challenges. Let's do a fun recap!",
    bigWord: "VICTORY",
    tracePrompt: "C-H-A-M-P",
    questions: [
      { q: "What comes next in the pattern: Red, Blue, Red, Blue, ___?", opts: ["Red! 🔴", "Yellow! 🟡", "Green! 🟢"], correct: 0, hint: "Look at the first color in the repeating sequence." },
      { q: "Which of these is a computing device?", opts: ["A laptop computer 💻", "An apple 🍎", "A wooden block 🪵"], correct: 0, hint: "Which one uses electricity and follows instructions?" },
      { q: "What is the correct order for a picture story?", opts: ["Beginning, Middle, End 🌱🪴🌻", "End, Middle, Beginning 🌻🌱🪴", "Just the End 🌻🔚"], correct: 0, hint: "Every good story starts at the beginning!" },
      { q: "What do we use to tell a robot which way to move on a grid?", opts: ["Arrow code cards ⬆️➡️⬇️", "Magic wands 🪄✨", "Paintbrushes 🖌️🎨"], correct: 0, hint: "We use symbols that point in a direction." },
      { q: "What is a robot?", opts: ["A machine built by humans to follow instructions 🤖", "A friendly pet dog 🐶", "A wild animal 🦁"], correct: 0, hint: "It is built with parts like wires and batteries." },
      { q: "If we clap our hands and tap a drum over and over, what are we making?", opts: ["A rhythm pattern 🥁👏", "A messy room 🌪️", "A quiet whisper 🤫"], correct: 0, hint: "Repeating sounds create this!" },
      { q: "How should we treat our school devices?", opts: ["Hold them gently with clean, dry hands 🧸", "Eat sticky candy while using them 🍬", "Wash them in a bucket of water 🪣"], correct: 0, hint: "We must be careful to keep them safe and working." }
    ]
  },
  'R-T2-W5': {
    mascotSpeech: "Let's explore robots in different places! Some help vacuum houses, some build cars in factories.",
    bigWord: "FACTORY",
    tracePrompt: "F-A-C-T-O-R-Y",
    questions: [
      { q: "Which robot helps clean carpets at home?", opts: ["An industrial arm 🦾", "A robot vacuum cleaner 🧹", "A drone copter 🛸"], correct: 1, hint: "Vacuums assist with standard floor dust and safe cleaning." },
      { q: "Industrial robots are often used for...", opts: ["Assembling cars in factories safely 🚗", "Eating sandwiches 🥪", "Playing guitar 🎸"], correct: 0, hint: "They assist assembly conveyers safely with massive weights." },
      { q: "Are robots machines or living creatures?", opts: ["Machines built by humans ⚙️", "Alien animals from Mars 👽", "Magical insects 🐞"], correct: 0, hint: "They are built out of batteries, chips, and hardware wires." }
    ]
  },
  'R-T3-W5': {
    mascotSpeech: "Robots use arms, legs, and wheels to move. They use camera sensors as eyes to detect walls!",
    bigWord: "SENSOR",
    tracePrompt: "S-E-N-S-O-R",
    questions: [
      { q: "What does a robot's light sensor do?", opts: ["Perceives brightness and color inputs 👁️", "Heats up food 🍕", "Sings slow lullabies 🎶"], correct: 0, hint: "Light sensors read photon levels to guide robot turns." },
      { q: "What makes a robot move its physical wheels?", opts: ["Motors and gears ⚙️", "Magical spells 🪄", "Wind power 🌬️"], correct: 0, hint: "Motors convert battery energy into rotation vector force." },
      { q: "Why does a robot need sensors?", opts: ["To perceive and adapt to its surroundings 🧱", "To talk to cats 🐱", "To look shiny ✨"], correct: 0, hint: "A blind robot will crash repeatedly. Sensors are its eyes!" }
    ]
  },
  'R-T4-W2': {
    mascotSpeech: "Online safety is important! Balance device time with playing outside, and never share secrets.",
    bigWord: "ONLINE SAFETY",
    tracePrompt: "S-A-F-E-T-Y",
    questions: [
      { q: "Is it safe to tell your home address to an online stranger?", opts: ["Never! Keep details private 🛑", "Yes, share it immediately 💬", "Only if they ask nicely 🍦"], correct: 0, hint: "Keep home profiles private to stay safe." },
      { q: "What is a healthy screen activity?", opts: ["Take breaks and play outside every hour 🌳", "Stare at the tablet for 8 hours 📺", "Throw the tablet 🪃"], correct: 0, hint: "Outdoor play keeps you high-spirited and fit." },
      { q: "Who should you ask before downloading a new game?", opts: ["A trusted adult or parent 🧑‍💼", "No one, just click 🔘", "Your teddy bear 🧸"], correct: 0, hint: "Always verify safety downloads with parents." }
    ]
  },
  'R-T4-W5': {
    mascotSpeech: "Let's model a robot using recycled containers, straws, and pins! What cool helper role will your robot have?",
    bigWord: "PROTOTYPE",
    tracePrompt: "D-E-S-I-G-N",
    questions: [
      { q: "What can we use at home to design a puppet helper robot?", opts: ["Cardboard boxes and straws 📦", "Real diamonds 💎", "Fresh ice cream 🍦"], correct: 0, hint: "Recyclable boxes make superb prototype parts." },
      { q: "A helper robot design should...", opts: ["Solve a specific helpful task for humans 🧹", "Be invisible 👻", "Break easily 💥"], correct: 0, hint: "Machines are designed to make difficult layout chores easier." },
      { q: "The first sketch or model of a machine is called a...", opts: ["Prototype or design draft 🎨", "Clean floor 🧹", "Sandwich 🥪"], correct: 0, hint: "A prototype models the mechanism before final factories production." }
    ]
  },

  // --- GRADE 1 ---
  '1-T1-W1': {
    mascotSpeech: "Hello, pattern star! Pattern sequences can have three colors now. Yellow, Pink, Yellow, Pink...",
    bigWord: "PATTERN",
    tracePrompt: "P-A-T-T-E-R-N",
    questions: [
      { q: "In an A-B-C-A-B-C pattern, what comes after C?", opts: ["A", "B", "C"], correct: 0, hint: "The sequence repeats back to the initial segment." },
      { q: "What is a repeating pattern?", opts: ["A set of elements repeating in order 🔁", "A random mess 🌀", "A broken toy 🧸"], correct: 0, hint: "It tracks structured repetition." },
      { q: "Look at: 🍒, 🍌, 🍒, 🍌, __. What goes next?", opts: ["🍒 Cherry", "🍌 Banana", "🍩 Donut"], correct: 0, hint: "The sequence alternates: Cherry, then Banana." }
    ]
  },
  '1-T1-W2': {
    mascotSpeech: "Computing devices assist us every day! Let's name and track computer parts.",
    bigWord: "COMPUTING DEVICE",
    tracePrompt: "D-E-V-I-C-E",
    questions: [
      { q: "Which of these is a computing device?", opts: ["Laptop computer 💻", "Wooden pencil ✏️", "Drinking cup 🥤"], correct: 0, hint: "Laptops process digital data sequences." },
      { q: "What computes results inside a device?", opts: ["Brain CPU or microchips ⚙️", "The fan exhaust 🌬️", "The keyboard plastic ⌨️"], correct: 0, hint: "The CPU chips are the computing core." },
      { q: "We can help screens stay clean by touching them with...", opts: ["Gently and with clean hands 🧼", "Sticky fingers 🍭", "Cardboard sticks 🥢"], correct: 0, hint: "Keep screens free of grease." }
    ]
  },
  '1-T1-W5': {
    mascotSpeech: "We are building longer command pathways! Let's dodge the high brick walls sequentially.",
    bigWord: "PATHWAY",
    tracePrompt: "P-A-T-H-W-A-Y",
    questions: [
      { q: "What is a series of coding commands executed one after another?", opts: ["A Sequence 📋", "A Bug 🐞", "A Screen 📺"], correct: 0, hint: "Sequential means one-by-one." },
      { q: "If our sequence hits a brick wall, we have a...", opts: ["Coding Error or Bug! 🐞", "Yummy snack 🍪", "Perfect run 🏆"], correct: 0, hint: "Collisions signal path logic errors." },
      { q: "How do we fix an incorrect arrow block?", opts: ["Replace it with the correct direction 🛠️", "Discard the device 🗑️", "Color the screen red 🎨"], correct: 0, hint: "Replace the bad card during debugging." }
    ]
  },
  '1-T2-W5': {
    mascotSpeech: "Let's learn loops! Placing a number count below our arrow card saves coding space.",
    bigWord: "LOOP REPEAT",
    tracePrompt: "R-E-P-E-A-T",
    questions: [
      { q: "Why do we use loops in computer science?", opts: ["To repeat instructions without rewriting them 🔄", "To make screen savers 📺", "To erase programs 🗑️"], correct: 0, hint: "Loops prevent redundant code blocks." },
      { q: "An arrow block pointing Up ⬆️ with a '3' below means...", opts: ["Move Up 3 times! ⬆️⬆️⬆️", "Move up 1 time then stop 🛑", "Power off 🔌"], correct: 0, hint: "The number represents repeat iterations." },
      { q: "Loops make our code programs...", opts: ["More efficient and shorter! ⚡", "Longer and slower 🐌", "Broken 💥"], correct: 0, hint: "They condense linear streams into quick loops." }
    ]
  },
  '1-T2-W9': {
    mascotSpeech: "Robot vacuums use moving bumpers, charging ports, and wheels to help clean houses safely.",
    bigWord: "DOMESTIC",
    tracePrompt: "M-A-C-H-I-N-E",
    questions: [
      { q: "What part of a robot vacuum detects a wall collision?", opts: ["Bumper guard touch sensor 🛡️", "The charger socket 🔋", "The dust brush 🧹"], correct: 0, hint: "Bumper springs press down on mechanical sensors." },
      { q: "A domestic robot helper works inside...", opts: ["A family household 🏠", "A car assembly conveyor 🏭", "Under the sea 🌊"], correct: 0, hint: "Domestic refers to household environments." },
      { q: "Where does a robot vaccum go when its battery is low?", opts: ["Its docking charger base 🔌", "The kitchen drawer 🚪", "To buy groceries 🛒"], correct: 0, hint: "Under battery depletion, bots steer to charger stations." }
    ]
  },
  '1-T3-W2': {
    mascotSpeech: "Hardware is physical! Software is digital! Screen, mouse, keyboard are things you can touch.",
    bigWord: "HARDWARE",
    tracePrompt: "S-O-F-T-W-A-R-E",
    questions: [
      { q: "Which of these is a digital Software App?", opts: ["A drawing or maths learning App 🎨", "A plastic computer keyboard ⌨️", "A heavy glass monitor 📺"], correct: 0, hint: "Software exists as stored binary instructions inside." },
      { q: "Hardware refers to parts of a computer that you can...", opts: ["Touch and hold physically 🖐️", "Download from app stores 🔌", "Smell and eat 🍕"], correct: 0, hint: "Physical wires, steel cases, plastic keys." },
      { q: "Without any software application, your hardware...", opts: ["Does not know what commands to run 🤷", "Gets super powers ⚡", "Turns yellow 🟡"], correct: 0, hint: "Hardware requires software compilers to direct circuits." }
    ]
  },
  '1-T3-W5': {
    mascotSpeech: "Debugging is fixing bugs! Let's carefully inspect the command arrow steps one-by-one.",
    bigWord: "DEBUGGING",
    tracePrompt: "D-E-B-U-G",
    questions: [
      { q: "What is a 'bug' in a computer script?", opts: ["An error that causes wrong coordinates or failures 🐞", "A real beetle inside the fan 🪲", "A fast shortcut key ⚡"], correct: 0, hint: "Logic blunders that cause unexpected crash loops." },
      { q: "When finding a coding error, what should a coder do?", opts: ["Trace commands in sequence and replace the error 🛠️", "Restart from Grade R 🎒", "Give up 🤷"], correct: 0, hint: "Iterate step-by-step until the failure is fixed." },
      { q: "In computer science, a path termination failure means...", opts: ["Our character got stuck 🛑", "We successfully scored 🏆", "The speaker volume muted 🔇"], correct: 0, hint: "The code ended before hitting the target goal." }
    ]
  },
  '1-T4-W2': {
    mascotSpeech: "Emojis can trigger letters! Let's translate animal symbols into sweet written phrases.",
    bigWord: "CIPHER",
    tracePrompt: "C-I-P-H-E-R",
    questions: [
      { q: "Mapping each character to an emoji symbol is called...", opts: ["Encoding or Encrypting 🔒", "Shuffling cards 🎴", "Volume control 🔊"], correct: 0, hint: "Translating plaintext into secret key tokens." },
      { q: "If 🐢=T, 🍊=O, 🦊=D, then '🐢 🍊 🦊 🍊' spells what word?", opts: ["TODO 📝", "TOY 🧸", "DOG 🐶"], correct: 0, hint: "Combine T-O-D-O." },
      { q: "Coded messages help keep secret and private information...", opts: ["Secure and protected from hackers 🛡️", "Visible on billboards 📺", "Lost in trash 🗑️"], correct: 0, hint: "Only those with the decipher pad can translate it safely." }
    ]
  },
  '1-T4-W5': {
    mascotSpeech: "Cords and leverage pull arms up! Let's construct pull string joints to map finger movements.",
    bigWord: "MECHANICAL",
    tracePrompt: "J-O-I-N-T",
    questions: [
      { q: "When we pull a string connected to a lever, the finger...", opts: ["Bends or opens! 🖐️", "Melts 🌋", "Starts singing 🎶"], correct: 0, hint: "The lever redirects the tension force of the line." },
      { q: "Pivoting joint coordinates help a physical robot wrist...", opts: ["Rotate and grip items 🦾", "Read screens 📺", "Power off 🔌"], correct: 0, hint: "Gears mesh at pivot joints for rotational utility." },
      { q: "What mimic system acts like muscle tissue in strings?", opts: ["Lever pull lines 🧵", "Paper plates 🍽️", "A charging plug 🔌"], correct: 0, hint: "Lines transmit force exactly like tendons." }
    ]
  }
};

const DEFAULT_WORKBOOK_DATA: LessonWorkbookData = {
  mascotSpeech: "Hello! Let's explore this amazing CAPS educational challenge together. Answer carefully!",
  bigWord: "EXPLORER",
  tracePrompt: "C-O-D-E-R",
  questions: [
    { q: "Is coding fun and super useful for our future?", opts: ["Absolutely yes! 🚀", "No, it is boring 🥱", "I don't know 🤷"], correct: 0, hint: "Coding empowers you to design algorithms!" },
    { q: "We should always balance device screentime with what?", opts: ["Playing outdoor healthy games 🌳", "Sleeping all day long 💤", "Eating sweet cupcakes 🧁"], correct: 0, hint: "Getting physical exercises keeps your system high-energy." },
    { q: "How we solve errors is named what?", opts: ["Debugging! 🛠️", "Shouting! 🗣️", "Running away! 🏃"], correct: 0, hint: "Fixing bugs is called debugging." }
  ]
};

interface InteractiveTourItem {
  id: number;
  title: string;
  text: string;
  renderItem: (isCompleted?: boolean, isActive?: boolean) => React.ReactNode;
}

function InteractiveSequenceViewer({
  steps,
  speakText,
  titleText,
  subtitleText,
  onStepProgress
}: {
  steps: InteractiveTourItem[];
  speakText: (t: string) => void;
  titleText?: string;
  subtitleText?: string;
  onStepProgress?: (p: number) => void;
}) {
  const [progress, setProgress] = useState(0);

  const playChime = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.log(e);
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

  const handleTourClick = (stepId: number) => {
    if (stepId <= progress) {
      playChime();
      speakText(steps[stepId].text);
      if (stepId === progress && progress < steps.length) {
         const newProg = progress + 1;
         setProgress(newProg);
         if (onStepProgress) onStepProgress(newProg);
      }
    } else {
      playBoop();
      speakText("Oops! Please click the glowing item first to learn step by step.");
    }
  };

  const getContainerClass = (stepId: number) => {
    const base = "p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer relative";
    if (stepId === progress) {
      return `${base} bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 border-2 border-indigo-400 z-10`;
    } else if (stepId < progress) {
      return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-emerald-400`;
    } else {
      return `${base} bg-slate-50 opacity-50 grayscale hover:scale-100 border-2 border-slate-200 cursor-not-allowed`;
    }
  };

  return (
    <div className="flex-1 w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 text-center md:text-left">
        <div>
          {titleText && <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest leading-none mb-1">{titleText}</p>}
          {subtitleText && <p className="text-sm font-black text-slate-800 tracking-tight">{subtitleText}</p>}
        </div>
        {/* Real-time animated progress badge */}
        <div className="shrink-0 text-right">
          <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full shadow-2xs">
            🌟 Progress: {progress} / {steps.length} Clicked
          </span>
        </div>
      </div>

      {/* Animated Gradient Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${(progress / steps.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        />
      </div>

      <div className={`grid grid-cols-1 ${steps.length === 1 ? 'sm:grid-cols-1 lg:grid-cols-1' : steps.length >= 4 ? 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 pt-1`}>
        {steps.map((step) => {
          const isCompleted = step.id < progress;
          const isActive = step.id === progress;
          const isLocked = step.id > progress;

          return (
            <motion.div
              key={step.id}
              onClick={() => handleTourClick(step.id)}
              className={getContainerClass(step.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isActive ? [1, 1.02, 1] : 1,
              }}
              whileHover={!isLocked ? { 
                scale: isActive ? 1.03 : 1.04, 
                y: -3, 
                boxShadow: isActive 
                  ? "0 10px 25px -5px rgba(251, 191, 36, 0.45), 0 0 15px rgba(251, 191, 36, 0.3)"
                  : "0 10px 20px -5px rgba(0, 0, 0, 0.08)" 
              } : undefined}
              whileTap={!isLocked ? { scale: 0.98 } : undefined}
              transition={{ 
                y: { type: "spring", stiffness: 350, damping: 20 },
                scale: isActive 
                  ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  : { type: "spring", stiffness: 350, damping: 20 }
              }}
            >
              {/* Animated checkmark overlay that scales when completed */}
              {isCompleted && (
                <motion.div 
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-md border-2 border-white z-25"
                >
                  ✓
                </motion.div>
              )}

              {/* Glowing active outline loop effect */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl ring-4 ring-amber-400/50 animate-ping pointer-events-none opacity-30" />
              )}

              {step.renderItem(isCompleted, isActive)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RobotColorActivity({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: () => void }) {
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // Default Blue
  const [colors, setColors] = useState<Record<string, string>>({
    head: '#e2e8f0',
    body: '#cbd5e1',
    leftArm: '#94a3b8',
    rightArm: '#94a3b8',
    leftLeg: '#64748b',
    rightLeg: '#64748b',
    antenna: '#ef4444',
    eyeBg: '#1e293b',
    screen: '#10b981'
  });
  const [coloredParts, setColoredParts] = useState<string[]>([]);

  const palette = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Slate', hex: '#64748b' },
  ];

  const handleFill = (part: string) => {
    setColors(prev => ({ ...prev, [part]: selectedColor }));
    if (!coloredParts.includes(part)) {
      setColoredParts(prev => [...prev, part]);
    }
    playPop();
  };

  const playPop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (err) {}
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/70 to-cyan-50/70 border-2 border-blue-100 p-4 sm:p-5 rounded-3xl mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div className="w-full">
          <h4 className="text-base sm:text-lg font-black text-blue-950 flex items-center gap-1.5 mb-3">
            🎨 Coloring Lab: Paint the Robot! 🤖
          </h4>
          <p className="text-slate-600 text-sm md:text-base font-medium bg-white/60 p-4 rounded-xl border border-blue-100 flex flex-wrap items-center gap-1 w-full relative">
            💡 <span className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
            <SpeakableText text="Select a crayon color from our palette, and click any part of the robot to paint. When you are finished, click Done Coloring!" className="p-0 hover:bg-transparent text-slate-600 border-0" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Robot SVG Interactive Area */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-blue-200/60 shadow-inner p-4 min-h-[300px]">
          <svg viewBox="0 0 400 400" className="w-full max-w-[280px] h-auto drop-shadow-sm cursor-pointer hover:drop-shadow-md transition-all">
            {/* Antenna Line */}
            <line x1="200" y1="50" x2="200" y2="90" stroke="#334155" strokeWidth="6" />
            {/* Antenna Ball */}
            <circle cx="200" cy="40" r="15" fill={colors.antenna} stroke="#1e293b" strokeWidth="4" onClick={() => handleFill('antenna')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '50% 10%'}} />
            
            {/* Left Arm */}
            <rect x="80" y="160" width="40" height="90" rx="20" fill={colors.leftArm} stroke="#1e293b" strokeWidth="4" onClick={() => handleFill('leftArm')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '25% 51%'}} />
            {/* Right Arm */}
            <rect x="280" y="160" width="40" height="90" rx="20" fill={colors.rightArm} stroke="#1e293b" strokeWidth="4" onClick={() => handleFill('rightArm')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '75% 51%'}} />
            
            {/* Left Leg */}
            <rect x="140" y="280" width="40" height="80" rx="10" fill={colors.leftLeg} stroke="#1e293b" strokeWidth="4" onClick={() => handleFill('leftLeg')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '40% 80%'}} />
            {/* Right Leg */}
            <rect x="220" y="280" width="40" height="80" rx="10" fill={colors.rightLeg} stroke="#1e293b" strokeWidth="4" onClick={() => handleFill('rightLeg')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '60% 80%'}} />

            {/* Body */}
            <rect x="120" y="150" width="160" height="140" rx="25" fill={colors.body} stroke="#1e293b" strokeWidth="6" onClick={() => handleFill('body')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '50% 55%'}} />
            {/* Screen on Body */}
            <rect x="140" y="170" width="120" height="60" rx="10" fill={colors.screen} stroke="#1e293b" strokeWidth="3" onClick={() => handleFill('screen')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '50% 50%'}} />
            <path d="M 150 200 Q 170 180 190 200 T 230 200 T 250 200" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" pointerEvents="none" />

            {/* Head */}
            <rect x="140" y="80" width="120" height="90" rx="15" fill={colors.head} stroke="#1e293b" strokeWidth="6" onClick={() => handleFill('head')} className="transition hover:opacity-80 hover:scale-105 origin-center" style={{transformOrigin: '50% 31%'}} />
            
            {/* Eyes */}
            <rect x="155" y="100" width="35" height="30" rx="10" fill={colors.eyeBg} onClick={() => handleFill('eyeBg')} className="transition hover:opacity-80" />
            <rect x="210" y="100" width="35" height="30" rx="10" fill={colors.eyeBg} onClick={() => handleFill('eyeBg')} className="transition hover:opacity-80" />
            <circle cx="172" cy="115" r="5" fill="#ffffff" pointerEvents="none" />
            <circle cx="227" cy="115" r="5" fill="#ffffff" pointerEvents="none" />
            
            {/* Mouth */}
            <line x1="170" y1="145" x2="230" y2="145" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="185" y1="140" x2="185" y2="150" stroke="#1e293b" strokeWidth="3" />
            <line x1="200" y1="140" x2="200" y2="150" stroke="#1e293b" strokeWidth="3" />
            <line x1="215" y1="140" x2="215" y2="150" stroke="#1e293b" strokeWidth="3" />
          </svg>
        </div>

        {/* Palette Area */}
        <div className="lg:col-span-5 bg-white border border-blue-100 rounded-2xl p-5 shadow-xs flex flex-col justify-center gap-4">
          <span className="text-sm font-black text-blue-900 block mb-1 uppercase tracking-wide">🎨 Pick a Paint Color</span>
          <div className="grid grid-cols-3 gap-3">
            {palette.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => { setSelectedColor(c.hex); playPop(); }}
                className={`w-full aspect-square rounded-2xl border-[3px] transition-transform transform active:scale-95 cursor-pointer relative shadow-sm ${
                  selectedColor === c.hex ? 'border-indigo-600 scale-110 shadow-md z-10' : 'border-transparent hover:scale-105 hover:shadow-md'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {selectedColor === c.hex && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-black/10 rounded-xl">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full border-2 border-slate-300 shadow-inner" style={{backgroundColor: selectedColor}}></div>
               <div className="flex flex-col text-left">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Brush</span>
                 <span className="text-xs font-bold text-indigo-600 mt-1">{coloredParts.length}/9 parts painted 🖌️</span>
               </div>
             </div>
             {onComplete && (
               <button 
                 type="button" 
                 onClick={() => {
                   const totalParts = 9;
                   if (coloredParts.length < totalParts) {
                     speakText(`Oops! You have colored ${coloredParts.length} out of ${totalParts} parts of our robot friend. Let's color all nine parts of the robot before we move to Level 2!`);
                   } else {
                     playPop();
                     onComplete();
                   }
                 }}
                 className={`px-4 py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-sm ${
                   coloredParts.length >= 9 
                     ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer scale-105 shadow-md ring-2 ring-emerald-300' 
                     : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                 }`}
               >
                 {coloredParts.length >= 9 ? 'Go to Level 2! 🚀' : `Done Coloring? 🎨`}
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RobotSandboxStage({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // Only speak Level 2 instructions, Level 1 is handled centrally
    if (level === 2) {
      speakText("Welcome to Level 2! Look at each picture below. Is it a robot? Click YES if you think it is a machine built by humans, or NO if it is not!");
    }
  }, [level]);

  const handleLevel1Complete = () => {
    setLevel(2);
  };

  return (
    <div className="relative overflow-hidden w-full min-h-[400px]">
      {level === 1 && (
        <div className="animate-in fade-in duration-700">
          <RobotColorActivity speakText={speakText} onComplete={handleLevel1Complete} />
        </div>
      )}

      {level === 2 && (
        <div className="animate-in fade-in slide-in-from-right-16 duration-700 fill-mode-both">
           <RobotIdentificationActivity speakText={speakText} onComplete={onComplete} />
        </div>
      )}
    </div>
  )
}

function RobotIdentificationActivity({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({
    0: null, 1: null, 2: null
  });

  const items = [
    { id: 0, name: "Teddy Bear", emoji: "🧸", isRobot: false },
    { id: 1, name: "Robot Friend", emoji: "🤖", isRobot: true },
    { id: 2, name: "Puppy", emoji: "🐶", isRobot: false }
  ];

  const handleSelect = (id: number, isRobot: boolean) => {
    const isCorrect = isRobot === items[id].isRobot;
    
    if (isCorrect) {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } catch (err) {}
      }
    } else {
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
        } catch (err) {}
      }
    }

    setAnswers(prev => {
      const updated = { ...prev, [id]: isRobot };
      
      // Check if all are answered correctly
      const allDone = items.every(item => {
        const currentAns = item.id === id ? isRobot : prev[item.id];
        return currentAns === item.isRobot;
      });

      if (isCorrect) {
        if (allDone) {
          speakText("Fantastic! You identified all the robots correctly! You have completed Level 2! Wonderful work!");
          if (onComplete) {
            onComplete(3);
          }
        } else {
          speakText("Correct! " + (isRobot ? "That is a machine built by humans!" : "That is not a robot."));
        }
      } else {
        speakText("Oops! Try again. Think about if it is a machine built by humans to follow instructions.");
      }

      return updated;
    });
  };

  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-5 mt-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="p-1 px-3 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xs">
            Level 2
          </span>
          <h4 className="text-sm sm:text-base font-black uppercase tracking-wide text-indigo-900">Are these ROBOTS?</h4>
        </div>
      </div>
      <p className="text-slate-600 text-sm md:text-base font-medium bg-white/60 p-4 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-1 mb-6">
        💡 <span className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
        <SpeakableText text="A robot is a machine built by humans to follow instructions. Look at each picture below. Is it a robot? Click YES if you think it is a machine built by humans, or NO if it is not!" className="p-0 hover:bg-transparent text-slate-600 border-0" />
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(item => {
          const isCorrect = answers[item.id] === item.isRobot;
          const isAnswered = answers[item.id] !== null;
          
          return (
            <div key={item.id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center ${isAnswered ? (isCorrect ? 'border-emerald-400 bg-emerald-50 shadow-sm relative' : 'border-rose-400 bg-rose-50 shadow-sm relative') : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
              <div className="flex flex-col items-center gap-2 relative z-10 w-full">
                <div className="text-5xl bg-white p-3 rounded-2xl shadow-inner border border-slate-100 transform transition-transform hover:scale-105 hover:-rotate-3">{item.emoji}</div>
                <span className="font-extrabold text-slate-800 text-sm tracking-tight">{item.name}</span>
              </div>
              <div className="flex gap-3 relative z-10 w-full justify-center">
                <button
                  type="button"
                  onClick={() => handleSelect(item.id, true)}
                  className={`flex-1 max-w-[90px] py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 ${
                    answers[item.id] === true 
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-105' 
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  <span className="text-2xl mb-0.5">👍</span>
                  <span className="text-[10px] uppercase font-black tracking-wide leading-none">YES</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id, false)}
                  className={`flex-1 max-w-[90px] py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 ${
                    answers[item.id] === false 
                      ? 'bg-rose-500 border-rose-600 text-white shadow-md scale-105' 
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700'
                  }`}
                >
                  <span className="text-2xl mb-0.5">👎</span>
                  <span className="text-[10px] uppercase font-black tracking-wide leading-none">NO</span>
                </button>
              </div>
              
              {/* Feedback watermark */}
              {isAnswered && (
                <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none opacity-20">
                  <span className="text-2xl font-black">{isCorrect ? '✅' : '❌'}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

function DeviceSafetySandboxStage({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const scenarios = [
    {
      id: 0,
      title: "Clean Hands Challenge 🧼",
      intro: "Sipho's hands are muddy and sticky! What should he do before using his school tablet?",
      opts: [
        { 
          text: "Wash hands with soap and water first!", 
          visual: "🧼 💦 🙌 ✨", 
          caption: "Clean Hands First! 🧼",
          bgColor: "bg-sky-100 border-sky-200 text-sky-950",
          isSafe: true, 
          feedback: "Great choice! Washing hands keeps dirt and sticky mud off the screen!" 
        },
        { 
          text: "Wipe hands on trousers and tap immediately!", 
          visual: "💩 👐 📱 ⚠️", 
          caption: "Use Muddy Hands! 💩",
          bgColor: "bg-amber-100 border-amber-200 text-amber-950",
          isSafe: false, 
          feedback: "Oh no! Sticky mud and grit can scratch or ruin the tablet screen." 
        }
      ],
      correctIndex: 0,
      mascotVoice: "Sipho's hands are muddy and sticky! What should he do before using his school tablet?"
    },
    {
      id: 1,
      title: "No Liquids Challenge 🚫🥤",
      intro: "You have a sweet, wet cup of juice. Where is the safest place to keep it while you learn on the computer?",
      opts: [
        { 
          text: "Keep the juice far away on another table!", 
          visual: "🥤 ↔️ 💻 ✅", 
          caption: "Keep Juice Far Away! 🥤",
          bgColor: "bg-sky-100 border-sky-200 text-sky-950",
          isSafe: true, 
          feedback: "Perfect choice! Keeping drinks far away prevents any bad spills from breaking your computer!" 
        },
        { 
          text: "Keep juice right next to the keyboard!", 
          visual: "🥤 ⌨️ 💥 ❌", 
          caption: "Juice Next to Keys! ⌨️",
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          isSafe: false, 
          feedback: "Yikes! Even a tiny splash of juice can make the computer short out and break forever." 
        }
      ],
      correctIndex: 0,
      mascotVoice: "You have a sweet, wet cup of juice. Where is the safest place to keep it while you learn on the computer?"
    },
    {
      id: 2,
      title: "Happy Screen Challenge 🧸",
      intro: "How should we touch the screen and press the buttons on our tablets?",
      opts: [
        { 
          text: "Pound buttons hard and slam the laptop down!", 
          visual: "🔨 💥 📱 😭", 
          caption: "Slam and Bash! 🔨",
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          isSafe: false, 
          feedback: "Oh dear! Slapping or slamming can crack the delicate glass screens." 
        },
        { 
          text: "Press buttons gently and touch softly like a teddy bear!", 
          visual: "🧸 👆 💻 ✨", 
          caption: "Touch Very Gently! 🧸",
          bgColor: "bg-emerald-100 border-emerald-200 text-emerald-950",
          isSafe: true, 
          feedback: "Wonderful! Touching gently keeps the keys and screen working perfectly!" 
        }
      ],
      correctIndex: 1,
      mascotVoice: "How should we touch the screen and press the buttons on our tablets?"
    },
    {
      id: 3,
      title: "Screen Time Break Challenge 🌳",
      intro: "You have been playing educational screen games for a long time. What is the best idea now?",
      opts: [
        { 
          text: "Put the tablet away, go outside, and run around!", 
          visual: "🌳 ☀️ ⚽ 🏃", 
          caption: "Go Play Outside! 🌳",
          bgColor: "bg-emerald-100 border-emerald-200 text-emerald-950",
          isSafe: true, 
          feedback: "Fantastic! Playing outside and running around rests your eyes and keeps your body strong!" 
        },
        { 
          text: "Keep staring at the bright screen in a dark room!", 
          visual: "📱 🌑 🧟 👁️", 
          caption: "Stare in the Dark! 📺",
          bgColor: "bg-amber-100 border-amber-200 text-amber-950",
          isSafe: false, 
          feedback: "Oh no! Staring at screens for too long can give you sore, tired eyes and headaches." 
        }
      ],
      correctIndex: 0,
      mascotVoice: "You have been playing educational screen games for a long time. What is the best idea now?"
    }
  ];

  useEffect(() => {
    speakText(scenarios[currentScenario].mascotVoice);
  }, [currentScenario]);

  // Self-contained sound engine
  const playLocalSound = (type: 'chime' | 'boop' | 'pop') => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'boop') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  const handleSelectOption = (idx: number) => {
    if (checked) return;
    setSelectedOption(idx);
    playLocalSound('pop');
    speakText(scenarios[currentScenario].opts[idx].text);
  };

  const handleCheck = () => {
    if (selectedOption === null || checked) return;
    setChecked(true);
    const isCorrect = selectedOption === scenarios[currentScenario].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playLocalSound('chime');
      speakText(scenarios[currentScenario].opts[selectedOption].feedback);
    } else {
      playLocalSound('boop');
      speakText(scenarios[currentScenario].opts[selectedOption].feedback);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setChecked(false);
    if (currentScenario + 1 < scenarios.length) {
      setCurrentScenario(prev => prev + 1);
    } else {
      setGameFinished(true);
      const finalStars = Math.round((score / scenarios.length) * 3) || 1;
      if (onComplete) {
        onComplete(finalStars);
      }
    }
  };

  const handleReset = () => {
    setCurrentScenario(0);
    setSelectedOption(null);
    setChecked(false);
    setScore(0);
    setGameFinished(false);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/50 to-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-5 md:p-6 min-h-[420px] flex flex-col justify-between" id="device-safety-game-stage">
      <div>
        {/* Game Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-100/50 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1 px-3 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
              Mimi's Safety Lesson {currentScenario + 1} of {scenarios.length}
            </span>
            <h4 className="text-sm md:text-base font-black text-emerald-900 uppercase tracking-tight hidden sm:block">
              {scenarios[currentScenario].title}
            </h4>
          </div>
          <span className="text-xs md:text-sm font-extrabold text-slate-700 bg-white border-2 border-emerald-100 px-3 py-1 rounded-full shadow-2xs">
            ⭐ Stars: {score}
          </span>
        </div>

        {!gameFinished ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Mascot & Intro Instruction Card */}
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <span className="text-4xl md:text-5xl block animate-bounce duration-1000">🐰</span>
                <span className="absolute -bottom-1 -right-1 text-base">🔊</span>
              </div>
              <div className="text-center sm:text-left flex-1 space-y-1.5 w-full">
                <p className="text-slate-800 text-sm md:text-base font-extrabold leading-relaxed">
                  {scenarios[currentScenario].intro}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playLocalSound('pop');
                      speakText(scenarios[currentScenario].mascotVoice);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 cursor-pointer transition-all active:scale-95"
                  >
                    🔊 Hear Sipho Again
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Tap a picture below to choose!
                  </span>
                </div>
              </div>
            </div>

            {/* Huge Visual Choices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {scenarios[currentScenario].opts.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === scenarios[currentScenario].correctIndex;
                
                // Styling classes
                let cardStyle = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/10 shadow-sm hover:shadow-md";
                
                if (isSelected) {
                  cardStyle = "border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/20 shadow-md transform scale-[1.01]";
                }
                
                if (checked) {
                  if (isCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/20 text-emerald-950 font-bold pointer-events-none";
                  } else if (isSelected) {
                    cardStyle = "border-rose-500 bg-rose-50 ring-4 ring-rose-500/20 text-rose-950 pointer-events-none";
                  } else {
                    cardStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-50 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={checked}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`group relative p-4 rounded-3xl border-3 text-center transition-all duration-200 cursor-pointer active:scale-98 flex flex-col items-center justify-between min-h-[180px] md:min-h-[220px] ${cardStyle}`}
                  >
                    {/* Visual Check / Cross Badge Overlay */}
                    {checked && isCorrect && (
                      <span className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center font-black text-lg shadow-md animate-bounce">
                        ✅
                      </span>
                    )}
                    {checked && isSelected && !isCorrect && (
                      <span className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center font-black text-lg shadow-md animate-shake">
                        ❌
                      </span>
                    )}

                    {/* Short Caption */}
                    <span className="text-xs md:text-sm font-black text-slate-700 tracking-tight uppercase group-hover:text-indigo-600 transition-colors mb-2">
                      {opt.caption}
                    </span>

                    {/* Giant Graphic Container */}
                    <div className={`w-full max-w-[180px] aspect-video rounded-2xl flex items-center justify-center border-2 shadow-inner transition-transform group-hover:scale-105 duration-300 ${opt.bgColor || 'bg-slate-50'}`}>
                      <span className="text-4xl md:text-5xl tracking-widest drop-shadow-md select-none">
                        {opt.visual}
                      </span>
                    </div>

                    {/* Read Option Text / Action Bar */}
                    <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                      <span className="text-[11px] md:text-xs font-bold leading-snug">
                        {opt.text}
                      </span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          playLocalSound('pop');
                          speakText(opt.text);
                        }}
                        className="p-1 hover:bg-slate-200/50 rounded-lg text-xs shrink-0 cursor-pointer"
                        title="Read option out loud"
                      >
                        🔊
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback Banner */}
            {checked && (
              <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-emerald-100 flex items-start gap-3 shadow-xs animate-in slide-in-from-bottom-3 duration-300">
                <span className="text-3xl shrink-0 animate-pulse">
                  {selectedOption === scenarios[currentScenario].correctIndex ? "🎉" : "💡"}
                </span>
                <div className="space-y-1">
                  <span className={`text-xs uppercase font-black tracking-wider block ${
                    selectedOption === scenarios[currentScenario].correctIndex ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {selectedOption === scenarios[currentScenario].correctIndex ? 'Awesome Answer! ⭐' : 'Let\'s Learn! 💡'}
                  </span>
                  <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed">
                    {scenarios[currentScenario].opts[selectedOption || 0].feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-5 animate-in scale-in duration-300">
            <span className="text-6xl block animate-bounce">🏆</span>
            <div className="space-y-2">
              <h5 className="text-lg md:text-xl font-black text-emerald-950 uppercase tracking-tight">
                Mimi's Safety Master Badge! 🐰✨
              </h5>
              <p className="text-xs md:text-sm text-slate-600 font-bold max-w-sm mx-auto leading-relaxed">
                Splendid job! You identified all the smart ways to keep your tablets, laptops, and smart screens neat and safe! You got <span className="text-emerald-600 font-black text-base">{score} out of {scenarios.length}</span> correct!
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wide active:scale-95 transition cursor-pointer shadow-md"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {!gameFinished && (
        <div className="flex justify-end pt-4 mt-4 border-t-2 border-emerald-100/30">
          {!checked ? (
            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleCheck}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedOption !== null 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Verify Answer 🚀</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 animate-pulse"
            >
              <span>{currentScenario + 1 === scenarios.length ? 'Finish Game 🏆' : 'Next Lesson ➡️'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Term1RecapSimulationStage({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Self-contained sound engine
  const playLocalSound = (type: 'chime' | 'boop' | 'pop') => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'boop') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  const challenges = [
    {
      id: 0,
      topic: "Repeating Patterns 🔴🔵",
      question: "Help Mimi finish her bead pattern! Look at the row: Red, Blue, Red, Blue... What color bead comes next?",
      visual: (
        <div className="flex justify-center items-center gap-3.5 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl drop-shadow-xs animate-bounce" style={{ animationDelay: '0s' }}>🔴</span>
          <span className="text-4xl md:text-5xl drop-shadow-xs animate-bounce" style={{ animationDelay: '0.1s' }}>🔵</span>
          <span className="text-4xl md:text-5xl drop-shadow-xs animate-bounce" style={{ animationDelay: '0.2s' }}>🔴</span>
          <span className="text-4xl md:text-5xl drop-shadow-xs animate-bounce" style={{ animationDelay: '0.3s' }}>🔵</span>
          <span className="text-4xl md:text-5xl font-black text-indigo-600 animate-pulse bg-indigo-50 border-2 border-indigo-200 rounded-full w-14 h-14 flex items-center justify-center shadow-xs">❓</span>
        </div>
      ),
      opts: [
        { 
          text: "Red bead comes next!", 
          emoji: "🔴", 
          caption: "Red Bead 🔴",
          isCorrect: true, 
          bgColor: "bg-rose-100 border-rose-200 text-rose-950",
          feedback: "Wonderful job! Red comes next to continue our repeating pattern: Red, Blue, Red, Blue, Red!" 
        },
        { 
          text: "Yellow bead comes next!", 
          emoji: "🟡", 
          caption: "Yellow Bead 🟡",
          isCorrect: false, 
          bgColor: "bg-amber-100 border-amber-200 text-amber-950",
          feedback: "Oops! We want to repeat our Red and Blue pattern. Tap Red to keep it repeating!" 
        }
      ],
      correctIndex: 0,
      narration: "Help Mimi finish her bead pattern! Look at the row: Red, Blue, Red, Blue. What color bead comes next?"
    },
    {
      id: 1,
      topic: "Devices Around the World 💻",
      question: "Which of these is a computing device?",
      visual: (
        <div className="flex justify-center items-center gap-5 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl animate-pulse">💻</span>
          <span className="text-xl font-bold text-slate-400">vs</span>
          <span className="text-4xl md:text-5xl animate-pulse">🍎</span>
        </div>
      ),
      opts: [
        { 
          text: "An Apple!", 
          emoji: "🍎", 
          caption: "Apple 🍎",
          isCorrect: false, 
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          feedback: "Oh silly! An apple is a healthy snack, not a machine!" 
        },
        { 
          text: "A Laptop Computer!", 
          emoji: "💻", 
          caption: "Laptop 💻",
          isCorrect: true, 
          bgColor: "bg-sky-100 border-sky-200 text-sky-950",
          feedback: "Spot on! A laptop is a computing device that follows our instructions!" 
        }
      ],
      correctIndex: 1,
      narration: "Which of these is a computing device? A laptop or an apple?"
    },
    {
      id: 2,
      topic: "Picture Stories 📖",
      question: "A seed needs to grow. What is the correct order of the story?",
      visual: (
        <div className="flex justify-center items-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl">🌱</span>
          <span className="text-lg font-bold text-slate-400">➡️</span>
          <span className="text-4xl md:text-5xl">🪴</span>
          <span className="text-lg font-bold text-slate-400">➡️</span>
          <span className="text-4xl md:text-5xl">🌻</span>
        </div>
      ),
      opts: [
        { 
          text: "Seed, then Sprout, then Flower!", 
          emoji: "🌱 🪴 🌻", 
          caption: "Seed to Flower",
          isCorrect: true, 
          bgColor: "bg-emerald-100 border-emerald-200 text-emerald-950",
          feedback: "Excellent! First we plant a seed, then it sprouts, and finally it becomes a beautiful flower!" 
        },
        { 
          text: "Flower, then Seed, then Sprout!", 
          emoji: "🌻 🌱 🪴", 
          caption: "Flower to Sprout",
          isCorrect: false, 
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          feedback: "Oops! We have to start with the seed first before we get a flower!" 
        }
      ],
      correctIndex: 0,
      narration: "A seed needs to grow. What is the correct order of the story: Seed then sprout then flower, or flower then seed then sprout?"
    },
    {
      id: 3,
      topic: "Arrow Cards ➡️",
      question: "Help Mimi's bunny robot reach the sweet carrot! Guide it: Right, Right, and then...?",
      visual: (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl w-full max-w-sm mx-auto shadow-inner flex flex-col items-center">
          <div className="grid grid-cols-4 gap-2 w-full max-w-[240px]">
            <div className="aspect-square bg-white border border-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-xs">🐰</div>
            <div className="aspect-square bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xl text-slate-400">➡️</div>
            <div className="aspect-square bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xl text-slate-400">➡️</div>
            <div className="aspect-square bg-emerald-100 border-2 border-emerald-300 rounded-xl flex items-center justify-center text-3xl animate-bounce">🥕</div>
          </div>
        </div>
      ),
      opts: [
        { 
          text: "Go Right again! ➡️", 
          emoji: "➡️", 
          caption: "Walk Right ➡️",
          isCorrect: true, 
          bgColor: "bg-emerald-100 border-emerald-200 text-emerald-950",
          feedback: "Excellent coding! Moving right one more time lets our bunny robot eat the delicious carrot!" 
        },
        { 
          text: "Go Down! ⬇️", 
          emoji: "⬇️", 
          caption: "Walk Down ⬇️",
          isCorrect: false, 
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          feedback: "Oops! Moving down takes the bunny off the path. Guide the bunny right to get the carrot!" 
        }
      ],
      correctIndex: 0,
      narration: "Help Mimi's bunny robot reach the sweet carrot! Guide it: Right, Right, and then what?"
    },
    {
      id: 4,
      topic: "What is a Robot? 🤖",
      question: "Which of these is a machine built by humans to follow instructions?",
      visual: (
        <div className="flex justify-center items-center gap-5 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl animate-pulse">🤖</span>
          <span className="text-xl font-bold text-slate-400">vs</span>
          <span className="text-4xl md:text-5xl animate-pulse">🐶</span>
        </div>
      ),
      opts: [
        { 
          text: "A friendly Dog!", 
          emoji: "🐶", 
          caption: "Dog 🐶",
          isCorrect: false, 
          bgColor: "bg-amber-100 border-amber-200 text-amber-950",
          feedback: "A dog is a wonderful pet, but it is a living animal, not a machine!" 
        },
        { 
          text: "A Mechanical Robot!", 
          emoji: "🤖", 
          caption: "Robot 🤖",
          isCorrect: true, 
          bgColor: "bg-violet-100 border-violet-200 text-violet-950",
          feedback: "Correct! A robot is a machine made of parts like batteries and wires to help us." 
        }
      ],
      correctIndex: 1,
      narration: "Which of these is a machine built by humans to follow instructions? A friendly dog or a mechanical robot?"
    },
    {
      id: 5,
      topic: "Rhythm Patterns 🥁",
      question: "Listen to the beat: Drum, Clap, Drum, Clap. What comes next?",
      visual: (
        <div className="flex justify-center items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl">🥁</span>
          <span className="text-4xl md:text-5xl">👏</span>
          <span className="text-4xl md:text-5xl">🥁</span>
          <span className="text-4xl md:text-5xl">👏</span>
          <span className="text-4xl md:text-5xl font-black text-indigo-600 animate-pulse bg-indigo-50 border-2 border-indigo-200 rounded-full w-14 h-14 flex items-center justify-center shadow-xs">❓</span>
        </div>
      ),
      opts: [
        { 
          text: "Another Clap! 👏", 
          emoji: "👏", 
          caption: "Clap 👏",
          isCorrect: false, 
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          feedback: "Oops! After a clap, we need a drum to keep our pattern going: Drum, Clap, Drum, Clap, Drum!" 
        },
        { 
          text: "A Drum! 🥁", 
          emoji: "🥁", 
          caption: "Drum 🥁",
          isCorrect: true, 
          bgColor: "bg-amber-100 border-amber-200 text-amber-950",
          feedback: "Great job! A drum comes next in our rhythm pattern!" 
        }
      ],
      correctIndex: 1,
      narration: "Listen to the beat: Drum, Clap, Drum, Clap. What comes next? Another clap or a drum?"
    },
    {
      id: 6,
      topic: "Keeping Devices Safe 🛡️",
      question: "Your school tablet screen is dusty. What is the safest way to clean the glass?",
      visual: (
        <div className="flex justify-center items-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
          <span className="text-4xl md:text-5xl animate-bounce">📱</span>
          <span className="text-xl text-slate-400">✨</span>
          <span className="text-4xl md:text-5xl font-black text-indigo-600 animate-pulse bg-indigo-50 border-2 border-indigo-200 rounded-full w-14 h-14 flex items-center justify-center shadow-xs">❓</span>
        </div>
      ),
      opts: [
        { 
          text: "Use a soft, dry cloth gently!", 
          emoji: "🧼 ✨ 🙌", 
          caption: "Soft Dry Cloth 🧼",
          isCorrect: true, 
          bgColor: "bg-emerald-100 border-emerald-200 text-emerald-950",
          feedback: "Splendid choice! A soft, dry cloth wipes dust off safely without scratching or water damage!" 
        },
        { 
          text: "Wash it with a big bucket of soapy water!", 
          emoji: "🪣 💦 🚫", 
          caption: "Soapy Water! 🪣",
          isCorrect: false, 
          bgColor: "bg-rose-50 border-rose-100 text-rose-950",
          feedback: "Yikes! Water will leak inside and break the tablet completely. Never use liquid!" 
        }
      ],
      correctIndex: 0,
      narration: "Your school tablet screen is dusty. What is the safest way to clean the glass?"
    }
  ];

  useEffect(() => {
    speakText(challenges[currentChallenge].narration);
  }, [currentChallenge]);

  const handleSelectOption = (idx: number) => {
    if (checked) return;
    setSelectedOption(idx);
    playLocalSound('pop');
    speakText(challenges[currentChallenge].opts[idx].text);
  };

  const handleCheck = () => {
    if (selectedOption === null || checked) return;
    setChecked(true);
    const isCorrect = selectedOption === challenges[currentChallenge].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playLocalSound('chime');
      speakText(challenges[currentChallenge].opts[selectedOption].feedback);
    } else {
      playLocalSound('boop');
      speakText(challenges[currentChallenge].opts[selectedOption].feedback);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setChecked(false);
    if (currentChallenge + 1 < challenges.length) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      setGameFinished(true);
      const finalStars = Math.round((score / challenges.length) * 3) || 1;
      if (onComplete) {
        onComplete(finalStars);
      }
    }
  };

  const handleReset = () => {
    setCurrentChallenge(0);
    setSelectedOption(null);
    setChecked(false);
    setScore(0);
    setGameFinished(false);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 to-emerald-50/50 border-2 border-indigo-200 rounded-3xl p-5 md:p-6 min-h-[420px] flex flex-col justify-between" id="term1-recap-game-stage">
      <div>
        {/* Game Header */}
        <div className="flex items-center justify-between border-b-2 border-indigo-100/50 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1 px-3 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-xs animate-pulse">
              🏆 Term 1 Graduation Quest {currentChallenge + 1} of {challenges.length}
            </span>
          </div>
          <span className="text-xs md:text-sm font-extrabold text-slate-700 bg-white border-2 border-indigo-100 px-3 py-1 rounded-full shadow-2xs">
            ⭐ Gold Stars: {score}
          </span>
        </div>

        {!gameFinished ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Mascot Speak Card */}
            <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <span className="text-4xl md:text-5xl block animate-bounce duration-1000">🐰</span>
                <span className="absolute -bottom-1 -right-1 text-base">🔊</span>
              </div>
              <div className="text-center sm:text-left flex-1 space-y-1.5 w-full">
                <p className="text-slate-800 text-sm md:text-base font-extrabold leading-relaxed">
                  {challenges[currentChallenge].question}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playLocalSound('pop');
                      speakText(challenges[currentChallenge].narration);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700 cursor-pointer transition-all active:scale-95"
                  >
                    🔊 Hear Quest Again
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Tap a picture choice below!
                  </span>
                </div>
              </div>
            </div>

            {/* Giant Graphic Question Visual */}
            <div className="w-full py-1">
              {challenges[currentChallenge].visual}
            </div>

            {/* Huge Visual Choices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {challenges[currentChallenge].opts.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === challenges[currentChallenge].correctIndex;
                
                let cardStyle = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/10 shadow-sm hover:shadow-md";
                
                if (isSelected) {
                  cardStyle = "border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/20 shadow-md transform scale-[1.01]";
                }
                
                if (checked) {
                  if (isCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-50/80 ring-4 ring-emerald-500/20 text-emerald-950 font-bold pointer-events-none";
                  } else if (isSelected) {
                    cardStyle = "border-rose-500 bg-rose-50 ring-4 ring-rose-500/20 text-rose-950 pointer-events-none";
                  } else {
                    cardStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-50 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={checked}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`group relative p-4 rounded-3xl border-3 text-center transition-all duration-200 cursor-pointer active:scale-98 flex flex-col items-center justify-between min-h-[170px] md:min-h-[200px] ${cardStyle}`}
                  >
                    {/* Visual Check / Cross Badge Overlay */}
                    {checked && isCorrect && (
                      <span className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center font-black text-lg shadow-md animate-bounce">
                        ✅
                      </span>
                    )}
                    {checked && isSelected && !isCorrect && (
                      <span className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center font-black text-lg shadow-md animate-shake">
                        ❌
                      </span>
                    )}

                    {/* Short Caption */}
                    <span className="text-xs md:text-sm font-black text-slate-700 tracking-tight uppercase group-hover:text-indigo-600 transition-colors mb-2">
                      {opt.caption}
                    </span>

                    {/* Giant Graphic Container */}
                    <div className={`w-full max-w-[180px] aspect-video rounded-2xl flex items-center justify-center border-2 shadow-inner transition-transform group-hover:scale-105 duration-300 ${opt.bgColor || 'bg-slate-50'}`}>
                      <span className="text-4xl md:text-5xl tracking-widest drop-shadow-md select-none">
                        {opt.emoji}
                      </span>
                    </div>

                    {/* Read Option Text / Action Bar */}
                    <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                      <span className="text-[11px] md:text-xs font-bold leading-snug">
                        {opt.text}
                      </span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          playLocalSound('pop');
                          speakText(opt.text);
                        }}
                        className="p-1 hover:bg-slate-200/50 rounded-lg text-xs shrink-0 cursor-pointer"
                        title="Read option out loud"
                      >
                        🔊
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback Banner */}
            {checked && (
              <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-indigo-100 flex items-start gap-3 shadow-xs animate-in slide-in-from-bottom-3 duration-300">
                <span className="text-3xl shrink-0 animate-pulse">
                  {selectedOption === challenges[currentChallenge].correctIndex ? "🎉" : "💡"}
                </span>
                <div className="space-y-1">
                  <span className={`text-xs uppercase font-black tracking-wider block ${
                    selectedOption === challenges[currentChallenge].correctIndex ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {selectedOption === challenges[currentChallenge].correctIndex ? 'Correct! ⭐' : 'Try Again! 💡'}
                  </span>
                  <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed">
                    {challenges[currentChallenge].opts[selectedOption || 0].feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-6 animate-in scale-in duration-300">
            <span className="text-7xl block animate-bounce">🎓🏆🎖️</span>
            <div className="space-y-2">
              <h5 className="text-xl md:text-2xl font-black text-indigo-950 uppercase tracking-tight">
                TERM 1 GRADUATE BADGE! 🎓✨
              </h5>
              <p className="text-xs md:text-sm text-slate-600 font-bold max-w-sm mx-auto leading-relaxed">
                Outstanding! You successfully conquered all four Term 1 recap quests: patterns, inputs, coding pathways, and screen safety! You are a fully certified coding star.
              </p>
              <div className="inline-block mt-3 bg-emerald-100 text-emerald-950 border-2 border-emerald-300 rounded-2xl px-5 py-3 shadow-md transform rotate-1">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-800">⭐ QUEST COMPLETE ⭐</p>
                <p className="text-2xl font-black text-emerald-950 leading-tight">Score: {score} / {challenges.length}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wide active:scale-95 transition cursor-pointer shadow-md"
              >
                🔄 Play Quest Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {!gameFinished && (
        <div className="flex justify-end pt-4 mt-4 border-t-2 border-indigo-100/30">
          {!checked ? (
            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleCheck}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                selectedOption !== null 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Verify Answer 🚀</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 animate-pulse"
            >
              <span>{currentChallenge + 1 === challenges.length ? 'Get Badge! 🏆' : 'Next Quest ➡️'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RobotLabConceptGuide({
  speakText,
  stepProgress,
  onStepProgress
}: {
  speakText: (t: string) => void;
  stepProgress?: number;
  onStepProgress?: (newProgress: number) => void;
}) {
  const [internalProgress, setInternalProgress] = useState(0);
  const progress = stepProgress !== undefined ? stepProgress : internalProgress;
  const setProgress = (updater: number | ((prev: number) => number)) => {
    if (typeof updater === 'function') {
      const newVal = updater(progress);
      setInternalProgress(newVal);
      onStepProgress?.(newVal);
    } else {
      setInternalProgress(updater);
      onStepProgress?.(updater);
    }
  };

  const [robotState, setRobotState] = useState<'idle' | 'dancing' | 'beeping' | 'charging'>('idle');
  const [battery, setBattery] = useState(80);
  const [robotLog, setRobotLog] = useState("SYSTEM ONLINE. PLACE ROBOT ON SCREEN TARGETS!");
  const [gridPos, setGridPos] = useState({ x: 1, y: 1 });
  const [lastDirection, setLastDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);

  const steps = [
    {
      id: 0,
      title: "1. It gets its energy from a power source. 🔌",
      text: "Robots don't eat pizzas or donuts and they don't do anything on their own. Instead of bedtime, they get energy from a power plug!",
      renderItem: () => (
        <div className="flex flex-row items-center gap-3.5 py-1.5 select-none w-full text-left">
          <span className="text-3xl shrink-0 animate-bounce">⚡</span>
          <span className="text-xs sm:text-sm font-black text-indigo-950 leading-relaxed flex-1">
            1. It gets its energy from a power source.
          </span>
        </div>
      )
    },
    {
      id: 1,
      title: "2. It performs tasks that we let it do. 🎮",
      text: "Robots do not think or have human brains, they only perform actions that we tell them to do! Try compiling code and using the direction wheels to let me move and play around!",
      renderItem: () => (
        <div className="flex flex-row items-center gap-3.5 py-1.5 select-none w-full text-left">
          <span className="text-3xl shrink-0 animate-pulse">🎮</span>
          <span className="text-xs sm:text-sm font-black text-indigo-950 leading-relaxed flex-1 font-sans">
            2. It performs tasks that we let it do.
          </span>
        </div>
      )
    }
  ];

  const playChime = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.log(e);
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
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const playInteractiveTune = (type: 'beep' | 'recharge' | 'arrow' | 'error') => {
    if (!('AudioContext' in window || 'webkitAudioContext' in window)) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      if (type === 'beep') {
        const notes = [600, 900, 1200];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.12);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.12);
        });
      } else if (type === 'recharge') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleTourClick = (stepId: number) => {
    if (stepId <= progress) {
      playChime();
      speakText(steps[stepId].text);
      if (stepId === progress && progress < steps.length) {
         setProgress(prev => prev + 1);
      }
    } else {
      playBoop();
      speakText("Let's complete step " + (progress + 1) + " first!");
    }
  };

  const triggerRecharge = (e: React.MouseEvent) => {
    e.stopPropagation();
    playInteractiveTune('recharge');
    setRobotState('charging');
    setBattery(100);
    setRobotLog("🔌 RECHARGING COMPLETED. BATTERY AT 100%! FEELING SUPERCHARGED!");
    speakText("Yum! Highly electric! My battery is now fully recharged!");
    setTimeout(() => setRobotState('idle'), 1500);
  };

  const triggerBeep = (e: React.MouseEvent) => {
    e.stopPropagation();
    playInteractiveTune('beep');
    setRobotState('beeping');
    setRobotLog("🤖 BEEP BEEP BOOP BOOP! 'I am a friendly companion robot!'");
    speakText("Beep beep boop boop! Playful melody complete!");
    setTimeout(() => setRobotState('idle'), 1200);
  };

  const moveRobot = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', e: React.MouseEvent) => {
    e.stopPropagation();

    // Check battery failure first
    if (battery <= 0) {
      playInteractiveTune('error');
      setRobotLog("❌ OPERATION CRITICAL FAILED! BATTERY DRAINED. PLEASE CLICK RECHARGE PLUG.");
      speakText("Oh oh! My batteries are empty! Help me plug into the golden charging disk!");
      return;
    }

    playInteractiveTune('arrow');
    setLastDirection(dir);
    setRobotState('dancing');
    
    let newX = gridPos.x;
    let newY = gridPos.y;
    let isContainedMove = true;
    
    if (dir === 'UP') {
      if (gridPos.y < 2) newY += 1;
      else isContainedMove = false;
    }
    if (dir === 'DOWN') {
      if (gridPos.y > 0) newY -= 1;
      else isContainedMove = false;
    }
    if (dir === 'LEFT') {
      if (gridPos.x > 0) newX -= 1;
      else isContainedMove = false;
    }
    if (dir === 'RIGHT') {
      if (gridPos.x < 2) newX += 1;
      else isContainedMove = false;
    }

    const nextBattery = Math.max(0, battery - 10);
    setBattery(nextBattery);

    if (!isContainedMove) {
      setRobotLog(`⚠️ BUMP! WALL COLLISION BLOCK AT RANGE IN DIRECTION: "${dir}"`);
      speakText("Ow! A wall obstacle! I cannot go that way!");
    } else {
      setGridPos({ x: newX, y: newY });
      
      const isDestinationChargingPad = newX === 1 && newY === 0;
      if (isDestinationChargingPad) {
        setRobotState('charging');
        setBattery(100);
        setRobotLog("🔌 CHARGING STATION AT (1,0) ENGAGED! BATTERY SPEEDY RECHARGED!");
        speakText("Whoosh! That's my gold charging station! I am fully charged!");
      } else {
        const voiceLines = {
          'UP': "Stepping forward!",
          'DOWN': "Sliding backward!",
          'LEFT': "Driving left!",
          'RIGHT': "Rolling right!"
        };
        speakText(voiceLines[dir]);
        
        const logs = [
          `🤖 EXECUTING CODE CARD "${dir}"!`,
          `⚙️ GEARS ACTIVE. SLIDED TO CELL (${newX}, ${newY}).`,
          `👀 CAMERA SENSORS RECORDED POSITION RANGE.`,
          `⚡ MOTORS NOMINAL. BATTERY DECREASED.`
        ];
        setRobotLog(logs[Math.floor(Math.random() * logs.length)]);
      }
    }
    
    setTimeout(() => {
      setRobotState('idle');
      setLastDirection(null);
    }, 600);
  };

  const getContainerClass = (stepId: number) => {
    const base = "p-3 rounded-2xl flex items-center justify-start transition-all cursor-pointer border-2 bg-white relative";
    if (stepId === progress) {
      return `${base} bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 border-indigo-400 z-10`;
    } else if (stepId < progress) {
      return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-emerald-400`;
    } else {
      return `${base} bg-slate-50 opacity-50 grayscale hover:scale-100 border-slate-200 cursor-not-allowed`;
    }
  };

  // Robot dynamic coordinate calculator (returns responsive percentage points)
  const getRobotCoords = (x: number, y: number) => {
    let left = "50%";
    let top = "48%";
    let scale = 1.0;
    let zIndex = 10;

    if (y === 0) {
      top = "24%";
      scale = 0.85;
      zIndex = 5;
      if (x === 0) left = "24%";
      else if (x === 1) left = "50%";
      else left = "76%";
    } else if (y === 1) {
      top = "50%";
      scale = 1.0;
      zIndex = 10;
      if (x === 0) left = "20%";
      else if (x === 1) left = "50%";
      else left = "80%";
    } else {
      top = "76%";
      scale = 1.15;
      zIndex = 15;
      if (x === 0) left = "14%";
      else if (x === 1) left = "50%";
      else left = "86%";
    }

    return { left, top, scale, zIndex };
  };

  const currentCoords = getRobotCoords(gridPos.x, gridPos.y);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Section: Mascot + Explanations */}
      <div className="flex flex-col md:flex-row gap-5 items-stretch w-full animate-fade-in">
        {/* Mascot Card on the side of explanations */}
        <div className="flex flex-col items-center justify-center shrink-0 p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-xs hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] select-none w-full md:w-36 lg:w-44 self-stretch">
          <img 
            src={regeneratedMascotImgW5.src || regeneratedMascotImgW5} 
            alt="Zola"
            referrerPolicy="no-referrer"
            className="w-24 h-24 md:w-28 md:h-28 object-contain animate-bounce"
          />
          <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 mt-3 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
            Zola
          </span>
        </div>

        {/* Informative Cards (Right side) */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Sub-heading & Definition Banner */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50/60 border-2 border-indigo-100 p-5 rounded-2xl text-indigo-950 select-none">
            <h3 className="text-base sm:text-lg font-black text-indigo-900 flex items-center gap-2 mb-1.5">
              🤖 What is a Robot?
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
              A robot is a machine made by humans that follows our exact instructions. It does not have feelings or sleep, but performs helpful jobs very fast!
            </p>
          </div>

          {/* Step Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((step) => (
              <div key={step.id} onClick={() => handleTourClick(step.id)} className={getContainerClass(step.id)}>
                 {step.renderItem()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Console Container */}
      <div id="robot-lab-console-wrapper" className="bg-slate-950 p-4 sm:p-5 rounded-3xl shadow-xl border-4 border-slate-800 w-full flex flex-col lg:flex-row gap-5">
        
        {/* Visualizer Side - High-tech Digital Lab Floor Grid */}
        <div className="relative flex-1 bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 overflow-hidden min-h-[300px] flex flex-col justify-between">
          
          {/* Cyber Lab Floor Background Decor */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          {/* System status ribbon */}
          <div className="flex justify-between items-center text-[10px] font-mono text-indigo-400 z-20">
            <span className="flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LAB FLOOR GRID - ZOLA BOT EDITION
            </span>
            <div className="flex items-center gap-2">
              <span>🔋 BATTERY: {battery}%</span>
              <div className="w-10 h-3 border border-slate-700 rounded-sm bg-slate-950 overflow-hidden p-0.5">
                <div className={`h-full ${battery > 30 ? 'bg-emerald-500' : 'bg-rose-500'} rounded-[1px] transition-all duration-500`} style={{ width: `${battery}%` }} />
              </div>
            </div>
          </div>

          {/* Interactive Lab Grid Room with 3D Center Alignment Perspective */}
          <div className="absolute inset-0 top-12 bottom-18">
            {/* Glowing Coordinate target circles */}
            {[0, 1, 2].map(fy => 
              [0, 1, 2].map(fx => {
                const targetCoords = getRobotCoords(fx, fy);
                const isPad = fx === 1 && fy === 0;
                const isCurrent = gridPos.x === fx && gridPos.y === fy;
                return (
                  <div 
                    key={`gnode-${fx}-${fy}`}
                    style={{ left: targetCoords.left, top: targetCoords.top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300"
                  >
                    <div className={`rounded-full flex items-center justify-center transition-all ${
                      isPad 
                        ? `w-14 h-6 border-2 border-dashed ${isCurrent ? 'border-amber-400 bg-amber-400/20 scale-105 shadow-[0_0_12px_#fbbf24]' : 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]'}`
                        : `w-10 h-4 border ${isCurrent ? 'border-indigo-400 bg-indigo-500/20 scale-105 shadow-[0_0_8px_#818cf8]' : 'border-slate-700/50 bg-slate-800/10'}`
                    }`} />
                    <span className="text-[8px] font-bold font-mono text-slate-500 tracking-wider mt-0.5 select-none">
                      {isPad ? "🔌 CARGER" : `CELL ${fx},${fy}`}
                    </span>
                  </div>
                );
              })
            )}

            {/* FULL-BODY HTML & CSS ROBOT COMPONENT - Moves with lovely precision and perspective scaled depths! */}
            <div 
              style={{ 
                left: currentCoords.left, 
                top: currentCoords.top,
                transform: `translate(-50%, -75%) scale(${currentCoords.scale})`,
                zIndex: currentCoords.zIndex
              }}
              className="absolute transition-all duration-500 ease-out flex flex-col items-center pointer-events-none select-none"
            >
              <div className={`relative flex flex-col items-center transition-transform duration-300 ${
                robotState === 'dancing' ? 'rotate-6 translate-y-[-8px]' :
                robotState === 'beeping' ? '-rotate-6' :
                robotState === 'charging' ? 'animate-bounce' : ''
              } ${lastDirection === 'LEFT' ? '-skew-x-6' : lastDirection === 'RIGHT' ? 'skew-x-6' : ''}`}>
                
                {/* Antenna */}
                <div className="relative flex flex-col items-center h-5">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-slate-900 transition-colors duration-300 ${
                    robotState === 'charging' ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse' :
                    robotState === 'beeping' ? 'bg-pink-500 shadow-[0_0_10px_#ec4899] animate-ping' :
                    'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  }`} />
                  <div className="w-1.5 h-3 bg-slate-500" />
                </div>

                {/* Head with blinking screen eyes */}
                <div className="w-16 h-12 bg-slate-300 border-2 border-slate-500 rounded-2xl relative flex items-center justify-center shadow-md">
                  {/* Left Ears bolt */}
                  <div className="absolute -left-2 w-2 h-4 bg-slate-500 rounded-l-md border-y border-slate-600" />
                  {/* Right Ears bolt */}
                  <div className="absolute -right-2 w-2 h-4 bg-slate-500 rounded-r-md border-y border-slate-600" />
                  
                  {/* Digital screen eyes */}
                  <div className="flex gap-2.5 bg-slate-950 p-1 px-1.5 rounded-xl border border-slate-400">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        robotState === 'charging' ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' :
                        robotState === 'beeping' ? 'bg-pink-400 shadow-[0_0_4px_#f472b6]' :
                        battery <= 20 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400 shadow-[0_0_4px_#22d3ee]'
                      } ${robotState === 'dancing' ? 'scale-y-[0.3]' : 'scale-100'}`} />
                    </div>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        robotState === 'charging' ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]' :
                        robotState === 'beeping' ? 'bg-pink-400 shadow-[0_0_4px_#f472b6]' :
                        battery <= 20 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400 shadow-[0_0_4px_#22d3ee]'
                      } ${robotState === 'dancing' ? 'scale-y-[0.3]' : 'scale-100'}`} />
                    </div>
                  </div>

                  {/* Mouth Line indicator */}
                  <div className="absolute bottom-1 w-7 h-1.5 bg-slate-950 rounded-full overflow-hidden flex justify-center items-center p-0.5">
                    <div className={`h-0.5 rounded-full bg-cyan-400 transition-all ${
                      robotState === 'beeping' ? 'w-full animate-pulse bg-pink-400' :
                      robotState === 'charging' ? 'w-4 bg-amber-400' : 'w-2.5'
                    }`} />
                  </div>
                </div>

                {/* Neck slot */}
                <div className="w-4.5 h-2 bg-slate-400 border-x-2 border-slate-500" />

                {/* Body / Chest Console Unit */}
                <div className="w-20 h-16 bg-slate-400 border-2 border-slate-500 rounded-3xl relative flex flex-col items-center p-1.5 shadow-lg">
                  {/* Left metal arm with clamp */}
                  <div className={`absolute -left-4.5 top-1.5 w-4 h-10 origin-top transition-transform duration-300 ${
                    robotState === 'dancing' ? '-rotate-45' :
                    robotState === 'beeping' ? 'rotate-12 translate-y-[-2px]' : '-rotate-12'
                  }`}>
                    <div className="w-2 h-7 bg-slate-300 border border-slate-500 rounded-full" />
                    <div className="w-3.5 h-3 bg-slate-500 rounded-md -mt-1.5 border border-slate-600 flex justify-center items-center text-[7px] text-white">C</div>
                  </div>

                  {/* Right metal arm with clamp */}
                  <div className={`absolute -right-4.5 top-1.5 w-4 h-10 origin-top transition-transform duration-300 ${
                    robotState === 'dancing' ? 'rotate-45' :
                    robotState === 'beeping' ? '-rotate-12 translate-y-[-2px]' : 'rotate-12'
                  }`}>
                    <div className="w-2 h-7 bg-slate-300 border border-slate-500 rounded-full" />
                    <div className="w-3.5 h-3 bg-slate-500 rounded-md -mt-1.5 border border-slate-600 flex justify-center items-center text-[7px] text-white">C</div>
                  </div>

                  {/* Glowing Meter Console screen */}
                  <div className="w-full h-8 bg-slate-950 border border-slate-500 rounded-xl flex flex-col items-center justify-center p-0.5 font-mono text-[7px] overflow-hidden text-emerald-400 leading-none">
                    {robotState === 'charging' ? (
                      <span className="text-amber-400 animate-pulse tracking-wide font-black">🔌 RECHARGE</span>
                    ) : battery <= 20 ? (
                      <span className="text-rose-500 animate-flash text-[6px] font-black">⚠️ Battery Low</span>
                    ) : (
                      <>
                        <div className="flex gap-1 mb-0.5 scale-90">
                          <span className={`w-1 h-1 rounded-full ${robotState === 'dancing' ? 'bg-pink-500' : 'bg-emerald-500 animate-pulse'}`} />
                          <span className="w-1.5 h-0.5 bg-indigo-500" />
                          <span className="w-1.5 h-0.5 bg-yellow-500 animate-pulse" />
                        </div>
                        <span className="text-[6px] text-slate-400">POS: {gridPos.x},{gridPos.y}</span>
                      </>
                    )}
                  </div>

                  {/* Little colorful dashboard status bolts */}
                  <div className="flex gap-1.5 mt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full border border-slate-500 ${robotState === 'charging' ? 'bg-amber-400 animate-ping' : 'bg-rose-500 animate-pulse'}`} />
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-500 bg-cyan-400" />
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-500 bg-emerald-400" />
                  </div>
                </div>

                {/* Base Engine Frame & Wheels */}
                <div className="w-14 h-5 bg-slate-500 rounded-b-xl border-t-2 border-slate-600 flex justify-around items-end px-1 shadow-inner relative">
                  {/* Wheel left */}
                  <div className={`w-4.5 h-4.5 rounded-full bg-slate-900 border border-slate-500 flex items-center justify-center ${
                    robotState === 'dancing' ? 'animate-spin' : ''
                  }`}>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  </div>
                  {/* Wheel right */}
                  <div className={`w-4.5 h-4.5 rounded-full bg-slate-900 border border-slate-500 flex items-center justify-center ${
                    robotState === 'dancing' ? 'animate-spin' : ''
                  }`}>
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-indigo-950 p-2.5 rounded-2xl font-mono text-[9px] text-indigo-300 min-h-[48px] z-10 max-h-[70px] overflow-y-auto mt-auto">
            <span className="text-indigo-500 font-bold">&gt;_ TERMINAL:</span> {robotLog}
          </div>
        </div>

        {/* Interactive Controls Side */}
        <div className="w-full lg:w-[320px] flex flex-col justify-between gap-4">
          
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">⚡ Quick Commands</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={triggerRecharge}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[10px] py-2 rounded-xl border border-amber-400 cursor-pointer transition transform hover:-translate-y-0.5 shadow-md active:scale-95"
              >
                🔌 PLUG RECHARGE
              </button>
              <button 
                type="button"
                onClick={triggerBeep}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-[10px] py-2 rounded-xl border border-indigo-400 cursor-pointer transition transform hover:-translate-y-0.5 shadow-md active:scale-95"
              >
                🎵 BEEP MELODY
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-xs font-bold text-slate-300">🎮 Laboratory Direction Wheels</span>
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest font-mono">BATTERY: 10% / move</span>
            </div>

            <div className="flex flex-col gap-2.5 items-center justify-center">
              {/* Direction controls with proper literal labelling forward, backward, left, right */}
              <button 
                type="button"
                onClick={(e) => moveRobot('UP', e)}
                className="w-24 px-2 py-1.5 flex items-center justify-center gap-1 border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold rounded-xl text-xs cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-md"
                title="Move Forward"
              >
                ⬆️ FORWARD
              </button>
              
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={(e) => moveRobot('LEFT', e)}
                  className="w-24 px-2 py-1.5 flex items-center justify-center gap-1 border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold rounded-xl text-xs cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-md"
                  title="Move Left"
                >
                  ⬅️ LEFT
                </button>
                <button 
                  type="button"
                  onClick={(e) => moveRobot('RIGHT', e)}
                  className="w-24 px-2 py-1.5 flex items-center justify-center gap-1 border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold rounded-xl text-xs cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-md"
                  title="Move Right"
                >
                  RIGHT ➡️
                </button>
              </div>

              <button 
                type="button"
                onClick={(e) => moveRobot('DOWN', e)}
                className="w-24 px-2 py-1.5 flex items-center justify-center gap-1 border-2 border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold rounded-xl text-xs cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-md"
                title="Move Backward"
              >
                ⬇️ BACKWARD
              </button>
            </div>
            
            <p className="text-[9px] text-slate-400 font-medium text-center leading-normal border-t border-slate-800 pt-1.5">
              Every step drains 10% battery energy. Step onto the <span className="text-amber-400 font-bold">🔌 Charger Pad (1,0)</span> at back top middle to fill energy up instantly!
            </p>
          </div>

        </div>
      </div>
      
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">
        💡 Click on Step 1 or 2 first to learn from the AI Guide, then try the robot simulator!
      </p>
    </div>
  );
}

function ArrowMazeConceptGuide({
  speakText,
  stepProgress = 0,
  onStepProgress
}: {
  speakText: (t: string) => void;
  stepProgress?: number;
  onStepProgress?: (p: number) => void;
}) {
  const [internalProgress, setInternalProgress] = useState(stepProgress);
  const progress = onStepProgress ? stepProgress : internalProgress;
  
  const handleProgressChange = (newProgress: number) => {
    setInternalProgress(newProgress);
    if (onStepProgress) onStepProgress(newProgress);
  };

  const [bunnyPos, setBunnyPos] = useState({ x: 0, y: 0 });

  const steps = [
    {
      id: 0,
      title: "Right",
      text: "Arrow Right means GO RIGHT until you hit a wall",
      targetPos: { x: 3, y: 0 },
      renderItem: () => (
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-indigo-600 font-extrabold text-2xl">➡️</span>
          <span className="text-[9px] font-black text-slate-500 mt-1">GO RIGHT</span>
        </div>
      )
    },
    {
      id: 1,
      title: "Down",
      text: "Arrow Down means GO DOWN until you hit a wall",
      targetPos: { x: 3, y: 2 },
      renderItem: () => (
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-indigo-600 font-extrabold text-2xl">⬇️</span>
          <span className="text-[9px] font-black text-slate-500 mt-1">GO DOWN</span>
        </div>
      )
    },
    {
      id: 2,
      title: "Left",
      text: "Arrow Left means GO LEFT until you hit a wall",
      targetPos: { x: 1, y: 2 },
      renderItem: () => (
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-indigo-600 font-extrabold text-2xl">⬅️</span>
          <span className="text-[9px] font-black text-slate-500 mt-1">GO LEFT</span>
        </div>
      )
    },
    {
      id: 3,
      title: "Down",
      text: "Arrow Down means GO DOWN until you hit a wall",
      targetPos: { x: 1, y: 4 },
      renderItem: () => (
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-indigo-600 font-extrabold text-2xl">⬇️</span>
          <span className="text-[9px] font-black text-slate-500 mt-1">GO DOWN</span>
        </div>
      )
    }
  ];

  const playChime = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.log(e);
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
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleTourClick = (stepId: number) => {
    if (stepId <= progress) {
      playChime();
      speakText(steps[stepId].text);
      setBunnyPos(steps[stepId].targetPos);
      if (stepId === progress && progress < steps.length) {
         handleProgressChange(progress + 1);
      }
    } else {
      playBoop();
      speakText("Oops! Please click the glowing item first to learn step by step.");
    }
  };

  const getContainerClass = (stepId: number) => {
    const base = "p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer relative";
    if (stepId === progress) {
      return `${base} bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 border-2 border-indigo-400 z-10`;
    } else if (stepId < progress) {
      return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-emerald-400`;
    } else {
      return `${base} bg-slate-50 opacity-50 grayscale hover:scale-100 border-2 border-slate-200 cursor-not-allowed`;
    }
  };

  // 5x5 Grid Maze visualizer match R-T1-W5 exact Sandbox Layout
  const grid = [
    ['empty', 'empty', 'empty', 'empty', 'wall'],
    ['wall',  'wall',  'wall',  'empty', 'wall'],
    ['wall',  'empty', 'empty', 'empty', 'wall'],
    ['wall',  'empty', 'wall',  'wall',  'wall'],
    ['wall',  'target','wall',  'wall',  'wall']
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center w-full">
      <div className="flex-1 w-full space-y-4">
        <div className="text-center md:text-left">
          <p className="text-sm font-bold text-indigo-700 uppercase tracking-widest leading-none">Command Block Paths</p>
          <p className="text-base font-black text-slate-800 tracking-tight">Move continuously until stopped by a wall:</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {steps.map((step) => (
            <div key={step.id} onClick={() => handleTourClick(step.id)} className={getContainerClass(step.id)}>
               {step.renderItem()}
            </div>
          ))}
        </div>
      </div>
      
      {/* Maze Guide */}
      <div className="w-full md:w-auto flex flex-col items-center gap-2">
        <div className="bg-slate-800 p-4 rounded-3xl shadow-xl border-4 border-slate-700 select-none">
          <div className="grid grid-cols-5 gap-1 bg-slate-900 border-4 border-slate-900 rounded-xl overflow-hidden relative">
            {grid.map((row, y) => row.map((cell, x) => (
               <div key={`${x}-${y}`} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${cell === 'wall' ? 'bg-stone-500 border-t-4 border-stone-400 shadow-inner' : cell === 'target' ? 'bg-emerald-950 border-2 border-emerald-400 shadow-lg' : 'bg-slate-700 shadow-sm'}`}>
                  {cell === 'target' && <span className="text-xl sm:text-2xl drop-shadow-md">🥕</span>}
               </div>
            )))}
            
            <div 
              className="absolute w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-[1500ms] ease-in-out z-10"
              style={{ transform: `translate(calc(${bunnyPos.x} * 100% + ${bunnyPos.x * 0.25}rem), calc(${bunnyPos.y} * 100% + ${bunnyPos.y * 0.25}rem))` }}
            >
              <div className="text-2xl sm:text-3xl filter drop-shadow-md transition-transform hover:scale-110 active:scale-95 cursor-default relative">
                🐰
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-slate-100 px-3 py-1 rounded-full">
          Live Sandbox Viewer
        </p>
      </div>
    </div>
  );
}

interface LessonConceptExplainerProps {
  lesson: Lesson;
  speakText: (text: string, onBoundary?: any, onEnd?: () => void) => void;
  onComplete?: (score?: number, total?: number) => void;
  isCompleted?: boolean;
  isUnlocked?: boolean;
}

export function RT1W6SandboxActivity({ speakText, onComplete }: { speakText: (t: string) => void; onComplete?: (stars: number) => void }) {
  const GRID_SIZE = 4;

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
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) { console.log(e); }
    }
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) { console.log(e); }
    }
  };

  const [level, setLevel] = useState<1 | 2>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [botPos, setBotPos] = useState({ x: 0, y: 3 });
  const [isAnimating, setIsAnimating] = useState(false);

  const levels = {
    1: {
      startPos: { x: 0, y: 3 },
      bottlePos: { x: 3, y: 0 },
      rocks: [] as { x: number, y: number }[],
      options: [
        { id: 0, label: "Set 1", emoji: "➡️ ⬆️", isCorrect: true, commands: ['RIGHT', 'UP'] },
        { id: 1, label: "Set 2", emoji: "➡️ ⬇️", isCorrect: false, commands: ['RIGHT', 'DOWN'] },
        { id: 2, label: "Set 3", emoji: "⬇️ ➡️", isCorrect: false, commands: ['DOWN', 'RIGHT'] }
      ]
    },
    2: {
      startPos: { x: 0, y: 0 },
      bottlePos: { x: 2, y: 3 },
      rocks: [{ x: 3, y: 0 }],
      options: [
        { id: 0, label: "Set 1", emoji: "⬇️ ➡️", isCorrect: false, commands: ['DOWN', 'RIGHT'] },
        { id: 1, label: "Set 2", emoji: "➡️ ⬇️", isCorrect: true, commands: ['RIGHT', 'DOWN'] },
        { id: 2, label: "Set 3", emoji: "➡️ ⬆️", isCorrect: false, commands: ['RIGHT', 'UP'] }
      ]
    }
  };

  const currentLevel = levels[level];

  useEffect(() => {
    setSelectedOption(null);
    setBotPos(levels[level].startPos);
    setIsAnimating(false);
    
    // Level 1 initial speech is handled centrally by GradeR1Workbook
    if (level === 2) {
      speakText("Welcome to Level 2! This time there is a rock blocking the way! Which set of instructions will safely guide Baby Bot to the milk bottle without hitting the rock?");
    }
  }, [level]);

  const handleSelect = (optionIdx: number) => {
    if (isAnimating) return;
    if (selectedOption !== null && currentLevel.options[selectedOption].isCorrect) return; // already solved

    setSelectedOption(optionIdx);
    setIsAnimating(true);
    
    const option = currentLevel.options[optionIdx];
    const isCorrect = option.isCorrect;
    
    let currentPos = { ...currentLevel.startPos };
    setBotPos(currentPos);
    
    let cmdIndex = 0;
    
    const runNextCommand = () => {
      if (cmdIndex >= option.commands.length) {
        setIsAnimating(false);
        if (isCorrect) {
          playChime();
          if (level === 1) {
            speakText("Excellent! Baby Bot reached the milk bottle. Now let's try Level 2!", undefined, () => {
              setTimeout(() => {
                setLevel(2);
              }, 1500);
            });
          } else {
            speakText("Incredible! You completed Level 2! Baby Bot avoided the rock and found the bottle.", undefined, () => {
              if (onComplete) onComplete(3);
            });
          }
        } else {
          playBoop();
          speakText("Oh no, Baby Bot didn't reach the bottle! Try another set of instructions.", undefined, () => {
             setTimeout(() => {
               setSelectedOption(null);
               setBotPos(currentLevel.startPos);
             }, 1000);
          });
        }
        return;
      }
      
      const cmd = option.commands[cmdIndex];
      let cmdSpeech = "";
      if (cmd === 'UP') cmdSpeech = 'Go Up!';
      else if (cmd === 'DOWN') cmdSpeech = 'Go Down!';
      else if (cmd === 'LEFT') cmdSpeech = 'Go Left!';
      else if (cmd === 'RIGHT') cmdSpeech = 'Go Right!';

      speakText(cmdSpeech, undefined, () => {
         const moveOneTile = () => {
           let nextX = currentPos.x;
           let nextY = currentPos.y;
           if (cmd === 'UP') nextY--;
           if (cmd === 'DOWN') nextY++;
           if (cmd === 'LEFT') nextX--;
           if (cmd === 'RIGHT') nextX++;

           const isOutOfBounds = nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE;
           const isRock = currentLevel.rocks.some(r => r.x === nextX && r.y === nextY);

           if (isOutOfBounds || isRock) {
             cmdIndex++;
             setTimeout(runNextCommand, 600);
           } else {
             currentPos = { x: nextX, y: nextY };
             setBotPos(currentPos);
             setTimeout(moveOneTile, 600);
           }
         };
         moveOneTile();
      });
    };
    
    runNextCommand();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto py-4">
      <div className="text-center">
        <p className="text-sm font-bold text-indigo-700 uppercase tracking-widest leading-none mb-2">Level {level}</p>
        <p className="text-base font-black text-slate-800 tracking-tight">Which set of instructions gets Baby Bot to the milk bottle?</p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 border-4 border-slate-800 relative overflow-hidden shadow-2xl mx-auto">
        {/* Grid Area */}
        <div className="grid grid-cols-4 gap-2 w-[240px] h-[240px] relative">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isRock = currentLevel.rocks.find(r => r.x === x && r.y === y);
            const isBottle = x === currentLevel.bottlePos.x && y === currentLevel.bottlePos.y;
            const isStart = x === currentLevel.startPos.x && y === currentLevel.startPos.y;
            
            return (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-inner w-[54px] h-[54px]">
                {isRock && <span className="text-3xl z-10">🪨</span>}
                {isBottle && <span className="text-3xl z-10 animate-pulse">🍼</span>}
                {isStart && (
                  <span className="text-[9px] uppercase font-black text-slate-500 absolute bottom-0.5">Start</span>
                )}
              </div>
            );
          })}
          
          {/* Animated Baby Bot */}
          <div 
            className="absolute w-[54px] h-[54px] flex items-center justify-center transition-all duration-500 ease-in-out z-20"
            style={{ 
              transform: `translate(calc(${botPos.x} * 100% + ${botPos.x * 0.5}rem), calc(${botPos.y} * 100% + ${botPos.y * 0.5}rem))` 
            }}
          >
            <span className="text-4xl filter drop-shadow-md">🤖</span>
          </div>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-3 gap-3">
        {currentLevel.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = isSelected && opt.isCorrect && !isAnimating;
          const isWrong = isSelected && !opt.isCorrect && !isAnimating;
          
          let btnClass = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md";
          
          if (isSelected && isAnimating) {
             btnClass = "bg-indigo-100 border-indigo-400 text-indigo-800 ring-2 ring-indigo-300 animate-pulse";
          } else if (isCorrect) {
            btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400 scale-105 shadow-lg";
          } else if (isWrong) {
            btnClass = "bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-300 animate-shake";
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(idx)}
              disabled={isAnimating || (selectedOption !== null && currentLevel.options[selectedOption].isCorrect)}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${btnClass}`}
            >
              <span className="text-xs font-bold uppercase opacity-60">{opt.label}</span>
              <span className="text-2xl tracking-widest">{opt.emoji}</span>
              {isCorrect && <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">✓</span>}
              {isWrong && <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BabyBotCodeCards({
  speakText,
  stepProgress = 0,
  onStepProgress
}: {
  speakText: (text: string, onBoundary?: any, onEnd?: () => void) => void;
  stepProgress?: number;
  onStepProgress?: (p: number) => void;
}) {
  const [internalProgress, setInternalProgress] = useState(stepProgress);
  const progress = onStepProgress ? stepProgress : internalProgress;
  
  const handleProgressChange = (newProgress: number) => {
    setInternalProgress(newProgress);
    if (onStepProgress && newProgress > stepProgress) {
      onStepProgress(newProgress);
    }
  };

  const GRID_SIZE = 4;
  const START_POS = { x: 0, y: 3 };
  const BOTTLE_POS = { x: 3, y: 0 };

  type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  type RunState = 'idle' | 'running' | 'success' | 'failure';

  const [botPos, setBotPos] = useState(START_POS);
  const [runState, setRunState] = useState<RunState>('idle');
  const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
  const [currentCmdIndex, setCurrentCmdIndex] = useState<number>(-1);
  const [testedSets, setTestedSets] = useState<number[]>([]);

  const instructionSets: { id: number, commands: Direction[], label: string }[] = [
    { id: 0, commands: ['RIGHT', 'UP'], label: "Set 1: ➡️ ⬆️" },
    { id: 1, commands: ['RIGHT', 'DOWN'], label: "Set 2: ➡️ ⬇️" },
    { id: 2, commands: ['UP', 'RIGHT'], label: "Set 3: ⬆️ ➡️" }
  ];

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

  const handlePlaySet = (setIdx: number) => {
    const isSet1Next = !testedSets.includes(0);
    const isSet2Next = testedSets.includes(0) && !testedSets.includes(1);
    const isSet3Next = testedSets.includes(0) && testedSets.includes(1) && !testedSets.includes(2);
    const isSelectableGlow = (setIdx === 0 && isSet1Next) || (setIdx === 1 && isSet2Next) || (setIdx === 2 && isSet3Next);
    const isCompleted = testedSets.includes(setIdx);

    if (isSelectableGlow || isCompleted) {
      playSet(setIdx);
    } else {
      playBoop();
      speakText("Oops! Please click the glowing item first to learn step by step.");
    }
  };

  const playSet = (setIdx: number) => {
    if (runState === 'running' || runState === 'success') return;
    const set = instructionSets[setIdx];
    setActiveSetIndex(setIdx);
    setRunState('running');
    setBotPos(START_POS);
    setCurrentCmdIndex(-1);

    if (!testedSets.includes(setIdx)) {
      setTestedSets([...testedSets, setIdx]);
    }
    
    let currentPos = START_POS;
    let step = 0;

    const speakLocal = (text: string, onEnd: () => void) => {
      speakText(text, undefined, onEnd);
    };
    
    let startSpeechText = "";
    if (setIdx === 0) {
      startSpeechText = "An instruction card has more than one arrow code on it. That means one instruction card can tell Baby Bot to follow a small group of steps. For example, this instruction card shows: right, up. This means Baby Bot must first move right, then move up. Let’s test Set 1 and see if this instruction card helps Baby Bot reach the milk bottle.";
    } else if (setIdx === 1) {
      startSpeechText = "Let’s test Set 2 and see if this instruction card helps Baby Bot reach the milk bottle.";
    } else {
      startSpeechText = "Let’s test Set 3 and see if this instruction card helps Baby Bot reach the milk bottle.";
    }
    handleProgressChange(1);

    speakLocal(startSpeechText, () => {
      const runNext = () => {
        if (step >= set.commands.length) {
          setTimeout(() => {
            const isCorrectSet = setIdx === 0 || setIdx === 2; // Set 1 and Set 3 are correct!
            if (isCorrectSet && currentPos.x === BOTTLE_POS.x && currentPos.y === BOTTLE_POS.y) {
              setRunState('success');
              if (setIdx === 0) {
                speakText(
                  "Excellent! Baby Bot reached the milk bottle using Set 1. This instruction card is correct because the arrow codes tell Baby Bot to move right first and then move up. You are great coders! Let’s check if the other instruction cards also help Baby Bot reach the bottle.",
                  undefined,
                  () => {
                    handleProgressChange(2);
                    setTimeout(() => {
                      setRunState('idle');
                      setBotPos(START_POS);
                      setActiveSetIndex(null);
                      setCurrentCmdIndex(-1);
                    }, 1500);
                  }
                );
              } else {
                speakText(
                  "Excellent! Baby Bot reached the milk bottle using Set 3. This instruction card is also correct. This teaches us that more than one instruction card can be correct. Set 1 and Set 3 both guide Baby Bot to the same milk bottle, but the arrow codes are in a different order. Now that we understand what instruction cards do, let's practice!",
                  undefined,
                  () => {
                    handleProgressChange(3);
                    setTimeout(() => {
                      setRunState('idle');
                      setBotPos(START_POS);
                      setActiveSetIndex(null);
                      setCurrentCmdIndex(-1);
                    }, 1500);
                  }
                );
              }
            } else {
              setRunState('failure');
              if (setIdx === 1) {
                speakText(
                  "Oh no! Baby Bot did not reach the milk bottle. This instruction card is incorrect because the down arrow code takes Baby Bot in the wrong direction. That’s okay — coders test their instructions and learn from mistakes. Let’s test Set 3 next.",
                  undefined,
                  () => {
                    setTimeout(() => {
                      setRunState('idle');
                      setBotPos(START_POS);
                      setActiveSetIndex(null);
                      setCurrentCmdIndex(-1);
                    }, 500);
                  }
                );
              } else {
                speakText(
                  "Oh no, Baby Bot didn't reach the bottle! Try another set of instructions.",
                  undefined,
                  () => {
                    setTimeout(() => {
                      setRunState('idle');
                      setBotPos(START_POS);
                      setActiveSetIndex(null);
                      setCurrentCmdIndex(-1);
                    }, 500);
                  }
                );
              }
            }
          }, 1000);
          return;
        }
        
        setCurrentCmdIndex(step);
        const cmd = set.commands[step];
        
        let cmdSpeech = "";
        if (cmd === 'UP') cmdSpeech = 'Go Up!';
        else if (cmd === 'DOWN') cmdSpeech = 'Go Down!';
        else if (cmd === 'LEFT') cmdSpeech = 'Go Left!';
        else if (cmd === 'RIGHT') cmdSpeech = 'Go Right!';

        speakLocal(cmdSpeech, () => {
          let tempPos = { ...currentPos };
          
          const moveOneTile = () => {
            let nextX = tempPos.x;
            let nextY = tempPos.y;
            if (cmd === 'UP') nextY--;
            if (cmd === 'DOWN') nextY++;
            if (cmd === 'LEFT') nextX--;
            if (cmd === 'RIGHT') nextX++;

            const isOutOfBounds = nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE;
            
            if (isOutOfBounds) {
              currentPos = tempPos;
              step++;
              setTimeout(runNext, 1000);
            } else {
              tempPos = { x: nextX, y: nextY };
              setBotPos(tempPos);
              setTimeout(moveOneTile, 1000);
            }
          };

          moveOneTile();
        });
      };

      runNext();
    });
  };

  const mapDirectionToArrow = (dir: Direction) => {
    switch(dir) {
      case 'UP': return '⬆️';
      case 'DOWN': return '⬇️';
      case 'LEFT': return '⬅️';
      case 'RIGHT': return '➡️';
    }
  };

  return (
    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 md:p-6 min-h-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-indigo-500 text-white rounded-xl shadow-sm">🤖</span>
        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Robot Code Cards Sandbox</h4>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
        <div className="bg-slate-900 rounded-2xl p-4 border-2 border-slate-700 relative overflow-hidden shadow-xl">

        
        {/* Grid Area */}
        <div className="grid grid-cols-4 gap-2 mb-4 mx-auto max-w-[280px]">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isBottle = x === BOTTLE_POS.x && y === BOTTLE_POS.y;
            const isBot = x === botPos.x && y === botPos.y;
            
            return (
              <div key={i} className="aspect-square bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-inner">
                {isBottle && !isBot && <span className="text-2xl z-10 animate-pulse">🍼</span>}
                {isBottle && isBot && runState === 'success' && (
                  <span className="text-3xl z-10 animate-bounce">💖🍼</span>
                )}
                {isBot && runState !== 'success' && (
                  <span className="text-3xl z-20 transition-all duration-300 transform scale-110">🤖</span>
                )}
                {x === START_POS.x && y === START_POS.y && !isBot && (
                  <span className="text-[10px] uppercase font-black text-slate-600 absolute bottom-1">Start</span>
                )}
              </div>
            );
          })}
        </div>

        {runState === 'success' && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-2 rounded-xl text-center font-bold text-sm mb-4 animate-pulse">
            Correct Instructions! Bottle Found!
          </div>
        )}
        {runState === 'failure' && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-2 rounded-xl text-center font-bold text-sm mb-4">
            Missed! Try a different set of instructions.
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {instructionSets.map((set, idx) => {
            const isActive = activeSetIndex === idx;
            const isSuccess = isActive && runState === 'success';
            const isFailure = isActive && runState === 'failure';
            const isRunning = isActive && runState === 'running';

            const isSet1Next = !testedSets.includes(0);
            const isSet2Next = testedSets.includes(0) && !testedSets.includes(1);
            const isSet3Next = testedSets.includes(0) && testedSets.includes(1) && !testedSets.includes(2);
            const isSelectableGlow = runState === 'idle' && (
              (idx === 0 && isSet1Next) ||
              (idx === 1 && isSet2Next) ||
              (idx === 2 && isSet3Next)
            );
            
            const isCompleted = testedSets.includes(idx);
            
            let btnClass = '';
            if (isActive) {
              if (isSuccess) {
                btnClass = 'bg-emerald-600 border-emerald-800 text-white shadow-[0_0_20px_#10b981] ring-4 ring-emerald-400 scale-105 animate-bounce z-10';
              } else if (isFailure) {
                btnClass = 'bg-rose-600 border-rose-800 text-white shadow-[0_0_20px_#f43f5e] ring-4 ring-rose-400 scale-105 z-10';
              } else if (isRunning) {
                btnClass = 'bg-indigo-600 border-indigo-800 text-white shadow-[0_0_25px_#6366f1] ring-4 ring-indigo-400 scale-105 animate-pulse z-10';
              } else {
                btnClass = 'bg-indigo-600 border-indigo-800 text-white shadow-[0_0_15px_#6366f1] ring-4 ring-indigo-400 z-10';
              }
            } else if (isSelectableGlow) {
              btnClass = 'bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 border-2 border-indigo-400 z-10 relative text-slate-800';
            } else if (isCompleted) {
              btnClass = 'bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-emerald-400 text-slate-800';
            } else {
              btnClass = 'bg-slate-50 opacity-50 grayscale hover:scale-100 border-2 border-slate-200 cursor-not-allowed text-slate-800';
            }

            return (
              <button
                key={set.id}
                onClick={() => handlePlaySet(idx)}
                disabled={runState === 'running' || runState === 'success'}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-b-4 transition-all duration-300 ${btnClass} ${(runState === 'running' && !isActive) ? 'opacity-40 cursor-not-allowed scale-95' : ''}`}
              >
                <span className="text-[10px] font-black uppercase mb-1 whitespace-nowrap">{set.label.split(':')[0]}</span>
                <div className="flex gap-1 text-sm bg-black/10 rounded-lg p-1">
                  {set.commands.map((cmd, i) => (
                    <span 
                      key={i} 
                      className={`transition-all ${isActive && currentCmdIndex === i ? 'scale-125 bg-yellow-300 text-slate-950 font-black rounded px-1 filter brightness-110 animate-pulse shadow-[0_0_10px_#fde047]' : ''}`}
                    >
                      {mapDirectionToArrow(cmd)}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase text-center mt-1">
        💡 Click the code cards to test them! They move until finding a wall.
      </p>
      </div>
    </div>
  );
}

function AnimatedTerm1RecapExplorer({ speakText, onComplete }: { speakText: (t: string, b?: any, end?: () => void) => void; onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const slides = [
    {
      text: "First, we learned how to keep our devices clean, safe, and happy!",
      emoji: (
        <div className="flex items-center justify-center gap-4">
          <motion.span animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">📱</motion.span>
          <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">✨</motion.span>
          <motion.span animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl">🧼</motion.span>
        </div>
      ),
      title: "Device Safety",
      bgColor: "bg-sky-100",
      textColor: "text-sky-700"
    },
    {
      text: "Next, we learned about repeating patterns with colors and shapes!",
      emoji: (
        <div className="flex gap-2">
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="text-5xl">🔴</motion.span>
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="text-5xl">🔵</motion.span>
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="text-5xl">🔴</motion.span>
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.9 }} className="text-5xl">🔵</motion.span>
        </div>
      ),
      title: "Repeating Patterns",
      bgColor: "bg-rose-100",
      textColor: "text-rose-700"
    },
    {
      text: "Then, we explored different devices like computers, smartphones, and microwaves around the world!",
      emoji: (
        <div className="flex items-center justify-center gap-3">
          <motion.span animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl">💻</motion.span>
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="text-6xl">🌍</motion.span>
          <motion.span animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="text-5xl">⌚</motion.span>
        </div>
      ),
      title: "Devices Around the World",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700"
    },
    {
      text: "We ordered picture stories with a beginning, middle, and an end!",
      emoji: (
        <div className="flex gap-4">
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl">🌱</motion.span>
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="text-5xl">🪴</motion.span>
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="text-5xl">🌻</motion.span>
        </div>
      ),
      title: "Picture Stories",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700"
    },
    {
      text: "We learned about direction with arrow code!",
      emoji: (
        <div className="flex items-center justify-center gap-2">
          <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-5xl">➡️</motion.span>
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} className="text-5xl">⬆️</motion.span>
          <motion.span animate={{ x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} className="text-5xl">⬅️</motion.span>
        </div>
      ),
      title: "Arrow Cards",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700"
    },
    {
      text: "We discovered what makes a machine a real robot!",
      emoji: (
        <div className="flex items-center justify-center gap-4">
          <motion.span animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl">🤖</motion.span>
          <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="text-5xl">⚙️</motion.span>
        </div>
      ),
      title: "What is a Robot?",
      bgColor: "bg-violet-100",
      textColor: "text-violet-700"
    },
    {
      text: "We programmed Baby Bot using code cards to move around the grid!",
      emoji: (
        <div className="flex items-center justify-center gap-2">
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-5xl bg-emerald-200 rounded-lg p-1">▶️</motion.span>
          <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-5xl">➡️</motion.span>
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-6xl">🐰</motion.span>
        </div>
      ),
      title: "Baby Bot Code",
      bgColor: "bg-teal-100",
      textColor: "text-teal-700"
    },
    {
      text: "We got creative and designed our own beautiful beaded bracelets!",
      emoji: (
        <div className="flex items-center justify-center gap-2">
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-5xl">💎</motion.span>
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} className="text-5xl">📿</motion.span>
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} className="text-5xl">✨</motion.span>
        </div>
      ),
      title: "Bracelet Designer",
      bgColor: "bg-pink-100",
      textColor: "text-pink-700"
    },
    {
      text: "We even made music by tapping out rhythm patterns on the drum pad!",
      emoji: (
        <div className="flex items-center justify-center gap-3">
          <motion.span animate={{ scale: [1, 1.2, 1], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-5xl">🥁</motion.span>
          <motion.span animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="text-5xl">🎵</motion.span>
          <motion.span animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="text-4xl">🎶</motion.span>
        </div>
      ),
      title: "Rhythm Patterns",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    {
      text: "You are a fully certified Term 1 Coding Star! Grab your shiny graduation badge!",
      emoji: (
        <div className="flex items-center justify-center gap-4">
          <motion.span animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">🎓</motion.span>
          <motion.span animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="text-7xl">🏆</motion.span>
          <motion.span animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} className="text-6xl">🎖️</motion.span>
        </div>
      ),
      title: "Graduation",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700"
    }
  ];

  const startRecap = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentSlide(0);
    setHasCompleted(false);

    let step = 0;
    
    const playSlide = (idx: number) => {
      setCurrentSlide(idx);
      
      const onSpeechEnd = () => {
        setTimeout(() => {
          if (idx < slides.length - 1) {
            playSlide(idx + 1);
          } else {
            setIsPlaying(false);
            setHasCompleted(true);
            onComplete();
          }
        }, 1000); // 1-second pause between slides for a natural flow
      };

      speakText(slides[idx].text, undefined, onSpeechEnd);
    };
    
    playSlide(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 relative overflow-hidden">
      {!isPlaying && !hasCompleted ? (
        <div className="text-center space-y-6">
          <div className="text-6xl animate-bounce">🎬</div>
          <div>
            <h4 className="text-xl font-black text-slate-800">Ready for the Term 1 Recap?</h4>
            <p className="text-sm font-bold text-slate-500 mt-2">Watch and listen as we review everything we've learned!</p>
          </div>
          <button
            onClick={startRecap}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <span>▶️ Start Recap Presentation</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`w-full max-w-lg p-8 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-8 ${slides[currentSlide].bgColor}`}
            >
              <h3 className={`text-2xl font-black uppercase tracking-widest ${slides[currentSlide].textColor}`}>
                {slides[currentSlide].title}
              </h3>
              
              <div className="py-6 flex items-center justify-center">
                {slides[currentSlide].emoji}
              </div>
              
              <p className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed bg-white/60 p-4 rounded-2xl backdrop-blur-sm">
                "{slides[currentSlide].text}"
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap max-w-full">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  i === currentSlide 
                    ? 'w-8 bg-indigo-600' 
                    : i < currentSlide
                      ? 'w-2.5 bg-indigo-300'
                      : 'w-2.5 bg-slate-300'
                }`} 
              />
            ))}
          </div>

          {!isPlaying && hasCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={startRecap}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold uppercase rounded-xl active:scale-95 transition-all text-xs"
              >
                🔄 Replay Recap
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonConceptExplainer({ lesson, speakText, onComplete, isCompleted, isUnlocked }: LessonConceptExplainerProps) {
  const [r1w1Progress, setR1W1Progress] = useState(0);
  const [r1w2Progress, setR1W2Progress] = useState(0);
  const [r1w3Progress, setR1W3Progress] = useState(0);
  const [r1w4Progress, setR1W4Progress] = useState(0);
  const [r1w5Progress, setR1W5Progress] = useState(0);
  const [r1w6Progress, setR1W6Progress] = useState(0);
  const [r1w7Progress, setR1W7Progress] = useState(0);
  const [r1w8Progress, setR1W8Progress] = useState(0);
  const [r1w9Progress, setR1W9Progress] = useState(0);
  const [r1w10Progress, setR1W10Progress] = useState(0);
  const [rt2w5Progress, setRt2w5Progress] = useState(0);
  const [rt3w5Progress, setRt3w5Progress] = useState(0);
  const [rt4w2Progress, setRt4w2Progress] = useState(0);
  const [rt4w5Progress, setRt4w5Progress] = useState(0);

  // Grade 1 Progress States
  const [g1t1w1Progress, setG1t1w1Progress] = useState(0);
  const [g1t1w2Progress, setG1t1w2Progress] = useState(0);
  const [g1t1w5Progress, setG1t1w5Progress] = useState(0);
  const [g1t2w5Progress, setG1t2w5Progress] = useState(0);
  const [g1t2w9Progress, setG1t2w9Progress] = useState(0);
  const [g1t3w2Progress, setG1t3w2Progress] = useState(0);
  const [g1t3w5Progress, setG1t3w5Progress] = useState(0);
  const [g1t4w2Progress, setG1t4w2Progress] = useState(0);
  const [g1t4w5Progress, setG1t4w5Progress] = useState(0);

  const [activePlayCard, setActivePlayCard] = useState<number | null>(null);
  const [activePlayIndex, setActivePlayIndex] = useState<number | null>(null);
  const r1w1TimerRef = React.useRef<any[]>([]);

  const clearR1W1Timers = () => {
    r1w1TimerRef.current.forEach(clearTimeout);
    r1w1TimerRef.current = [];
    setActivePlayCard(null);
    setActivePlayIndex(null);
  };

  useEffect(() => {
    return () => {
      r1w1TimerRef.current.forEach(clearTimeout);
    };
  }, []);
  
  // Only render for Grade R and Grade 1 lessons
  if (lesson.grade !== 'R' && lesson.grade !== '1') {
    return null;
  }

  // Define unique visuals, titles, speech narratives, and mascot poses for EACH lesson ID
  let title = "Concept Explorer Guide";
  let pose: 'waving' | 'highfive' | 'crayon_book' | 'reminder' | 'thumbsup' | 'clapping' | 'pointing_idea' | 'arms_crossed' = 'pointing_idea';
  let speechText = "Let's explore today's lessons together!";

  let voiceButtonLabel = "Read Aloud 🔊";
  let visualNode: React.ReactNode = null;

  switch (lesson.id) {
    // --- GRADE R ---
    case 'R-T1-W2':
      title = "Pattern Explorer Guide";
      pose = "pointing_idea";
      speechText = "A pattern goes over and over! Click on the glowing card first to learn!";
      
      const r1w1Steps = [
        { 
          id: 0, 
          title: "1. Repeating Patterns!", 
          text: "A pattern repeats over and over! Look at row one: Red, Yellow, Red, Yellow, Red, Yellow! And row two: Green, Blue, Green, Blue, Green, Blue! They go over and over." 
        },
        { 
          id: 1, 
          title: "2. Not a Pattern!", 
          text: "Now let's look at this row, it has no repeating rule! Look at the colors: Red, Blue, Green, Pink, Purple, Yellow! They are all mixed up. This is not a pattern! A pattern repeats again and again. Now that we understand pattern let's complete some challenges in our sandbox." 
        }
      ];

      const handleR1W1Click = (stepId: number) => {
        clearR1W1Timers();
        if (stepId <= r1w1Progress) {
          if (stepId === r1w1Progress && r1w1Progress < r1w1Steps.length) {
            setR1W1Progress(prev => prev + 1);
          }

          setActivePlayCard(stepId);
          setActivePlayIndex(null);

          if (stepId === 0) {
            const patternADelays = [4800, 5600, 6400, 7200, 8000, 8800];
            patternADelays.forEach((delay, idx) => {
              const tId = setTimeout(() => {
                setActivePlayIndex(idx);
              }, delay);
              r1w1TimerRef.current.push(tId);
            });

            const patternBDelays = [11000, 11800, 12600, 13400, 14200, 15000];
            patternBDelays.forEach((delay, idx) => {
              const tId = setTimeout(() => {
                setActivePlayIndex(idx + 6);
              }, delay);
              r1w1TimerRef.current.push(tId);
            });

            const clearId = setTimeout(() => {
              setActivePlayIndex(null);
              setActivePlayCard(null);
            }, 16000);
            r1w1TimerRef.current.push(clearId);
            
            speakText(r1w1Steps[stepId].text);
          } else if (stepId === 1) {
            const wrongDelays = [7000, 7700, 8400, 9100, 9800, 10500];
            wrongDelays.forEach((delay, idx) => {
              const tId = setTimeout(() => {
                setActivePlayIndex(idx);
              }, delay);
              r1w1TimerRef.current.push(tId);
            });

            const clearId = setTimeout(() => {
              setActivePlayIndex(null);
              setActivePlayCard(null);
            }, 20000);
            r1w1TimerRef.current.push(clearId);
            
            speakText(r1w1Steps[stepId].text);
          } else {
            speakText(r1w1Steps[stepId].text);
          }
        } else {
          speakText("Oops! Click the glowing card first.");
        }
      };

      const getR1W1Class = (stepId: number) => {
        const base = "p-4 rounded-2xl flex flex-col gap-3 transition-all cursor-pointer text-left w-full h-full relative";
        if (stepId === r1w1Progress) {
          return `${base} bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] border-2 border-indigo-400 z-10`;
        } else if (stepId < r1w1Progress) {
          return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-indigo-150 hover:border-indigo-400`;
        } else {
          return `${base} bg-slate-50 opacity-40 grayscale hover:scale-100 border-2 border-indigo-100 cursor-not-allowed`;
        }
      };

      // Helper to render responsive ball animations
      const renderBigBall = (cardId: number, idx: number, colorClass: string) => {
        const isHighlighted = activePlayCard === cardId && activePlayIndex === idx;
        
        let glowClass = "";
        if (isHighlighted) {
          let glowColor = "rgba(168, 85, 247, 0.9)";
          if (colorClass.includes('rose')) glowColor = "rgba(244, 63, 94, 0.95)";
          if (colorClass.includes('amber')) glowColor = "rgba(251, 191, 36, 0.95)";
          if (colorClass.includes('blue')) glowColor = "rgba(59, 130, 246, 0.95)";
          if (colorClass.includes('emerald')) glowColor = "rgba(16, 185, 129, 0.95)";
          if (colorClass.includes('pink')) glowColor = "rgba(236, 72, 153, 0.95)";
          if (colorClass.includes('purple')) glowColor = "rgba(168, 85, 247, 0.95)";

          glowClass = `scale-135 ring-4 ring-white shadow-[0_0_24px_${glowColor}] z-20 brightness-110`;
        }
        
        return (
          <div 
            key={idx}
            className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 ${colorClass} rounded-full shadow-md shrink-0 transition-all duration-300 ${glowClass} ${isHighlighted ? 'animate-none' : 'animate-bounce'}`}
            style={isHighlighted ? undefined : { animationDelay: `${idx * 0.15}s`, animationDuration: '2s' }}
          />
        );
      };

      const card1PatternAColors = ['bg-rose-500', 'bg-amber-400', 'bg-rose-500', 'bg-amber-400', 'bg-rose-500', 'bg-amber-400'];
      const card1PatternBColors = ['bg-emerald-500', 'bg-blue-500', 'bg-emerald-500', 'bg-blue-500', 'bg-emerald-500', 'bg-blue-500'];
      const card2WrongColors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-pink-500', 'bg-purple-500', 'bg-amber-400'];

      visualNode = (
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="space-y-4 w-full max-w-2xl mx-auto md:mx-0">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-5 w-full shadow-xs">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <span className="text-xl">🎨</span>
                <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-widest leading-none">Pattern Discovery Studio</h4>
              </div>
              <div className="flex flex-col gap-4 bg-indigo-50/20 p-2 rounded-2xl">
                {/* CARD 1 */}
                <motion.div 
                  onClick={() => handleR1W1Click(0)} 
                  className={getR1W1Class(0)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: r1w1Progress === 0 ? [1, 1.02, 1] : 1
                  }}
                  whileHover={r1w1Progress >= 0 ? { scale: r1w1Progress === 0 ? 1.03 : 1.04, y: -3 } : undefined}
                  whileTap={r1w1Progress >= 0 ? { scale: 0.98 } : undefined}
                  transition={{ 
                    y: { type: "spring", stiffness: 350, damping: 20 },
                    scale: r1w1Progress === 0 ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", stiffness: 350, damping: 20 }
                  }}
                >
                  {/* Completed star overlay */}
                  {r1w1Progress > 0 && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-md border-2 border-white z-25"
                    >
                      ✓
                    </motion.div>
                  )}
                  {r1w1Progress === 0 && (
                    <span className="absolute inset-0 rounded-2xl ring-4 ring-amber-400/50 animate-ping pointer-events-none opacity-30" />
                  )}
                  <div className="flex items-center justify-between">
                    <h5 className="text-base font-black text-slate-800 leading-tight">1. Repeating Patterns!</h5>
                    <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shrink-0">
                      💡 Idea!
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium text-slate-600 leading-relaxed">
                    A pattern repeats a rule! It goes over and over.
                  </p>
                  
                  {/* Pattern A row */}
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                      🔴 Pattern A (Red & Yellow)
                    </span>
                    <div className="flex justify-around items-center bg-indigo-50/50 p-2.5 py-3.5 rounded-xl border border-indigo-100/30 gap-1.5">
                      {card1PatternAColors.map((color, idx) => renderBigBall(0, idx, color))}
                    </div>
                  </div>

                  {/* Pattern B row */}
                  <div className="space-y-1 w-full mt-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                      🟢 Pattern B (Green & Blue)
                    </span>
                    <div className="flex justify-around items-center bg-indigo-50/50 p-2.5 py-3.5 rounded-xl border border-indigo-100/30 gap-1.5">
                      {card1PatternBColors.map((color, idx) => renderBigBall(0, idx + 6, color))}
                    </div>
                  </div>
                </motion.div>

                {/* CARD 2 */}
                <motion.div 
                  onClick={() => handleR1W1Click(1)} 
                  className={getR1W1Class(1)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: r1w1Progress >= 1 ? 1 : 0.4, 
                    y: 0,
                    scale: r1w1Progress === 1 ? [1, 1.02, 1] : 1
                  }}
                  whileHover={r1w1Progress >= 1 ? { scale: r1w1Progress === 1 ? 1.03 : 1.04, y: -3 } : undefined}
                  whileTap={r1w1Progress >= 1 ? { scale: 0.98 } : undefined}
                  transition={{ 
                    y: { type: "spring", stiffness: 350, damping: 20 },
                    scale: r1w1Progress === 1 ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { type: "spring", stiffness: 350, damping: 20 }
                  }}
                >
                  {/* Completed star overlay */}
                  {r1w1Progress > 1 && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-md border-2 border-white z-25"
                    >
                      ✓
                    </motion.div>
                  )}
                  {r1w1Progress === 1 && (
                    <span className="absolute inset-0 rounded-2xl ring-4 ring-amber-400/50 animate-ping pointer-events-none opacity-30" />
                  )}
                  <div className="flex items-center justify-between">
                    <h5 className="text-base md:text-lg font-black text-slate-800 leading-tight">2. Not a Pattern!</h5>
                    <span className="text-xs md:text-sm font-extrabold uppercase px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-100 shrink-0">
                      ⚠️ Mixed Up
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
                    This row is mixed up with no rule at all. It is NOT a pattern!
                  </p>
                  
                  <div className="space-y-1.5 w-full mt-auto">
                    <div>
                      <span className="text-xs md:text-sm font-extrabold uppercase text-rose-600">
                        ❌ Mixed Up Row (No Rule!)
                      </span>
                    </div>
                    <div className="flex justify-around items-center bg-rose-50/15 p-2.5 py-3.5 rounded-lg border border-rose-100/20 gap-1">
                      {card2WrongColors.map((color, idx) => renderBigBall(1, idx, color))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      );
      break;

    case 'R-T1-W3':
      title = "2. Device Explorer Guide Introduction";
      pose = "thumbsup";
      speechText = "As mentioned in the introduction there are different electronic devices in the world! Let's learn about them. Click on the highlighted item to continue.";
      
      const tourSteps = [
        { id: 0, title: "Computers", text: "Computers. We use them with a mouse and keyboard for learning and building things!" },
        { id: 1, title: "Smartphones", text: "Smart phone .We use them to call family, take pictures, and play games." },
        { id: 2, title: "Laptops", text: "Laptops are folding computers with a keyboard. Grown-ups use them for work and we use them for learning!" },
        { id: 3, title: "Microwaves", text: "Microwaves are machines that use invisible waves to heat up our food quickly!" },
        { id: 4, title: "Smartwatches", text: "Smartwatches are tiny computers you wear on your wrist to see the time and track your steps!" },
        { id: 5, title: "Tablets", text: "Tablets are flat touchscreen computers perfect for reading books and drawing!. There many other devices in the world that perform different other function and this are just a Few of them ,lets now click continue to practice in the sandbox" },
      ];

      const handleTourClick = (stepId: number) => {
        if (stepId <= r1w2Progress) {
          speakText(tourSteps[stepId].text);
          if (stepId === r1w2Progress && r1w2Progress < tourSteps.length) {
            setR1W2Progress(prev => prev + 1);
          }
        } else {
          speakText("Oops! Please click the glowing item first to learn step by step.");
        }
      };

      const getDeviceClass = (stepId: number) => {
        const base = "p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer relative";
        if (stepId === r1w2Progress) {
          return `${base} bg-white ring-4 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 border-2 border-indigo-400 z-10`;
        } else if (stepId < r1w2Progress) {
          return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-indigo-150 hover:border-indigo-400`;
        } else {
          return `${base} bg-slate-50 opacity-50 grayscale hover:scale-100 border-2 border-indigo-100 cursor-not-allowed`;
        }
      };

      visualNode = (
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="space-y-4 w-full max-w-lg mx-auto md:mx-0">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 w-full">
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <span className="text-xl">🌍</span>
                <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Devices Around the World</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 0, title: "Computers", desc: "Desk computers for learning", node: <ColorfulDesktop />, scale: "scale-[0.6] -ml-2" },
                  { id: 1, title: "Smartphones", desc: "Pocket computers for games", node: <ColorfulSmartphone />, scale: "scale-[0.7] -ml-1" },
                  { id: 2, title: "Laptops", desc: "Folding computers for learning", node: <ColorfulLaptop />, scale: "scale-[0.6] -ml-2" },
                  { id: 3, title: "Microwaves", desc: "Quickly heats up food", node: <ColorfulMicrowave />, scale: "scale-[0.6] -ml-2" },
                  { id: 4, title: "Smartwatches", desc: "Tiny wrist computers", node: <ColorfulSmartwatch />, scale: "scale-[0.6] -ml-2" },
                  { id: 5, title: "Tablets", desc: "Flat touchscreen computers", node: <ColorfulTablet />, scale: "scale-[0.7] -ml-1" },
                ].map((device) => {
                  const isActive = device.id === r1w2Progress;
                  const isCompleted = device.id < r1w2Progress;
                  const isLocked = device.id > r1w2Progress;

                  return (
                    <motion.div
                      key={device.id}
                      onClick={() => handleTourClick(device.id)}
                      className={getDeviceClass(device.id)}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: isLocked ? 0.5 : 1, 
                        y: 0,
                        scale: isActive ? [1, 1.02, 1] : 1
                      }}
                      whileHover={!isLocked ? { 
                        scale: isActive ? 1.03 : 1.04, 
                        y: -3, 
                        boxShadow: isActive 
                          ? "0 10px 25px -5px rgba(251, 191, 36, 0.45), 0 0 15px rgba(251, 191, 36, 0.3)"
                          : "0 10px 20px -5px rgba(0, 0, 0, 0.08)" 
                      } : undefined}
                      whileTap={!isLocked ? { scale: 0.98 } : undefined}
                      transition={{ 
                        y: { type: "spring", stiffness: 350, damping: 20 },
                        scale: isActive 
                          ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                          : { type: "spring", stiffness: 350, damping: 20 }
                      }}
                    >
                      {/* Completed checkmark badge */}
                      {isCompleted && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white z-25"
                        >
                          ✓
                        </motion.div>
                      )}

                      {/* Glowing ring */}
                      {isActive && (
                        <span className="absolute inset-0 rounded-2xl ring-4 ring-amber-400/50 animate-ping pointer-events-none opacity-30" />
                      )}

                      <div className={`w-12 h-12 flex items-center justify-center shrink-0 transform ${device.scale} origin-center`}>
                        {device.node}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-black text-slate-800 leading-tight truncate">{device.title}</h5>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words line-clamp-2">{device.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
      break;

    case 'R-T1-W4':
      title = "Picture Storyteller";
      pose = "crayon_book";
      speechText = "Every picture story has a Beginning, a Middle, and an End! Click the glowing boxes to continue.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setR1W3Progress(p)}
          titleText="Picture Story of the Apple Tree"
          subtitleText="Order matters! Follow the story to grow apples:"
          steps={[
            {
              id: 0,
              title: "Start",
              text: "Every story has a beginning. The beginning tells us what happens first. In our example, we want a tree that gives us apples for lunch. But before the tree can give us apples, we must first plant the seed",
              renderItem: () => (
                <div className="flex-1 flex flex-col items-center h-24">
                  <span className="text-[10px] font-black text-emerald-600 mb-1">Beginning<br/>(Start)</span>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 mt-1 text-center leading-tight">Plant Seeds</span>
                </div>
              )
            },
            {
              id: 1,
              title: "Next",
              text: "The middle of our story is what happens next! The seed needs water to grow big and strong into an apple tree so we keep watering it every day",
              renderItem: (isCompleted?: boolean, isActive?: boolean) => (
                <div className="flex-1 flex flex-col items-center h-24 relative overflow-hidden">
                  <span className="text-[10px] font-black text-amber-600 mb-1 z-10">Middle<br/>(Next)</span>
                  <div className="relative flex-1 flex items-center justify-center w-full">
                    <span className={`text-2xl absolute transition-all duration-1000 ${isCompleted ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>🌱🚿</span>
                    <span className={`text-[40px] absolute transition-all duration-[2000ms] ease-out ${isCompleted ? 'scale-100 opacity-100 translate-y-0 delay-700' : 'scale-0 opacity-0 translate-y-4'}`}>🌳</span>
                    {isCompleted && (
                      <div className="absolute top-0 flex justify-center gap-2">
                         <span className="text-blue-400 text-xs animate-[bounce_1s_infinite] drop-shadow-sm" style={{animationDelay: '0ms'}}>💧</span>
                         <span className="text-blue-400 text-xs animate-[bounce_1s_infinite] drop-shadow-sm" style={{animationDelay: '200ms'}}>💧</span>
                         <span className="text-blue-400 text-xs animate-[bounce_1s_infinite] drop-shadow-sm" style={{animationDelay: '400ms'}}>💧</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-800 mt-1 text-center leading-tight z-10">Water Tree</span>
                </div>
              )
            },
            {
              id: 2,
              title: "Finish",
              text: "The end tells us the final action in the story. Now we have a tree with apples. we can now pick our delicious apples and enjoy them for lunch with friends. Now that we understand the correct order of the story, let’s move to the sandbox and practise",
              renderItem: (isCompleted?: boolean, isActive?: boolean) => (
                <div className="flex-1 flex flex-col items-center h-24 relative overflow-hidden">
                  <span className="text-[10px] font-black text-purple-600 mb-1 z-10">End<br/>(Finish)</span>
                  <div className="relative flex-1 flex items-center justify-center w-full">
                    <span className={`text-[40px] absolute transition-all duration-[1000ms] ${isCompleted ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>🌳</span>
                    
                    <div className={`absolute flex items-end justify-center transition-all duration-[1000ms] ease-out ${isCompleted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                      <div className="relative">
                        <span className="text-[40px]">🌳</span>
                        {/* Apples on tree */}
                        <span className={`absolute top-1 left-1 text-sm transition-all duration-500 delay-300 ${isCompleted ? 'scale-100' : 'scale-0'}`}>🍎</span>
                        <span className={`absolute top-0 right-1 text-sm transition-all duration-500 delay-500 ${isCompleted ? 'scale-100' : 'scale-0'}`}>🍎</span>
                        <span className={`absolute top-4 left-4 text-sm transition-all duration-500 delay-700 ${isCompleted ? 'scale-100' : 'scale-0'}`}>🍎</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-800 mt-1 text-center leading-tight z-10">Pick Apples</span>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case 'R-T1-W5':
      title = "Arrow Code Navigator";
      pose = "reminder";
      speechText = "Each arrow tells Sipho Super Bunny to hop in a direction until hitting a wall. Click to trace the commands!";
      visualNode = (
        <ArrowMazeConceptGuide speakText={speakText} stepProgress={r1w4Progress} onStepProgress={(p) => setR1W4Progress(p)} />
      );
      break;

    case 'R-T1-W6':
      title = "Robot Assistant Lab";
      pose = "clapping";
      speechText = "A robot is a machine made by humans that follows our exact instructions. It does not have feelings or sleep, but performs helpful jobs very fast! Click to learn more.";
      visualNode = (
        <RobotLabConceptGuide 
          speakText={speakText} 
          stepProgress={r1w5Progress}
          onStepProgress={(newProgress) => setR1W5Progress(newProgress)}
        />
      );
      break;

    case 'R-T1-W7':
      title = "Baby Bot Code Cards";
      pose = "waving";
      speechText = "Just like we used arrow cards to guide the bunny, we can group arrow cards together to build instructions for a robot! Since there are no obstacles in our path, different sets of instructions can reach our goal. Test the sets to see which ones work!";
      visualNode = (
        <BabyBotCodeCards speakText={speakText} stepProgress={r1w6Progress} onStepProgress={(p) => setR1W6Progress(p)} />
      );
      break;

    case 'R-T1-W8':
      title = "Bracelet Design Challenge";
      pose = "pointing_idea";
      speechText = "A bracelet is a beautiful piece of jewelry we wear around our wrists! Today, you are going to design your own bracelet using a repeating color pattern with round beads. Tap to see the design you need to build!";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setR1W7Progress(p)}
          titleText="Your Bracelet Design Challenge"
          subtitleText="We will design a bracelet with an alternating color pattern."
          steps={[
            {
              id: 0,
              title: "The Alternating Color Pattern",
              text: "A bracelet is a beautiful piece of jewelry we wear around our wrists! , typically used for decorative purposes, as an accessory, or to hold charms. They come in a wide variety of styles and materials  and this  are just examples.",
              renderItem: () => {
                return (
                  <div className="flex flex-col items-center justify-center gap-4 flex-1 bg-amber-50/50 p-4 sm:p-6 rounded-xl border border-amber-100 min-h-[300px] w-full overflow-hidden">
                    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                        <Image src={braceletDesignImg1} alt="Beaded bracelets" fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                        <Image src={braceletDesignImg2} alt="Kid wearing bracelets" fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                        <Image src={braceletDesignImg3} alt="Colorful beads" fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                        <Image src={braceletDesignImg4} alt="Child making bracelet" fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    <h5 className="text-[12px] sm:text-sm font-black text-amber-850 uppercase text-center mt-2 tracking-wide shrink-0">Inspiration: Beaded Bracelets</h5>
                  </div>
                )
              }
            }
          ]}
        />
      );
      break;

    case 'R-T1-W9':
      title = "Drum Pad Rhythm Explorer";
      pose = "clapping";
      speechText = "Rhythm patterns are sound patterns that repeat over and over! We can use drums and claps to make a beat. Let's play the drum pad to hear our sequence!";
      visualNode = <DrumPadExplorer speakText={speakText} stepProgress={r1w8Progress} onStepProgress={(p) => setR1W8Progress(p)} />;
      break;

    case 'R-T1-W1':
      title = "Device Safety Guide";
      pose = "thumbsup";
      speechText = "To keep our electronic devices working perfectly, we must treat them well! Keep them away from food and water, hold them nicely, and always have clean hands. Let's learn to keep devices safe!";
      
      const safetyTourSteps = [
        { id: 0, title: "Clean Hands", text: "Wash and Dry. Clean hands keep devices working perfectly!" },
        { id: 1, title: "No Food", text: "Keep away. Keep food and drinks far away to avoid spills." },
        { id: 2, title: "Be Gentle", text: "Careful handling. Hold devices gently with two hands." },
        { id: 3, title: "Take Breaks", text: "Look away from the screen. Go outside and play to rest your eyes." },
      ];

      const handleSafetyTourClick = (stepId: number) => {
        if (stepId <= r1w9Progress) {
          speakText(safetyTourSteps[stepId].text);
          if (stepId === r1w9Progress && r1w9Progress < safetyTourSteps.length) {
            setR1W9Progress(prev => prev + 1);
          }
        } else {
          speakText("Oops! Please click the glowing item first to learn step by step.");
        }
      };

      const getSafetyGridClass = (stepId: number) => {
        const base = "p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer relative";
        if (stepId === r1w9Progress) {
          return `${base} bg-white ring-4 ring-rose-300 shadow-[0_0_20px_rgba(251,113,133,0.6)] scale-105 border-2 border-emerald-400 z-10`;
        } else if (stepId < r1w9Progress) {
          return `${base} bg-white shadow-sm hover:-translate-y-1 hover:shadow-md border-2 border-emerald-150 hover:border-emerald-400`;
        } else {
          return `${base} bg-slate-50 opacity-50 grayscale hover:scale-100 border-2 border-emerald-100 cursor-not-allowed`;
        }
      };

      visualNode = (
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="space-y-4 w-full max-w-lg mx-auto md:mx-0">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 w-full">
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <span className="text-xl">🛡️</span>
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">How to Use Devices Safely</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onClick={() => handleSafetyTourClick(0)} className={getSafetyGridClass(0)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                    <span className="text-2xl drop-shadow-sm">🧼</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-black text-slate-800 leading-tight truncate">Clean Hands</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words line-clamp-2">Wash and dry hands</p>
                  </div>
                </div>
                <div onClick={() => handleSafetyTourClick(1)} className={getSafetyGridClass(1)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                    <span className="text-2xl drop-shadow-sm">🚫🍔</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-black text-slate-800 leading-tight truncate">No Food</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words line-clamp-2">Keep water and snacks away</p>
                  </div>
                </div>
                <div onClick={() => handleSafetyTourClick(2)} className={getSafetyGridClass(2)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                    <span className="text-2xl drop-shadow-sm">🧸</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-black text-slate-800 leading-tight truncate">Be Gentle</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words line-clamp-2">Hold and click nicely</p>
                  </div>
                </div>
                <div onClick={() => handleSafetyTourClick(3)} className={getSafetyGridClass(3)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                    <span className="text-2xl drop-shadow-sm">🌳</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-black text-slate-800 leading-tight truncate">Take Breaks</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 break-words line-clamp-2">Rest your eyes, play outside</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      break;

    case 'R-T1-W10':
      title = "Term 1 Tech Champion";
      pose = "clapping";
      speechText = "You are a fully certified Term 1 Coding Star! Watch the recap below!";
      visualNode = (
        <AnimatedTerm1RecapExplorer 
          speakText={speakText} 
          onComplete={() => setR1W10Progress(1)} 
        />
      );
      break;

    case 'R-T2-W5':
      title = "Robot Classifier";
      pose = "pointing_idea";
      speechText = "Robots belong to different categories based on their workspace. Domestic sweeps dust in living rooms, while heavy factory robots build cars! Click to explore.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setRt2w5Progress(p)}
          titleText="Robot Job Classification"
          subtitleText="Different robots for different workspaces:"
          steps={[
            {
              id: 0,
              title: "Domestic",
              text: "Domestic robots clean carpets safely in your house.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2xl">🧹</span>
                  <h5 className="font-black text-slate-800 text-xs mt-1">DOMESTIC</h5>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">Cleans carpets safely</p>
                </div>
              )
            },
            {
              id: 1,
              title: "Industrial",
              text: "Industrial robots build heavy cars safely in factories.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2xl">🦾</span>
                  <h5 className="font-black text-slate-800 text-xs mt-1">INDUSTRIAL</h5>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">Builds heavy cars safely</p>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case 'R-T3-W5':
      title = "Robot Anatomy Lab";
      pose = "reminder";
      speechText = "A robot uses moving gears, wheels, or mechanical arms to navigate and lift objects, and camera sensors to perceive the world. Click the parts.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setRt3w5Progress(p)}
          titleText="Robot Components"
          subtitleText="How robots navigate and perceive:"
          steps={[
            {
              id: 0,
              title: "Sensors",
              text: "Sensors are like eyes! They help the machine see blocks and obstacles.",
              renderItem: () => (
                <div className="flex items-center gap-2.5 flex-1 w-full justify-start">
                  <span className="text-xl">👁️</span>
                  <div className="text-left">
                    <h5 className="text-xs font-black text-indigo-650">SENSORS (Camera Eyes)</h5>
                    <p className="text-[9px] text-slate-500 font-bold">Helps the machine see blocks.</p>
                  </div>
                </div>
              )
            },
            {
              id: 1,
              title: "Moving Parts",
              text: "Moving parts are like legs or arms! They help the machine move over floors.",
              renderItem: () => (
                <div className="flex items-center gap-2.5 flex-1 w-full justify-start">
                  <span className="text-xl">⚙️</span>
                  <div className="text-left">
                    <h5 className="text-xs font-black text-emerald-600">MOVING PARTS (Wheels / Arms)</h5>
                    <p className="text-[9px] text-slate-500 font-bold">Helps the machine move over floors.</p>
                  </div>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case 'R-T4-W2':
      title = "Online Safety Shield";
      pose = "thumbsup";
      speechText = "Online safety is super easy! Balance computer screen time with active outdoor games, and keep your secret family details private!";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setRt4w2Progress(p)}
          titleText="Healthy Living Levels"
          subtitleText="Balance tablet screen use with physical play!"
          steps={[
            {
              id: 0,
              title: "Outdoors",
              text: "Spend plenty of time outdoors! At least two hours a day.",
              renderItem: () => (
                <div className="p-1 px-2.5 flex-1 bg-emerald-50 rounded-xl flex flex-col items-center">
                  <span className="text-2xl">🌳</span>
                  <h5 className="text-[9px] font-black text-emerald-700 mt-1 uppercase leading-none">Outdoors</h5>
                  <p className="text-[8px] font-extrabold text-slate-500 mt-0.5">2 Hours</p>
                </div>
              )
            },
            {
              id: 1,
              title: "Screens Limit",
              text: "Keep screen time limited to just one hour a day.",
              renderItem: () => (
                <div className="p-1 px-2.5 flex-1 bg-rose-50 rounded-xl flex flex-col items-center">
                  <span className="text-2xl">📱</span>
                  <h5 className="text-[9px] font-black text-rose-700 mt-1 uppercase leading-none">Screens Limit</h5>
                  <p className="text-[8px] font-extrabold text-slate-500 mt-0.5">1 Hour</p>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case 'R-T4-W5':
      title = "Cardboard Puppet Workshop";
      pose = "crayon_book";
      speechText = "A prototype is a first craft test. You can build dummy hands at home using cardboard boxes, plastic drinking straws, and string tendons! Click the materials.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setRt4w5Progress(p)}
          titleText="Recycled Box Prototype"
          subtitleText="Design helper mechanisms using cardboard at home:"
          steps={[
            {
              id: 0,
              title: "Cardboard",
              text: "Use cardboard from empty boxes to make the hand.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2.5xl block">📦</span>
                  <h5 className="text-[9px] font-black text-slate-700 uppercase mt-1 leading-none">Cardboard</h5>
                </div>
              )
            },
            {
              id: 1,
              title: "Straws",
              text: "Use plastic drinking straws for the fingers.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2.5xl block">🥤</span>
                  <h5 className="text-[9px] font-black text-slate-700 uppercase mt-1 leading-none">Straws</h5>
                </div>
              )
            },
            {
              id: 2,
              title: "String",
              text: "Use string tendons to pull the fingers to move them!",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2.5xl block">🧵</span>
                  <h5 className="text-[9px] font-black text-slate-700 uppercase mt-1 leading-none">String</h5>
                </div>
              )
            }
          ]}
        />
      );
      break;

    // --- GRADE 1 ---
    case '1-T1-W1':
      title = "3-Element Pattern Guide";
      pose = "pointing_idea";
      speechText = "A patterns row can have three distinct elements repeating in an A-B-C order. Check out these rows of tasty apples, bananas, and grapes! Click the items.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t1w1Progress(p)}
          titleText="Repeating Patterns"
          subtitleText="A repeating A-B-C pattern row:"
          steps={[
            {
              id: 0,
              title: "Fruit",
              text: "Fruit pattern: Apple, Banana, Grapes, Apple, Banana, Grapes!",
              renderItem: () => (
                <div className="flex items-center justify-around gap-1 flex-1">
                  <span className="text-2.5xl">🍎</span>
                  <span className="text-2.5xl">🍌</span>
                  <span className="text-2.5xl">🍇</span>
                  <span className="text-2.5xl">🍎</span>
                </div>
              )
            },
            {
              id: 1,
              title: "Colors",
              text: "Color pattern: Red, Green, Blue, Red, Green, Blue!",
              renderItem: () => (
                <div className="flex items-center justify-around gap-1 flex-1">
                  <div className="w-8 h-8 bg-rose-500 rounded-full shrink-0"></div>
                  <div className="w-8 h-8 bg-emerald-500 rounded-full shrink-0"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full shrink-0"></div>
                  <div className="w-8 h-8 bg-rose-500 rounded-full shrink-0"></div>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T1-W2':
      title = "Digital Device Decoder";
      pose = "thumbsup";
      speechText = "Computers process information! First you enter keys as Input, the CPU microchip does the smart Processing, and the screen displays the Output. Click to trace the flow.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t1w2Progress(p)}
          titleText="Information Processing Cycle"
          subtitleText="Devices process inputs to produce outputs!"
          steps={[
            {
              id: 0,
              title: "Input",
              text: "First you enter keys as Input.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2xl">⌨️</span>
                  <h6 className="text-[9px] font-black text-slate-700 leading-none mt-1 uppercase">Input</h6>
                </div>
              )
            },
            {
              id: 1,
              title: "Process",
              text: "Then the CPU microchip does the smart Processing.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2xl animate-pulse inline-block">🧠</span>
                  <h6 className="text-[9px] font-black text-indigo-800 leading-none mt-1 uppercase">Process</h6>
                </div>
              )
            },
            {
              id: 2,
              title: "Output",
              text: "Finally, the screen displays the Output.",
              renderItem: () => (
                <div className="text-center flex-1">
                  <span className="text-2xl">🖥️</span>
                  <h6 className="text-[9px] font-black text-slate-700 leading-none mt-1 uppercase">Output</h6>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T1-W5':
      title = "Long Pathway Planner";
      pose = "reminder";
      speechText = "A pathway sequence guides a character across complex maps. Always chart your arrows step-by-step so you do not hit any brick walls! Click to learn.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t1w5Progress(p)}
          titleText="Sequential Mapping"
          subtitleText="Dodge high brick walls block-by-block!"
          steps={[
            {
              id: 0,
              title: "Crash",
              text: "Going straight into a brick wall causes a crash!",
              renderItem: () => (
                <div className="flex justify-center items-center gap-2 flex-1">
                  <span className="text-2xl">🐰</span>
                  <span className="text-slate-400 font-bold">&#8594;</span>
                  <span className="text-2xl filter grayscale">🧱</span>
                  <span className="text-rose-500 text-xs font-black bg-rose-50 px-1 rounded uppercase">Crash!</span>
                </div>
              )
            },
            {
              id: 1,
              title: "Safe",
              text: "Charting the right arrows keeps you safe!",
              renderItem: () => (
                <div className="flex justify-center items-center gap-2 flex-1">
                  <span className="text-2xl">🐰⬆️➡️</span>
                  <span className="text-emerald-500 text-xs font-black bg-emerald-50 px-1 rounded uppercase">Safe!</span>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T2-W5':
      title = "Loop-Repeat Shrinker";
      pose = "pointing_idea";
      speechText = "Loops let us write super clean, professional code. Instead of writing forward four separate times, just write forward with the number 4 below! Click to learn.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t2w5Progress(p)}
          titleText="Efficient Coding Logic"
          subtitleText="Use Repeat loops to avoid redundant blocks:"
          steps={[
            {
              id: 0,
              title: "Long Program",
              text: "Long way! You place 4 individual forward cards.",
              renderItem: () => (
                <div className="bg-white border border-slate-200 p-2 rounded-xl flex flex-col items-center flex-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-2">Long Cards Program</span>
                  <div className="flex gap-1 justify-center">
                    <span className="bg-slate-100 p-1 px-1.5 rounded text-xs font-bold text-indigo-750">➡️</span>
                    <span className="bg-slate-100 p-1 px-1.5 rounded text-xs font-bold text-indigo-750">➡️</span>
                    <span className="bg-slate-100 p-1 px-1.5 rounded text-xs font-bold text-indigo-750">➡️</span>
                    <span className="bg-slate-100 p-1 px-1.5 rounded text-xs font-bold text-indigo-750">➡️</span>
                  </div>
                </div>
              )
            },
            {
              id: 1,
              title: "Short Loop",
              text: "Short way! Put 1 arrow with a Repeat 4 block.",
              renderItem: () => (
                <div className="bg-indigo-50 border-2 border-indigo-400 p-2 rounded-xl flex flex-col items-center flex-1">
                  <span className="text-[9px] font-black text-indigo-800 uppercase mb-2">Short Loop Method</span>
                  <div className="bg-white border border-indigo-200 p-1 px-2.5 rounded-lg flex items-center gap-2 justify-center">
                    <span className="font-extrabold text-indigo-650 text-base">➡️</span>
                    <span className="text-[10px] bg-indigo-500 text-white p-0.5 px-1.5 rounded font-black">LOOP: 4</span>
                  </div>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T2-W9':
      title = "Domestic Vacuum Anatomy";
      pose = "thumbsup";
      speechText = "A autonomous vacuum cleaner has spring-loaded bumpers to feel wall obstacles, vacuum ducts, and automatically steers to its charger dock.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t2w9Progress(p)}
          titleText="Domestic Helper Anatomy"
          subtitleText="How a smart robot vacuum executes tasks:"
          steps={[
            {
              id: 0,
              title: "Bumper",
              text: "Bumper Guard senses the walls.",
              renderItem: () => (
                <div className="text-center text-slate-800 flex-1 border border-slate-150 p-2 rounded-xl">
                  <span className="text-2xl block">🛡️</span>
                  <h6 className="text-[10px] font-black leading-none mt-1">Bumper Guard</h6>
                  <p className="text-[7.5px] font-bold text-slate-400 mt-1">Senses walls</p>
                </div>
              )
            },
            {
              id: 1,
              title: "Wheels & Brushes",
              text: "Gears and brushes clean the dust automatically.",
              renderItem: () => (
                <div className="text-center text-slate-800 flex-1 border border-slate-150 p-2 rounded-xl">
                  <span className="text-2xl block animate-spin" style={{ animationDuration: '6s' }}>🧹</span>
                  <h6 className="text-[10px] font-black leading-none mt-1">Brush Gears</h6>
                  <p className="text-[7.5px] font-bold text-slate-400 mt-1">Cleans dust</p>
                </div>
              )
            },
            {
              id: 2,
              title: "Charger",
              text: "The Power Base auto-charges the vacuum when running low.",
              renderItem: () => (
                <div className="text-center text-slate-800 flex-1 border border-slate-150 p-2 rounded-xl">
                  <span className="text-2xl block animate-pulse">🔌</span>
                  <h6 className="text-[10px] font-black leading-none mt-1">Power Base</h6>
                  <p className="text-[7.5px] font-bold text-slate-400 mt-1">Auto-charges</p>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T3-W2':
      title = "Hardware & Software Bins";
      pose = "crayon_book";
      speechText = "Hardware is physical parts you can touch, like keyboard and monitors. Software is interactive programs inside, like drawing or spelling apps! Click to learn.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t3w2Progress(p)}
          titleText="Computer Architecture"
          subtitleText="Touchable hardware versus virtual program software:"
          steps={[
            {
              id: 0,
              title: "Hardware",
              text: "Hardware is physical parts you can touch.",
              renderItem: () => (
                <div className="bg-rose-50 border-2 border-rose-305 rounded-xl p-2.5 flex-1 shadow-3xs flex flex-col items-center">
                  <h6 className="text-[10px] font-black text-rose-800 mb-1.5 uppercase leading-none">🖐️ HARDWARE</h6>
                  <div className="flex justify-around text-2xl w-full">
                    <span>💻</span>
                    <span>🖱️</span>
                    <span>⌨️</span>
                  </div>
                  <p className="text-[8px] font-extrabold text-rose-500 mt-1 text-center uppercase">Touchable Parts</p>
                </div>
              )
            },
            {
              id: 1,
              title: "Software",
              text: "Software is virtual programs you run inside.",
              renderItem: () => (
                <div className="bg-indigo-50 border-2 border-indigo-305 rounded-xl p-2.5 flex-1 shadow-3xs flex flex-col items-center">
                  <h6 className="text-[10px] font-black text-indigo-800 mb-1.5 uppercase leading-none">📱 SOFTWARE</h6>
                  <div className="flex justify-around text-2xl w-full">
                    <span>🎮</span>
                    <span>🎨</span>
                    <span>🔢</span>
                  </div>
                  <p className="text-[8px] font-extrabold text-indigo-600 mt-1 text-center uppercase font-medium">Digital Apps</p>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T3-W5':
      title = "Debugging Lab";
      pose = "reminder";
      speechText = "A programming bug is a mistake. Debugging is tracing your instructions step-by-step to find the bad step and replace it! Find the bug by clicking its path.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t3w5Progress(p)}
          titleText="Debugging & Tracing"
          subtitleText="Trace commands sequentially to replace error codes:"
          steps={[
            {
              id: 0,
              title: "Crash",
              text: "Oh no! Hitting the rock is a crash.",
              renderItem: () => (
                <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl flex flex-col justify-between items-center gap-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-500 font-extrabold text-xs">➡️ ➡️ ⬇️</span>
                    <span className="text-xs">🪨</span>
                  </div>
                  <span className="text-rose-600 text-[8px] bg-white border border-rose-200 font-black px-1.5 py-0.5 rounded uppercase">❌ Obstacle Hit!</span>
                </div>
              )
            },
            {
              id: 1,
              title: "Safe path",
              text: "Great! Our new code goes around it securely.",
              renderItem: () => (
                <div className="bg-emerald-50 border-2 border-emerald-400 p-2 rounded-xl flex flex-col justify-between items-center gap-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-extrabold text-xs">➡️ ⬆️ ➡️</span>
                    <span className="text-xs">🥕</span>
                  </div>
                  <span className="text-emerald-600 text-[8px] bg-white border border-emerald-200 font-black px-1.5 py-0.5 rounded uppercase font-black">✔️ Safe Path!</span>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T4-W2':
      title = "Emoji Cipher Machine";
      pose = "pointing_idea";
      speechText = "A cipher helps us encode secret data. By exchanging letters for emojis, we can write codes that keep our files secure! Click each symbol.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t4w2Progress(p)}
          titleText="Cryptography Symbols"
          subtitleText="Translate code symbols into English text letters:"
          steps={[
            {
              id: 0,
              title: "Translate T",
              text: "The turtle is the letter T.",
              renderItem: () => (
                <div className="text-center text-slate-900 border border-slate-100 rounded-xl p-2 flex-1">
                  <span className="text-lg block">🐢</span>
                  <p className="text-[10px] font-black mt-0.5">= T</p>
                </div>
              )
            },
            {
              id: 1,
              title: "Translate O",
              text: "The Orange is the letter O.",
              renderItem: () => (
                <div className="text-center text-slate-900 border border-slate-100 rounded-xl p-2 flex-1">
                  <span className="text-lg block">🍊</span>
                  <p className="text-[10px] font-black mt-0.5">= O</p>
                </div>
              )
            },
            {
              id: 2,
              title: "Translate D",
              text: "The Fox is the letter D. Put it together: T-O-D-O. TODO list!",
              renderItem: () => (
                <div className="text-center text-slate-900 border border-slate-100 rounded-xl p-2 flex-1">
                  <span className="text-lg block">🦊</span>
                  <p className="text-[10px] font-black mt-0.5">= D</p>
                </div>
              )
            }
          ]}
        />
      );
      break;

    case '1-T4-W5':
      title = "Mechanical Joint Blueprint";
      pose = "clapping";
      speechText = "Joint hinges pivot under rope tension. Pulling on the connecting cords makes cardboard puppet fingers bend and clutch tightly! Click the parts.";
      visualNode = (
        <InteractiveSequenceViewer
          speakText={speakText}
          onStepProgress={(p) => setG1t4w5Progress(p)}
          titleText="Pulley Mechanical leverage"
          subtitleText="How cords and joints coordinate finger benders:"
          steps={[
            {
              id: 0,
              title: "Pull String",
              text: "Pull string acts as the muscle to pull.",
              renderItem: () => (
                <div className="flex flex-col items-center gap-1 text-xs font-black text-slate-800 flex-1 text-center">
                  <span className="text-indigo-400 text-2xl">🧵</span>
                  <span className="text-[9px]">String / Muscle</span>
                </div>
              )
            },
            {
              id: 1,
              title: "Drinking Straw",
              text: "Drinking Straw acts as the bone structure.",
              renderItem: () => (
                <div className="flex flex-col items-center gap-1 text-xs font-black text-slate-800 flex-1 text-center">
                  <span className="text-emerald-400 text-2xl">🥤</span>
                  <span className="text-[9px]">Straw / Bone</span>
                </div>
              )
            },
            {
              id: 2,
              title: "Hinge Pin",
              text: "Hinge pin points act as the joint where it bends.",
              renderItem: () => (
                <div className="flex flex-col items-center gap-1 text-xs font-black text-slate-800 flex-1 text-center">
                  <span className="text-rose-400 text-2xl">📂</span>
                  <span className="text-[9px]">Hinge / Joint</span>
                </div>
              )
            }
          ]}
        />
      );
      break;

    default:
      return null;
  }

  return (
    <div id={`grade-r1-lesson-${lesson.id}-concept-guide`} className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-60"></div>
      
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 bg-amber-500 text-white rounded-full text-xs font-bold font-sans">💡</span>
          <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight font-sans">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => speakText(speechText)}
          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold rounded-lg text-[10px] uppercase border border-amber-200 active:scale-95 transition cursor-pointer flex items-center gap-1 font-sans"
        >
          <span>{voiceButtonLabel}</span>
        </button>
      </div>

      <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-stretch gap-6 relative z-10 font-sans">
        {/* Left Side: Mascot Girl / Zoe / Zola */}
        {lesson.id !== 'R-T1-W6' && (
          <div id="workbook-guidance-mascot-card" className="flex flex-col items-center shrink-0 p-3 bg-white rounded-3xl border-2 border-indigo-100 shadow-xs hover:shadow-md transition-all duration-300 transform hover:scale-105 select-none self-start">
            {lesson.grade === 'R' ? (
              <img 
                src={
                  lesson.id === 'R-T1-W2' ? (regeneratedMascotImg.src || regeneratedMascotImg) : 
                  lesson.id === 'R-T1-W3' ? (regeneratedMascotImgW2.src || regeneratedMascotImgW2) : 
                  lesson.id === 'R-T1-W4' ? (regeneratedMascotImgW3.src || regeneratedMascotImgW3) : 
                  lesson.id === 'R-T1-W5' ? (regeneratedMascotImgW4.src || regeneratedMascotImgW4) : 
                  lesson.id === 'R-T1-W8' ? (regeneratedMascotImgW7.src || regeneratedMascotImgW7) : 
                  lesson.id === 'R-T1-W9' ? (regeneratedMascotImgW8.src || regeneratedMascotImgW8) : 
                  lesson.id === 'R-T1-W1' ? (regeneratedMascotImgW9.src || regeneratedMascotImgW9) : 
                  getZolaImage(pose)
                } 
                alt="Zola"
                referrerPolicy="no-referrer"
                className="w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            ) : (
              <MascotGirl 
                grade="1" 
                pose={pose} 
                className="w-24 h-24 md:w-32 md:h-32" 
              />
            )}
            {lesson.grade === '1' ? (
              <span className="text-[10px] uppercase font-black tracking-widest text-violet-600 mt-3 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
                Zoe
              </span>
            ) : (
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 mt-3 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                Zola
              </span>
            )}
          </div>
        )}

        {/* Right Side: Visual Content */}
        <div className="flex-1 min-w-0">
          {visualNode}
        </div>
      </div>

      {onComplete && !isCompleted && (() => {
        const requiredSteps: Record<string, number> = {
          'R-T1-W2': 2, 'R-T1-W3': 6, 'R-T1-W4': 3, 'R-T1-W5': 4,
          'R-T1-W6': 2, 'R-T1-W7': 3, 'R-T1-W8': 1, 'R-T1-W9': 2,
          'R-T1-W1': 4, 'R-T1-W10': 1, 'R-T2-W5': 2, 'R-T3-W5': 2,
          'R-T4-W2': 2, 'R-T4-W5': 3, '1-T1-W1': 3, '1-T1-W2': 3,
          '1-T1-W5': 3, '1-T2-W5': 2, '1-T2-W9': 3, '1-T3-W2': 2,
          '1-T3-W5': 3, '1-T4-W2': 3, '1-T4-W5': 3,
        };
        const progresses: Record<string, number> = {
          'R-T1-W2': r1w1Progress, 'R-T1-W3': r1w2Progress, 'R-T1-W4': r1w3Progress,
          'R-T1-W5': r1w4Progress, 'R-T1-W6': r1w5Progress, 'R-T1-W7': r1w6Progress,
          'R-T1-W8': r1w7Progress, 'R-T1-W9': r1w8Progress, 'R-T1-W1': r1w9Progress,
          'R-T1-W10': r1w10Progress, 'R-T2-W5': rt2w5Progress, 'R-T3-W5': rt3w5Progress,
          'R-T4-W2': rt4w2Progress, 'R-T4-W5': rt4w5Progress, '1-T1-W1': g1t1w1Progress,
          '1-T1-W2': g1t1w2Progress, '1-T1-W5': g1t1w5Progress, '1-T2-W5': g1t2w5Progress,
          '1-T2-W9': g1t2w9Progress, '1-T3-W2': g1t3w2Progress, '1-T3-W5': g1t3w5Progress,
          '1-T4-W2': g1t4w2Progress, '1-T4-W5': g1t4w5Progress,
        };

        let readyToProceed = true;
        if (progresses[lesson.id] !== undefined) {
          readyToProceed = progresses[lesson.id] >= (requiredSteps[lesson.id] || 1);
        }

        return (
          <div className="flex justify-center mt-6 pt-4 border-t border-amber-200">
            {readyToProceed ? (
              <button
                onClick={onComplete}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wide border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
              >
                Continue to Practice!
              </button>
            ) : (
              <p className="text-xs text-slate-500 font-bold animate-pulse cursor-not-allowed">
                Click all highlighted items to continue...
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export default function GradeR1Workbook({ 
  lesson, 
  activeStudentId, 
  onComplete, 
  onNextLesson,
  isSuperAdmin = false,
  superAdminBypass = false
}: GradeR1WorkbookProps) {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  // States for Page 1 Workbook Study
  const [traceInput, setTraceInput] = useState('');
  const [isSection2Unlocked, setIsSection2Unlocked] = useState(false);
  const [isSection3Unlocked, setIsSection3Unlocked] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [grW1Level1Completed, setGrW1Level1Completed] = useState(false);
  const [reflectionFace, setReflectionFace] = useState<string | null>(null);
  const [showHomeworkWarning, setShowHomeworkWarning] = useState(false);

  // States for interactive coloring puzzle in R-T1-W2
  const [w1SelectedCrayon, setW1SelectedCrayon] = useState<string | null>(null);
  const [w1ActiveColor, setW1ActiveColor] = useState<string | null>(null);
  const [w1Correct, setW1Correct] = useState<boolean | null>(null);
  const [w1Feedback, setW1Feedback] = useState<string>('');
  const [w1HasPainted, setW1HasPainted] = useState(false);

  // States for interactive coloring puzzle in R-T1-W2 Page 2 Tech Challenge
  const [grW1P2SelectedCrayon, setGrW1P2SelectedCrayon] = useState<string | null>(null);
  const [grW1P2ActiveColor, setGrW1P2ActiveColor] = useState<string | null>(null);
  const [grW1P2Correct, setGrW1P2Correct] = useState<boolean | null>(null);
  const [grW1P2Feedback, setGrW1P2Feedback] = useState<string>('');

  // States for interactive coloring puzzle in 1-T1-W1 Tech Challenge
  const [g1w1SelectedCrayon, setG1w1SelectedCrayon] = useState<string | null>(null);
  const [g1w1ActiveColor, setG1w1ActiveColor] = useState<string | null>(null);
  const [g1w1Correct, setG1w1Correct] = useState<boolean | null>(null);
  
  // States for interactive ordering puzzle in R-T1-W4
  const [grW3Order, setGrW3Order] = useState<string[]>([]);
  const [grW3Correct, setGrW3Correct] = useState<boolean | null>(null);
  const [grW3Feedback, setGrW3Feedback] = useState<string>('');
  
  // States for interactive rhythm challenge in R-T1-W9
  const [grW8Sequence, setGrW8Sequence] = useState<string[]>([]);
  const [grW8Correct, setGrW8Correct] = useState<boolean | null>(null);
  const [grW8Feedback, setGrW8Feedback] = useState<string>('');
  
  const [g1w1Feedback, setG1w1Feedback] = useState<string>('');

  // States for Page 2 Tech Challenge (Quiz)
  const coloringCanvasRef = React.useRef<ColoringCanvasRef>(null);
  const [isGradingDrawing, setIsGradingDrawing] = useState(false);
  const [drawingFeedback, setDrawingFeedback] = useState<string | null>(() => {
    return localStore.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_feedback`) || null;
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(() => {
    const s = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_answers`);
    return s ? JSON.parse(s) : {};
  });
  const [quizScores, setQuizScores] = useState<number | null>(null);
  
  const [grTracingCompleted, setGrTracingCompleted] = useState<boolean>(() => {
    return localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing`) === 'true';
  });
  const [grTracingWordInput, setGrTracingWordInput] = useState<string>(() => {
    return localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_input`) || '';
  });
  const [grTracingCorrect, setGrTracingCorrect] = useState<boolean | null>(() => {
    const s = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_correct`);
    return s !== null ? s === 'true' : null;
  });
  const [grTypingCorrect, setGrTypingCorrect] = useState<boolean | null>(() => {
    const s = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_typing_correct`);
    return s !== null ? s === 'true' : null;
  });
  const [grIdentifiedWord, setGrIdentifiedWord] = useState<string | null>(() => {
    return localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_identified_word`) || null;
  });

  const [aiFeedbackText, setAiFeedbackText] = useState<string | null>(() => {
    return localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_ai_feedback`) || null;
  });
  
  // Tech Challenge Lock persistent setup
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`) === 'true';
  });
  const [quizFinalScore, setQuizFinalScore] = useState<number | null>(() => {
    const s = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_score`);
    return s !== null ? parseInt(s, 10) : null;
  });
  const [quizTotalScore, setQuizTotalScore] = useState<number | null>(() => {
    const s = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_total`);
    // Fallback: If not found but quiz is submitted, trying to guess from lesson defaults
    if (s !== null) return parseInt(s, 10);
    if (localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`) === 'true') {
      let t = 3; // basic questions length
      if (lesson.grade === 'R') t += 2;
      if (lesson.id === 'R-T1-W2') t += 1;
      if (lesson.id === '1-T1-W1') t += 1;
      if (lesson.id === 'R-T1-W4') t += 1;
      return t;
    }
    return null;
  });

  // Re-evaluate correctness on mount or state changes if already submitted, and sync all state when student/lesson changes
  useEffect(() => {
    // Sync all basic guide/discovery page states
    setCurrentPage(1);
    setIsSection2Unlocked(false);
    setIsSection3Unlocked(false);
    setPracticeCompleted(false);
    setGrW1Level1Completed(false);
    setTraceInput('');

    const subKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`;
    const scoreKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_score`;
    const totalKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_total`;
    const answersKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_answers`;
    const tracingKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing`;
    const tracingInputKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_input`;
    const tracingCorrectKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_correct`;
    const typingCorrectKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_typing_correct`;
    const feedbackKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_feedback`;
    const identifiedWordKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_identified_word`;

    const isSub = localStorage.getItem(subKey) === 'true';
    setQuizSubmitted(isSub);

    const savedScore = localStorage.getItem(scoreKey);
    setQuizFinalScore(savedScore !== null ? parseInt(savedScore, 10) : null);

    const savedTotal = localStorage.getItem(totalKey);
    setQuizTotalScore(savedTotal !== null ? parseInt(savedTotal, 10) : null);

    const savedAnswers = localStorage.getItem(answersKey);
    setQuizAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});

    setGrTracingCompleted(localStorage.getItem(tracingKey) === 'true');
    setGrTracingWordInput(localStorage.getItem(tracingInputKey) || '');

    const sCorrect = localStorage.getItem(tracingCorrectKey);
    setGrTracingCorrect(sCorrect !== null ? sCorrect === 'true' : null);

    const tCorrect = localStorage.getItem(typingCorrectKey);
    setGrTypingCorrect(tCorrect !== null ? tCorrect === 'true' : null);

    setDrawingFeedback(localStorage.getItem(feedbackKey) || null);
    setGrIdentifiedWord(localStorage.getItem(identifiedWordKey) || null);

    const aiFeedbackKey = `gr_wb_${activeStudentId || 'default'}_${lesson.id}_ai_feedback`;
    setAiFeedbackText(localStorage.getItem(aiFeedbackKey) || null);

    // Sandbox simulation and guides should unlock if already submitted
    if (isSub) {
      setIsSection2Unlocked(true);
      setIsSection3Unlocked(true);
      setPracticeCompleted(true);
    }

    const savedLevelCompleted = localStorage.getItem(`gr_wb_${activeStudentId || "default"}_${lesson.id}_w1_level1_completed`) === "true";
    setGrW1Level1Completed(isSub || savedLevelCompleted);

    if (isSub) {
      if (lesson.id === 'R-T1-W2') {
        const savedColor = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w1p2_color`);
        if (savedColor) {
          setGrW1P2ActiveColor(savedColor);
          setGrW1P2Correct(savedColor === 'Blue');
        } else {
          setGrW1P2ActiveColor(null);
          setGrW1P2Correct(null);
        }
      } else {
        setGrW1P2ActiveColor(null);
        setGrW1P2Correct(null);
      }

      if (lesson.id === '1-T1-W1') {
        const savedColor1 = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_g1w1_color`);
        if (savedColor1) {
          setG1w1ActiveColor(savedColor1);
          setG1w1Correct(savedColor1 === 'Blue');
        } else {
          setG1w1ActiveColor(null);
          setG1w1Correct(null);
        }
      } else {
        setG1w1ActiveColor(null);
        setG1w1Correct(null);
      }

      if (lesson.id === 'R-T1-W4') {
        const savedOrder = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w3_order`);
        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);
          setGrW3Order(parsedOrder);
          setGrW3Correct(parsedOrder.join(',') === 'Start,Middle,End');
        } else {
          setGrW3Order([]);
          setGrW3Correct(null);
        }
      } else {
        setGrW3Order([]);
        setGrW3Correct(null);
      }
      
      if (lesson.id === 'R-T1-W9') {
        const savedSeq = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w8_sequence`);
        if (savedSeq) {
          const parsedSeq = JSON.parse(savedSeq);
          setGrW8Sequence(parsedSeq);
          setGrW8Correct(parsedSeq.join(',') === '🔴,🟡,🔴,🟡');
        } else {
          setGrW8Sequence([]);
          setGrW8Correct(null);
        }
      } else {
        setGrW8Sequence([]);
        setGrW8Correct(null);
      }
    } else {
      // Not submitted, reset custom task fields to defaults
      setGrW1P2ActiveColor(null);
      setGrW1P2Correct(null);
      setG1w1ActiveColor(null);
      setG1w1Correct(null);
      setGrW3Order([]);
      setGrW3Correct(null);
      setGrW8Sequence([]);
      setGrW8Correct(null);
      setGrW1Level1Completed(false);
    }
  }, [lesson.id, activeStudentId]);

  const workbookConfig = LESSON_WORKBOOK_DATA[lesson.id] || DEFAULT_WORKBOOK_DATA;

  // Track if user is speaking
  const speakText = (text: string, onBoundary?: (e: SpeechSynthesisEvent) => void, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }
    window.speechSynthesis.cancel();
    if (activeSpeech === text) {
      setActiveSpeech(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.22;
    if (onBoundary) {
      utterance.onboundary = onBoundary;
    }
    utterance.onend = () => {
      setActiveSpeech(null);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      setActiveSpeech(null);
      if (onEndCallback) onEndCallback();
    };
    setActiveSpeech(text);
    (window as any).__currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeech(null);
  };

  // Sound Synth Helpers
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
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
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

  // Page index trigger
  useEffect(() => {
    handleStopSpeech();
    // Auto-welcome speech when lesson changes
    const timeout = setTimeout(() => {
      speakText(`${workbookConfig.mascotSpeech} Let's explore our big vocabulary word: ${workbookConfig.bigWord}. Say it out loud: ${workbookConfig.bigWord}. Now type it out by matching the letters in the writing desk below!`);
    }, 400);

    // Save started state if it's W7 to check for workstation unlocking
    if (lesson.id === 'R-T1-W8' && activeStudentId) {
      localStorage.setItem(`w7_started_${activeStudentId}`, 'true');
    }

    return () => {
      clearTimeout(timeout);
      handleStopSpeech();
    };
  }, [lesson.id, activeStudentId]);

  // Unlock section 3 once the student tries writing the big word
  const handleVerifyBigWord = () => {
    if (isLenientMatch(traceInput, workbookConfig.bigWord, workbookConfig.tracePrompt)) {
      setIsSection2Unlocked(true);
      playChime();
      if (lesson.id === 'R-T1-W3') {
        speakText(`Wonderful tracing! You successfully matched our big word of the day in our writing desk! Let's explore the ${workbookConfig.bigWord} Explorer Guide below! Scroll down and click on the highlighted items to learn more about them.`);
      } else {
        speakText(`Wonderful tracing! You successfully matched our big word of the day in our writing desk! Let's explore the ${workbookConfig.bigWord} Explorer Guide below! Scroll down and click on the highlighted items to learn more.`);
      }
    } else {
      playPop();
      speakText("Keep looking closely at our big word and match the letters in the writing desk!");
    }
  };

  useEffect(() => {
    // Sandbox speech triggers are now handled directly by the onComplete handler below.
  }, [isSection3Unlocked]);

  const onCompleteActivitySimulation = (starsEarned: number, possible?: number, aiFeedback?: string) => {
    setPracticeCompleted(true);
    playChime();
    
    if (lesson.id === 'R-T1-W8') {
      const finalStars = starsEarned;
      const finalPossible = possible || 3;
      setQuizSubmitted(true);
      setQuizFinalScore(finalStars);
      setQuizTotalScore(finalPossible);
      
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`, 'true');
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_score`, finalStars.toString());
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_total`, finalPossible.toString());
      
      if (aiFeedback) {
        localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_ai_feedback`, aiFeedback);
        setAiFeedbackText(aiFeedback);
      }
      
      onComplete(finalStars, finalPossible);
      const speechToPlay = aiFeedback || `Magnificent design, bracelet designer! You completed your beaded bracelet design with a grade of ${finalStars} out of ${finalPossible} stars! Your workbook entries are locked and certified!`;
      speakText(speechToPlay);
      return;
    }
    
    speakText(`Wonderful job! You finished the sandbox simulation! Let's write down how you felt, and head to the Page 2 Tech Challenge!`);
  };

  const handleSelectQuizOpt = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return; // locked

    const isCorrect = workbookConfig.questions[qIdx].correct === oIdx;
    if (isCorrect) {
      playPop();
    } else {
      playBoop();
    }

    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }));

    if (lesson.id === 'R-T1-W2') {
      const q = workbookConfig.questions[qIdx];
      const optText = q.opts[oIdx];
      const speakingText = optText.replace(/[🔴🔵🟢🟡]/g, '').trim();
      speakText(`You selected: ${speakingText || optText}. Click Submit Evaluation below when you are ready to check your final workbook grades!`);
    }
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;

    let isTypingCorrect = false;
    let isDrawingCorrectLocal = false;
    let aiFeedback = '';

    if (lesson.grade === 'R') {
      setIsGradingDrawing(true);
      isTypingCorrect = isLenientMatch(grTracingWordInput, workbookConfig.bigWord, workbookConfig.tracePrompt);
      let detectedWord = '';
      
      try {
        const imageData = coloringCanvasRef.current?.getDataUrl() || '';
        const response = await fetch('/api/grade-drawing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData, word: workbookConfig.bigWord })
        });
        const data = await response.json();
        isDrawingCorrectLocal = data.isCorrect;
        aiFeedback = data.feedback;
        detectedWord = data.identifiedWord || '';
      } catch (err) {
        console.error('Failed to grade drawing:', err);
        isDrawingCorrectLocal = false; 
        aiFeedback = "AI feature not available. Please try again later.";
        detectedWord = "";
      }

      setIsGradingDrawing(false);
      setDrawingFeedback(aiFeedback);
      setGrIdentifiedWord(detectedWord);
      setGrTracingCorrect(isDrawingCorrectLocal);
      setGrTypingCorrect(isTypingCorrect);
    }

    if (lesson.id === 'R-T1-W2') {
      if (grW1P2ActiveColor === 'Blue') {
        setGrW1P2Correct(true);
        setGrW1P2Feedback('Superb! You colored the last shape BLUE. The Blue-Green pattern continues perfectly!');
      } else if (grW1P2ActiveColor === 'Green') {
        setGrW1P2Correct(false);
        setGrW1P2Feedback("Incorrect. Blue comes after Green in this pattern.");
      } else {
        setGrW1P2Correct(false);
        setGrW1P2Feedback('Incorrect. We only have Blue and Green blocks in this pattern.');
      }
    }

    if (lesson.id === '1-T1-W1') {
      if (g1w1ActiveColor === 'Blue') {
        setG1w1Correct(true);
        setG1w1Feedback('Correct! Blue completes the Red-Green-Blue sequence.');
      } else {
        setG1w1Correct(false);
        setG1w1Feedback('Incorrect. Blue comes after the Green shape in this pattern.');
      }
    }
    
    if (lesson.id === 'R-T1-W4') {
      if (grW3Order.join(',') === 'Start,Middle,End') {
        setGrW3Correct(true);
        setGrW3Feedback('Correct! You arranged the pictures perfectly: Start, Middle, then End.');
      } else {
        setGrW3Correct(false);
        setGrW3Feedback('Incorrect order. Let\'s try putting them in the right order.');
      }
    }
    
    if (lesson.id === 'R-T1-W9') {
      if (grW8Sequence.join(',') === '🔴,🟡,🔴,🟡') {
        setGrW8Correct(true);
        setGrW8Feedback('Fantastic! You followed the rhythm perfectly: Drum, Clap, Drum, Clap!');
      } else {
        setGrW8Correct(false);
        setGrW8Feedback('Oops! Listen closely again. The rhythm is Drum, Clap, Drum, Clap.');
      }
    }

    // Evaluate answers
    let correctCount = 0;
    workbookConfig.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    if (lesson.grade === 'R') {
      if (isTypingCorrect) correctCount++;
      if (isDrawingCorrectLocal) correctCount++;
    }

    if (lesson.id === 'R-T1-W2') {
      if (grW1P2ActiveColor === 'Blue') correctCount++;
    }

    if (lesson.id === '1-T1-W1') {
      // Assuming 1 custom activity for 1-T1-W1 which adds a start (also question size is smaller?)
      if (g1w1ActiveColor === 'Blue') correctCount++;
    }
    
    if (lesson.id === 'R-T1-W4') {
      if (grW3Order.join(',') === 'Start,Middle,End') correctCount++;
    }

    if (lesson.id === 'R-T1-W9') {
      if (grW8Sequence.join(',') === '🔴,🟡,🔴,🟡') correctCount++;
    }

    let totalQuestions = workbookConfig.questions.length;
    if (lesson.grade === 'R') totalQuestions += 2;
    if (lesson.id === 'R-T1-W2') totalQuestions += 1;
    if (lesson.id === '1-T1-W1') totalQuestions += 1;
    if (lesson.id === 'R-T1-W4') totalQuestions += 1;
    if (lesson.id === 'R-T1-W9') totalQuestions += 1;

    let calculatedStars = totalQuestions > 0 ? correctCount : 0;
    
    setQuizScores(calculatedStars);
    setQuizFinalScore(calculatedStars);
    setQuizTotalScore(totalQuestions);
    setQuizSubmitted(true);
    
    // Save to localStorage so they CANNOT redo it even after resetting simulation
    localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`, 'true');
    localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_score`, String(calculatedStars));
    localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_total`, String(totalQuestions));
    localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_answers`, JSON.stringify(quizAnswers));
    if (grTracingCompleted) {
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing`, 'true');
    }
    if (lesson.grade === 'R') {
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_input`, grTracingWordInput);
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_correct`, isDrawingCorrectLocal ? 'true' : 'false');
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_typing_correct`, isTypingCorrect ? 'true' : 'false');
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_identified_word`, grIdentifiedWord || '');
      
      const fbToSave = aiFeedback || drawingFeedback;
      if (fbToSave) {
        localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_feedback`, fbToSave);
      }
    }
    if (lesson.id === 'R-T1-W2') {
      if (grW1P2ActiveColor) localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w1p2_color`, grW1P2ActiveColor);
    }
    if (lesson.id === '1-T1-W1') {
      if (g1w1ActiveColor) localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_g1w1_color`, g1w1ActiveColor);
    }
    if (lesson.id === 'R-T1-W4') {
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w3_order`, JSON.stringify(grW3Order));
    }
    if (lesson.id === 'R-T1-W9') {
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_w8_sequence`, JSON.stringify(grW8Sequence));
    }

    if (calculatedStars === totalQuestions) {
      playChime();
    } else {
      playBoop();
    }
    onComplete(calculatedStars, totalQuestions);

    if (lesson.id === 'R-T1-W2') {
      let speechFeedback = `Congratulations technology explorer! You finished your workbook and scored ${calculatedStars} out of ${totalQuestions} stars! `;
      if (calculatedStars === totalQuestions) {
        speechFeedback += "You got a perfect score! Excellent tracing of PATTERN, magnificent coloring of our blue square, and perfect matching of Sipho's sequence! You are a pattern superstar!";
      } else {
        speechFeedback += "Let's review our learning steps together. ";
        if (!isDrawingCorrectLocal || !isTypingCorrect) {
          speechFeedback += "Look at our big word tracing under the writing desk: did you copy and match the letters of P-A-T-T-E-R-N correctly? ";
        }
        if (grW1P2ActiveColor !== 'Blue') {
          speechFeedback += "For the coloring activity: look at our squares! They go Blue, Green, Blue, Green. What comes after Green? Yes, the last square should be blue! ";
        }
        if (quizAnswers[0] !== 0) {
          speechFeedback += "For the multiple choice pattern question: a neat repeating sequence alternates cleanly, like Red, Blue, Red, Blue. ";
        }
        speechFeedback += "Learning is a beautiful journey! Ask your teacher or parent helper to check your finished workbook!";
      }
      speakText(speechFeedback);
    } else if (lesson.id === 'R-T1-W4') {
      let speechFeedback = `Congratulations technology explorer! You finished your workbook and scored ${calculatedStars} out of ${totalQuestions} stars! `;
      if (calculatedStars === totalQuestions) {
        speechFeedback += "You got a perfect score! Excellent ordering of our cookie making story!";
      } else {
        speechFeedback += "Let's review our learning steps together. ";
        if (grW3Order.join(',') !== 'Start,Middle,End') {
          speechFeedback += "For the cookie baking story: remember, first we mix the ingredients, then we bake them, and finally we eat the cookies! ";
        }
        speechFeedback += "Learning is a beautiful journey! Ask your teacher or parent helper to check your finished workbook!";
      }
      speakText(speechFeedback);
    } else {
      speakText(`Congratulations technology explorer! You scored ${calculatedStars} out of ${totalQuestions} stars! Your workbook entries are locked and certified!`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans" id={`workbook-early-learning-${lesson.id}`}>
      
      {/* Dynamic Workbook Navigator Header */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2">
          {lesson.id === 'R-T1-W8' ? (
            <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs select-none">
              Page 1: Design Challenge Workspace 🎨
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                  currentPage === 1 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Page 1: Discovery Guide Study 📖
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  if (!practiceCompleted && !quizSubmitted && !(isSuperAdmin && superAdminBypass)) {
                    setShowHomeworkWarning(true);
                    speakText("Wait champion! You must complete the Discovery Guide Study on Page 1 first.");
                    return;
                  }
                  setCurrentPage(2);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                  currentPage === 2 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                } ${(!practiceCompleted && !quizSubmitted && !(isSuperAdmin && superAdminBypass)) ? 'opacity-50' : ''}`}
              >
                Page 2: Tech Challenge 📝
                {(!practiceCompleted && !quizSubmitted && !(isSuperAdmin && superAdminBypass)) && <span className="ml-1">🔒</span>}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStopSpeech}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center transition"
            title="Stop Mascot Speaks"
          >
            <Clock className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
            GRADE {lesson.grade} | WEEK {lesson.week}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentPage === 1 ? (
          <motion.div
            key="page-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Section 1: Mascot Hello Bubble */}
            {true && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-3xs flex gap-4 md:gap-6 flex-col md:flex-row items-center md:items-start">
                {lesson.grade === 'R' ? (
                  <div className="w-16 h-16 shrink-0 select-none animate-bounce flex items-center justify-center bg-rose-50 border border-rose-200 rounded-2xl overflow-hidden p-0.5">
                    <img 
                      src={getZolaImage('waving')} 
                      alt="Zola"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-contain rounded-xl"
                    />
                  </div>
                ) : lesson.grade === '1' ? (
                  <div className="w-16 h-16 shrink-0 select-none animate-bounce flex items-center justify-center bg-purple-50 border border-purple-200 rounded-2xl p-1">
                    <MascotGirl grade="1" pose="waving" className="w-14 h-14" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl shrink-0 select-none animate-bounce border border-slate-200">
                    {lesson.strand === 'Coding' ? '🐰' : lesson.strand === 'Robotics' ? '🤖' : '📱'}
                  </div>
                )}
                <div className="text-center md:text-left space-y-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                    Mascot Speech Guide
                  </span>
                  <p className="text-sm md:text-base font-bold text-slate-800 leading-snug">
                    &ldquo;{workbookConfig.mascotSpeech}&rdquo;
                  </p>

                </div>
              </div>
            )}

            {/* Section 2: Our Big Word & Vocabulary Gate */}
            {true && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-amber-500 text-white rounded-full text-xs font-bold">🗣️</span>
                  <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Our Big Word Today</h3>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 text-center space-y-3 shadow-md relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                  
                  <h4 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight leading-none uppercase filter drop-shadow-xs">
                    {workbookConfig.bigWord}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">Say it aloud, and let&apos;s trace spelling keycodes inside our writing desk!</p>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => speakText(`The big vocabulary word is: ${workbookConfig.bigWord}. Say it out loud: ${workbookConfig.bigWord}.`)}
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold rounded-lg text-[10px] uppercase border border-amber-500/30 active:scale-95 transition cursor-pointer"
                    >
                      Shoutout! 🔊
                    </button>
                  </div>
                </div>

                {/* Writing Desk Gate */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-3">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Writing Desk Tracing: Type the Word Here
                  </label>
                  <div className="text-[10px] text-slate-400 font-bold font-mono tracking-widest uppercase">
                    Letter guide: {workbookConfig.bigWord.split(' ').map(w => w.split('').join('-')).join('   ')}
                  </div>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={traceInput}
                      onChange={(e) => setTraceInput(e.target.value)}
                      placeholder="Type our big word here..."
                      className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-hidden focus:border-indigo-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyBigWord}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs active:scale-95 transition cursor-pointer"
                    >
                      Check Tracing Plan ✨
                    </button>
                  </div>
                  {isSection2Unlocked && (
                    <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 animate-pulse">
                      <Check className="w-3.5 h-3.5" />
                      Unlocked Explorer Guide! Scroll down to continue.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* In-Lesson Illustrated Pattern Explainer */}
            {true && (
              <div className="relative">
                {!isSection2Unlocked && !(isSuperAdmin && superAdminBypass) && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs rounded-3xl flex flex-col justify-center items-center p-6 text-center z-20 text-white space-y-3">
                    <span className="text-3xl">🔒</span>
                    <h4 className="font-extrabold text-sm uppercase">Explorer Guide is locked</h4>
                    <p className="text-xs text-slate-300 max-w-xs leading-normal">
                      Please key in and trace the big vocabulary word above first to unlock your explorer guide!
                    </p>
                  </div>
                )}
                <LessonConceptExplainer 
                  lesson={lesson} 
                  speakText={speakText}
                  isCompleted={isSection3Unlocked || (isSuperAdmin && superAdminBypass)}
                  isUnlocked={isSection2Unlocked || (isSuperAdmin && superAdminBypass)}
                  onComplete={() => {
                    setIsSection3Unlocked(true);
                    playChime();
                    
                    let studentMission = "Complete the activity to earn your stars!";
                    
                    if (lesson.id === 'R-T1-W2') {
                      studentMission = "Which color circle comes next in Sipho’s repeating sequence?";
                    } else if (lesson.id === 'R-T1-W3') {
                      studentMission = "Level 1: Tap all the electronic computing devices!";
                    } else if (lesson.id === 'R-T1-W4') {
                      studentMission = "What is the right order to wash your hands? Click the pictures in the correct order!";
                    } else if (lesson.id === 'R-T1-W7') {
                      studentMission = "Which set of instructions gets Baby Bot to the bottle? Click on a set to test it!";
                    } else if (lesson.id === 'R-T1-W5' || lesson.activityType === 'grid') {
                      studentMission = "Help Sipho Super Bunny collect the gem and reach the juicy carrot target using coded movement arrows!";
                    } else if (lesson.id === 'R-T1-W6') {
                      studentMission = "Select a crayon color from our palette, and click any part of the robot to paint. When you are finished, click Done Coloring!";
                    } else if (lesson.id === 'R-T1-W8') {
                      studentMission = "Welcome to your Beaded Bracelet Designer! Scroll down to the workspace, select the circle shape tool, and draw colorful round beads in a row. Alternate colors to create a repeating pattern, and click Submit Workstation Design to grade your custom bracelet!";
                    } else if (lesson.id === 'R-T1-W9') {
                      studentMission = "Listen to the sound pattern by tapping Hear Pattern, then match it: Drum, Clap, Drum, Clap!";
                    } else if (lesson.activityType === 'robotics') {
                      studentMission = "Mission Grade R & 1 (R.1): Select exactly all the objects below that qualify as a Robot (machines built by humans that take instructions to do repetitive work).";
                    } else if (lesson.activityType === 'digital') {
                      if (lesson.grade === 'R') {
                        studentMission = "Level 1: Tap all the electronic computing devices!";
                      } else if (lesson.grade === '1') {
                        studentMission = "Solve the emoji code below! Each emoji matches a letter in our secret dictionary card. Write the English word to decipher it!";
                      } else {
                        studentMission = "Safeguard your profile! Test your safety reflexes across digital safety scenarios.";
                      }
                    } else if (lesson.activityType === 'pattern' && lesson.grade === '1') {
                      studentMission = "Complete the pattern of steps by filling in the missing sequential numbers!";
                    }

                    speakText(`Great job exploring! Please scroll down to the Interactive Sandbox. ${studentMission}`);
                  }} 
                />
              </div>
            )}

            {/* Section 3: Re-routed Simulation Practice Space */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-4 relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-emerald-500 text-white rounded-full text-xs font-bold">🎮</span>
                  <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Interactive Sandbox Study</h3>
                </div>
                {practiceCompleted && (
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Completed!
                  </span>
                )}
              </div>

              {!isSection3Unlocked && !(isSuperAdmin && superAdminBypass) && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs rounded-3xl flex flex-col justify-center items-center p-6 text-center z-10 text-white space-y-3">
                  <span className="text-3xl">🔒</span>
                  <h4 className="font-extrabold text-sm uppercase">Sandbox Practice is locked</h4>
                  <p className="text-xs text-slate-300 max-w-xs leading-normal">
                    Please complete the Explorer Guide section above first to unlock your learning sandbox!
                  </p>
                </div>
              )}

              <div className="p-2 border border-slate-100 rounded-2xl bg-slate-50 min-h-[300px]">
                {lesson.id === 'R-T1-W9' ? (
                  <DrumSandboxStage speakText={speakText} onComplete={onCompleteActivitySimulation} />
                ) : lesson.activityType === 'pattern' ? (
                  <PatternActivity grade={lesson.grade} onComplete={onCompleteActivitySimulation} isUnlocked={isSection3Unlocked || (isSuperAdmin && superAdminBypass)} speakText={speakText} disableInitialSpeech={true} />
                ) : null}
                {lesson.activityType === 'grid' && (
                  <CodingGridActivity grade={lesson.grade} lessonId={lesson.id} onComplete={onCompleteActivitySimulation} speakText={speakText} />
                )}
                {lesson.activityType === 'robotics' && lesson.id === 'R-T1-W6' ? (
                  <RobotSandboxStage speakText={speakText} onComplete={onCompleteActivitySimulation} />
                ) : lesson.activityType === 'robotics' && lesson.id === 'R-T1-W8' ? (
                  <CreativeWorkstationApp 
                    onComplete={onCompleteActivitySimulation} 
                    mode="bracelet" 
                    speakText={speakText} 
                    otherActivitiesCompleted={isSection3Unlocked || (isSuperAdmin && superAdminBypass)} 
                    activeStudentId={activeStudentId}
                    isLocked={quizSubmitted}
                    certifiedScore={quizFinalScore}
                  />
                ) : lesson.activityType === 'robotics' && (
                  <RoboticsActivity grade={lesson.grade} onComplete={onCompleteActivitySimulation} />
                )}
                {lesson.activityType === 'digital' && (
                  lesson.id === 'R-T1-W1' ? (
                    <DeviceSafetySandboxStage speakText={speakText} onComplete={onCompleteActivitySimulation} />
                  ) : (
                    <DigitalConceptsActivity grade={lesson.grade} onComplete={onCompleteActivitySimulation} />
                  )
                )}
                {lesson.activityType === 'exploration' && (
                  lesson.id === 'R-T1-W10' ? (
                    <Term1RecapSimulationStage speakText={speakText} onComplete={onCompleteActivitySimulation} />
                  ) : (
                    <DigitalConceptsActivity grade={lesson.grade} onComplete={onCompleteActivitySimulation} />
                  )
                )}
                {lesson.activityType === 'sequence' && (
                  <SequenceActivity grade={lesson.grade} onComplete={onCompleteActivitySimulation} speakText={speakText} />
                )}
              </div>
            </div>

            {/* ========================================================== */}
            {/* SECTION 4 - WRAP UP & REFLECTION */}
            {/* ========================================================== */}
            <motion.div
              key="sec-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 bg-white p-6 md:p-8 rounded-xl border-l-4 border-l-teal-500 border border-teal-100/80 shadow-xs w-full text-left"
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
                  <h3 className="text-xl md:text-2xl font-black">
                    {lesson.grade === 'R' ? 'Well done, Tech Explorer!' : 'Well done, Code Explorer!'}
                  </h3>
                  <p className="text-xs md:text-sm text-indigo-200 font-bold max-w-xl mx-auto md:mx-0 leading-relaxed">
                    You are now a {lesson.title} master! We discovered new concepts, played interactive practice simulations, and unlocked smart vocab keys together. See you in the next lesson!
                  </p>

                  <div className="flex justify-center md:justify-start pt-1">
                    {quizSubmitted ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-500/25 text-emerald-300 border border-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase">
                        <span>🏆 Lesson Workbook Certified ({quizFinalScore} / {quizTotalScore} Stars)</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setShowHomeworkWarning(true);
                            if (lesson.id === 'R-T1-W8') {
                              speakText("Stop, technology champion! You must complete and submit your beaded bracelet design in the workstation below first before we can certify this lesson and proceed!");
                            } else {
                              speakText("Stop, technology champion! You must complete and submit your Tech Challenge on Page 2 first before we can certify this lesson and proceed!");
                            }
                          }}
                          className="px-5 py-2.5 bg-slate-250 text-slate-500 hover:bg-slate-300 border border-slate-300 font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Finalise and Sign Workbook (Locked)</span>
                        </button>
                        <p className="text-[10px] font-black text-rose-500 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          {lesson.id === 'R-T1-W8'
                            ? "Complete and submit your beaded bracelet design first! 🔒"
                            : "Complete Page 2's Tech Challenge first! 🔒"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Celebration Mascot Badge */}
                <div className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden select-none z-10 p-2">
                  {lesson.grade === 'R' ? (
                    <img 
                      src={getZolaImage('clapping')} 
                      alt="Zola"
                      referrerPolicy="no-referrer"
                      className="w-[90%] h-[90%] object-contain rounded-full"
                    />
                  ) : (
                    <MascotGirl grade="1" pose="clapping" className="w-[90%] h-[90%]" />
                  )}
                </div>
              </div>

              {lesson.id === 'R-T1-W8' && quizSubmitted && aiFeedbackText && (
                <div className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-5 space-y-2 shadow-xs animate-fade-in text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-sky-800 uppercase tracking-wide">
                      AI Tutor Final Grading Feedback
                    </h4>
                  </div>
                  <p className="text-sky-950 text-xs sm:text-sm font-semibold leading-relaxed">
                    "{aiFeedbackText}"
                  </p>
                </div>
              )}

              {/* Reflection faces */}
              <div className="bg-[#e1f5f5] p-6 border border-teal-200 rounded-3xl space-y-5 text-center">
                <h4 className="font-sans font-black text-[#004d4d] text-base md:text-lg">
                  How did I do today? Colour in your face! 🎨😀
                </h4>
                <p className="text-xs text-[#065f46] font-bold">
                  Tap on how well you understood today&apos;s lessons with {lesson.title}:
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
                      {lesson.id === 'R-T1-W8' ? (
                        <span>Please complete and submit your beaded bracelet design in the workstation below first to unlock lesson progress!</span>
                      ) : (
                        <span>Please go to <strong className="font-black text-pink-600">Page 2: Tech Challenge</strong> at the top, complete all worksheets, and submit for grading to unlock lesson progress!</span>
                      )}
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
                      if (quizSubmitted) {
                        speakText("Yippee! You understood perfectly! Today you are an absolute technology hero.");
                        onComplete(quizFinalScore ?? 3, quizTotalScore ?? 3);
                      } else {
                        setShowHomeworkWarning(true);
                        if (lesson.id === 'R-T1-W8') {
                          speakText("Stop, technology champion! You must complete and submit your beaded bracelet design in the workstation below first before we can proceed to the next lesson!");
                        } else {
                          speakText("Stop, technology champion! You must complete and submit your Tech Challenge on Page 2 first before we can proceed to the next lesson!");
                        }
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
                      if (!quizSubmitted) {
                        setShowHomeworkWarning(true);
                      }
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 shadow-3xs transition-all relative cursor-pointer active:scale-95 ${
                      reflectionFace === 'practice' ? 'bg-[#fff3cd] border-amber-300 text-[#664d03] ring-2 ring-amber-300/60' : 'bg-white border-slate-200'
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
                      speakText(`That is totally okay! Learning is a progress staircase. Ask your parent or teacher helper to work alongside our mascot helper!`);
                      if (!quizSubmitted) {
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

          </motion.div>
        ) : (
          <motion.div
            key="page-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Tech Challenge (Quiz) Sheet */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-3xs space-y-6">
              
              <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-1 px-3 bg-indigo-600 text-white font-extrabold rounded-lg text-xs leading-none">TEST</span>
                  <div>
                    <h3 className="font-sans text-slate-900 font-extrabold text-base tracking-tight leading-none">
                      Dynamic Tech Challenge
                    </h3>
                    <p className="text-[10px] text-slate-450 font-medium mt-1">Answer the questions below to secure your progress trophies!</p>
                  </div>
                </div>

                {quizSubmitted && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-250 px-3 py-1 rounded-full uppercase leading-none">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-white" />
                    Locked / Submitted
                  </span>
                )}
              </div>

              {/* List questions */}
              <div className="space-y-6">
                {/* Tracing Activity for Grade R */}
                {lesson.grade === 'R' && (
                  <div className={`p-5 rounded-2xl border space-y-4 transition ${(quizSubmitted && grTracingCorrect && grTypingCorrect) ? 'bg-emerald-50/20 border-emerald-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-250 font-bold text-[10px] text-slate-800 flex items-center justify-center shrink-0">
                         1
                      </span>
                      <div className="space-y-1 w-full">
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-normal">
                          Word Tracing Activity: Use your finger or mouse to trace our big word, then type it to check your spelling!
                        </p>
                        
                        <div className="flex justify-center flex-col items-center gap-2 py-3 w-full overflow-x-auto relative">
                          <ColoringCanvas
                            ref={coloringCanvasRef}
                            imageSrc={`data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox='0 0 600 160' xmlns='http://www.w3.org/2000/svg'><text x='300' y='100' font-family='sans-serif' font-size='60' font-weight='900' letter-spacing='10' fill='none' stroke='#94a3b8' stroke-width='4' stroke-dasharray='8 8' text-anchor='middle'>${workbookConfig.bigWord}</text></svg>`)}`}
                            altText={`Trace the word ${workbookConfig.bigWord}`}
                            canvasWidth={600}
                            canvasHeight={160}
                            containerClassName="w-[600px] h-[160px] shrink-0"
                            onColor={() => setGrTracingCompleted(true)}
                          />
                          {quizSubmitted && (
                             <div className="absolute top-0 w-[600px] h-[160px] bg-transparent z-10" />
                          )}
                        </div>

                        {isGradingDrawing && (
                          <div className="flex items-center justify-center gap-2 mt-2 px-3 py-2 text-indigo-500 text-xs font-bold animate-pulse">
                            Checking your tracing...
                          </div>
                        )}

                        {quizSubmitted && grTracingCorrect !== null && (
                          <div className={`flex flex-col items-center justify-center gap-1 mt-2 px-3 py-2 rounded-lg text-xs font-bold border w-fit mx-auto ${grTracingCorrect ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200' : 'bg-rose-100/50 text-rose-800 border-rose-200'}`}>
                            <div className="flex items-center gap-2">
                              {grTracingCorrect ? (
                                <><span className="text-emerald-500">✅</span> Super tracing!</>
                              ) : (
                                <><span className="text-rose-500">❌</span> Tracing needs a bit more practice.</>
                              )}
                            </div>
                            {grIdentifiedWord && (
                              <span className="text-[11px] font-bold text-slate-800 mt-1">
                                We identified your writing as: <span className="underline decoration-indigo-500 font-mono text-xs uppercase px-1 py-0.5 bg-slate-100/60 rounded-sm">{grIdentifiedWord}</span>
                              </span>
                            )}
                            {drawingFeedback && (
                              <span className="text-[10px] opacity-75 font-semibold text-center italic">
                                AI Teacher says: "{drawingFeedback}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Input field to check their spelling */}
                        <div className="mt-4 max-w-sm mx-auto flex flex-col gap-2">
                           <input
                            type="text"
                            value={grTracingWordInput}
                            onChange={(e) => setGrTracingWordInput(e.target.value)}
                            disabled={quizSubmitted}
                            placeholder="Type the word you traced here..."
                            className={`w-full px-4 py-2 border-2 rounded-xl text-center text-sm font-bold uppercase transition ${quizSubmitted ? (grTypingCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-rose-400 bg-rose-50 text-rose-950') : 'border-slate-200 bg-white placeholder:text-slate-300 focus:border-indigo-500 outline-hidden'}`}
                           />
                           
                           {quizSubmitted && grTypingCorrect !== null && (
                             <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${grTypingCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                               {grTypingCorrect ? (
                                 <><span className="text-emerald-500">✅</span> Correct spelling!</>
                               ) : (
                                 <><span className="text-rose-500">❌</span> Check your spelling.</>
                               )}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Custom Tech Challenge Activity for R-T1-W2 (Coloring Pattern) */}
                {lesson.id === 'R-T1-W2' && (
                  <div className={`p-5 rounded-2xl border space-y-4 transition ${quizSubmitted ? (grW1P2Correct ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200') : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-250 font-bold text-[10px] text-slate-800 flex items-center justify-center shrink-0">
                         2
                      </span>
                      <div className="space-y-1 w-full">
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-normal">
                          Coloring Activity: What colour should the last shape be in this new pattern?
                        </p>
                        
                        {/* Pattern Display row */}
                        <div className="flex flex-wrap items-center gap-2 py-3">
                          <div className="w-8 h-8 bg-sky-500 border-2 border-sky-600 shadow-3xs flex items-center justify-center text-white font-extrabold text-xs">🟦</div>
                          <div className="w-8 h-8 bg-emerald-500 border-2 border-emerald-600 shadow-3xs flex items-center justify-center text-white font-extrabold text-xs">🟩</div>
                          <div className="w-8 h-8 bg-sky-500 border-2 border-sky-600 shadow-3xs flex items-center justify-center text-white font-extrabold text-xs">🟦</div>
                          <div className="w-8 h-8 bg-emerald-500 border-2 border-emerald-600 shadow-3xs flex items-center justify-center text-white font-extrabold text-xs">🟩</div>
                          <div className="text-slate-400 font-extrabold text-xs px-1">➡️</div>
                          <div className="relative">
                            <ColoringCanvas
                              imageSrc={`data:image/svg+xml,${encodeURIComponent("<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><rect x='10' y='10' width='80' height='80' stroke='#cbd5e1' stroke-width='6' fill='none'/><text x='50' y='55' font-family='sans-serif' font-size='12' font-weight='bold' fill='#94a3b8' text-anchor='middle'>Color Me!</text></svg>")}`}
                              altText="Square pattern shape"
                              hidePalette={true}
                              externalActiveColor={
                                grW1P2ActiveColor === 'Red' ? '#ef4444' :
                                grW1P2ActiveColor === 'Orange' ? '#f97316' :
                                grW1P2ActiveColor === 'Yellow' ? '#fbbf24' :
                                grW1P2ActiveColor === 'Green' ? '#22c55e' :
                                grW1P2ActiveColor === 'Blue' ? '#0ea5e9' :
                                grW1P2ActiveColor === 'Purple' ? '#a855f7' :
                                grW1P2ActiveColor === 'Pink' ? '#ec4899' : '#000000'
                              }
                              onColor={() => {
                                if (quizSubmitted) return;
                                if (!grW1P2ActiveColor) {
                                   setGrW1P2Feedback('Please select a crayon colour first!');
                                   speakText('Please select a crayon colour first!');
                                   return;
                                }
                                setGrW1P2Feedback('');
                                speakText(`Fabulous! You painted the shape with your ${grW1P2ActiveColor} crayon! Let's complete the repeating pattern quiz question below, then click Submit Evaluation!`);
                              }}
                            />
                            {quizSubmitted && (
                              <div className="absolute inset-0 bg-transparent z-10" />
                            )}
                          </div>
                        </div>

                        {!quizSubmitted && (
                          <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 bg-fuchsia-100/50 border border-fuchsia-200 rounded-full max-w-sm mx-auto mt-2">
                            <span className="text-[10px] font-extrabold tracking-wide text-fuchsia-800 uppercase pl-1 select-none">
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
                                { name: 'Pink', hex: 'Pink', bg: 'bg-pink-500' },
                              ].map((color) => {
                                const isSelected = grW1P2ActiveColor === color.hex;
                                return (
                                  <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => {
                                      setGrW1P2ActiveColor(color.hex);
                                      setGrW1P2Feedback('');
                                      playChime();
                                      speakText(`You chose the ${color.name} crayon. Now click and drag inside the square shape to color it in!`);
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
                        )}

                        {grW1P2Feedback && (
                          <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2 border ${
                            grW1P2Correct 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            <span>{grW1P2Correct ? '🎉' : '💡'}</span>
                            <p>{grW1P2Feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                

                {/* Custom Tech Challenge Activity for R-T1-W4 (Picture Ordering) */}
                {lesson.id === 'R-T1-W4' && (
                  <div className={`p-5 rounded-2xl border space-y-4 transition ${quizSubmitted ? (grW3Correct ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200') : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-250 font-bold text-[10px] text-slate-800 flex items-center justify-center shrink-0">
                         2
                      </span>
                      <div className="space-y-1 w-full">
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-normal">
                          Picture Story Activity: Click the pictures in the correct order (Start, Next, Finish) to show how we bake cookies!
                        </p>
                        
                        {/* Order Display row */}
                        <div className="flex flex-wrap items-center gap-3 py-3">
                          {[0, 1, 2].map(slotIdx => {
                            const val = grW3Order[slotIdx];
                            return (
                               <div key={`slot-${slotIdx}`} className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm transition-all ${val ? 'bg-white border-indigo-400' : 'bg-slate-100 border-slate-200 border-dashed'} text-center`} onClick={() => {
                                 if (!quizSubmitted && val) {
                                   setGrW3Order(prev => prev.filter(v => v !== val));
                                   playPop();
                                 }
                               }}>
                                 {val && (
                                   <>
                                     <span className="text-2xl">{val === 'Start' ? '🥣' : val === 'Middle' ? '🍪' : '😋'}</span>
                                     <span className="text-[9px] font-bold text-slate-600 mt-1">{val === 'Start' ? 'Mix' : val === 'Middle' ? 'Bake' : 'Eat'}</span>
                                   </>
                                 )}
                                 {!val && <span className="text-[10px] font-bold text-slate-400">Step {slotIdx + 1}</span>}
                               </div>
                            );
                          })}
                        </div>

                        {!quizSubmitted && (
                          <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl max-w-sm mt-2">
                            <span className="text-xs font-extrabold tracking-wide text-indigo-800 uppercase select-none w-full mb-1">
                              ✨ Click to add to the story:
                            </span>
                            <div className="flex gap-2">
                              {['Middle', 'Start', 'End'].map((stepVal) => {
                                const isSelected = grW3Order.includes(stepVal);
                                return (
                                  <button
                                    key={stepVal}
                                    type="button"
                                    disabled={isSelected}
                                    onClick={() => {
                                      if (grW3Order.length < 3) {
                                        setGrW3Order([...grW3Order, stepVal]);
                                        setGrW3Feedback('');
                                        playPop();
                                      }
                                    }}
                                    className={`w-16 h-16 rounded-xl bg-white border flex flex-col items-center justify-center text-xl transition-all duration-155 ${
                                      isSelected ? 'opacity-50 scale-95 border-slate-200 shadow-none grayscale' : 'border-slate-300 hover:scale-105 active:scale-95 text-slate-700 shadow-sm border-2 border-indigo-200 hover:border-indigo-400'
                                    } cursor-pointer relative`}
                                  >
                                    <span className="text-2xl">{stepVal === 'Start' ? '🥣' : stepVal === 'Middle' ? '🍪' : '😋'}</span>
                                    <span className="text-[9px] font-bold text-slate-600 mt-1">{stepVal === 'Start' ? 'Mix' : stepVal === 'Middle' ? 'Bake' : 'Eat'}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {grW3Feedback && (
                          <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2 border ${
                            grW3Correct 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            <span>{grW3Correct ? '🎉' : '💡'}</span>
                            <p>{grW3Feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                

                {/* Custom Tech Challenge Activity for 1-T1-W1 (Coloring Pattern) */}
                {lesson.id === '1-T1-W1' && (
                  <div className={`p-5 rounded-2xl border space-y-4 transition ${quizSubmitted ? (g1w1Correct ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200') : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-250 font-bold text-[10px] text-slate-800 flex items-center justify-center shrink-0">
                         1
                      </span>
                      <div className="space-y-1 w-full">
                        <p className="text-xs md:text-sm font-bold text-slate-900 leading-normal">
                          Coloring Activity: Complete the alternating 3-shape sequence (Red, Green, Blue, Red, Green...)
                        </p>
                        
                        {/* Pattern Display row */}
                        <div className="flex flex-wrap items-center gap-2 py-3">
                          <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-rose-600 shadow-3xs"></div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-600 shadow-3xs"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-600 shadow-3xs"></div>
                          <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-rose-600 shadow-3xs"></div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-600 shadow-3xs"></div>
                          <div className="text-slate-400 font-extrabold text-xs px-1">➡️</div>
                          <div className="relative">
                            <ColoringCanvas
                              imageSrc={`data:image/svg+xml,${encodeURIComponent("<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><circle cx='60' cy='60' r='50' stroke='#cbd5e1' stroke-width='6' fill='none'/><text x='60' y='65' font-family='sans-serif' font-size='12' font-weight='bold' fill='#94a3b8' text-anchor='middle'>Color Me!</text></svg>")}`}
                              altText="Circle pattern shape"
                              hidePalette={true}
                              externalActiveColor={
                                g1w1SelectedCrayon === 'Red' ? '#ef4444' :
                                g1w1SelectedCrayon === 'Orange' ? '#f97316' :
                                g1w1SelectedCrayon === 'Green' ? '#10b981' :
                                g1w1SelectedCrayon === 'Blue' ? '#3b82f6' :
                                g1w1SelectedCrayon === 'Pink' ? '#ec4899' : '#000000'
                              }
                              onColor={() => {
                                if (quizSubmitted) return;
                                if (!g1w1SelectedCrayon) {
                                   setG1w1Feedback('Please select a crayon colour first!');
                                   speakText('Please select a crayon colour first!');
                                   return;
                                }
                                setG1w1Feedback('');
                                setG1w1ActiveColor(g1w1SelectedCrayon);
                                // The correctness will be graded on submit.
                              }}
                            />
                            {quizSubmitted && (
                              <div className="absolute inset-0 bg-transparent z-10" />
                            )}
                          </div>
                        </div>

                        {!quizSubmitted && (
                          <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 bg-fuchsia-100/50 border border-fuchsia-200 rounded-full max-w-sm mx-auto mt-2">
                            <span className="text-[10px] font-extrabold tracking-wide text-fuchsia-800 uppercase pl-1 select-none">
                              🖍️ Choose Crayon:
                            </span>
                            <div className="flex items-center gap-1.5">
                              {[
                                { name: 'Red', hex: 'Red', bg: 'bg-red-500' },
                                { name: 'Orange', hex: 'Orange', bg: 'bg-orange-500' },
                                { name: 'Green', hex: 'Green', bg: 'bg-emerald-500' },
                                { name: 'Blue', hex: 'Blue', bg: 'bg-blue-500' },
                                { name: 'Pink', hex: 'Pink', bg: 'bg-pink-500' },
                              ].map((color) => {
                                const isSelected = g1w1SelectedCrayon === color.hex;
                                return (
                                  <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => {
                                      setG1w1SelectedCrayon(color.hex);
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
                        )}

                        {g1w1Feedback && (
                          <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2 border ${
                            g1w1Correct 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            <span>{g1w1Correct ? '🎉' : '💡'}</span>
                            <p>{g1w1Feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {workbookConfig.questions.map((q, qIdx) => {
                  const selectedId = quizAnswers[qIdx];
                  const hasAnswered = selectedId !== undefined;

                  return (
                    <div 
                      key={qIdx} 
                      className={`p-5 rounded-2xl border space-y-3 transition ${
                        quizSubmitted 
                          ? selectedId === q.correct 
                            ? 'bg-emerald-50/20 border-emerald-200' 
                            : 'bg-rose-50/20 border-rose-200'
                          : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-250 font-bold text-[10px] text-slate-800 flex items-center justify-center shrink-0">
                          {lesson.id === 'R-T1-W2' ? qIdx + 4 : lesson.id === '1-T1-W1' ? qIdx + 2 : lesson.id === 'R-T1-W4' ? qIdx + 3 : lesson.id === 'R-T1-W9' ? qIdx + 2 : lesson.grade === 'R' ? qIdx + 2 : qIdx + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm md:text-base font-bold text-slate-900 leading-normal mb-1">
                            {lesson.grade === 'R' ? <SpeakableText text={q.q} /> : q.q}
                          </p>
                          {lesson.grade !== 'R' && (
                            <button
                              type="button"
                              onClick={() => speakText(q.q)}
                              className="text-[9px] text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Listen Question 🔊</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {q.beadColors && (
                        <div className="my-4 p-4 bg-amber-50/25 rounded-2xl border border-dashed border-amber-200/60 max-w-sm mx-auto flex flex-col items-center justify-center animate-in fade-in duration-300">
                          <span className="text-[9px] uppercase font-black text-amber-900/50 mb-3 tracking-wider">
                            Bracelet Pattern Specimen:
                          </span>
                          <div className="relative w-full flex items-center justify-center min-h-[44px]">
                            {/* Golden Thread Wire */}
                            <div className="absolute inset-x-2 h-0.5 bg-amber-500/40 rounded-full"></div>
                            <div className="absolute left-2 w-1.5 h-3 bg-amber-600 rounded-sm"></div>
                            <div className="absolute right-2 w-1.5 h-3 bg-amber-600 rounded-sm"></div>

                            {/* Beads Row */}
                            <div className="flex items-center justify-center gap-3 z-10">
                              {q.beadColors.map((b, bIdx) => {
                                let bgCol = '#ef4444'; // default red
                                if (b === '🟡') bgCol = '#facc15';
                                if (b === '🔵') bgCol = '#3b82f6';
                                if (b === '🟢') bgCol = '#10b981';
                                return (
                                  <div 
                                    key={bIdx}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-md border border-white relative shrink-0"
                                    style={{
                                      backgroundColor: bgCol,
                                      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.25), inset 2px 2px 4px rgba(255,255,255,0.4), 0 3px 5px rgba(0,0,0,0.1)'
                                    }}
                                  >
                                    <span className="select-none text-base leading-none">{b}</span>
                                    <span className="absolute bottom-[-16px] text-[7px] font-black text-slate-400 font-mono">
                                      #{bIdx + 1}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* Extra spacer to balance out numbering labels */}
                          <div className="h-2.5" />
                        </div>
                      )}

                      {lesson.id === 'R-T1-W9' && qIdx === 0 && (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-100/60 rounded-2xl border border-slate-200/50 my-3">
                          <span className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-wider">Sound Pattern Row</span>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center p-2 bg-rose-50 border border-rose-200 rounded-xl w-14 h-18 justify-center shadow-3xs animate-in fade-in duration-200">
                              <span className="text-3xl">🥁</span>
                              <span className="text-[8px] font-black text-rose-700 mt-1 uppercase">DRUM</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-amber-50 border border-amber-200 rounded-xl w-14 h-18 justify-center shadow-3xs animate-in fade-in duration-250">
                              <span className="text-3xl">👏</span>
                              <span className="text-[8px] font-black text-amber-700 mt-1 uppercase">CLAP</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-rose-50 border border-rose-200 rounded-xl w-14 h-18 justify-center shadow-3xs animate-in fade-in duration-300">
                              <span className="text-3xl">🥁</span>
                              <span className="text-[8px] font-black text-rose-700 mt-1 uppercase">DRUM</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-amber-50 border border-amber-200 rounded-xl w-14 h-18 justify-center shadow-3xs animate-in fade-in duration-350">
                              <span className="text-3xl">👏</span>
                              <span className="text-[8px] font-black text-amber-700 mt-1 uppercase">CLAP</span>
                            </div>
                            <div className="text-slate-400 font-extrabold text-xs px-0.5">➡️</div>
                            <div className="flex flex-col items-center p-2 bg-indigo-50 border border-indigo-200 rounded-xl w-14 h-18 justify-center shadow-xs animate-bounce border-dashed">
                              <span className="text-3xl font-black text-indigo-600">❓</span>
                              <span className="text-[8px] font-black text-indigo-700 mt-1 uppercase">NEXT?</span>
                            </div>
                          </div>
                        </div>
                      )}



                      {lesson.id === 'R-T1-W9' && qIdx === 2 && (
                        <div className="p-4 bg-slate-100/60 rounded-2xl border border-slate-200/50 my-3 flex flex-col items-center w-full max-w-sm mx-auto">
                          <span className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-wider text-center">Rhythm Matching Challenge</span>
                          
                          <div className="flex flex-col items-center gap-4 w-full">
                            {/* Target Pattern Playback */}
                            <button
                              type="button"
                              onClick={() => {
                                let step = 0;
                                const interval = setInterval(() => {
                                  if (step >= 4) {
                                    clearInterval(interval);
                                    return;
                                  }
                                  if (step % 2 === 0) playDrumAudio('kick');
                                  else playDrumAudio('snare');
                                  step++;
                                }, 600);
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
                            >
                              <span>🔊 Listen to the Beat</span>
                            </button>

                            {/* Current progress visualization */}
                            <div className="flex gap-2 justify-center h-12 my-1">
                              {[0, 1, 2, 3].map((idx) => {
                                const val = grW8Sequence[idx];
                                return (
                                  <div 
                                    key={`q4-slot-${idx}`} 
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${
                                      val ? 'bg-fuchsia-50 border-fuchsia-400 scale-105 shadow-3xs' : 'bg-slate-50 border-slate-200 border-dashed'
                                    }`}
                                  >
                                    {val === "🔴" ? "🥁" : val === "🟡" ? "👏" : ""}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Pad Controls */}
                            {!quizSubmitted ? (
                              <div className="flex gap-4 w-full justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    playDrumAudio('kick');
                                    const nextSeq = [...grW8Sequence, '🔴'];
                                    if (nextSeq.length <= 4) {
                                      setGrW8Sequence(nextSeq);
                                      if (nextSeq.length === 4) {
                                        if (nextSeq.join(',') === '🔴,🟡,🔴,🟡') {
                                          playChime();
                                          speakText("Excellent! You matched the beat! Drum, Clap, Drum, Clap.");
                                          handleSelectQuizOpt(qIdx, q.correct);
                                        } else {
                                          playBoop();
                                          speakText("Let's try that again!");
                                          setTimeout(() => setGrW8Sequence([]), 1200);
                                        }
                                      }
                                    }
                                  }}
                                  className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs w-28 justify-center"
                                >
                                  <span>🥁 DRUM</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playDrumAudio('snare');
                                    const nextSeq = [...grW8Sequence, '🟡'];
                                    if (nextSeq.length <= 4) {
                                      setGrW8Sequence(nextSeq);
                                      if (nextSeq.length === 4) {
                                        if (nextSeq.join(',') === '🔴,🟡,🔴,🟡') {
                                          playChime();
                                          speakText("Excellent! You matched the beat! Drum, Clap, Drum, Clap.");
                                          handleSelectQuizOpt(qIdx, q.correct);
                                        } else {
                                          playBoop();
                                          speakText("Let's try that again!");
                                          setTimeout(() => setGrW8Sequence([]), 1200);
                                        }
                                      }
                                    }
                                  }}
                                  className="px-4 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs w-28 justify-center"
                                >
                                  <span>👏 CLAP</span>
                                </button>
                              </div>
                            ) : (
                              <div className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-250 animate-pulse">
                                🎉 Beat matched successfully!
                              </div>
                            )}

                            {grW8Sequence.length > 0 && !quizSubmitted && (
                              <button
                                type="button"
                                onClick={() => setGrW8Sequence([])}
                                className="text-[10px] text-slate-400 hover:text-slate-600 uppercase font-bold underline cursor-pointer"
                              >
                                Reset beat sequence
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Options */}
                      {!(lesson.id === 'R-T1-W9' && qIdx === 2) && (
                        <div className={`grid ${q.opts.length === 2 ? 'grid-cols-2 max-w-md mx-auto' : 'grid-cols-3'} gap-2.5 pt-1`}>
                          {q.opts.map((opt, oIdx) => {
                            const isOptionSelected = selectedId === oIdx;

                            let textPart = opt;
                            let emojiPart = null;
                            if (lesson.grade === 'R') {
                              const match = opt.match(/^(.*?)([\p{Emoji_Presentation}\p{Extended_Pictographic}].*)$/u);
                              if (match) {
                                textPart = match[1].trim();
                                emojiPart = match[2].trim();
                              }
                            }

                            const isYes = textPart.toUpperCase() === 'YES';
                            const isNo = textPart.toUpperCase() === 'NO';

                            let btnStyle = 'border-slate-250 bg-white hover:border-slate-400';
                            
                            if (isOptionSelected) {
                              if (isYes) {
                                btnStyle = 'border-emerald-500 bg-emerald-50/75 ring-2 ring-emerald-500 text-emerald-950 font-black';
                              } else if (isNo) {
                                btnStyle = 'border-rose-500 bg-rose-50/75 ring-2 ring-rose-500 text-rose-950 font-black';
                              } else {
                                btnStyle = 'border-indigo-605 bg-indigo-50/60 ring-2 ring-indigo-500';
                              }
                            }

                            if (quizSubmitted) {
                              if (oIdx === q.correct) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black';
                              } else if (isOptionSelected) {
                                btnStyle = 'border-rose-300 bg-rose-50 text-rose-950 line-through opacity-75';
                              } else {
                                btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => handleSelectQuizOpt(qIdx, oIdx)}
                                className={`p-3 rounded-2xl border text-center transition cursor-pointer select-none active:scale-95 flex flex-col items-center justify-center gap-1 min-h-[5rem] ${btnStyle}`}
                              >
                                {lesson.id === 'R-T1-W9' && qIdx === 1 ? (
                                  <div className="flex flex-col items-center gap-2 w-full">
                                    {oIdx === 0 && (
                                      <>
                                        <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                          <span className="text-2xl" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Drum">🥁</span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-slate-700 leading-tight">No pattern</span>
                                      </>
                                    )}
                                    {oIdx === 1 && (
                                      <>
                                        <div className="flex gap-1 p-1 bg-indigo-50 border border-indigo-150 rounded-xl ring-2 ring-indigo-50/30">
                                          <span className="text-2xl animate-pulse" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Clap">👏</span>
                                          <span className="text-2xl animate-pulse" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Clap">👏</span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black text-indigo-700 leading-tight">Repeats perfectly! ✨</span>
                                      </>
                                    )}
                                    {oIdx === 2 && (
                                      <>
                                        <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                          <span className="text-2xl" title="Drum">🥁</span>
                                          <span className="text-2xl" title="Sneeze">🤧</span>
                                          <span className="text-2xl" title="Giggle">🤭</span>
                                          <span className="text-2xl" title="Yawn">🥱</span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-slate-700 leading-tight">Random sounds</span>
                                      </>
                                    )}
                                  </div>
                                ) : lesson.grade === 'R' ? (
                                  <>
                                    {emojiPart && <span className="text-4xl drop-shadow-sm pointer-events-none mb-1">{emojiPart}</span>}
                                    {textPart && <span className="text-xs md:text-sm font-bold text-slate-700 pointer-events-none leading-tight">{textPart}</span>}
                                  </>
                                ) : (
                                  <span className="text-base tracking-[0.25em] font-bold">{opt}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {quizSubmitted && selectedId !== q.correct && (
                        <p className="text-[10px] text-rose-600 font-bold leading-normal">
                          💡 Hint: {q.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submission Controls */}
              {!quizSubmitted ? (
                <div className="pt-4 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < workbookConfig.questions.length || (lesson.grade === 'R' && (!grTracingCompleted || grTracingWordInput.trim().length === 0)) || (lesson.id === '1-T1-W1' && g1w1ActiveColor === null) || (lesson.id === 'R-T1-W2' && grW1P2ActiveColor === null) || (lesson.id === 'R-T1-W4' && grW3Order.length < 3) || (lesson.id === 'R-T1-W9' && grW8Sequence.join(',') !== '🔴,🟡,🔴,🟡')}
                    className={`px-6 py-3 font-extrabold rounded-xl text-xs active:scale-95 transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      (Object.keys(quizAnswers).length >= workbookConfig.questions.length && (lesson.grade !== 'R' || (grTracingCompleted && grTracingWordInput.trim().length > 0)) && (lesson.id !== '1-T1-W1' || g1w1ActiveColor !== null) && (lesson.id !== 'R-T1-W2' || grW1P2ActiveColor !== null) && (lesson.id !== 'R-T1-W4' || grW3Order.length === 3) && (lesson.id !== 'R-T1-W9' || grW8Sequence.join(',') === '🔴,🟡,🔴,🟡'))
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Submit Tech Challenge 🚀</span>
                  </button>
                  {(Object.keys(quizAnswers).length < workbookConfig.questions.length || (lesson.grade === 'R' && (!grTracingCompleted || grTracingWordInput.trim().length === 0)) || (lesson.id === '1-T1-W1' && g1w1ActiveColor === null) || (lesson.id === 'R-T1-W2' && grW1P2ActiveColor === null) || (lesson.id === 'R-T1-W4' && grW3Order.length < 3) || (lesson.id === 'R-T1-W9' && grW8Sequence.join(',') !== '🔴,🟡,🔴,🟡')) && (
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                      Complete all activities to submit!
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-center md:justify-start flex-wrap gap-1">
                      {Array.from({ length: quizTotalScore ?? 3 }).map((_, i) => i + 1).map((starIdx) => {
                        const isEarned = (quizFinalScore ?? 0) >= starIdx;
                        return (
                          <Star 
                            key={starIdx} 
                            className={`transition-all ${
                              quizTotalScore && quizTotalScore > 5 
                                ? 'w-5 h-5 sm:w-6 sm:h-6' 
                                : 'w-7 h-7'
                            } ${
                              isEarned 
                                ? 'text-amber-500 fill-amber-500 animate-bounce' 
                                : 'text-slate-200'
                            }`} 
                          />
                        );
                      })}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                      Secured Score: {quizFinalScore} / {quizTotalScore} 
                      {quizTotalScore ? ` (${Math.round(((quizFinalScore ?? 0) / quizTotalScore) * 100)}%)` : ''} - ⭐
                    </h4>

                    <p className="text-xs text-slate-500 max-w-md mx-auto md:mx-0 leading-relaxed">
                      Well done, champion! This homework is officially locked and submitted. Your progress can no longer be redone to keep your scores secure on this workbook session.
                    </p>
                  </div>

                  {/* Celebration Mascot Badge */}
                  <div className="flex-shrink-0 relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden select-none z-10 p-2">
                    {lesson.grade === 'R' ? (
                      <img 
                        src={getZolaImage('clapping')} 
                        alt="Zola"
                        referrerPolicy="no-referrer"
                        className="w-[95%] h-[95%] object-contain rounded-full"
                      />
                    ) : (
                      <MascotGirl grade="1" pose="clapping" className="w-[95%] h-[95%]" />
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setCurrentPage(1);
                      }}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-850 text-white font-extrabold rounded-xl text-xs active:scale-95 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Back to Study Section</span>
                    </button>

                    {lesson.id !== 'R-T1-W8' && (
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          // Reset submission state
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                          setQuizFinalScore(0);
                          setQuizTotalScore(3);
                          localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_submitted`);
                          localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_score`);
                          localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_total`);
                          localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_answers`);

                          // Also clear tracing if Grade R
                          if (lesson.grade === 'R') {
                            setGrTracingCompleted(false);
                            setGrTracingWordInput('');
                            setGrTracingCorrect(null);
                            setGrTypingCorrect(null);
                            setDrawingFeedback('');
                            setGrIdentifiedWord('');
                            localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing`);
                            localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_input`);
                            localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_tracing_correct`);
                            localStorage.removeItem(`gr_wb_${activeStudentId || 'default'}_${lesson.id}_typing_correct`);
                          }
                          
                          // Speak encouraging words
                          speakText("Workbook reset! You can now edit your designs and try again to get all the stars!");
                        }}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs active:scale-95 transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Try Again / Redo 🔄</span>
                      </button>
                    )}

                    {onNextLesson && (
                      <button
                        type="button"
                        onClick={() => {
                          playChime();
                          onComplete(quizFinalScore ?? 3, quizTotalScore ?? 3);
                          onNextLesson();
                        }}
                        className="px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition shadow-md cursor-pointer inline-flex items-center gap-1.5 animate-bounce"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Continue to Next Lesson 🚀</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
