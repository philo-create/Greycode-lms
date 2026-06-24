import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, MailWarning, Compass, Trophy, HelpCircle, Check, Smile, AlertCircle, Refrigerator, Microwave as MicrowaveIcon, Flame, MonitorSmartphone } from 'lucide-react';
import { GradeType } from '../types';
import SpeakableText from './SpeakableText';

export const ColorfulWashingMachine = () => (
      <div className="relative w-[60px] h-[70px] mx-auto pt-1 flex items-center justify-center">
        <div className="w-[50px] h-[60px] bg-slate-100 border-[3px] border-slate-700 rounded-[10px] flex flex-col shadow-sm">
          {/* Top Panel */}
          <div className="h-[14px] border-b-[3px] border-slate-700 flex items-center px-1 gap-1">
            <div className="w-[8px] h-[8px] rounded-full border-[2px] border-slate-700 bg-red-400"></div>
            <div className="flex-1"></div>
            <div className="w-[10px] h-[4px] bg-slate-300 border-[1.5px] border-slate-700 rounded-[1px]"></div>
          </div>
          {/* Drum */}
          <div className="flex-1 flex items-center justify-center relative bg-white rounded-b-lg">
            <div className="w-[30px] h-[30px] rounded-full border-[3px] border-slate-700 bg-sky-200 overflow-hidden relative">
               <div className="absolute bottom-0 w-full h-[12px] bg-blue-500"></div>
               {/* Bubbles */}
               <div className="absolute top-[10px] left-[6px] w-2 h-2 rounded-full bg-white/70"></div>
            </div>
          </div>
        </div>
      </div>
);

export const ColorfulFridge = () => (
      <div className="relative w-[50px] h-[76px] mx-auto pt-1 flex items-center justify-center">
        <div className="w-[42px] h-[70px] bg-slate-50 border-[3px] border-slate-700 rounded-lg flex flex-col shadow-sm">
          {/* Freezer */}
          <div className="h-[24px] border-b-[3px] border-slate-700 relative bg-slate-100 rounded-t-[5px]">
            <div className="absolute left-[4px] top-[4px] w-[3px] h-[10px] bg-slate-300 border-[1.5px] border-slate-700 rounded-full"></div>
            {/* Magnet */}
            <div className="absolute right-[4px] top-[4px] w-[6px] h-[6px] bg-yellow-400 border-[1.5px] border-slate-700 rounded-sm rotate-12"></div>
          </div>
          {/* Main Fridge */}
          <div className="flex-1 relative bg-white rounded-b-[5px]">
            <div className="absolute left-[4px] top-[6px] w-[3px] h-[16px] bg-slate-300 border-[1.5px] border-slate-700 rounded-full"></div>
            {/* Water dispenser */}
            <div className="absolute right-[6px] top-[4px] w-[8px] h-[12px] bg-slate-800 border-[1.5px] border-slate-700 rounded-[2px] flex items-end justify-center pb-[1px]">
              <div className="w-[4px] h-[3px] bg-blue-400 rounded-t-sm"></div>
            </div>
          </div>
        </div>
      </div>
);

export const ColorfulSmartwatch = () => (
      <div className="relative w-[40px] h-[70px] mx-auto flex flex-col items-center justify-center">
        {/* Top strap */}
        <div className="w-[22px] h-[16px] bg-rose-400 border-[3px] border-slate-700 rounded-t-md -mb-[3px] z-0"></div>
        {/* Watch body */}
        <div className="w-[34px] h-[36px] bg-slate-200 border-[3px] border-slate-700 rounded-xl z-10 flex items-center justify-center relative shadow-sm">
          <div className="w-[20px] h-[24px] bg-slate-800 rounded-lg flex flex-col items-center justify-center">
            <div className="text-[9px] font-bold text-cyan-400 leading-none">12</div>
            <div className="text-[7px] font-bold text-cyan-400 leading-none opacity-80 mt-[1px]">00</div>
          </div>
          <div className="absolute -right-[5px] top-[10px] w-[4px] h-[8px] bg-slate-400 border-[1.5px] border-slate-700 rounded-r-[2px]"></div>
        </div>
        {/* Bottom strap */}
        <div className="w-[22px] h-[16px] bg-rose-400 border-[3px] border-slate-700 rounded-b-md -mt-[3px] z-0"></div>
      </div>
);

