"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, Award } from 'lucide-react';
import { GradeType } from '../types';
import SpeakableText from './SpeakableText';

export default function SequenceActivity({ grade, onComplete, speakText }: { grade: GradeType; onComplete: (stars: number, possible?: number) => void; speakText?: (text: string) => void }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  
  // Game state
  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);

  const steps = [
    { id: '1', label: 'Turn on water', emoji: '🚰' },
    { id: '2', label: 'Rub with soap', emoji: '🧼' },
    { id: '3', label: 'Dry Hands', emoji: '🧴' }
  ];

  const handleSelect = (id: string) => {
    if (checked) return;
    
    // Play sounds if available
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

    if (order.includes(id)) {
      setOrder(order.filter(item => item !== id));
    } else {
      setOrder([...order, id]);
    }
  };

  const checkAnswer = () => {
    setChecked(true);
    if (order.join(',') === '1,2,3') {
      setSuccess(true);
      setStars(3);
      if (speakText) speakText("Great job! You washed your hands perfectly in order!");
      onComplete(3);
    } else {
      setSuccess(false);
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
      if (speakText) speakText("Oops! The order should be: Water first, then soap, then dry.");
    }
  };

  const reset = () => {
    setOrder([]);
    setChecked(false);
    setSuccess(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl relative overflow-hidden font-sans border-2 border-indigo-50 shadow-xs">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">
            1
          </div>
          <h3 className="font-extrabold text-sm tracking-wide">Sequence Sorting</h3>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((starIdx) => (
            <Award 
              key={starIdx} 
              className={`w-5 h-5 ${
                starIdx <= stars ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-indigo-400/50'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 relative">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 md:p-5 flex gap-4 items-start shadow-3xs">
            <div className="text-3xl shrink-0 pt-1">
              <span className="drop-shadow-xs">🧼</span>
            </div>
            <div className="space-y-1 w-full">
               <h4 className="font-black text-indigo-900 leading-tight">Washing Hands Sequence</h4>
               <p className="text-slate-600 text-sm font-medium bg-white/60 p-3 rounded-xl border border-indigo-100 flex flex-wrap items-center gap-1 mt-2">
                 💡 <span id="student-mission-label" className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
                 <SpeakableText text="What is the right order to wash your hands? Click the pictures in the correct order!" className="p-0 hover:bg-transparent text-slate-600 border-0" />
               </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {steps.map(step => {
               const idx = order.indexOf(step.id);
               const isSelected = idx !== -1;
               
               return (
                 <button
                   key={step.id}
                   type="button"
                   onClick={() => handleSelect(step.id)}
                   disabled={checked}
                   className={`relative border-2 rounded-2xl p-4 w-32 h-32 flex flex-col items-center justify-center gap-2 transition-all shadow-3xs cursor-pointer ${
                     isSelected 
                       ? 'bg-indigo-50 border-indigo-500 scale-105'
                       : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                   } ${checked && !success ? 'opacity-50' : ''}`}
                 >
                   <span className="text-4xl drop-shadow-sm pointer-events-none">{step.emoji}</span>
                   <span className="text-xs font-bold text-slate-800 pointer-events-none text-center leading-tight">
                     {step.label}
                   </span>
                   {isSelected && (
                     <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-500 text-white font-black flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-indigo-500/20">
                       {idx + 1}
                     </div>
                   )}
                 </button>
               );
            })}
          </div>

          {checked && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-xs ${
                 success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
               }`}
             >
               {success ? (
                 <>
                   <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                   Great job! You washed your hands perfectly in order!
                 </>
               ) : (
                 <>
                   <span className="text-xl">🤔</span>
                   Oops! The order should be: Water first, then soap, then dry.
                 </>
               )}
             </motion.div>
           )}

           <div className="flex justify-center pt-4">
             {!checked ? (
               <button
                 type="button"
                 onClick={checkAnswer}
                 disabled={order.length < 3}
                 className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                   order.length === 3 
                     ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 hover:shadow-md'
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                 }`}
               >
                 <CheckCircle2 className="w-5 h-5" />
                 Check Sequence
               </button>
             ) : (
               <button
                 type="button"
                 onClick={reset}
                 className="px-8 py-3 rounded-xl font-black text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
               >
                 <RotateCcw className="w-5 h-5" />
                 Try Again
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
