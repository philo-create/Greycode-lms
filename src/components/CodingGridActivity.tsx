import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, ArrowUp, RotateCw, RefreshCw, Sparkles, Award } from 'lucide-react';
import { GradeType } from '../types';
import SpeakableText from './SpeakableText';

interface Position {
  x: number;
  y: number;
}

interface GridCell {
  type: 'empty' | 'wall' | 'target' | 'collectible' | 'lava' | 'start';
  hasCollectible?: boolean;
}

export default function CodingGridActivity({ grade, lessonId, onComplete }: { grade: GradeType; lessonId?: string; onComplete: (stars: number, possible?: number) => void; speakText?: (text: string) => void }) {
  // Level configuration
  const gridRows = 5;
  const gridCols = 5;

  const isExplicitTurn = grade === '2' || grade === '3';

  const [level, setLevel] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const getInitialBoard = (lvl: number): GridCell[][] => {
    if (lessonId === 'R-T1-W6') {
      if (lvl === 1) {
        return [
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'target'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'start'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ]
        ];
      } else {
        return [
          [ {type: 'start'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
          [ {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'target'} ]
        ];
      }
    }
    if (lessonId === 'R-T1-W4') {
      return [
        [ {type: 'start'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'wall'} ],
        [ {type: 'wall'}, {type: 'wall'}, {type: 'wall'}, {type: 'empty'}, {type: 'wall'} ],
        [ {type: 'wall'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'wall'} ],
        [ {type: 'wall'}, {type: 'empty'}, {type: 'wall'}, {type: 'wall'}, {type: 'wall'} ],
        [ {type: 'wall'}, {type: 'target'}, {type: 'wall'}, {type: 'wall'}, {type: 'wall'} ]
      ];
    }
    return [
      [ {type: 'start'}, {type: 'empty'}, {type: 'empty'}, {type: 'wall'}, {type: 'target'} ],
      [ {type: 'empty'}, {type: 'wall'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
      [ {type: 'empty'}, {type: 'empty'}, {type: 'collectible', hasCollectible: true}, {type: 'wall'}, {type: 'empty'} ],
      [ {type: 'wall'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'}, {type: 'empty'} ],
      [ {type: 'empty'}, {type: 'empty'}, {type: 'lava'}, {type: 'empty'}, {type: 'empty'} ],
    ];
  };

  // Map levels
  const characterName = lessonId === 'R-T1-W6' ? 'Baby Bot' : 'Sipho Super Bunny';
  const characterEmoji = lessonId === 'R-T1-W6' ? '🤖' : '🐰';
  const targetEmoji = lessonId === 'R-T1-W6' ? '🍼' : '🥕';
  const targetName = lessonId === 'R-T1-W6' ? 'milk bottle' : 'juicy carrot';

  const [board, setBoard] = useState<GridCell[][]>(getInitialBoard(1));

  const rabbitPosRef = useRef<Position>({ x: 0, y: 0 });
  const rabbitDirRef = useRef<'N' | 'E' | 'S' | 'W'>('E');
  const [rabbitPos, setRabbitPos] = useState<Position>({ x: 0, y: 0 });
  const [rabbitDir, setRabbitDir] = useState<'N' | 'E' | 'S' | 'W'>('E'); // N, E, S, W
  const [collectiblesCollected, setCollectiblesCollected] = useState(0);
  const [program, setProgram] = useState<string[]>([]);
  const [executionIndex, setExecutionIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<string>(`Click arrow buttons to program ${characterName}!`);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [tick, setTick] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const demoRunningRef = useRef(false);
  const [hasWatchedDemo, setHasWatchedDemo] = useState(lessonId !== 'R-T1-W4');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Load level start coordinates based on grade style
  useEffect(() => {
    resetActivity();
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      demoRunningRef.current = false;
    };
  }, [grade, lessonId, level]);

  const resetActivity = (preserveDemo = false) => {
    // Find start position
    const initialBoard = getInitialBoard(level);
    let startX = 0;
    let startY = 0;
    for (let r = 0; r < initialBoard.length; r++) {
      for (let c = 0; c < initialBoard[r].length; c++) {
        if (initialBoard[r][c].type === 'start') {
          startX = c;
          startY = r;
        }
      }
    }

    rabbitPosRef.current = { x: startX, y: startY };
    rabbitDirRef.current = 'E';
    setRabbitPos({ x: startX, y: startY });
    setRabbitDir('E');
    setCollectiblesCollected(0);
    setExecutionIndex(-1);
    setIsRunning(false);
    setStatus('idle');
    setTick(0);
    if (!preserveDemo) {
      setDemoRunning(false);
      demoRunningRef.current = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    setActiveHighlight(null);
    setFeedback(isExplicitTurn 
      ? 'Grade 2 & 3: Turn Left/Right rotating in-place. Forward physically enters next tile.' 
      : 'Grade R & 1: Movement arrows auto-face and advance block-by-block.'
    );
    
    // Reset collectibles on the board
    setBoard(initialBoard);
  };

  const runTeacherSimulation = async () => {
    if (demoRunningRef.current) return;
    setDemoRunning(true);
    demoRunningRef.current = true;
    setActiveHighlight(null);

    const speakAndWait = (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if ('speechSynthesis' in window && demoRunningRef.current) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          // Protect from garbage collection
          (window as any).__currentUtterance = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          resolve();
        }
      });
    };

    resetActivity(true);
    setProgram([]);
    setFeedback("Watch closely! The teacher is showing you how to code.");
    await speakAndWait("Watch closely! The teacher is showing you how to code Sipho's path.");
    await new Promise(r => setTimeout(r, 500));
    
    // Simulate clicking Move Right
    if (!demoRunningRef.current) return;
    setActiveHighlight('MOVE_RIGHT');
    const pFirstSpeak = speakAndWait("First, we click the arrow cards below to build our sequence. Move right.");
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT']);
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setActiveHighlight(null);
    await pFirstSpeak; // Wait until speech completes
    
    // Simulate clicking Move Down
    await new Promise(r => setTimeout(r, 500));
    if (!demoRunningRef.current) return;
    setActiveHighlight('MOVE_DOWN');
    await speakAndWait("Then, let's add move down.");
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN']);
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setActiveHighlight(null);
    
    // Simulate mistake
    await new Promise(r => setTimeout(r, 500));
    if (!demoRunningRef.current) return;
    setActiveHighlight('MOVE_RIGHT');
    const pMistake = speakAndWait("Oops! We made a mistake. To fix it, click the Delete Last button to clear the mistake.");
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_RIGHT']);
    setActiveHighlight(null);
    setFeedback("Oops! We made a mistake. Let's delete the last block.");
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate Delete
    if (!demoRunningRef.current) return;
    setActiveHighlight('DELETE');
    await new Promise(r => setTimeout(r, 800));
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN']);
    setActiveHighlight(null);
    await pMistake;
    
    setFeedback("Mistake cleared! Now let's finish the path.");
    await speakAndWait("Mistake cleared! Now let's finish the path to the carrot.");
    
    // Simulate Left and Down
    await new Promise(r => setTimeout(r, 500));
    if (!demoRunningRef.current) return;
    setActiveHighlight('MOVE_LEFT');
    await speakAndWait("Move left.");
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_LEFT']);
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setActiveHighlight(null);

    await new Promise(r => setTimeout(r, 1000));
    if (!demoRunningRef.current) return;
    setActiveHighlight('MOVE_DOWN');
    await speakAndWait("And move down.");
    if (!demoRunningRef.current) return;
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_DOWN']);
    await new Promise(r => setTimeout(r, 600));
    if (!demoRunningRef.current) return;
    setActiveHighlight(null);
    
    setFeedback("Perfect! Now we click Run Code!");
    await speakAndWait("Perfect! Now we click the green Run Code button to test our program!");
    
    if (!demoRunningRef.current) return;
    setActiveHighlight('RUN');
    await new Promise(r => setTimeout(r, 800));
    if (!demoRunningRef.current) return;
    setActiveHighlight(null);
    
    // Explicitly run the exact sequence
    resetActivity(true);
    setProgram(['MOVE_RIGHT', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_DOWN']);
    setIsRunning(true);
    setExecutionIndex(0);
    // After execution starts, the status will eventually change to "success",
    // which will be caught by a useEffect.
  };

  useEffect(() => {
    if (status === 'success' && demoRunning) {
      const finishDemo = async () => {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(`See? ${characterName} reached the target! Now I will reset the board, and it's your turn to practice!`);
          u.rate = 0.9;
          u.pitch = 1.1;
          (window as any).__currentUtterance = u;
          window.speechSynthesis.speak(u);
          
          u.onend = () => {
             resetActivity();
             setProgram([]);
             setHasWatchedDemo(true);
          }
          u.onerror = () => {
             resetActivity();
             setProgram([]);
             setHasWatchedDemo(true);
          }
        } else {
          setTimeout(() => {
             resetActivity();
             setProgram([]);
             setHasWatchedDemo(true);
          }, 3000);
        }
      };
      finishDemo();
    }
  }, [status, demoRunning]);

  useEffect(() => {
    if (status === 'failed' && !demoRunning) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(feedback);
        u.rate = 0.9;
        u.pitch = 1.1;
        (window as any).__currentUtterance = u;
        window.speechSynthesis.speak(u);
      }
    }
  }, [status, demoRunning, feedback]);

  const addCommand = (cmd: string) => {
    if (program.length >= 12) {
      setFeedback('Program memory is full (maximum 12 commands).');
      return;
    }
    setProgram(prev => [...prev, cmd]);
  };

  const deleteLastCommand = () => {
    setProgram(prev => prev.slice(0, -1));
  };

  const clearProgram = () => {
    setProgram([]);
    resetActivity();
  };

  // Perform single execution tick
  const executeStep = (cmd: string): boolean => {
    let { x, y } = rabbitPosRef.current;
    let newDir = rabbitDirRef.current;
    let isContinuous = false;

    if (!isExplicitTurn) {
      if (grade === 'R' && lessonId?.startsWith('R-T1')) {
        let dx = 0; let dy = 0;
        if (cmd === 'MOVE_UP') { dy = -1; newDir = 'N'; }
        else if (cmd === 'MOVE_DOWN') { dy = 1; newDir = 'S'; }
        else if (cmd === 'MOVE_LEFT') { dx = -1; newDir = 'W'; }
        else if (cmd === 'MOVE_RIGHT') { dx = 1; newDir = 'E'; }

        if (dx !== 0 || dy !== 0) {
          const nextX = x + dx;
          const nextY = y + dy;
          
          const isBlocked = 
            nextX < 0 || nextY < 0 || 
            nextX >= gridCols || nextY >= gridRows ||
            (board[nextY]?.[nextX]?.type === 'wall') ||
            (board[nextY]?.[nextX]?.type === 'lava');
            
          if (!isBlocked) {
            x = nextX;
            y = nextY;
            isContinuous = true; // Still moving, do not advance command index next time
          }
        }
      } else {
        if (cmd === 'MOVE_UP') { y = Math.max(0, y - 1); newDir = 'N'; }
        else if (cmd === 'MOVE_DOWN') { y = Math.min(gridRows - 1, y + 1); newDir = 'S'; }
        else if (cmd === 'MOVE_LEFT') { x = Math.max(0, x - 1); newDir = 'W'; }
        else if (cmd === 'MOVE_RIGHT') { x = Math.min(gridCols - 1, x + 1); newDir = 'E'; }
      }
    } else {
      if (cmd === 'TURN_LEFT') {
        const dirs: ('N' | 'E' | 'S' | 'W')[] = ['N', 'W', 'S', 'E'];
        const idx = dirs.indexOf(newDir);
        newDir = dirs[(idx + 1) % 4];
      } else if (cmd === 'TURN_RIGHT') {
        const dirs: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'S', 'W'];
        const idx = dirs.indexOf(newDir);
        newDir = dirs[(idx + 1) % 4];
      } else if (cmd === 'FORWARD') {
        if (newDir === 'N') y = Math.max(0, y - 1);
        else if (newDir === 'S') y = Math.min(gridRows - 1, y + 1);
        else if (newDir === 'W') x = Math.max(0, x - 1);
        else if (newDir === 'E') x = Math.min(gridCols - 1, x + 1);
      } else if (cmd === 'LOOP_X2_FORWARD') {
        if (newDir === 'N') y = Math.max(0, y - 2);
        else if (newDir === 'S') y = Math.min(gridRows - 1, y + 2);
        else if (newDir === 'W') x = Math.max(0, x - 2);
        else if (newDir === 'E') x = Math.min(gridCols - 1, x + 2);
      }
    }

    rabbitPosRef.current = { x, y };
    rabbitDirRef.current = newDir;
    setRabbitPos({ x, y });
    setRabbitDir(newDir);

    const currentCell = board[y]?.[x];
    if (!currentCell || currentCell.type === 'wall') {
      setStatus('failed');
      setIsRunning(false);
      setFeedback('Crash! Sipho bumped into a brick block! Click the reset button to start over or delete the last command to try again.');
      return false;
    }

    if (currentCell.type === 'lava') {
      setStatus('failed');
      setIsRunning(false);
      setFeedback('Oh no! Sipho fell into the lava block. Please debug your steps by deleting the last command and routing around it.');
      return false;
    }

    if (currentCell.type === 'collectible' && currentCell.hasCollectible) {
      setBoard(b => {
        const newB = [...b.map(r => [...r])];
        newB[y][x].hasCollectible = false;
        return newB;
      });
      setCollectiblesCollected(c => c + 1);
      setFeedback(`Yummy! ${characterName} picked up a gem!`);
    }

    if (currentCell.type === 'target') {
      if (grade !== 'R' && collectiblesCollected === 0) {
        setStatus('failed');
        setIsRunning(false);
        setFeedback('Target block reached, but you forgot to collect the gem first! Click reset and add steps to pick up the gem on the way.');
      } else {
        setStatus('success');
        setIsRunning(false);
        setFeedback(`Outstanding success! You coded ${characterName} safely to the target goal!`);
        if (!demoRunningRef.current) {
          onComplete(3); 
        }
      }
      return false; // we reached target, so no more continuity
    }

    return isContinuous;
  };

  // Execution ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && executionIndex < program.length && status === 'idle') {
      timer = setTimeout(() => {
        const nextCmd = program[executionIndex];
        const isContinuous = executeStep(nextCmd);
        if (!isContinuous) {
          setExecutionIndex(idx => idx + 1);
        } else {
          setTick(t => t + 1);
        }
      }, 700);
    } else if (isRunning && executionIndex === program.length) {
      setIsRunning(false);
      // If we finished commands but didn't solve
      if (status === 'idle') {
        setStatus('failed');
        setFeedback(`Sequence ended, but ${characterName} has not reached the target block. Add more arrows to your code or click the Delete Last button to edit.`);
      }
    }
    return () => clearTimeout(timer);
  }, [isRunning, executionIndex, tick]);

  const runProgram = () => {
    if (program.length === 0) {
      setFeedback('Program is empty! Add directional commands first.');
      return;
    }
    resetActivity();
    setIsRunning(true);
    setExecutionIndex(0);
  };

  // Commands pool to render
  const defaultCommands = [
    { code: 'MOVE_UP', label: 'Move Up', icon: <ArrowUp className="w-5 h-5 text-indigo-500" /> },
    { code: 'MOVE_DOWN', label: 'Move Down', icon: <ArrowUp className="w-5 h-5 text-indigo-500 rotate-180" /> },
    { code: 'MOVE_LEFT', label: 'Move Left', icon: <ArrowUp className="w-5 h-5 text-indigo-500 -rotate-90" /> },
    { code: 'MOVE_RIGHT', label: 'Move Right', icon: <ArrowUp className="w-5 h-5 text-indigo-500 rotate-90" /> },
  ];

  const explicitTurnCommands = [
    { code: 'FORWARD', label: 'Forward', icon: <ArrowUp className="w-5 h-5 text-emerald-500" /> },
    { code: 'TURN_LEFT', label: 'Turn Left', icon: <RotateCw className="w-5 h-5 text-indigo-500 scale-x-[-1]" /> },
    { code: 'TURN_RIGHT', label: 'Turn Right', icon: <RotateCw className="w-5 h-5 text-indigo-500" /> },
    { code: 'LOOP_X2_FORWARD', label: 'Forward x2 (Loop)', icon: <ArrowUp className="w-5 h-5 text-amber-500 mt-1" /> }
  ];

  const commands = isExplicitTurn ? explicitTurnCommands : defaultCommands;

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl shadow-xl p-5 md:p-8" id="coding-grid-activity">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Algorithms & Grid Coding (Strand C.1-C.5)
          </span>
          <h2 className="text-xl font-black text-slate-800 mt-2">Sipho’s Grid Solver</h2>
        </div>
        <button
          onClick={resetActivity}
          className="p-2 hover:bg-slate-200/80 rounded-xl text-slate-500 transition cursor-pointer"
          title="Reset puzzle board"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Playful Instruction Banner or Interactive Teacher */}
      {lessonId === 'R-T1-W4' ? (
        <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl mb-6 shadow-sm flex gap-4 items-center">
          <div className="w-16 h-16 bg-white shrink-0 rounded-full border-4 border-indigo-100 flex items-center justify-center text-3xl shadow">
            👩‍🏫
          </div>
          <div>
            <span className="font-bold text-indigo-800 text-sm uppercase tracking-wider block mb-1">Teacher Guide</span>
            <p className="text-indigo-900 font-bold text-base leading-snug">
              {!hasWatchedDemo 
                ? "First time coding? You MUST watch the demo first! Click '▶️ Watch Demo' to see how it's done."
                : (program.length === 0 
                  ? "Great! Now it's your turn. Click the arrow block cards below to add steps to Sipho's path. Try adding 'Move Right'!"
                  : (status === 'failed' 
                    ? "Oops! Sipho hit a wall. In coding, you can click 'Delete Last' or 'Clear All' to fix mistakes!"
                    : (isRunning 
                      ? "Look! Sipho is looping step-by-step through your exact block program..."
                      : "Great job! Keep adding blocks, then click the green 'Run Code' button when you're ready to test it!"
                    )
                  )
                )
              }
            </p>
          </div>
          <button 
            onClick={runTeacherSimulation}
            disabled={demoRunning || isRunning}
            className={`ml-auto shrink-0 px-4 py-2 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow transition ${!hasWatchedDemo && !demoRunning ? 'bg-indigo-500 hover:bg-indigo-600 ring-4 ring-indigo-300 ring-offset-2 animate-pulse cursor-pointer' : 'bg-indigo-500 hover:bg-indigo-600'}`}
          >
            ▶️ Watch Demo
          </button>
        </div>
      ) : (
        <p className="text-slate-600 text-sm md:text-base font-medium bg-slate-100/40 p-4 rounded-xl border border-slate-200/60 mb-6 flex flex-wrap items-center gap-1">
          💡 <span className="font-bold text-slate-800 mr-1 shrink-0">Student Mission:</span>
          <SpeakableText 
            text={isExplicitTurn 
              ? `Program ${characterName} to navigate the grid obstacles, collect the gem and reach the ${targetName} target!`
              : `Help ${characterName} collect the gem and reach the ${targetName} target using coded movement arrows!`
            } 
            className="p-0 hover:bg-transparent text-slate-600 border-0" 
          />
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Playable Grid Area */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="grid grid-cols-5 gap-1.5 bg-slate-800 p-4 rounded-3xl shadow-xl max-w-full relative">
            <div className="absolute top-2 left-2 bg-slate-900/60 text-white/50 text-[10px] px-2 py-0.5 rounded font-mono">
              5x5 board
            </div>
            {board.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isRabbit = rabbitPos.x === cIdx && rabbitPos.y === rIdx;
                let cellColor = 'bg-slate-700 hover:bg-slate-600/85';
                
                if (cell.type === 'wall') cellColor = 'bg-stone-500 shadow-md border-t-4 border-stone-400';
                if (cell.type === 'target') cellColor = 'bg-emerald-950 border-2 border-emerald-400 shadow-lg';
                if (cell.type === 'lava') cellColor = 'bg-rose-950 border-2 border-rose-400';

                // rotation rotation representation
                const dirRotation = {
                  'N': 'rotate-0',
                  'E': 'rotate-90',
                  'S': 'rotate-180',
                  'W': '-rotate-90'
                }[rabbitDir];

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-14 h-14 md:w-16 md:h-14 rounded-2xl flex items-center justify-center transition-all relative select-none ${cellColor}`}
                  >
                    {/* Goal Signpost */}
                    {cell.type === 'target' && (
                      <span className="text-xl font-bold">{targetEmoji}</span>
                    )}

                    {/* Collectible bone/small carrot */}
                    {cell.type === 'collectible' && cell.hasCollectible && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-lg"
                      >
                        💎
                      </motion.span>
                    )}

                    {/* Red Lava indicator */}
                    {cell.type === 'lava' && (
                      <span className="text-red-400 text-xs font-black animate-pulse">LAVA</span>
                    )}

                    {/* Sipho Super Bunny Character representing actual current grid coordinates */}
                    {isRabbit && (
                      <motion.div
                        layoutId="rabbit"
                        className={`absolute w-12 h-12 bg-indigo-600 border-2 border-indigo-300 rounded-full flex flex-col items-center justify-center shadow-lg text-white ${dirRotation} transition-transform duration-300`}
                        title="Sipho Super Bunny"
                      >
                        <span className="text-xl leading-none">🐰</span>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-0.5 animate-pulse"></div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Feedback Prompt Banner */}
          <div className="w-full mt-4 text-center">
            <p className="text-xs md:text-sm font-semibold text-indigo-900 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
              💬 {feedback}
            </p>
          </div>
        </div>

        {/* Workspace Block Programmer or Multiple Choice Mode */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {lessonId === 'R-T1-W6' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-grow flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-4">
                Which set of instructions gets Baby Bot to the bottle?
              </h3>
              <div className="flex justify-between items-start mb-6">
                <p className="text-slate-600 text-sm">
                  {level === 1 ? "(Hint: Arrow moves until it hits a wall!)" : "Level 2: Which sets of commands will guide Baby Bot? (Select ALL correct answers!)"}
                </p>
              </div>
              
              <div className="space-y-3 flex-grow">
                {(level === 1 ? [
                  { id: 1, label: 'Set 1: ➡️ ⬆️', isCorrect: true },
                  { id: 2, label: 'Set 2: ➡️ ⬇️', isCorrect: false },
                  { id: 3, label: 'Set 3: ⬆️ ➡️', isCorrect: false },
                ] : [
                  { id: 1, label: 'Set 1: ➡️ ⬇️', isCorrect: true },
                  { id: 2, label: 'Set 2: ➡️ ⬆️', isCorrect: false },
                  { id: 3, label: 'Set 3: ⬇️ ➡️', isCorrect: true },
                ]).map((set) => {
                  const isSelected = selectedAnswers.includes(set.id);
                  return (
                    <button
                      key={set.id}
                      onClick={() => {
                        setSelectedAnswers(prev => 
                          prev.includes(set.id) ? prev.filter(id => id !== set.id) : [...prev, set.id]
                        );
                        setStatus('idle');
                        setFeedback("Good choice! Click Submit to check if it's correct.");
                      }}
                      className={`w-full flex items-center p-4 rounded-xl border-2 transition-all font-bold text-left ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md ring-2 ring-indigo-200' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && '✓'}
                      </div>
                      <span className="flex-1">{set.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {status === 'failed' && (
                  <div className="text-rose-600 font-bold text-sm mb-3 text-center bg-rose-50 p-2 rounded-lg">
                    Not quite right. Try again!
                  </div>
                )}
                {status === 'success' && level === 2 && (
                  <div className="text-emerald-600 font-bold text-sm mb-3 text-center bg-emerald-50 p-2 rounded-lg">
                    Level 2 completed! You are a coding master!
                  </div>
                )}
                <button
                  disabled={selectedAnswers.length === 0}
                  onClick={() => {
                    const currentOptions = level === 1 ? [
                      { id: 1, isCorrect: true },
                      { id: 2, isCorrect: false },
                      { id: 3, isCorrect: false },
                    ] : [
                      { id: 1, isCorrect: true },
                      { id: 2, isCorrect: false },
                      { id: 3, isCorrect: true },
                    ];
                    
                    const correctIds = currentOptions.filter(o => o.isCorrect).map(o => o.id);
                    const isFullyCorrect = selectedAnswers.length === correctIds.length && selectedAnswers.every(id => correctIds.includes(id));

                    if (isFullyCorrect) {
                      setStatus('success');
                      if (level === 1) {
                        setFeedback("Excellent! Moving to Level 2...");
                        setTimeout(() => {
                          setLevel(2);
                          setSelectedAnswers([]);
                          setStatus('idle');
                        }, 1500);
                      } else {
                        setFeedback("Excellent! You beat Level 2!");
                        if (onComplete) onComplete();
                      }
                    } else {
                      setStatus('failed');
                      setFeedback("Oops, those sets didn't get Baby Bot to the milk bottle.");
                    }
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  🧱 Available Block Commands
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                  {commands.map(cmd => {
                    const isActive = activeHighlight === cmd.code;
                    const highlightStyle = isActive ? 'ring-4 ring-indigo-400 bg-indigo-100 border-indigo-400 scale-105 z-10 shadow-lg' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300';
                    return (
                    <button
                      key={cmd.code}
                      disabled={!hasWatchedDemo || demoRunning || isRunning || status !== 'idle'}
                      onClick={() => addCommand(cmd.code)}
                      id={`cmd-btn-${cmd.code}`}
                      className={`p-3 border active:scale-95 rounded-xl font-bold text-xs text-slate-800 flex items-center gap-2 transition cursor-pointer ${highlightStyle}`}
                    >
                      {cmd.icon}
                      <span>{cmd.label}</span>
                    </button>
                  )})}
                </div>
              </div>

              {/* Coded Instructions list */}
              <div className="bg-slate-900 rounded-2xl p-4 flex-grow min-h-[14rem] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                      Program Workspace ({program.length} / 12)
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={!hasWatchedDemo || demoRunning || program.length === 0 || isRunning}
                        onClick={deleteLastCommand}
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded cursor-pointer transition ${activeHighlight === 'DELETE' ? 'ring-2 ring-white bg-white/20 text-white scale-105' : 'text-white/60 hover:text-white bg-white/10 hover:bg-white/20'}`}
                      >
                        Delete Last
                      </button>
                      <button
                        disabled={!hasWatchedDemo || demoRunning || program.length === 0 || isRunning}
                        onClick={clearProgram}
                        className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Command badges list representation */}
                  {program.length === 0 ? (
                    <div className="text-center py-10 text-white/30 text-xs font-medium">
                      {"< Program space is empty. Add blocks above! >"}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {program.map((cmd, idx) => {
                        const isExecuting = isRunning && executionIndex === idx;
                        const baseStyle = isExecuting 
                          ? 'bg-amber-500 text-slate-900 scale-105 border-amber-300 ring-4 ring-amber-500/30' 
                          : 'bg-indigo-950/60 text-indigo-300 border-indigo-900/60';

                        return (
                          <div
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${baseStyle}`}
                           id={`block-instr-${idx}`}
                          >
                            <span className="opacity-40">{idx + 1}.</span>
                            <span>{cmd.replace('MOVE_', '').replace('TURN_', '')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Run controls container */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-4">
                  <div className="text-[10px] text-slate-500 max-w-[50%]">
                    Tip: Sipho must collect the diamond (💎) before stepping onto the carrot (🥕) in higher grades.
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={demoRunning}
                      onClick={resetActivity}
                      className="px-4 py-2 border border-white/20 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button
                      disabled={!hasWatchedDemo || demoRunning || program.length === 0 || isRunning}
                      onClick={runProgram}
                      id="run-sequence-btn"
                      className={`px-5 py-2.5 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer ${activeHighlight === 'RUN' ? 'ring-4 ring-emerald-400 bg-emerald-400 scale-105 shadow-emerald-500/50' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      Run Code
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Modal overlay */}
      {status === 'success' && (
        <div className="inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 mt-6 rounded-2xl">
          <div className="bg-white rounded-2xl p-6 text-center max-w-md w-full border border-slate-100 shadow-2xl">
            <div className="inline-flex p-3.5 bg-emerald-50 rounded-full text-emerald-500 border border-emerald-200 mb-3 shadow">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Puzzle Solved Successfully!</h3>
            <p className="text-xs text-slate-500 mt-2">
              {characterName} collected all objectives and completed this grid layout in exactly {program.length} instruction steps.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={resetActivity}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Replay Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