export const ColorfulStove = () => (
      <div className="relative w-[60px] h-[70px] mx-auto pt-2 flex items-center justify-center">
        <div className="w-[50px] h-[58px] bg-slate-100 border-[3px] border-slate-700 rounded-lg flex flex-col shadow-sm relative">
          {/* Back panel / dials area */}
          <div className="absolute -top-[10px] left-[-3px] w-[50px] h-[14px] bg-slate-300 border-[3px] border-slate-700 rounded-t-[6px] z-0 flex items-end justify-center gap-[4px] pb-[2px]">
             <div className="text-[5px] font-bold text-slate-800 leading-none bg-emerald-200 border border-slate-700 px-[2px] rounded-[1px] mb-[1px]">12:00</div>
          </div>
          {/* Stovetop */}
          <div className="h-[12px] bg-slate-800 flex items-center justify-around px-[4px] z-10 border-b-[3px] border-slate-700 rounded-t-[4px] pt-[2px]">
             <div className="w-[14px] h-[4px] bg-orange-500 rounded-full mt-[-6px]"></div>
             <div className="w-[14px] h-[4px] bg-red-500 rounded-full mt-[-2px]"></div>
          </div>
          {/* Oven panel */}
          <div className="h-[8px] border-b-[3px] border-slate-700 bg-slate-200 flex items-center justify-around px-1">
             <div className="w-[4px] h-[4px] bg-slate-800 rounded-full"></div>
             <div className="w-[4px] h-[4px] bg-slate-800 rounded-full"></div>
             <div className="w-[4px] h-[4px] bg-slate-800 rounded-full"></div>
             <div className="w-[4px] h-[4px] bg-slate-800 rounded-full"></div>
          </div>
          {/* Oven */}
          <div className="flex-1 bg-white rounded-b-[4px] p-1.5 flex items-center justify-center relative">
             {/* Handle */}
             <div className="absolute top-[4px] w-[30px] h-[3px] bg-slate-300 border-[1.5px] border-slate-700 rounded-full z-20"></div>
             <div className="w-full h-full border-[3px] border-slate-700 bg-[#1e293b] rounded-md relative flex items-center justify-center overflow-hidden">
                <div className="absolute bottom-0 w-full h-[6px] bg-orange-500/80"></div>
                <div className="w-[20px] h-[3px] bg-slate-400 rounded-full z-10"></div>
             </div>
          </div>
        </div>
      </div>
);

export const ColorfulDesktop = () => (
      <div className="relative w-[70px] h-[70px] mx-auto mt-2 flex flex-col items-center justify-center">
        {/* Monitor */}
        <div className="w-[66px] h-[44px] bg-slate-200 border-[3px] border-slate-700 rounded-lg z-10 flex flex-col items-center p-[2px] shadow-sm pb-[4px]">
           {/* Screen display */}
           <div className="w-full h-[30px] bg-sky-200 border-[2px] border-slate-700 rounded-sm relative overflow-hidden flex flex-col">
             {/* Wallpaper sun */}
             <div className="w-[12px] h-[12px] rounded-full bg-yellow-400 absolute right-1 top-1"></div>
             {/* Wallpaper hill */}
             <div className="absolute -bottom-2 -left-2 w-[30px] h-[20px] bg-green-400 rounded-full"></div>
             <div className="absolute -bottom-1 -right-2 w-[40px] h-[16px] bg-emerald-500 rounded-full"></div>
           </div>
           {/* Logo pip */}
           <div className="w-[4px] h-[2px] bg-slate-400 rounded-full mt-[3px]"></div>
        </div>
        {/* Stand */}
        <div className="w-[10px] h-[10px] bg-slate-300 border-x-[3px] border-slate-700 -mt-[3px] z-0"></div>
        {/* Base */}
        <div className="w-[36px] h-[6px] bg-slate-400 border-[3px] border-slate-700 rounded-t-[4px] -mt-[3px] z-0"></div>
      </div>
);

export const ColorfulLaptop = () => (
      <div className="relative w-[80px] h-[60px] mx-auto pt-4 flex flex-col items-center">
        {/* Screen lid */}
        <div className="w-[66px] h-[40px] bg-slate-200 border-[3px] border-slate-700 rounded-t-[8px] p-[3px] pb-[5px] flex flex-col items-center shadow-sm relative z-0">
           {/* Screen display */}
           <div className="w-full h-[28px] bg-indigo-200 border-[2px] border-slate-700 rounded-[2px] relative overflow-hidden">
             {/* Content lines */}
             <div className="absolute top-[4px] left-[6px] w-[20px] h-[3px] bg-slate-800 rounded-full opacity-60"></div>
             <div className="absolute top-[10px] left-[6px] w-[30px] h-[3px] bg-white rounded-full"></div>
             {/* Box */}
             <div className="absolute top-[4px] right-[4px] w-[14px] h-[14px] bg-pink-400 rounded-[2px] border border-slate-700"></div>
           </div>
        </div>
        {/* Base / Keyboard */}
        <div className="w-[78px] h-[10px] bg-slate-300 border-[3px] border-slate-700 rounded-b-[6px] shadow-sm z-10 flex justify-center -mt-[2px] relative">
           <div className="w-[16px] h-[3px] bg-slate-400 border border-slate-600 rounded-full mt-[1px]"></div>
        </div>
      </div>
);

