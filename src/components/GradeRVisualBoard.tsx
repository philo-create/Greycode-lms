import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowUp, 
  ArrowRight, 
  ArrowDown, 
  ArrowLeft, 
  Check, 
  Tv, 
  Smartphone, 
  Laptop, 
  Trash2, 
  Play, 
  Award,
  Gamepad,
  Sparkle
} from 'lucide-react';
import SpeakableText from './SpeakableText';

// Drum synthesizer using Web Audio API for interactive drum pad
export const playDrumAudio = (type: 'kick' | 'snare') => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const t = ctx.currentTime;
  
  if (type === 'kick') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.5);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.5);
  } else if (type === 'snare') {
    const bufferSize = ctx.sampleRate * 0.2; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    noise.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(t);
  }
};

interface GradeRVisualBoardProps {
  lessonId: string;
}

export default function GradeRVisualBoard({ lessonId }: GradeRVisualBoardProps) {
  // Pattern interactive state (R-T1-W1)
  const [patternAnswers, setPatternAnswers] = useState<(string | null)[]>([null, null]);
  const [patternSuccess, setPatternSuccess] = useState(false);

  // Arrow card interactive state (R-T1-W4)
  const [bunnyPosition, setBunnyPosition] = useState<number>(0); // 0 = start, 1 = mid, 2 = eating, 3 = happy
  const [arrowCommands, setArrowCommands] = useState<string[]>([]);

  // Input/Output tapping state (R-T1-W9)
  const [isPhoneRinging, setIsPhoneRinging] = useState(false);

  // Rhythm percussion interactive states (R-T1-W8)
  const [rhythmSequence, setRhythmSequence] = useState<string[]>([]);
  const [rhythmSuccessState, setRhythmSuccessState] = useState(false);

  // Desktop parts interactive states (R-T1-W9)
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  // General audio states
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  const speakTextDirectly = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (activeSpeech === text) {
      setActiveSpeech(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.25;
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

  const playCorrectSound = () => {
    // Simple synth beep if web audio API is available
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const playClickSound = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const playRingSound = () => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } catch (e) {
        console.log(e);
      }
    }
  };


  // --- RENDER VISUAL CONTENT PER LEVEL ---
  const renderVisualContent = () => {
    switch (lessonId) {
      // WEEK 1: Rudimentary Patterns
      case 'R-T1-W1':
        return (
          <div className="space-y-5">
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-center space-y-2">
              <span className="text-3xl animate-pulse block">🔴 🔵 🔴 🔵</span>
              <p className="text-xs font-black text-amber-950 uppercase tracking-tight">
                Can you complete our pattern chain?
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Tap the balloons to fill in the correct colors! Let's solve it.
              </p>
            </div>

            {/* Pattern Chain Display */}
            <div className="flex items-center justify-center gap-3.5 py-4 bg-white/70 rounded-2xl border border-slate-100 shadow-3xs">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-red-500 shadow-md flex items-center justify-center text-white text-xs select-none animate-bounce">🎈</div>
                <span className="text-[9px] text-slate-400 font-bold mt-1">1. Red</span>
              </div>
              <span className="text-slate-400 font-bold">➡️</span>
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-blue-500 shadow-md flex items-center justify-center text-white text-xs select-none">🎈</div>
                <span className="text-[9px] text-slate-400 font-bold mt-1">2. Blue</span>
              </div>
              <span className="text-slate-400 font-bold">➡️</span>
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-red-500 shadow-md flex items-center justify-center text-white text-xs select-none">🎈</div>
                <span className="text-[9px] text-slate-400 font-bold mt-1">3. Red</span>
              </div>
              <span className="text-slate-400 font-bold">➡️</span>
              
              {/* Slot 4 */}
              <button 
                type="button"
                onClick={() => {
                  playClickSound();
                  const nextAnswers = [...patternAnswers];
                  nextAnswers[0] = nextAnswers[0] === 'blue' ? 'red' : 'blue';
                  setPatternAnswers(nextAnswers);
                  checkPattern(nextAnswers);
                }}
                className={`w-11 h-11 rounded-full border-1 border-dashed flex items-center justify-center transition-all cursor-pointer shadow-3xs ${
                  patternAnswers[0] === 'blue' 
                    ? 'bg-blue-500 border-blue-600 text-white font-bold animate-pulse text-lg' 
                    : patternAnswers[0] === 'red'
                    ? 'bg-red-500 border-red-600 text-white font-bold animate-pulse text-lg'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-400 text-sm font-black'
                }`}
              >
                {patternAnswers[0] ? '🎈' : '?'}
              </button>

              <span className="text-slate-400 font-bold">➡️</span>
              
              {/* Slot 5 */}
              <button 
                type="button"
                onClick={() => {
                  playClickSound();
                  const nextAnswers = [...patternAnswers];
                  nextAnswers[1] = nextAnswers[1] === 'red' ? 'blue' : 'red';
                  setPatternAnswers(nextAnswers);
                  checkPattern(nextAnswers);
                }}
                className={`w-11 h-11 rounded-full border-1 border-dashed flex items-center justify-center transition-all cursor-pointer shadow-3xs ${
                  patternAnswers[1] === 'red' 
                    ? 'bg-red-500 border-red-600 text-white font-bold animate-pulse text-lg' 
                    : patternAnswers[1] === 'blue'
                    ? 'bg-blue-500 border-blue-600 text-white font-bold animate-pulse text-lg'
                    : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-400 text-sm font-black'
                }`}
              >
                {patternAnswers[1] ? '🎈' : '?'}
              </button>
            </div>

            {/* Hint Box */}
            <div className="text-center">
              {patternAnswers[0] === null && patternAnswers[1] === null ? (
                <div className="text-[11px] text-slate-500 font-bold italic">
                  💡 Hint: We go Red, Blue, Red, then what comes next? tap the question marks!
                </div>
              ) : patternSuccess ? (
                <div className="bg-emerald-500 border border-emerald-600 rounded-xl p-3 text-white text-xs font-black tracking-tight animate-bounce flex items-center justify-center gap-1.5 shadow-sm">
                  <span>🎉 Perfect! Red ➔ Blue ➔ Red ➔ Blue ➔ Red! You are a brilliant coder! 🏆</span>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-rose-800 text-[11px] font-bold">
                  ⚠️ Keep tapping! Find the combination that alternates perfectly!
                </div>
              )}
            </div>
          </div>
        );

      // WEEK 2: My First Computing Devices
      case 'R-T1-W2':
        return (
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200/60 rounded-2xl p-4 text-center space-y-1.5">
              <span className="text-3xl animate-wiggle block">📱 💻 🖥️</span>
              <p className="text-xs font-black text-sky-950 uppercase tracking-tight">
                Our Amazing Computers Family!
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Tap on each device to learn its name and how we use it!
              </p>
            </div>

            {/* Smart Devices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a cell phone! It fits in our hand and lets us talk to people far away.");
                }}
                className={`bg-white border hover:border-sky-350 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 shadow-3xs cursor-pointer active:scale-95 transition ${
                  activeSpeech?.includes("cell phone") ? 'ring-2 ring-sky-400 bg-sky-50/30' : 'border-slate-150'
                }`}
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-3xs">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h6 className="font-extrabold text-xs text-indigo-950">Mobile Phone</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Fits in your pocket! 📱</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a tablet or laptop! It has a larger screen for lessons and watching videos.");
                }}
                className={`bg-white border hover:border-sky-350 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 shadow-3xs cursor-pointer active:scale-95 transition ${
                  activeSpeech?.includes("tablet") ? 'ring-2 ring-sky-400 bg-sky-50/30' : 'border-slate-150'
                }`}
              >
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-3xl shadow-3xs">
                  <Laptop className="w-7 h-7" />
                </div>
                <div>
                  <h6 className="font-extrabold text-xs text-indigo-950">Tablet & Laptop</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">For cool school games! 💻</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a big desktop computer! It sits on a table. It uses a keyboard and mouse.");
                }}
                className={`bg-white border hover:border-sky-350 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 shadow-3xs cursor-pointer active:scale-95 transition ${
                  activeSpeech?.includes("desktop") ? 'ring-2 ring-sky-400 bg-sky-50/30' : 'border-slate-150'
                }`}
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-3xs">
                  <Tv className="w-7 h-7" />
                </div>
                <div>
                  <h6 className="font-extrabold text-xs text-indigo-950">Desktop Computer</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Sits on a real desk! 🖥️</p>
                </div>
              </button>
            </div>
          </div>
        );

      // WEEK 3: Picture Stories — Beginning, Middle and End
      case 'R-T1-W3':
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 text-center space-y-1.5">
              <span className="text-3xl block">🧼 🚿 🧴</span>
              <p className="text-xs font-black text-emerald-990 uppercase tracking-tight">
                Brushing and Washing Story
              </p>
              <p className="text-[11px] text-slate-655 font-bold">
                Order matters! Tap each card to hear the daily routine steps:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Step one: Put soap on your wet hands. Rub them to make bubbles!");
                }}
                className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-3xs transition active:scale-95 ${
                  activeSpeech?.includes("Step one") ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-base font-black text-emerald-750">1</div>
                <div className="text-3xl animate-bounce">🧼</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">1. Soap Hands</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Make nice white bubbles!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Step two: Wash the soap away under the running water faucet!");
                }}
                className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-3xs transition active:scale-95 ${
                  activeSpeech?.includes("Step two") ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-base font-black text-emerald-750">2</div>
                <div className="text-3xl">🚿</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">2. Water Rinse</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Rinse out the germs!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Step three: Use a clean dry towel so your hands look clean and sparkly!");
                }}
                className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-3xs transition active:scale-95 ${
                  activeSpeech?.includes("Step three") ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-base font-black text-emerald-750">3</div>
                <div className="text-3xl">🧴</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">3. Dry Hands</h6>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Wipe dry with clean towels!</p>
                </div>
              </button>
            </div>
          </div>
        );

      // WEEK 4: Introduction to Arrow Cards
      case 'R-T1-W4':
        return (
          <div className="space-y-4">
            <div className="bg-amber-55/40 border border-amber-200 bg-amber-50 rounded-2xl p-4 text-center space-y-1">
              <span className="text-3xl block">🐰 ➡️ 🥕</span>
              <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Sipho bunny needs to jump!</p>
              <p className="text-[11px] text-slate-600 font-semibold">
                Tap on an arrow button to guide our super bunny 🐰 to the orange carrot 🥕!
              </p>
            </div>

            {/* Mini active timeline grid */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-2 left-2 bg-indigo-500/25 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold text-indigo-350">
                Bunny Trail Map
              </div>
              
              <div className="flex items-center justify-between w-full max-w-xs mt-3 bg-slate-800 ring-1 ring-slate-700/60 rounded-xl p-3 h-16 relative">
                <div className={`text-4xl transition-all duration-300 ${
                  bunnyPosition === 0 ? 'translate-x-0' :
                  bunnyPosition === 1 ? 'translate-x-[75px]' :
                  bunnyPosition === 2 ? 'translate-x-[150px] scale-110' :
                  'translate-x-[150px] rotate-12 scale-120'
                }`}>
                  {bunnyPosition === 3 ? '🎉🐰' : '🐰'}
                </div>

                <div className="text-4xl absolute right-3 font-semibold select-none">
                  {bunnyPosition >= 2 ? '😋' : '🥕'}
                </div>
              </div>

              {bunnyPosition === 3 ? (
                <div className="text-xs font-black text-emerald-400 mt-3 animate-bounce">
                  ✨ Sipho bunny is happy and tummy is full! Congratulations! 🥕✨
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 font-semibold mt-2.5">
                  Bunny steps remaining: {2 - bunnyPosition > 0 ? 2 - bunnyPosition : 0} steps to carrot!
                </div>
              )}
            </div>

            {/* Interactive Arrow Commands deck */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  if (bunnyPosition < 2) {
                    setBunnyPosition(prev => {
                      const next = prev + 1;
                      if (next === 2) {
                        playCorrectSound();
                        setTimeout(() => setBunnyPosition(3), 1000);
                      }
                      return next;
                    });
                  }
                }}
                className="w-14 h-14 bg-indigo-600 active:scale-90 hover:bg-indigo-500 text-white rounded-2xl shadow-md border-b-4 border-indigo-800 flex flex-col items-center justify-center cursor-pointer transition"
              >
                <ArrowRight className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase mt-1">FORWARD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setBunnyPosition(0);
                }}
                className="w-14 h-14 bg-rose-550 border-b-4 border-rose-700 hover:bg-rose-500 text-white rounded-2xl shadow-md flex flex-col items-center justify-center cursor-pointer transition active:scale-90"
              >
                <span className="text-[10px] font-black">🔄</span>
                <span className="text-[8px] font-black uppercase mt-1">RETRY</span>
              </button>
            </div>
          </div>
        );

      // WEEK 5: What is a Robot?
      case 'R-T1-W5':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 text-center space-y-1">
              <span className="text-3xl block">🧑 vs 🤖</span>
              <p className="text-xs font-black text-indigo-950 uppercase tracking-tight">Humans and Robots Comparison</p>
              <p className="text-[11px] text-slate-600 font-semibold">
                Tap on each character side to hear differences or characteristics!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Human side */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a beautiful human boy or girl. Humans eat bananas and apples, think by themselves, and sleep in comfy beds at night.");
                }}
                className={`bg-white border rounded-2xl p-4 text-left space-y-3 transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("human boy") ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-xl">🧑</div>
                  <div>
                    <h6 className="font-extrabold text-xs text-slate-800">Our Clever Friends</h6>
                    <span className="text-[8px] font-extrabold text-indigo-500 uppercase tracking-wide">Awesome Human</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-550 pl-2 border-l-2 border-slate-100 font-semibold">
                  <p>🍉 Eats fruits & drinks water</p>
                  <p>🛌 Sleeps to get strong muscles</p>
                  <p>⚽ Plays on green soccer field</p>
                </div>
              </button>

              {/* Robot side */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a friendly metal robot helper! Robots do not eat food, they use batteries for energy. They only follow programs and cannot think by themselves.");
                }}
                className={`bg-white border rounded-2xl p-4 text-left space-y-3 transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("metal robot") ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xl animate-bounce">🤖</div>
                  <div>
                    <h6 className="font-extrabold text-xs text-slate-800">The Helpful Machines</h6>
                    <span className="text-[8px] font-extrabold text-purple-600 uppercase tracking-wide">Programmable Robot</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-550 pl-2 border-l-2 border-slate-100 font-semibold">
                  <p>🔋 Uses gold electric batteries</p>
                  <p>📜 Follows instruction maps</p>
                  <p>🧹 Helps people sweep hard floors</p>
                </div>
              </button>
            </div>
          </div>
        );

      // WEEK 6: Mimic Robot Grid Task
      case 'R-T1-W6':
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block">👶🤖 🪨 🍼</span>
              <p className="text-xs font-black text-amber-950 uppercase tracking-tight">Baby Bot Milk Quest</p>
              <p className="text-[11px] text-slate-655 font-bold">
                Tap on elements below to hear how the baby bot can find yummy milk:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is the baby bot robot. It is very hungry. Let's make a grid code sequence to steer him forward!");
                }}
                className={`bg-white border p-4.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition hover:border-amber-400 active:scale-95 ${
                  activeSpeech?.includes("baby bot") ? 'ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-3xl animate-pulse">👶🤖</span>
                <span className="font-bold text-xs text-slate-800">1. Baby Robot</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Stay away from the dangerous grey spikes and hard rocks. Guide our baby robot safe routes!");
                }}
                className={`bg-white border p-4.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition hover:border-amber-400 active:scale-95 ${
                  activeSpeech?.includes("dangerous grey") ? 'ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-3xl">🪨</span>
                <span className="font-bold text-xs text-slate-800">2. Avoid Obstacles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("This is a bottle of yummy warm milk. This is the goal or output spot of our grid pathway.");
                }}
                className={`bg-white border p-4.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition hover:border-amber-400 active:scale-95 ${
                  activeSpeech?.includes("yummy warm") ? 'ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-3xl">🍼</span>
                <span className="font-bold text-xs text-slate-800">3. Target Milk Goal</span>
              </button>
            </div>
          </div>
        );

      // WEEK 7: Beaded Bracelet Designer
      case 'R-T1-W7':
        return (
          <div className="space-y-4">
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block">📿 ✨ 👑</span>
              <p className="text-xs font-black text-fuchsia-950 uppercase tracking-tight">Pattern Recognition & Bracelet Design</p>
              <p className="text-[11px] text-slate-655 font-bold">
                Tap on each design element to learn about creating patterned bracelets!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Colors and shapes repeat in patterns! An AB pattern alternates blue and red beads. Learning patterns helps robots build products automatically!");
                }}
                className={`bg-white border rounded-2xl p-5 text-left flex items-start gap-4 transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("Colors and shapes") ? 'ring-2 ring-fuchsia-400 bg-fuchsia-50/10' : 'border-slate-200'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">📿</div>
                <div>
                  <h6 className="font-black text-sm text-slate-800">Identify the Patterns</h6>
                  <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">Look at the sequence first. Identify what comes next by repeating the order of colors!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Design is a specification of a product. We must decide which sequence to repeat before we string our beads together to form the custom bracelet!");
                }}
                className={`bg-white border rounded-2xl p-5 text-left flex items-start gap-4 transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("Design is a specification") ? 'ring-2 ring-pink-400 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-pink-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">🎨</div>
                <div>
                  <h6 className="font-black text-sm text-slate-800">Design Specifications</h6>
                  <p className="text-xs text-slate-500 leading-normal font-semibold mt-1">Designers use instructions as guidelines. We ensure our manufactured products are perfectly repeated!</p>
                </div>
              </button>
            </div>
          </div>
        );

      // WEEK 8: Sound & Percussion Rhythm
      case 'R-T1-W8': {
        const expectedPattern = ["🔴", "🟡", "🔴", "🟡"];
        const handleAddBeats = (type: string) => {
          if (rhythmSuccessState) return;
          if (type === "🔴") playDrumAudio('kick');
          if (type === "🟡") playDrumAudio('snare');
          const nextSeq = [...rhythmSequence, type];
          setRhythmSequence(nextSeq);
          
          if (nextSeq.length === 4) {
            const isMatch = nextSeq.every((val, index) => val === expectedPattern[index]);
            if (isMatch) {
              setRhythmSuccessState(true);
              speakTextDirectly("Perfect rhythm! Drum, Clap, Drum, Clap!");
            } else {
              speakTextDirectly("Wrong pattern! Try again. Remember: Drum, Clap, Drum, Clap.");
              setTimeout(() => {
                setRhythmSequence([]);
              }, 1200);
            }
          }
        };

        const playSequenceExample = () => {
          let step = 0;
          const interval = setInterval(() => {
            if (step >= 4) {
              clearInterval(interval);
              return;
            }
            if (expectedPattern[step] === "🔴") playDrumAudio('kick');
            else if (expectedPattern[step] === "🟡") playDrumAudio('snare');
            step++;
          }, 600);
        };

        return (
          <div className="space-y-4">
            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block">🥁</span>
              <p className="text-xs font-black text-fuchsia-950 uppercase tracking-tight">Interactive Drum Pad</p>
              <p className="text-[11px] text-fuchsia-800 font-semibold mt-1">
                Listen to the drum pattern by pressing the play button, then play it yourself!
              </p>
            </div>

            <div className="bg-white p-4 justify-center items-center flex border border-slate-200 rounded-xl">
               <button
                  type="button"
                  onClick={playSequenceExample}
                  className="px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition shadow-sm active:scale-95"
               >
                 <Play className="w-4 h-4 fill-indigo-800" /> Hear Pattern
               </button>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-4 text-center">
              <h6 className="font-black text-xs text-slate-700 uppercase tracking-tight mt-1">Play the sequence:</h6>
              <div className="flex justify-center gap-3 h-12">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 font-bold transition-all duration-150 ${
                    rhythmSequence[idx] 
                      ? 'bg-fuchsia-50 border-fuchsia-400 scale-105 shadow-inner' 
                      : 'bg-slate-50/50 border-slate-200 border-dashed'
                  }`}>
                    {rhythmSequence[idx] === "🟡" ? "👏" : (rhythmSequence[idx] || "")}
                  </div>
                ))}
              </div>

              {!rhythmSuccessState ? (
                <div className="flex justify-center gap-6 pt-5 pb-3">
                  <button
                    type="button"
                    onClick={() => handleAddBeats("🔴")}
                    className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 focus:outline-none text-white font-black text-sm flex flex-col items-center justify-center gap-1 shadow-[0_8px_0_rgb(159,18,57)] active:shadow-[0_0px_0_rgb(159,18,57)] active:translate-y-2 transition-all cursor-pointer"
                  >
                    <span className="text-3xl">🔴</span>
                    DRUM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBeats("🟡")}
                    className="w-24 h-24 rounded-full bg-amber-400 hover:bg-amber-500 focus:outline-none text-amber-900 font-black text-sm flex flex-col items-center justify-center gap-1 shadow-[0_8px_0_rgb(180,83,9)] active:shadow-[0_0px_0_rgb(180,83,9)] active:translate-y-2 transition-all cursor-pointer"
                  >
                    <span className="text-3xl">👏</span>
                    CLAP
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 py-4 px-3 rounded-xl animate-bounce mt-5 flex items-center justify-center">
                  <span className="text-emerald-800 font-extrabold text-xs items-center justify-center">⭐ You Rocked the Rhythm! ⭐</span>
                  <button
                    type="button"
                    onClick={() => { setRhythmSequence([]); setRhythmSuccessState(false); }}
                    className="ml-4 text-[10px] bg-emerald-600 text-white font-bold px-4 py-2 rounded-full hover:bg-emerald-700 cursor-pointer shadow-sm"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
            
            {(rhythmSequence.length > 0 && !rhythmSuccessState) && (
              <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setRhythmSequence([]); }}
                    className="px-4 py-2 rounded-full hover:bg-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
                  >
                    🔄 Reset Pattern
                  </button>
              </div>
            )}
          </div>
        );
      }

      // WEEK 9: How to Keep Devices Safe
      case 'R-T1-W9': {
        const safetyRulesList = [
          {
            id: 'clean-hands',
            emoji: '🧼',
            name: 'Clean Hands',
            description: 'Always wash and dry hands before touching devices!',
            soundText: 'Always use your devices with clean and dry hands.'
          },
          {
            id: 'no-food',
            emoji: '🚫🍔',
            name: 'No Food or Drinks',
            description: 'Keep water and snacks away from electronics.',
            soundText: 'Keep all food and drinks far away to avoid spills and crumbs.'
          },
          {
            id: 'gentle',
            emoji: '🧸',
            name: 'Be Gentle',
            description: 'Hold devices carefully and set them down softly.',
            soundText: 'Always hold devices nicely and be gentle when pressing buttons.'
          },
          {
            id: 'time-limit',
            emoji: '⏱️',
            name: 'Take Breaks',
            description: 'Rest your eyes, play outside, and do not stare too long.',
            soundText: 'Take breaks to rest your eyes and go play outside.'
          }
        ];

        return (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block">🛡️ 💻</span>
              <p className="text-xs font-black text-rose-950 uppercase tracking-tight">Device Safety Rules</p>
              <p className="text-[11px] text-slate-600 font-semibold mt-1">
                Tap each rule to learn how to keep our devices safe and happy!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2">
              {safetyRulesList.map((rule) => {
                const isActive = highlightedComponent === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setHighlightedComponent(rule.id);
                      speakTextDirectly(rule.soundText);
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isActive 
                        ? 'bg-rose-50 border-rose-500 scale-105 shadow-md ring-3 ring-rose-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:scale-102'
                    }`}
                  >
                    <span className="text-4xl">{rule.emoji}</span>
                    <h6 className="font-extrabold text-xs text-slate-800">{rule.name}</h6>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 border rounded-2xl p-3.5 min-h-20 flex items-center justify-center text-center">
              {highlightedComponent ? (
                <div className="space-y-1">
                  <p className="font-extrabold text-[13px] text-rose-900 uppercase tracking-tight">
                    {safetyRulesList.find(c => c.id === highlightedComponent)?.name}
                  </p>
                  <p className="text-xs text-slate-700 font-semibold">
                    {safetyRulesList.find(c => c.id === highlightedComponent)?.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-bold italic">
                  Tap any safety rule in the grid above to learn more!
                </p>
              )}
            </div>
          </div>
        );
      }

      // WEEK 10: Revision & Celebration
      case 'R-T1-W10':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none"></div>
              <span className="text-5xl animate-bounce duration-1000 block">🏆⭐🎉</span>
              <div className="space-y-1">
                <h5 className="font-extrabold text-sm text-indigo-300 uppercase tracking-widest">
                  School Star Medal Achieved!
                </h5>
                <h4 className="text-xl font-black font-sans leading-relaxed">
                  Congratulations, Term Complete!
                </h4>
              </div>

              <div className="bg-white/10 rounded-xl p-3 inline-block px-5 border border-white/5">
                <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                  "Tap below to trigger cheering sound effect!"
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playCorrectSound();
                    speakTextDirectly("Yippee! Hip hip hooray! You completed all lessons in Grade R term one! You are a master programmer rabbit. Wear your shiny star badge with pride!");
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-amber-300 transition active:scale-95 animate-pulse cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  <span>🥳 Cheer Out Loud</span>
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      // GRADE R TERM 2 TOPIC: Robots Grouping
      case 'R-T2-W5':
        return (
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-150 rounded-2xl p-4 text-center">
              <span className="text-3xl block">🧹 🦾 🐢</span>
              <p className="text-xs font-black text-sky-950 uppercase tracking-tight">Meet the Robot Family</p>
              <p className="text-[11px] text-slate-655 font-bold">
                Tap on each helper machine to learn about their cool jobs:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("The vacuum cleaner bot helps moms and dads sweep messy carpets automatically!");
                }}
                className={`bg-white border p-4 rounded-xl flex flex-col items-center text-center gap-2 transition cursor-pointer active:scale-95 ${
                  activeSpeech?.includes("vacuum cleaner") ? 'ring-2 ring-sky-400 bg-sky-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-4xl">🧹🤖</span>
                <div>
                  <h6 className="font-black text-xs text-slate-800">Vacuum Bot</h6>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Cleans domestic carpets!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("The factory robot arm lifts heavy car parts so people stay safe!");
                }}
                className={`bg-white border p-4 rounded-xl flex flex-col items-center text-center gap-2 transition cursor-pointer active:scale-95 ${
                  activeSpeech?.includes("factory robot") ? 'ring-2 ring-sky-400 bg-sky-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-4xl animate-pulse">🏭🦾</span>
                <div>
                  <h6 className="font-black text-xs text-slate-800">Assembly Arm</h6>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Lifts heavy car parts!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("The scholastic turtle robot teaches kids computer instructions in primary classes!");
                }}
                className={`bg-white border p-4 rounded-xl flex flex-col items-center text-center gap-2 transition cursor-pointer active:scale-95 ${
                  activeSpeech?.includes("scholastic turtle") ? 'ring-2 ring-sky-400 bg-sky-50/20' : 'border-slate-200'
                }`}
              >
                <span className="text-4xl">🏫🐢</span>
                <div>
                  <h6 className="font-black text-xs text-slate-800">Turtle Robot</h6>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">Teaches coding to kids!</p>
                </div>
              </button>
            </div>
          </div>
        );

      // GRADE R TERM 3 TOPIC: Moving Parts and Sensors
      case 'R-T3-W5':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-150 rounded-2xl p-4 text-center">
              <span className="text-3xl block">👁️ 🧠 ⚙️</span>
              <p className="text-xs font-black text-purple-950 uppercase tracking-tight">Anatomy of our Robot Friend!</p>
              <p className="text-[11px] text-slate-655 font-bold">
                Tap on each organ of the robot body helper to see how they work:
              </p>
            </div>

            <div className="space-y-3.5">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Robot eyes are computer cameras and sensors. They read surrounding room cards and detect obstacles first.");
                }}
                className={`w-full bg-white border p-3.5 rounded-xl flex items-center gap-3.5 text-left transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("Robot eyes") ? 'ring-2 ring-purple-400 bg-purple-50/10' : 'border-slate-250'
                }`}
              >
                <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-2xl select-none">👁️</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">Cameras and Sensors (EYES)</h6>
                  <p className="text-[10px] text-slate-500 font-medium">Allows robots to look around, measure boundaries, and recognize faces!</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Robot brain contains high speed chips. They receive input codes and calculate directions.");
                }}
                className={`w-full bg-white border p-3.5 rounded-xl flex items-center gap-3.5 text-left transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("Robot brain") ? 'ring-2 ring-purple-400 bg-purple-50/10' : 'border-slate-250'
                }`}
              >
                <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-2xl select-none animate-pulse">🧠</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">Smart Chips and Controllers (BRAIN)</h6>
                  <p className="text-[10px] text-slate-500 font-medium font-sans">Reads instruction symbols, processes mathematical calculations and drives motors.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  speakTextDirectly("Robot arms and wheels are tools and legs. They physicalize work, turn, and do useful routines!");
                }}
                className={`w-full bg-white border p-3.5 rounded-xl flex items-center gap-3.5 text-left transition cursor-pointer active:scale-98 ${
                  activeSpeech?.includes("Robot arms") ? 'ring-2 ring-purple-400 bg-purple-50/10' : 'border-slate-250'
                }`}
              >
                <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-2xl select-none">⚙️</div>
                <div>
                  <h6 className="font-extrabold text-xs text-slate-800">Motors, Gears, and Wheels (LEGS & ARMS)</h6>
                  <p className="text-[10px] text-slate-500 font-medium">Turns surrounding parts physical, cleans rooms, and drives forward!</p>
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-3xl block">⭐</span>
            <p className="text-xs text-slate-550 font-bold">Grade R Visual Interactive Deck is ready!</p>
          </div>
        );
    }
  };

  const checkPattern = (ans: (string | null)[]) => {
    if (ans[0] === 'blue' && ans[1] === 'red') {
      setPatternSuccess(true);
      playCorrectSound();
    } else {
      setPatternSuccess(false);
    }
  };

  return (
    <div className="border-2 border-indigo-200 bg-indigo-50/25 rounded-2xl p-1 shadow-sm relative overflow-hidden">
      {/* Decorative sparkle corner background tag */}
      <div className="absolute right-0 top-0 w-12 h-12 bg-indigo-500/10 rounded-bl-3xl flex items-center justify-center select-none pointer-events-none">
        <Sparkle className="w-4 h-4 text-indigo-400 animate-spin-slow" />
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 relative">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shadow-xs select-none">
            🎨
          </div>
          <div className="text-left">
            <h5 className="font-black text-[10px] uppercase text-indigo-850 tracking-wider">
              Grade R Kid's Visual Playground
            </h5>
            <p className="text-[10px] text-slate-500 font-bold leading-none mt-0.5">
              Read-Free Illustrated Lesson Activity!
            </p>
          </div>

          {activeSpeech && (
            <button
              type="button"
              onClick={handleStopSpeech}
              className="absolute right-4 top-1 text-[8px] font-black bg-rose-500 text-white rounded px-2 py-0.5 shrink-0 flex items-center gap-1 active:scale-95"
            >
              <VolumeX className="w-2.5 h-2.5" />
              <span>STOP</span>
            </button>
          )}
        </div>

        {/* Dynamic Visual Level Component */}
        <div className="pt-2">
          {renderVisualContent()}
        </div>
      </div>
    </div>
  );
}
