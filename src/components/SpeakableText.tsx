import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

interface SpeakableTextProps {
  text: string;
  className?: string;
  isGradeR?: boolean;
}

export default function SpeakableText({ text, className = "", isGradeR = true }: SpeakableTextProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Split text by whitespace, preserving the whitespace as separate array items
  const words = text.split(/(\s+)/);
  
  // Calculate character intervals for each segment
  const segments: { text: string; start: number; length: number }[] = [];
  let charAccumulator = 0;
  words.forEach((w) => {
    segments.push({
      text: w,
      start: charAccumulator,
      length: w.length,
    });
    charAccumulator += w.length;
  });

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Kiddie-friendly tone and pacing
    utterance.rate = 0.82; 
    utterance.pitch = 1.20; 

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find which segment encompasses this character index
        const activeIdx = segments.findIndex(
          (seg) => charIndex >= seg.start && charIndex < seg.start + seg.length
        );
        if (activeIdx !== -1) {
          setCurrentWordIndex(activeIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentWordIndex(null);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  return (
    <span 
      onClick={handleSpeak}
      className={`cursor-pointer inline-flex flex-wrap items-center gap-x-0.5 rounded-lg px-2.5 py-1.5 transition-all text-left group hover:bg-rose-50 border hover:border-rose-200/50 select-none ${
        isPlaying 
          ? 'bg-rose-50 border-rose-350/80 shadow-xs' 
          : 'border-transparent'
      } ${className}`}
      title="Tap to listen and read along!"
    >
      <span className="inline">
        {segments.map((seg, idx) => {
          const isHighlighted = isPlaying && currentWordIndex === idx;
          return (
            <span
              key={idx}
              className={`transition-all duration-100 rounded-xs px-0.5 py-0.25 ${
                isHighlighted 
                  ? 'bg-indigo-600 text-white font-extrabold scale-105 shadow-3xs inline-block' 
                  : ''
              }`}
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      <span className="inline-flex items-center gap-1.5 ml-1.5 shrink-0 select-none">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 group-hover:bg-rose-200 text-rose-600 shrink-0">
          {isPlaying ? (
            <span className="flex items-center gap-0.5">
              <span className="w-0.5 h-1.5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-2 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-rose-600" />
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/50 rounded-md group-hover:bg-rose-100 transition-colors">
          Read out loud
        </span>
      </span>
    </span>
  );
}

export interface WordToken {
  partIndex: number;
  wordIndex: number;
  text: string;
  globalStart: number;
  globalEnd: number;
}

export function useSectionSpeech(parts: string[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Parse active parts into a flat token list
  const globalTokens: WordToken[] = [];
  let speechTextAccumulator = "";

  if (parts && parts.length > 0) {
    parts.forEach((partText, partIdx) => {
      // Split by spaces but preserve word boundaries
      const partSegments = partText.split(/(\s+)/);
      let partCharOffset = 0;
      
      partSegments.forEach((segment, idx) => {
        const globalStart = speechTextAccumulator.length + partCharOffset;
        const globalEnd = globalStart + segment.length;
        
        globalTokens.push({
          partIndex: partIdx,
          wordIndex: idx,
          text: segment,
          globalStart,
          globalEnd
        });
        
        partCharOffset += segment.length;
      });
      
      speechTextAccumulator += partText + " "; // Add space between parts
    });
  }

  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!('speechSynthesis' in window) || !parts || parts.length === 0) {
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveWordIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechTextAccumulator);
    utteranceRef.current = utterance;
    
    // Kiddie-friendly tone and pacing
    utterance.rate = 0.82; 
    utterance.pitch = 1.20; 

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find which token matches the character offset
        const activeIdx = globalTokens.findIndex(
          (t) => charIndex >= t.globalStart && charIndex < t.globalEnd
        );
        if (activeIdx !== -1) {
          setActiveWordIndex(activeIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setActiveWordIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveWordIndex(null);
    };

    setIsPlaying(true);
    (window as any).__currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveWordIndex(null);
    }
  };

  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // Stop speaking when parts string representation changes
  const partsStr = (parts || []).join("||");
  useEffect(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveWordIndex(null);
    }
  }, [partsStr]);

  const renderPart = (partIdx: number, className: string = "") => {
    const partText = parts[partIdx];
    if (!partText) return null;
    
    const partSegments = partText.split(/(\s+)/);
    
    // Find absolute matching index offset for this part
    let currentGlobalOffset = 0;
    for (let i = 0; i < partIdx; i++) {
       currentGlobalOffset += parts[i].split(/(\s+)/).length;
    }

    return (
      <span className={className}>
        {partSegments.map((segment, idx) => {
          const globalTokenIdx = currentGlobalOffset + idx;
          const isCurrentWord = isPlaying && activeWordIndex === globalTokenIdx;
          
          return (
            <span
              key={idx}
              className={`transition-all duration-100 rounded-2xs ${
                isCurrentWord 
                  ? 'bg-rose-500 text-white font-extrabold px-1 py-0.25 scale-105 shadow-md shadow-rose-200 inline-block' 
                  : ''
              }`}
            >
              {segment}
            </span>
          );
        })}
      </span>
    );
  };

  return {
    isPlaying,
    activeWordIndex,
    handleSpeak,
    stopSpeak,
    renderPart
  };
}