export const ColorfulTablet = () => (
      <div className="relative w-[50px] h-[70px] mx-auto flex items-center justify-center mt-1">
        <div className="w-[50px] h-[66px] bg-slate-800 border-[3px] border-slate-700 rounded-[10px] flex flex-col items-center justify-center shadow-sm relative px-[3px] py-[6px]">
          {/* Camera dot */}
          <div className="w-[4px] h-[4px] bg-slate-600 rounded-full absolute top-[3px]"></div>
          {/* Screen Grid */}
          <div className="w-[38px] h-[50px] bg-fuchsia-200 border-[2px] border-slate-700 rounded-[4px] grid grid-cols-2 grid-rows-3 gap-[4px] p-[4px]">
             <div className="bg-white rounded-[3px] border-[1.5px] border-slate-700 flex items-center justify-center"><div className="w-[4px] h-[4px] bg-red-400 rounded-full"></div></div>
             <div className="bg-white rounded-[3px] border-[1.5px] border-slate-700 flex items-center justify-center"><div className="w-[6px] h-[6px] bg-yellow-400 rounded-sm"></div></div>
             <div className="bg-white rounded-[3px] border-[1.5px] border-slate-700"></div>
             <div className="bg-white rounded-[3px] border-[1.5px] border-slate-700"></div>
          </div>
          {/* Home button */}
          <div className="absolute bottom-[3px] w-[6px] h-[6px] border-[1.5px] border-slate-500 rounded-full"></div>
        </div>
      </div>
);

export const ColorfulSmartphone = () => (
      <div className="relative w-[40px] h-[66px] mx-auto mt-1 flex items-center justify-center">
        <div className="w-[36px] h-[64px] bg-slate-800 border-[3px] border-slate-700 rounded-[12px] flex flex-col items-center justify-center shadow-sm relative px-[3px] py-[6px]">
          {/* Speaker grill */}
          <div className="absolute top-[4px] w-[8px] h-[2px] bg-slate-600 rounded-full"></div>
          {/* Screen */}
          <div className="w-[24px] h-[48px] bg-cyan-100 rounded-[3px] border-[2px] border-slate-700 flex flex-col px-[2px] py-[4px] gap-[3px]">
             <div className="flex gap-[3px]">
               <div className="w-[6px] h-[6px] bg-pink-400 rounded-sm border border-slate-700"></div>
               <div className="w-[6px] h-[6px] bg-yellow-400 rounded-sm border border-slate-700"></div>
             </div>
             <div className="flex gap-[3px]">
               <div className="w-[6px] h-[6px] bg-emerald-400 rounded-sm border border-slate-700"></div>
               <div className="w-[6px] h-[6px] bg-blue-400 rounded-sm border border-slate-700"></div>
             </div>
             <div className="mt-auto flex gap-[3px] bg-white/50 p-[1px] rounded-[2px]">
               <div className="w-[5px] h-[5px] bg-slate-800 rounded-full"></div>
               <div className="w-[5px] h-[5px] bg-slate-800 rounded-full"></div>
             </div>
          </div>
          {/* Home bar */}
          <div className="w-[10px] h-[2px] bg-slate-500 rounded-full absolute bottom-[3px]"></div>
        </div>
      </div>
);

export const ColorfulMicrowave = () => (
      <div className="relative w-[76px] h-[60px] mx-auto flex items-center justify-center">
        <div className="w-[70px] h-[46px] bg-slate-100 border-[3px] border-slate-700 rounded-[8px] flex shadow-sm p-[3px] gap-[3px]">
          {/* Window */}
          <div className="flex-1 bg-[#1e293b] border-[2px] border-slate-700 rounded-[4px] relative flex items-center justify-center overflow-hidden">
             {/* Interior lines */}
             <div className="absolute top-[4px] left-[4px] w-[4px] h-[2px] bg-slate-500 rounded-full"></div>
             <div className="absolute bottom-[6px] w-[30px] h-[2px] bg-slate-400"></div>
             <div className="w-[16px] h-[8px] bg-orange-400 border-[1.5px] border-slate-700 rounded-t-[4px] mt-[4px]"></div>
             <div className="absolute inset-0 bg-yellow-400/10"></div>
          </div>
          {/* Control panel */}
          <div className="w-[16px] h-full bg-slate-200 border-[2px] border-slate-700 rounded-[4px] flex flex-col items-center py-[2px] gap-[3px]">
            <div className="w-[10px] h-[6px] bg-emerald-200 border border-slate-700 rounded-[1px] text-[4px] leading-none text-center font-black text-slate-800 flex items-center justify-center">0:30</div>
            <div className="grid grid-cols-2 gap-[2px]">
              <div className="w-[3px] h-[2px] bg-slate-800 rounded-[1px]"></div>
              <div className="w-[3px] h-[2px] bg-slate-800 rounded-[1px]"></div>
              <div className="w-[3px] h-[2px] bg-slate-800 rounded-[1px]"></div>
              <div className="w-[3px] h-[2px] bg-slate-800 rounded-[1px]"></div>
            </div>
            <div className="w-[8px] h-[6px] bg-green-400 rounded-sm border-[1.5px] border-slate-700 mt-auto flex items-center justify-center text-[3px] text-white font-bold leading-none select-none">&#9658;</div>
          </div>
        </div>
      </div>
);

export default function DigitalConceptsActivity({ grade, onComplete }: { grade: GradeType; onComplete: (stars: number, possible?: number) => void }) {
  const [activeTab, setActiveTab] = useState<'emoji' | 'binary' | 'citizenship' | 'devices'>('devices');

  // EMOJI CODE BREAKER state
  const emojiMap: Record<string, string> = {
    'A': '🍒', 'B': '🍌', 'C': '🍩', 'D': '🦊', 'E': '🎈', 'F': '🐸', 'G': '🍇', 'H': '🐹',
    'I': '🍦', 'J': '🎨', 'K': '🥝', 'L': '🦁', 'M': '🍋', 'N': '🐾', 'O': '🍊', 'P': '🐧',
    'Q': '👑', 'R': '🌈', 'S': '☀️', 'T': '🐢', 'U': '🦄', 'V': '🎻', 'W': '🍉', 'X': '👾',
    'Y': '⛵', 'Z': '⚡'
  };

  const [decoderInput, setDecoderInput] = useState<string>('🐢🍊🦊🍊'); // T O D O
  const [decoderAnswer, setDecoderInputTxt] = useState<string>('');
  const [decoderResult, setDecoderResult] = useState<'idle' | 'success' | 'incorrect'>('idle');

  const [encoderInput, setEncoderInput] = useState<string>('HELLO');

  // BINARY ASCII BEADING state
  // Mapping A=01000001, B=01000010, C=01000011, D=01000100, E=01000101, H=01001000, L=01001100, O=01001111
  const binaryLetterMap: Record<string, string> = {
    'H': '01001000',
    'E': '01000101',
    'L': '01001100',
    'O': '01001111',
    'A': '01000001',
    'B': '01000010',
    'C': '01000011'
  };
  const [selectedBinaryLetter, setSelectedBinaryLetter] = useState<string>('A');
  const [binaryBeads, setBinaryBeads] = useState<number[]>([0, 1, 0, 0, 0, 0, 0, 1]); // Representing 'A'
  const [beadResult, setBeadResult] = useState<string>('Correct 8-bit matching!');

  // DIGITAL CITIZENSHIP state
  const scenarios = [
    {
      q: "A player in a friendly online game asks you: 'What is your address and favorite playground?' What do you do?",
      opts: [
        "Share it immediately so you can match teams.",
        "Never share home details and call a parent/teacher.",
        "Tell them a fake playground instead."
      ],
      correctAnswer: 1,
      hint: "Your home address is private personal data that can be used to track your location. Never verify it online."
    },
    {
      q: "Sipho has been playing games on his device for three hours. What is the screen safe rule?",
      opts: [
        "Play for another three hours until the battery dies.",
        "Switch off screens, go outside, play with toys/friends.",
        "Eat chocolate next to the tablet while playing."
      ],
      correctAnswer: 1,
      hint: "Screen limits (like 1 hour daily) prevent fatigue and keep your brain and body healthy and active."
    },
    {
      q: "Someone sends a mean or disrespectful message to you or a classmate online. What do you do?",
      opts: [
        "Send an even meaner message back.",
        "Delete the message and forget about it.",
        "Tell a trusted parent or teacher, and report the user."
      ],
      correctAnswer: 2,
      hint: "Reporting respect-breaches or online bullying keeps online networks safe for kids."
    }
  ];

  const [activeScenario, setActiveScenario] = useState(0);
  const [selectedScenarioOpt, setSelectedScenarioOpt] = useState<number | null>(null);
  const [scenarioChecked, setScenarioChecked] = useState(false);
  const [quizCompleted, setScenarioCompleted] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
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

  // DEVICES Activity state
  const deviceLevels = [
    [
      { id: 1, name: 'Smartphone', emoji: <ColorfulSmartphone />, isDevice: true, audio: 'A smartphone is an electronic machine we use to communicate!' },
      { id: 2, name: 'Apple', emoji: '🍎', isDevice: false, audio: 'Oops! An apple is a fruit we eat. It is not an electronic device.' },
      { id: 3, name: 'Laptop', emoji: <ColorfulLaptop />, isDevice: true, audio: 'Great! A laptop is a folding computer we use.' },
      { id: 4, name: 'Shoe', emoji: '🥾', isDevice: false, audio: 'Oops! A shoe goes on your foot. It is not an electronic device.' },
      { id: 5, name: 'Microwave', emoji: <ColorfulMicrowave />, isDevice: true, audio: 'Yes, a microwave is a machine that uses electricity to heat food!' },
      { id: 6, name: 'Teddy Bear', emoji: '🧸', isDevice: false, audio: 'Oops! A teddy bear is a soft toy, not a machine.' },
    ],
    [
      { id: 7, name: 'Smartwatch', emoji: <ColorfulSmartwatch />, isDevice: true, audio: 'Yes! A smartwatch is a tiny computer for your wrist.' },
      { id: 8, name: 'Pencil', emoji: '✏️', isDevice: false, audio: 'Oops! A pencil is for writing, it does not use electricity.' },
      { id: 9, name: 'Tablet', emoji: <ColorfulTablet />, isDevice: true, audio: 'Great! A tablet is a flat touch-screen computer.' },
      { id: 10, name: 'Tree', emoji: '🌲', isDevice: false, audio: 'Oops! A tree is a living plant, not a machine.' },
      { id: 11, name: 'Robot', emoji: '🤖', isDevice: true, audio: 'Yes! A robot is an awesome electronic device.' },
      { id: 12, name: 'Chair', emoji: '🪑', isDevice: false, audio: 'Oops! A chair is furniture, not an electronic device.' },
    ],
    [
      { id: 13, name: 'Cooking Stove', emoji: <ColorfulStove />, isDevice: false, audio: 'Oops! A cooking stove is used in the kitchen, not in a classroom.' },
      { id: 14, name: 'Washing Machine', emoji: <ColorfulWashingMachine />, isDevice: false, audio: 'Oops! A washing machine is electronic, but you would not find it in a classroom.' },
      { id: 15, name: 'Class Tablet', emoji: <ColorfulTablet />, isDevice: true, audio: 'Great! We use tablets in class to learn.' },
      { id: 16, name: 'Microwave', emoji: <ColorfulMicrowave />, isDevice: false, audio: 'Oops! A microwave belongs in the kitchen, not your classroom.' },
      { id: 17, name: 'Class Laptop', emoji: <ColorfulLaptop />, isDevice: true, audio: 'Yes! Laptops are used in school every day.' },
      { id: 18, name: 'Fridge', emoji: <ColorfulFridge />, isDevice: false, audio: 'Oops! A fridge keeps food cold, you would not find it in a classroom.' },
    ]
  ];
  
  const levelInstructions = [
    "Level 1: Tap all the electronic computing devices!",
    "Level 2: Let's find more electronic computing devices!",
    "Level 3: These are all items... but which electronic devices do we use inside the CLASSROOM?"
  ];

  const [currentDeviceLevel, setCurrentDeviceLevel] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [devicesCompleted, setDevicesCompleted] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);

  const handleToggleDevice = (id: number) => {
    if (levelCompleted || devicesCompleted) return;
    
    const currentItems = deviceLevels[currentDeviceLevel];
    
    // Play audio for selection
    const isSelecting = !selectedDevices.includes(id);
    const item = currentItems.find(i => i.id === id);
    if (isSelecting && item && item.audio) {
      if (item.isDevice) {
        playChime();
      } else {
        playBoop();
      }
      speak(item.audio);
    }
    
    const newSel = selectedDevices.includes(id) ? selectedDevices.filter(x => x !== id) : [...selectedDevices, id];
    setSelectedDevices(newSel);

    // Check if all selected are devices and all devices are selected
    const correctDeviceIds = currentItems.filter(d => d.isDevice).map(d => d.id);
    const allCorrectSelected = correctDeviceIds.every(cid => newSel.includes(cid));
    const noWrongSelected = newSel.every(sid => correctDeviceIds.includes(sid));
    
    if (allCorrectSelected && noWrongSelected && newSel.length > 0) {
      if (currentDeviceLevel < deviceLevels.length - 1) {
        setLevelCompleted(true);
        playChime();
        speak("Great Job! You found all the devices in this level.");
      } else {
        setDevicesCompleted(true);
        playChime();
        speak("Awesome sorting! You are a device expert.");
        onComplete(3);
      }
    }
  };

  const handleNextDeviceLevel = () => {
    const nextLvl = currentDeviceLevel + 1;
    setCurrentDeviceLevel(nextLvl);
    setSelectedDevices([]);
    setLevelCompleted(false);
    speak(levelInstructions[nextLvl]);
  };

  // Sync tab selection with appropriate grade
  useEffect(() => {
    setActiveScenario(0);
    setSelectedScenarioOpt(null);
    setScenarioChecked(false);
    setScenarioCompleted(false);
    setDecoderResult('idle');
    setDecoderInputTxt('');
    setSelectedDevices([]);
    setDevicesCompleted(false);
    if (grade === 'R') {
      setActiveTab('devices');
    } else if (grade === '1') {
      setActiveTab('emoji');
    } else if (grade === '2') {
      setActiveTab('citizenship');
    } else {
      setActiveTab('binary');
    }
  }, [grade]);

  // Handle Decoder submissions
  const handleCheckCode = () => {
    const cleanAns = decoderAnswer.trim().toUpperCase();
    if (cleanAns === 'TODO') {
      setDecoderResult('success');
      playChime();
      speak("Great job! You cracked the text code!");
      onComplete(3);
    } else {
      playBoop();
      speak("That is incorrect! Try to match the letters again.");
      setDecoderResult('incorrect');
    }
  };

  // Toggle index binary beads and verify if match target
  const handleToggleBead = (idx: number) => {
    const newBeads = [...binaryBeads];
    newBeads[idx] = newBeads[idx] === 1 ? 0 : 1;
    setBinaryBeads(newBeads);

    if (newBeads[idx] === 1) {
      playChime();
    } else {
      playBoop();
    }

    const matchStr = newBeads.join('');
    const targetBin = binaryLetterMap[selectedBinaryLetter] || '01000001';
    if (matchStr === targetBin) {
      setBeadResult(`Excellent! ${selectedBinaryLetter} matches this 8-bit binary bead sequence!`);
      playChime();
      speak(`Excellent! You matched the binary structure for ${selectedBinaryLetter}!`);
      onComplete(3);
    } else {
      setBeadResult('Still tinkering... Match the target matrix above.');
    }
  };

  const handleSelectLetter = (lettr: string) => {
    setSelectedBinaryLetter(lettr);
    const code = binaryLetterMap[lettr];
    // Populate layout with incorrect beads to let kid solve
    setBinaryBeads([0, 0, 0, 0, 0, 0, 0, 0]);
    setBeadResult('Adjust the beads to match the ASCII target!');
  };

  // Scenario selection
  const handleSelectScenario = (idx: number) => {
    if (scenarioChecked) return;
    setSelectedScenarioOpt(idx);
  };

  const handleCheckScenario = () => {
    setScenarioChecked(true);
    if (selectedScenarioOpt === scenarios[activeScenario].correctAnswer) {
      playChime();
      speak("That's right! Excellent choice for digital safety.");
    } else {
      playBoop();
      speak("Not quite! Next time remember the digital safety hints.");
    }
  };

  const handleNextScenario = () => {
    setSelectedScenarioOpt(null);
    setScenarioChecked(false);
    if (activeScenario + 1 < scenarios.length) {
      setActiveScenario(prev => prev + 1);
    } else {
      setScenarioCompleted(true);
      onComplete(3);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8" id="digital-concepts-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            Digital Concepts (Strand D.1 - D.9)
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Digital Sandbox</h2>
        </div>

        {/* Tab configuration based on grade */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1">
          {grade === 'R' && (
            <button
              onClick={() => setActiveTab('devices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'devices' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Device Sorting
            </button>
          )}
          {grade === '1' && (
            <button
              onClick={() => setActiveTab('emoji')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'emoji' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Emoji Code Breaker
            </button>
          )}
          {(grade === '2' || grade === '3') && (
            <button
              onClick={() => setActiveTab('citizenship')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'citizenship' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Safe Citizenship Quiz
            </button>
          )}
          {grade === '3' && (
            <button
              onClick={() => setActiveTab('binary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'binary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Binary Beading Board
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- DEVICES SORTING --- */}
        {activeTab === 'devices' && (
          <motion.div
            key="devices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text={levelInstructions[currentDeviceLevel]} className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 relative overflow-hidden">
              {levelCompleted && !devicesCompleted && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-100 text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl">⭐</div>
                    <h3 className="text-xl font-black text-slate-800">Great Job!</h3>
                    <p className="text-sm font-bold text-slate-500">You found all the devices in Level {currentDeviceLevel + 1}.</p>
                    <button
                      onClick={handleNextDeviceLevel}
                      className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-xl text-sm uppercase tracking-wide border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all"
                    >
                      Next Level
                    </button>
                  </div>
                </div>
              )}

              {devicesCompleted && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 text-center space-y-3 max-w-sm">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-3xl">🎉</div>
                    <h3 className="text-xl font-black text-slate-800">Awesome Sorting!</h3>
                    <p className="text-sm font-bold text-slate-500">You found all the electronic computing devices! Great job.</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10 w-full max-w-2xl mx-auto">
                {deviceLevels[currentDeviceLevel].map(item => {
                  const isSelected = selectedDevices.includes(item.id);
                  const isError = isSelected && !item.isDevice;
                  const isSuccess = isSelected && item.isDevice;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleDevice(item.id)}
                      className={`cursor-pointer aspect-square rounded-2xl border-4 flex flex-col items-center justify-center p-4 transition-colors ${
                        isSelected
                          ? isError 
                            ? 'bg-rose-50 border-rose-400 text-rose-800 animate-wiggle' 
                            : 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-lg shadow-emerald-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm'
                      }`}
                    >
                      <span className="text-4xl md:text-5xl drop-shadow-sm mb-3">{item.emoji}</span>
                      <span className="font-extrabold text-sm text-center">{item.name}</span>
                      {isError && (
                        <div className="absolute top-2 right-2 text-rose-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                      {isSuccess && (
                        <div className="absolute top-2 right-2 text-emerald-500">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- EMOJI CODE BREAKER --- */}
        {activeTab === 'emoji' && (
          <motion.div
            key="emoji"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Solve the emoji code below! Each emoji matches a letter in our secret dictionary card. Write the English word to decipher it!" className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            {/* Emoji Dictionary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">🐢 Secret Cipher Keys</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {Object.entries(emojiMap).slice(0, 16).map(([ltr, emo]) => (
                  <div key={ltr} className="bg-white border rounded-lg p-1.5 text-center flex items-center justify-center gap-1 shadow-xs">
                    <span className="text-base">{emo}</span>
                    <span className="text-[10px] font-black text-slate-400">=</span>
                    <span className="text-xs font-extrabold text-slate-700">{ltr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Decoder Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-900 rounded-2xl text-white">
              {/* Decoder challenge */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Challenge Code</span>
                <div className="flex items-center gap-2">
                  {Array.from(decoderInput).map((emo, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg text-2xl"
                    >
                      {emo}
                    </motion.div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">Hint: Decode item by item. 🐢=T, 🍊=O...</p>

                {/* Submitting text answers representation */}
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Type decoded word..."
                    value={decoderAnswer}
                    disabled={decoderResult === 'success'}
                    onChange={(e) => setDecoderInputTxt(e.target.value)}
                    className="w-full bg-black/45 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-xs md:text-sm font-bold tracking-wider placeholder:text-slate-600 focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleCheckCode}
                    disabled={decoderResult === 'success' || !decoderAnswer}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Submit Word Code
                  </button>
                </div>

                {decoderResult === 'success' && (
                  <div className="text-emerald-400 text-xs font-bold pt-1.5 flex items-center gap-1.5">
                    <span className="text-base">🎉</span> Solved! The secret word is indeed TODO! Excellent algorithmic mapping!
                  </div>
                )}
                {decoderResult === 'incorrect' && (
                  <div className="text-rose-400 text-xs font-bold pt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Try again. Match item letters exactly.
                  </div>
                )}
              </div>

              {/* Encoder sandbox representing custom kids encryption tool */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400">Custom Code Encoder</span>
                  <p className="text-[11px] text-slate-400 mt-1">Write any letters or words to encrypt them instanly into the secret emojis!</p>
                  
                  <input
                    type="text"
                    placeholder="Write a custom name..."
                    value={encoderInput}
                    onChange={(e) => setEncoderInput(e.target.value)}
                    className="w-full bg-black/45 border border-slate-700 focus:border-pink-500 rounded-xl p-3 text-xs font-bold placeholder:text-slate-600 focus:outline-none uppercase mt-3"
                  />
                </div>

                <div className="bg-black/35 rounded-xl p-3 flex flex-wrap gap-1.5 items-center justify-center min-h-[4rem]">
                  {Array.from(encoderInput.toUpperCase()).map((chr, i) => {
                    const chrStr = chr as string;
                    const emo = emojiMap[chrStr];
                    return emo ? (
                      <span key={i} className="text-2xl" title={chrStr}>{emo}</span>
                    ) : (
                      <span key={i} className="text-xs font-bold text-white/40">{chrStr}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SAFE CITIZENSHIP QUIZ --- */}
        {activeTab === 'citizenship' && (
          <motion.div
            key="citizenship"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Safeguard your profile! Test your safety reflexes across digital safety scenarios." className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            {!quizCompleted ? (
              <div className="space-y-5">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl relative">
                  <div className="absolute top-2 right-2 bg-indigo-50 border border-indigo-100 p-1.5 rounded-full text-indigo-500">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm md:text-base font-black text-slate-800 leading-relaxed pr-8 flex items-start gap-1">
                    <SpeakableText text={scenarios[activeScenario].q} className="p-0 hover:bg-transparent text-slate-800 border-0 text-left font-black" />
                  </h3>
                </div>

                <div className="space-y-3">
                  {scenarios[activeScenario].opts.map((opt, i) => {
                    const isSelected = selectedScenarioOpt === i;
                    let rowStyle = "border-slate-200 hover:bg-slate-50/50 hover:border-indigo-400";
                    if (isSelected) rowStyle = "border-indigo-500 bg-indigo-50/30 text-indigo-800 ring-2 ring-indigo-500/20";
                    if (scenarioChecked) {
                      if (i === scenarios[activeScenario].correctAnswer) {
                        rowStyle = "border-emerald-500 bg-emerald-50/60 text-emerald-800";
                      } else if (isSelected) {
                        rowStyle = "border-rose-500 bg-rose-50 text-rose-800";
                      } else {
                        rowStyle = "opacity-45 border-slate-100 bg-slate-100 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={scenarioChecked}
                        onClick={() => handleSelectScenario(i)}
                        id={`sc-opt-${i}`}
                        className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-semibold transition cursor-pointer flex items-center justify-between ${rowStyle}`}
                      >
                        <span>{opt}</span>
                        {scenarioChecked && i === scenarios[activeScenario].correctAnswer && (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {scenarioChecked && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-4 rounded-xl border flex gap-3 items-start ${
                      selectedScenarioOpt === scenarios[activeScenario].correctAnswer 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs">
                        {selectedScenarioOpt === scenarios[activeScenario].correctAnswer ? 'Superb Safety Decision!' : 'Let\'s modify the strategy!'}
                      </h4>
                      <p className="text-[11px] mt-1 pr-6 leading-relaxed">
                        {scenarios[activeScenario].hint}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-6">
                  {!scenarioChecked ? (
                    <button
                      disabled={selectedScenarioOpt === null}
                      onClick={handleCheckScenario}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                    >
                      Authenticate Choice
                    </button>
                  ) : (
                    <button
                      onClick={handleNextScenario}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                    >
                      Next Scenario Case
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="inline-flex p-4 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600 mb-2">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-slate-800">You are a Certified Safekeeper!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sensational! You successfully solved every safety scenario, mastering netiquette and personal data protection.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setScenarioCompleted(false); setActiveScenario(0); setSelectedScenarioOpt(null); setScenarioChecked(false); }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs hover:shadow-lg transition cursor-pointer"
                  >
                    Replay Quiz
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* --- BINARY BEADING BOARD --- */}
        {activeTab === 'binary' && (
          <motion.div
            key="binary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-1">
              💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
              <SpeakableText text="Create matching bracelet beads in binary format. Map target symbols in sequences of 0s and 1s." className="p-0 hover:bg-transparent text-slate-600 border-0" />
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 rounded-2xl p-5 md:p-6 text-white text-xs">
              {/* Selector and specs */}
              <div className="md:col-span-4 space-y-4">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-2">
                  ASCII Codebook Level 3
                </span>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-white/40 text-[10px]">Select Letter to Encode:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.keys(binaryLetterMap).map(ltr => (
                      <button
                        key={ltr}
                        onClick={() => handleSelectLetter(ltr)}
                        className={`p-2 font-bold rounded-lg border text-center transition cursor-pointer ${
                          selectedBinaryLetter === ltr 
                            ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {ltr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 bg-white/5 rounded-xl p-3 space-y-2 mt-4">
                  <h4 className="font-bold text-white/50 text-[10px] uppercase">Mapping standards</h4>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Target letter:</span>
                    <span className="text-purple-400 font-extrabold">{selectedBinaryLetter}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Target binary matrix:</span>
                    <span className="text-indigo-400 font-extrabold">{binaryLetterMap[selectedBinaryLetter]}</span>
                  </div>
                </div>
              </div>

              {/* Editable beads representation */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-4">
                    Motherboard Bead Row (8-bits)
                  </span>

                  {/* Visual bead string row */}
                  <div className="relative flex items-center justify-between bg-black/45 hover:bg-black/60 border border-slate-800 p-4 rounded-full h-[5rem] overflow-hidden select-none">
                    {/* Metal thread line */}
                    <div className="absolute inset-x-0 h-0.5 bg-slate-700/80 top-1/2 -translate-y-1/2 z-0"></div>

                    {binaryBeads.map((bead, i) => {
                      const isOne = bead === 1;
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleBead(i)}
                          id={`bead-btn-${i}`}
                          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-black text-xs md:text-sm shadow-xl relative z-10 transition-colors cursor-pointer border ${
                            isOne 
                              ? 'bg-purple-500 border-purple-300 text-white shadow-purple-500/20' 
                              : 'bg-indigo-950 border-indigo-800 text-indigo-400 shadow-slate-900/50'
                          }`}
                        >
                          <span className="leading-none">{bead}</span>
                          <span className="text-[8px] opacity-40 font-mono mt-0.5">{isOne ? 'ON' : 'OFF'}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] font-mono">
                  <span className="text-emerald-400 font-bold uppercase shrink-0">Output Status:</span>
                  <span className="text-slate-300 line-clamp-1">{beadResult}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
