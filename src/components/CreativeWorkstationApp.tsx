'use client';

import React, { useState, useRef, useEffect, useMemo, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { 
  Palette, PenTool, Battery, Lightbulb, Zap, 
  Settings, MousePointer2, Trash2, Undo2, Redo2, Copy,
  Circle, Square, Triangle, Minus, Type, Eraser, PaintBucket,
  Star, Sparkles, CheckCircle2, AlertCircle,
  Volume2, Maximize2, Minimize2, Lock, Trophy, Play, Pause, Activity, Grid
} from 'lucide-react';
import greycodeBoardSvg from './greycode_board_top.svg';
import greycodeLedTransparentSvg from './Greycode_LED_transparent.svg';

import { routeWireManhattan } from './router';

type Tool = 'select' | 'draw' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'oval' | 'curly' | 'component' | 'text' | 'eraser' | 'fill' | 'circuit-wire';
type ComponentType = 'battery' | 'led' | 'motor' | 'wire' | 'robot-arm' | 'wheel' | 'esp32' | 'resistor' | 'breadboard';

function getCurlyPath(x1: number, y1: number, x2: number, y2: number, startDir: string = 'auto', endDir: string = 'auto'): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const controlDist = Math.max(Math.abs(dx), Math.abs(dy)) * 0.4 + 20;
  
  let cp1x = x1;
  let cp1y = y1;
  if (startDir === 'left') cp1x -= controlDist;
  else if (startDir === 'right') cp1x += controlDist;
  else if (startDir === 'up') cp1y -= controlDist;
  else if (startDir === 'down') cp1y += controlDist;
  
  let cp2x = x2;
  let cp2y = y2;
  if (endDir === 'left') cp2x -= controlDist;
  else if (endDir === 'right') cp2x += controlDist;
  else if (endDir === 'up') cp2y -= controlDist;
  else if (endDir === 'down') cp2y += controlDist;

  // Use a bezier curve, but add slight waviness along the curve
  const points: string[] = [];
  const steps = Math.floor(len / 4);
  const amplitude = 5;
  const frequency = len / 10;
  
  points.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)}`);
  
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    
    // Calculate bezier point
    let bx = u*u*u * x1 + 3*u*u*t * cp1x + 3*u*t*t * cp2x + t*t*t * x2;
    let by = u*u*u * y1 + 3*u*u*t * cp1y + 3*u*t*t * cp2y + t*t*t * y2;
    
    // Calculate bezier tangent to add perpendicular wavy offset
    let tx = 3*u*u * (cp1x - x1) + 6*u*t * (cp2x - cp1x) + 3*t*t * (x2 - cp2x);
    let ty = 3*u*u * (cp1y - y1) + 6*u*t * (cp2y - cp1y) + 3*t*t * (y2 - cp2y);
    const tLen = Math.sqrt(tx*tx + ty*ty);
    const nx = -ty / (tLen || 1);
    const ny = tx / (tLen || 1);
    
    const offset = Math.sin(t * Math.PI * frequency) * amplitude;
    
    points.push(`L ${(bx + nx * offset).toFixed(1)} ${(by + ny * offset).toFixed(1)}`);
  }
  
  return points.join(' ');
}

interface CanvasObject {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: { x: number; y: number }[];
  waypoints?: { x: number; y: number }[];
  color: string;
  fillColor?: string;
  strokeWidth: number;
  componentType?: ComponentType;
  text?: string;
  fontSize?: number;
  startPin?: string;
  endPin?: string;
  startBoardId?: string;
  endBoardId?: string;
  pinStates?: Record<string, boolean>; // For ESP32 to define which pins are HIGH
}

export interface WorkstationActivity {
  id: string;
  title: string;
  emoji: string;
  description: string;
  targetDescription: string;
  validate: (objects: CanvasObject[]) => boolean;
}

export const TERM_WORKSTATION_ACTIVITIES: WorkstationActivity[] = [
  {
    id: 'activity_1_red_blue',
    title: 'Pattern Creator 🔴🔵',
    emoji: '🔴🔵',
    description: 'Use the circle tool to draw a pattern of alternating red and blue beads! Needs at least 3 circles.',
    targetDescription: '3+ Alternating Red & Blue Circles',
    validate: (objects: CanvasObject[]) => {
      const circles = objects.filter(obj => obj.type === 'circle');
      if (circles.length < 3) return false;
      const colors = circles.map(i => i.color.toLowerCase());
      const hasRed = colors.some(c => c === '#ef4444' || c.includes('ef44') || c.includes('red') || c === '#f59e0b');
      const hasBlue = colors.some(c => c === '#3b82f6' || c.includes('3b82') || c.includes('blue') || c === '#8b5cf6');
      return hasRed && hasBlue;
    }
  },
  {
    id: 'activity_2_device_frame',
    title: 'Shape Sorter Art 📐⏹️',
    emoji: '📐⏹️',
    description: 'Draw 2 rectangles and 2 triangles on your canvas using the shape tools!',
    targetDescription: '2 Rectangles + 2 Triangles',
    validate: (objects: CanvasObject[]) => {
      const rectangles = objects.filter(obj => obj.type === 'rectangle');
      const triangles = objects.filter(obj => obj.type === 'triangle');
      return rectangles.length >= 2 && triangles.length >= 2;
    }
  },
  {
    id: 'activity_3_led_circuit',
    title: 'Glowing Circuitry 🔋💡',
    emoji: '🔋💡',
    description: 'Place a Battery component and an LED Light component onto the canvas.',
    targetDescription: '1 Battery + 1 LED component',
    validate: (objects: CanvasObject[]) => {
      const hasBattery = objects.some(obj => obj.type === 'component' && (obj.componentType === 'battery' || obj.componentType === 'esp32'));
      const hasLED = objects.some(obj => obj.type === 'component' && (obj.componentType === 'led' || obj.componentType === 'light'));
      return hasBattery && hasLED;
    }
  },
  {
    id: 'activity_4_house_design',
    title: 'Sipho\'s Shelter 🏠🤖',
    emoji: '🏠🤖',
    description: 'Draw a house for Sipho using a rectangle for the base, a triangle for the roof, and a line for the ground.',
    targetDescription: '1 Rectangle + 1 Triangle + 1 Line',
    validate: (objects: CanvasObject[]) => {
      const hasRectangle = objects.some(obj => obj.type === 'rectangle');
      const hasTriangle = objects.some(obj => obj.type === 'triangle');
      const hasLine = objects.some(obj => obj.type === 'line' || obj.type === 'draw');
      return hasRectangle && hasTriangle && hasLine;
    }
  }
];

interface CreativeWorkstationAppProps {
  onComplete?: (stars: number, possible?: number, aiFeedback?: string) => void;
  mode?: 'bracelet' | 'general';
  speakText?: (text: string) => void;
  otherActivitiesCompleted?: boolean;
  activeStudentId?: string;
  isLocked?: boolean;
  certifiedScore?: number | null;
}

export default function CreativeWorkstationApp({ 
  onComplete, 
  mode = 'general', 
  speakText, 
  otherActivitiesCompleted = true,
  activeStudentId,
  isLocked = false,
  certifiedScore = null
}: CreativeWorkstationAppProps) {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(null);
  const [currentColor, setCurrentColor] = useState('#4f46e5');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(4);
  const [objects, setObjects] = useState<CanvasObject[]>(() => {
    if (typeof window !== 'undefined' && mode === 'bracelet') {
      const saved = localStorage.getItem(`gr_wb_${activeStudentId || 'default'}_R-T1-W7_bracelet_objects`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && mode === 'bracelet') {
      localStorage.setItem(`gr_wb_${activeStudentId || 'default'}_R-T1-W7_bracelet_objects`, JSON.stringify(objects));
    }
  }, [objects, mode, activeStudentId]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState(false);
  const [showActivities, setShowActivities] = useState(true);
  const [checkingActivityId, setCheckingActivityId] = useState<string | null>(null);
  const [isSubmittingWorkstation, setIsSubmittingWorkstation] = useState(false);
  const [inlineTextPos, setInlineTextPos] = useState<{ x: number; y: number } | null>(null);
  const [inlineTextVal, setInlineTextVal] = useState('');
  const [history, setHistory] = useState<CanvasObject[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const commitObjects = (newObjectsOrUpdater: CanvasObject[] | ((prev: CanvasObject[]) => CanvasObject[])) => {
    if (isLocked) {
      setValidationError("🔒 This design is certified and locked by the AI Tutor!");
      return;
    }
    setObjects(prev => {
      const newObjects = typeof newObjectsOrUpdater === 'function' ? newObjectsOrUpdater(prev) : newObjectsOrUpdater;
      
      if (newObjects === prev) return prev; // Do not push if identical
      
      setHistory(prevHistory => {
        const nextHistory = prevHistory.slice(0, historyIndex + 1);
        nextHistory.push(newObjects);
        if (nextHistory.length > 50) nextHistory.shift();
        return nextHistory;
      });
      setHistoryIndex(prevIdx => Math.min(prevIdx + 1, 50));
      
      return newObjects;
    });
  };

  const pushCurrentStateToHistory = () => {
    if (isLocked) return;
    if (history.length > 0 && history[historyIndex] === objects) return;
    setHistory(prev => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      nextHistory.push(objects);
      if (nextHistory.length > 50) nextHistory.shift();
      return nextHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 50));
  };

  const undo = () => {
    if (isLocked) return;
    if (historyIndex > 0) {
      const nextState = history[historyIndex - 1];
      if (nextState) {
        setHistoryIndex(prev => prev - 1);
        setObjects(nextState);
        setSelectedIds([]);
      }
    }
  };

  const redo = () => {
    if (isLocked) return;
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (nextState) {
        setHistoryIndex(prev => prev + 1);
        setObjects(nextState);
        setSelectedIds([]);
      }
    }
  };
  const [pinSelectorQueue, setPinSelectorQueue] = useState<{
    objectId: string;
    endpoint: 'start' | 'end';
    boardId: string;
    x: number;
    y: number;
  }[]>([]);
  
  const currentPinSelector = pinSelectorQueue[0];
  const [boardRenderMode, setBoardRenderMode] = useState<'photo' | 'schematic'>('photo');

  // Activities tracking state and actions
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);

  useEffect(() => {
    const studentId = activeStudentId || 'default';
    const completed: string[] = [];
    TERM_WORKSTATION_ACTIVITIES.forEach(act => {
      if (typeof window !== 'undefined' && localStorage.getItem(`w7_act_${studentId}_${act.id}`) === 'true') {
        completed.push(act.id);
      }
    });
    setCompletedActivityIds(completed);
  }, [activeStudentId]);

  const triggerSuccessEffects = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteActivity = (actId: string) => {
    const studentId = activeStudentId || 'default';
    const act = TERM_WORKSTATION_ACTIVITIES.find(a => a.id === actId);
    if (!act) return;

    if (act.validate(objects)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`w7_act_${studentId}_${actId}`, 'true');
        triggerSuccessEffects();
      }
      setCompletedActivityIds(prev => [...prev, actId]);
      speakTextLocal(`Incredible! You completed the ${act.title} activity! It disappears from your checklist.`);
    } else {
      // Fallback to AI-powered grading
      setCheckingActivityId(actId);
      setValidationError("🤖 AI Tutor is evaluating your creative design...");
      
      const triggerAIEvaluation = async (imgData: string | null) => {
        try {
          const res = await fetch("/api/check-workstation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityId: act.id,
              title: act.title,
              description: act.description,
              targetDescription: act.targetDescription,
              imageData: imgData,
              objects: objects.map(obj => {
                if (obj.type === 'draw') {
                  return { ...obj, points: '...omitted to save bandwidth...' };
                }
                return obj;
              })
            })
          });
          const data = await res.json();
          setCheckingActivityId(null);
          if (data.success) {
            setValidationError(null);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`w7_act_${studentId}_${actId}`, 'true');
              triggerSuccessEffects();
            }
            setCompletedActivityIds(prev => [...prev, actId]);
            speakTextLocal(data.feedback || `Amazing! You completed the ${act.title} activity!`);
          } else {
            speakTextLocal(data.feedback);
            setValidationError(`❌ ${data.feedback}`);
            setTimeout(() => setValidationError(null), 8000);
          }
        } catch (err) {
          console.error(err);
          setCheckingActivityId(null);
          speakTextLocal("AI feature not available. Please try again later.");
          setValidationError("❌ AI feature not available. Please try again later.");
          setTimeout(() => setValidationError(null), 5000);
        }
      };

      // Extract image data from the SVG canvas
      try {
        const svgElement = canvasRef.current?.querySelector('svg');
        if (svgElement) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          const img = new Image();
          img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            // Scale down to 800x800 for quick upload and token efficiency
            tempCanvas.width = 800;
            tempCanvas.height = 800;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.fillStyle = '#ffffff';
              tempCtx.fillRect(0, 0, 800, 800);
              // Draw scaled image of SVG
              tempCtx.drawImage(img, 0, 0, 1500, 1500, 0, 0, 800, 800);
              const dataUrl = tempCanvas.toDataURL('image/png');
              URL.revokeObjectURL(url);
              triggerAIEvaluation(dataUrl);
            } else {
              URL.revokeObjectURL(url);
              triggerAIEvaluation(null);
            }
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            triggerAIEvaluation(null);
          };
          img.src = url;
        } else {
          triggerAIEvaluation(null);
        }
      } catch (e) {
        console.error("Failed to capture workstation snapshot:", e);
        triggerAIEvaluation(null);
      }
    }
  };

  const speakTextLocal = (text: string) => {
    if (speakText) {
      speakText(text);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.22;
    window.speechSynthesis.speak(utterance);
  };
  
  // Interaction states
  const [isDrawing, setIsDrawing] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'drawing' | 'moving' | 'resizing' | 'selecting'>('idle');
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [pendingIsolateId, setPendingIsolateId] = useState<string | null>(null);
  
  // --- CIRCUIT SIMULATOR ENGINE ---
  const [isSimulating, setIsSimulating] = useState(false);

  // --- AI AUTO-ROUTER STATES & ACTIONS ---
  const [isRouting, setIsRouting] = useState(false);
  const [aiRoutingMessage, setAiRoutingMessage] = useState<string | null>(null);
  const [customRoutePrompt, setCustomRoutePrompt] = useState('');

  // --- MICROBLOCKS CODING STATES ---
  const [workstationTab, setWorkstationTab] = useState<'designer' | 'microblocks'>('designer');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[MicroBlocks VM v1.2] Ready. Select a preset template or build your own blocks, then click 'Run Code'!"
  ]);
  const [blocks, setBlocks] = useState<any[]>([
    { id: 'b1', type: 'when-start', label: '🎬 When program starts', category: 'control' },
    { id: 'b2', type: 'set-pin-high', label: '🔌 Set Pin HIGH', category: 'output', paramPin: '18' },
    { id: 'b3', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '1.0' },
    { id: 'b4', type: 'set-pin-low', label: '🔌 Set Pin LOW', category: 'output', paramPin: '18' },
    { id: 'b5', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '1.0' },
  ]);
  const [foreverLoop, setForeverLoop] = useState(true);

  // --- SCRATCH & HYBRID ROBOT STATES ---
  const [spriteX, setSpriteX] = useState(0);
  const [spriteY, setSpriteY] = useState(0);
  const [spriteAngle, setSpriteAngle] = useState(0);
  const [spriteSize, setSpriteSize] = useState(100);
  const [spriteSay, setSpriteSay] = useState<string | null>(null);
  const [penActive, setPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#4f46e5');
  const [drawings, setDrawings] = useState<any[]>([]);
  const [robotCostume, setRobotCostume] = useState<'cute-bot' | 'rover-bot' | 'ufo-bot'>('cute-bot');

  // React Refs for high-speed synchronous reads and writes inside executeStep loop
  const spriteXRef = useRef(0);
  const spriteYRef = useRef(0);
  const spriteAngleRef = useRef(0);
  const spriteSizeRef = useRef(100);
  const penActiveRef = useRef(false);
  const penColorRef = useRef('#4f46e5');
  const drawingsRef = useRef<any[]>([]);

  // Use refs to prevent stale closure bugs in asynchronous execution loop
  const isRunningCodeRef = useRef(false);
  const blocksRef = useRef(blocks);
  const foreverLoopRef = useRef(foreverLoop);
  const runCodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isRunningCodeRef.current = isRunningCode;
  }, [isRunningCode]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    foreverLoopRef.current = foreverLoop;
  }, [foreverLoop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (runCodeTimeoutRef.current) {
        clearTimeout(runCodeTimeoutRef.current);
      }
    };
  }, []);

  const addConsoleLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setConsoleLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const resetScratchStage = () => {
    spriteXRef.current = 0;
    spriteYRef.current = 0;
    spriteAngleRef.current = 0;
    spriteSizeRef.current = 100;
    penActiveRef.current = false;
    penColorRef.current = '#4f46e5';
    drawingsRef.current = [];

    setSpriteX(0);
    setSpriteY(0);
    setSpriteAngle(0);
    setSpriteSize(100);
    setSpriteSay(null);
    setPenActive(false);
    setPenColor('#4f46e5');
    setDrawings([]);
    addConsoleLog("🧹 Robot returned to home, pen lifted, and drawings canvas wiped clean.");
    speakTextLocal("Reset stage canvas.");
  };

  const stopCodeExecution = () => {
    setIsRunningCode(false);
    setCurrentBlockIndex(null);
    if (runCodeTimeoutRef.current) {
      clearTimeout(runCodeTimeoutRef.current);
      runCodeTimeoutRef.current = null;
    }
    // Turn off ESP32 pins to standby
    commitObjects(prev => prev.map(obj => {
      if (obj.componentType === 'esp32') {
        return { ...obj, pinStates: {} };
      }
      return obj;
    }));
    
    setSpriteSay(null);
    addConsoleLog("⏹️ Program stopped. All microcontroller pins powered down.");
    speakTextLocal("Program stopped.");
  };

  const startCodeExecution = () => {
    // Check if there is an ESP32 microcontroller component on the canvas
    const esp32Obj = objects.find(obj => obj.componentType === 'esp32');
    if (!esp32Obj) {
      // Auto-add an ESP32 to make it extremely easy for the student to simulate!
      const newEsp32: CanvasObject = {
        id: 'esp32-' + Date.now(),
        type: 'component',
        componentType: 'esp32',
        x: 350,
        y: 200,
        width: 240,
        height: 96,
        color: '#4f46e5',
        strokeWidth: 4,
        pinStates: {}
      };
      commitObjects(prev => [...prev, newEsp32]);
      addConsoleLog("⚙️ Added virtual microcontroller (ESP32) to canvas.");
    }

    setIsSimulating(true);
    setIsRunningCode(true);
    setConsoleLogs([
      "[MicroBlocks VM v1.2] Initializing Interpreter...",
      "[MicroBlocks VM v1.2] Compiling block sequences...",
      "[MicroBlocks VM v1.2] Program uploaded successfully!",
      `▶️ Starting execution of ${blocks.length} code blocks...`
    ]);
    speakTextLocal("Uploading program and starting execution.");

    if (runCodeTimeoutRef.current) {
      clearTimeout(runCodeTimeoutRef.current);
    }

    const updateSpritePosition = (newX: number, newY: number) => {
      const oldX = spriteXRef.current;
      const oldY = spriteYRef.current;
      spriteXRef.current = newX;
      spriteYRef.current = newY;
      setSpriteX(newX);
      setSpriteY(newY);

      if (penActiveRef.current) {
        const newDrawing = {
          x1: oldX,
          y1: oldY,
          x2: newX,
          y2: newY,
          color: penColorRef.current,
          width: 3
        };
        drawingsRef.current.push(newDrawing);
        setDrawings([...drawingsRef.current]);
      }
    };

    let blockIdx = 0;

    const executeStep = () => {
      if (!isRunningCodeRef.current) return;

      const currentBlocks = blocksRef.current;
      if (currentBlocks.length === 0) {
        setIsRunningCode(false);
        setCurrentBlockIndex(null);
        return;
      }

      // Check if we hit the end of our blocks
      if (blockIdx >= currentBlocks.length) {
        if (foreverLoopRef.current) {
          blockIdx = 0; // loop back
          addConsoleLog("🔁 Forever Loop: restarting sequence...");
        } else {
          setIsRunningCode(false);
          setCurrentBlockIndex(null);
          addConsoleLog("✅ Execution completed successfully!");
          speakTextLocal("Execution completed successfully.");
          return;
        }
      }

      const block = currentBlocks[blockIdx];
      setCurrentBlockIndex(blockIdx);

      let delayMs = 150;

      if (block.type === 'when-start') {
        addConsoleLog("🎬 Start Event triggered");
        delayMs = 150;
      } else if (block.type === 'set-pin-high') {
        const pin = block.paramPin || '18';
        commitObjects(prev => prev.map(obj => {
          if (obj.componentType === 'esp32') {
            return {
              ...obj,
              pinStates: {
                ...(obj.pinStates || {}),
                [pin]: true
              }
            };
          }
          return obj;
        }));
        addConsoleLog(`⚡ Set Pin D${pin} HIGH (3.3V)`);
        delayMs = 200;
      } else if (block.type === 'set-pin-low') {
        const pin = block.paramPin || '18';
        commitObjects(prev => prev.map(obj => {
          if (obj.componentType === 'esp32') {
            return {
              ...obj,
              pinStates: {
                ...(obj.pinStates || {}),
                [pin]: false
              }
            };
          }
          return obj;
        }));
        addConsoleLog(`🔌 Set Pin D${pin} LOW (0V)`);
        delayMs = 200;
      } else if (block.type === 'toggle-pin') {
        const pin = block.paramPin || '18';
        commitObjects(prev => prev.map(obj => {
          if (obj.componentType === 'esp32') {
            const cur = !!obj.pinStates?.[pin];
            return {
              ...obj,
              pinStates: {
                ...(obj.pinStates || {}),
                [pin]: !cur
              }
            };
          }
          return obj;
        }));
        addConsoleLog(`🔄 Toggled Pin D${pin}`);
        delayMs = 200;
      } else if (block.type === 'wait') {
        const sec = parseFloat(block.paramValue) || 1.0;
        addConsoleLog(`⏱️ Sleeping for ${sec} seconds...`);
        delayMs = sec * 1000;
      } else if (block.type === 'spin-motor') {
        const pin = block.paramPin || '18';
        const speed = block.paramValue || '100';
        commitObjects(prev => prev.map(obj => {
          if (obj.componentType === 'esp32') {
            return {
              ...obj,
              pinStates: {
                ...(obj.pinStates || {}),
                [pin]: true
              }
            };
          }
          return obj;
        }));
        addConsoleLog(`⚙️ Spin motor on pin D${pin} at ${speed}% speed`);
        delayMs = 250;
      } else if (block.type === 'move-steps') {
        const steps = parseFloat(block.paramValue) || 20;
        const rad = (spriteAngleRef.current * Math.PI) / 180;
        let newX = spriteXRef.current + Math.cos(rad) * steps;
        let newY = spriteYRef.current + Math.sin(rad) * steps;
        
        // Stage boundaries: X is [-180, 180], Y is [-130, 130]
        if (newX > 180) newX = 180;
        if (newX < -180) newX = -180;
        if (newY > 130) newY = 130;
        if (newY < -130) newY = -130;

        updateSpritePosition(newX, newY);
        addConsoleLog(`🏃 Moved robot ${steps} steps forward to (${newX.toFixed(0)}, ${newY.toFixed(0)})`);
        delayMs = 200;
      } else if (block.type === 'turn-right') {
        const deg = parseFloat(block.paramValue) || 15;
        const newAngle = (spriteAngleRef.current + deg) % 360;
        spriteAngleRef.current = newAngle;
        setSpriteAngle(newAngle);
        addConsoleLog(`↪️ Turned right ${deg}° to ${newAngle.toFixed(0)}°`);
        delayMs = 150;
      } else if (block.type === 'turn-left') {
        const deg = parseFloat(block.paramValue) || 15;
        const newAngle = (spriteAngleRef.current - deg + 360) % 360;
        spriteAngleRef.current = newAngle;
        setSpriteAngle(newAngle);
        addConsoleLog(`↩️ Turned left ${deg}° to ${newAngle.toFixed(0)}°`);
        delayMs = 150;
      } else if (block.type === 'go-to-xy') {
        let tx = parseFloat(block.paramX) || 0;
        let ty = parseFloat(block.paramY) || 0;
        if (tx > 180) tx = 180;
        if (tx < -180) tx = -180;
        if (ty > 130) ty = 130;
        if (ty < -130) ty = -130;
        updateSpritePosition(tx, ty);
        addConsoleLog(`📍 Go to X: ${tx}, Y: ${ty}`);
        delayMs = 250;
      } else if (block.type === 'bounce') {
        let x = spriteXRef.current;
        let y = spriteYRef.current;
        let ang = spriteAngleRef.current;
        let bounced = false;
        if (Math.abs(x) >= 179) {
          ang = (180 - ang + 360) % 360;
          bounced = true;
        }
        if (Math.abs(y) >= 129) {
          ang = (-ang + 360) % 360;
          bounced = true;
        }
        if (bounced) {
          spriteAngleRef.current = ang;
          setSpriteAngle(ang);
          addConsoleLog(`💥 Bounced off edge! New angle: ${ang.toFixed(0)}°`);
        } else {
          addConsoleLog(`✨ Checked edge: no bounce needed`);
        }
        delayMs = 150;
      } else if (block.type === 'pen-down') {
        penActiveRef.current = true;
        setPenActive(true);
        addConsoleLog(`✏️ Pen put DOWN`);
        delayMs = 100;
      } else if (block.type === 'pen-up') {
        penActiveRef.current = false;
        setPenActive(false);
        addConsoleLog(`✏️ Pen put UP`);
        delayMs = 100;
      } else if (block.type === 'clear-drawings') {
        drawingsRef.current = [];
        setDrawings([]);
        addConsoleLog(`🧹 Drawings canvas cleared`);
        delayMs = 150;
      } else if (block.type === 'set-pen-color') {
        const col = block.paramValue || '#4f46e5';
        penColorRef.current = col;
        setPenColor(col);
        addConsoleLog(`🎨 Set pen color to ${col}`);
        delayMs = 100;
      } else if (block.type === 'say-message') {
        const msg = block.paramValue || 'Hello!';
        setSpriteSay(msg);
        speakTextLocal(msg);
        addConsoleLog(`💬 Robot says: "${msg}"`);
        delayMs = 1500;
        setTimeout(() => {
          setSpriteSay(null);
        }, 2500);
      } else if (block.type === 'change-sprite-costume') {
        const cst = block.paramValue || 'cute-bot';
        setRobotCostume(cst as any);
        addConsoleLog(`👗 Switched costume to ${cst}`);
        delayMs = 150;
      } else if (block.type === 'set-sprite-size') {
        const size = parseFloat(block.paramValue) || 100;
        spriteSizeRef.current = size;
        setSpriteSize(size);
        addConsoleLog(`📏 Set Sprite size to ${size}%`);
        delayMs = 150;
      }

      blockIdx++;
      runCodeTimeoutRef.current = setTimeout(executeStep, delayMs);
    };

    runCodeTimeoutRef.current = setTimeout(executeStep, 100);
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    addConsoleLog("🗑️ Removed block from program stack.");
    speakTextLocal("Removed block.");
  };

  const handleUpdateBlockParam = (blockId: string, paramKey: string, val: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, [paramKey]: val } : b));
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      
      const newBlocks = [...prev];
      const temp = newBlocks[idx];
      newBlocks[idx] = newBlocks[targetIdx];
      newBlocks[targetIdx] = temp;
      
      addConsoleLog(`↕️ Block moved ${direction}.`);
      return newBlocks;
    });
  };

  const runAiAutoRouter = async (customPrompt?: string) => {
    const currentComponents = objects.filter(obj => obj.type === 'component');
    if (currentComponents.length === 0) {
      setValidationError("⚠️ Add some electronic parts to your canvas first, like a battery and an LED!");
      speakTextLocal("Please add some electronic components to the board first, like a battery and an LED!");
      setTimeout(() => setValidationError(null), 5000);
      return;
    }
    setIsRouting(true);
    setAiRoutingMessage(null);
    try {
      const res = await fetch('/api/auto-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components: currentComponents, userPrompt: customPrompt })
      });
      const data = await res.json();
      if (!data.success) {
        setValidationError("⚠️ AI routing failed: " + (data.error || "Please try again."));
        setTimeout(() => setValidationError(null), 5000);
        setIsRouting(false);
        return;
      }
      
      const newWires: CanvasObject[] = [];
      const obstacles = objects.filter(o => o.type === 'component' && o.componentType !== 'wire');
      
      data.connections.forEach((conn: any) => {
        const startComp = objects.find(o => o.id === conn.startBoardId);
        const endComp = objects.find(o => o.id === conn.endBoardId);
        if (!startComp || !endComp) return;
        
        const startCoords = getPinCoordinates(startComp, conn.startPin);
        const endCoords = getPinCoordinates(endComp, conn.endPin);
        if (!startCoords || !endCoords) return;
        
        const wireId = `ai-wire-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const startDir = getPinDirection(conn.startBoardId, conn.startPin);
        const endDir = getPinDirection(conn.endBoardId, conn.endPin);
        
        const waypoints = routeWireManhattan(
          startCoords.x, startCoords.y,
          endCoords.x, endCoords.y,
          startDir, endDir,
          obstacles, conn.startBoardId, conn.endBoardId,
          wireId,
          [...objects.filter(o => o.type === 'circuit-wire'), ...newWires] as any[]
        );
        
        newWires.push({
          id: wireId,
          type: 'circuit-wire',
          x: startCoords.x,
          y: startCoords.y,
          width: 0,
          height: 0,
          x1: startCoords.x,
          y1: startCoords.y,
          x2: endCoords.x,
          y2: endCoords.y,
          waypoints,
          startPin: conn.startPin,
          startBoardId: conn.startBoardId,
          endPin: conn.endPin,
          endBoardId: conn.endBoardId,
          color: conn.color,
          strokeWidth: 4
        });
      });
      
      if (newWires.length > 0) {
        commitObjects(prev => [
          ...prev.filter(obj => obj.type !== 'circuit-wire'), // Replace existing wires
          ...newWires
        ]);
        speakTextLocal(`AI Routing Complete! ${data.explanation}`);
        setAiRoutingMessage(data.explanation);
      } else {
        speakTextLocal("AI found no connections to route. Check if your components have free pins!");
        setAiRoutingMessage("Check if your components have free pins!");
      }
    } catch (err) {
      console.error("Routing error:", err);
      setValidationError("⚠️ Auto-router experienced a network error.");
      setTimeout(() => setValidationError(null), 5000);
    } finally {
      setIsRouting(false);
    }
  };

  const playSimulationSound = (type: 'power-up' | 'power-down' | 'chime') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'power-up') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'power-down') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (err) {
      console.warn("Audio Context blocked or not supported:", err);
    }
  };

  const getPinDirection = (boardId: string | undefined, pinName: string | undefined): 'left' | 'right' | 'top' | 'bottom' | 'auto' => {
    if (!boardId || !pinName) return 'auto';
    const board = objects.find(o => o.id === boardId);
    if (!board) return 'auto';
    if (board.componentType === 'esp32') {
      const leftPins = ['TX', 'RX', '3V3', 'GND_1', '22', '21', '23', '19', '18', '5', '4', '2', '0', 'RST', 'GND_2', 'VIN_5V'];
      if (leftPins.includes(pinName)) return 'left';
      return 'right';
    } else if (board.componentType === 'resistor') {
      return pinName === 'left' ? 'left' : 'right';
    } else if (board.componentType === 'led') {
      return 'bottom';
    } else if (board.componentType === 'battery') {
      return 'top';
    } else if (board.componentType === 'motor' || board.componentType === 'wheel' || board.componentType === 'robot-arm') {
      return 'bottom';
    }
    return 'auto';
  };

  const getPinCoordinates = (board: CanvasObject, pinName: string) => {
    const w = board.width || 80;
    const h = board.height || 200;
    
    if (board.componentType === 'esp32') {
      const leftPins = ['TX', 'RX', '3V3', 'GND_1', '22', '21', '23', '19', '18', '5', '4', '2', '0', 'RST', 'GND_2', 'VIN_5V'];
      const rightPins = ['3V3_2', 'GND_3', '36', '39', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', '15', 'VBAT'];
      
      const leftIdx = leftPins.indexOf(pinName);
      if (leftIdx !== -1) {
        return { x: board.x + w * ((21.4 - 16)/48), y: board.y + h * ((46.15 + leftIdx * 3.175 - 33)/134) };
      }
      const rightIdx = rightPins.indexOf(pinName);
      if (rightIdx !== -1) {
        return { x: board.x + w * ((59.0 - 16)/48), y: board.y + h * ((46.15 + rightIdx * 3.175 - 33)/134) };
      }
    } else if (board.componentType === 'resistor') {
      if (pinName === 'left') {
        return { x: board.x + w * (5 / 200), y: board.y + h / 2 };
      } else if (pinName === 'right') {
        return { x: board.x + w * (195 / 200), y: board.y + h / 2 };
      }
    } else if (board.componentType === 'led') {
      if (pinName === 'anode') {
        return { x: board.x + w * (229.5 / 489), y: board.y + h * (355 / 408) };
      } else if (pinName === 'cathode') {
        return { x: board.x + w * (260.5 / 489), y: board.y + h * (271 / 408) };
      }
    } else if (board.componentType === 'battery') {
      if (pinName === 'vcc') {
        return { x: board.x + w - 10, y: board.y + h / 2 };
      } else if (pinName === 'gnd') {
        return { x: board.x + 10, y: board.y + h / 2 };
      }
    } else if (board.componentType === 'motor' || board.componentType === 'wheel' || board.componentType === 'robot-arm') {
      if (pinName === 'term1') {
        return { x: board.x + w * 0.3, y: board.y + h * 0.9 };
      } else if (pinName === 'term2') {
        return { x: board.x + w * 0.7, y: board.y + h * 0.9 };
      }
    } else if (board.componentType === 'breadboard') {
      const scaleX = w / 300;
      const scaleY = h / 120;
      if (pinName.startsWith('top-vcc-')) {
        const i = parseInt(pinName.replace('top-vcc-', ''), 10);
        return { x: board.x + (20 + i * 9) * scaleX, y: board.y + 12 * scaleY };
      } else if (pinName.startsWith('top-gnd-')) {
        const i = parseInt(pinName.replace('top-gnd-', ''), 10);
        return { x: board.x + (20 + i * 9) * scaleX, y: board.y + 24 * scaleY };
      } else if (pinName.startsWith('bot-vcc-')) {
        const i = parseInt(pinName.replace('bot-vcc-', ''), 10);
        return { x: board.x + (20 + i * 9) * scaleX, y: board.y + 108 * scaleY };
      } else if (pinName.startsWith('bot-gnd-')) {
        const i = parseInt(pinName.replace('bot-gnd-', ''), 10);
        return { x: board.x + (20 + i * 9) * scaleX, y: board.y + 96 * scaleY };
      } else if (pinName.startsWith('t1-')) {
        const parts = pinName.replace('t1-', '').split('-');
        const c = parseInt(parts[0], 10);
        const r = parseInt(parts[1], 10);
        return { x: board.x + (20 + c * 9) * scaleX, y: board.y + (38 + r * 6) * scaleY };
      } else if (pinName.startsWith('t2-')) {
        const parts = pinName.replace('t2-', '').split('-');
        const c = parseInt(parts[0], 10);
        const r = parseInt(parts[1], 10);
        return { x: board.x + (20 + c * 9) * scaleX, y: board.y + (70 + r * 6) * scaleY };
      }
    }
    return null;
  };

  const { poweredIds, isShortCircuit } = useMemo(() => {
    if (!isSimulating) return { poweredIds: new Set<string>(), isShortCircuit: false };

    const batteries = objects.filter(obj => obj.type === 'component' && (obj.componentType === 'battery' || obj.componentType === 'esp32'));
    if (batteries.length === 0) return { poweredIds: new Set<string>(), isShortCircuit: false };

    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // 1. Build Nodes and Internal Nets
    type PinNode = {
      id: string;
      objId: string;
      x: number;
      y: number;
      sourceType?: 'vcc' | 'gnd';
      sinkType?: 'vcc' | 'gnd';
      isConductor?: boolean;
      isExactSnapped?: boolean;
    };
    
    const nodes: PinNode[] = [];
    const nets: Set<string>[] = [];

    const addNet = (nodeIds: string[]) => {
      nets.push(new Set(nodeIds));
    };

    const addNode = (node: PinNode) => {
      nodes.push(node);
      return node.id;
    };

    objects.forEach(obj => {
      const w = obj.width || 100;
      const h = obj.height || 100;
      const isEsp32 = obj.componentType === 'esp32';

      if (obj.type === 'component') {
        if (isEsp32) {
          const leftPins = ['TX', 'RX', '3V3', 'GND_1', '22', '21', '23', '19', '18', '5', '4', '2', '0', 'RST', 'GND_2', 'VIN_5V'];
          const rightPins = ['3V3_2', 'GND_3', '36', '39', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', '15', 'VBAT'];
          
          leftPins.forEach((pin, i) => {
            const cy = 46.15 + i * 3.175;
            const x = obj.x + w * ((21.4 - 16)/48);
            const y = obj.y + h * ((cy - 33)/134);
            let sourceType: 'vcc' | 'gnd' | undefined = undefined;
            if (pin.startsWith('3V3') || pin === 'VIN_5V') sourceType = 'vcc';
            else if (pin.startsWith('GND')) sourceType = 'gnd';
            else if (obj.pinStates && obj.pinStates[pin]) sourceType = 'vcc'; // Parameter to switch on
            
            addNode({ id: `${obj.id}-${pin}`, objId: obj.id, x, y, sourceType, sinkType: sourceType });
          });
          
          rightPins.forEach((pin, i) => {
            const cy = 46.15 + i * 3.175;
            const x = obj.x + w * ((59.0 - 16)/48);
            const y = obj.y + h * ((cy - 33)/134);
            let sourceType: 'vcc' | 'gnd' | undefined = undefined;
            if (pin.startsWith('3V3') || pin === 'VBAT') sourceType = 'vcc';
            else if (pin.startsWith('GND')) sourceType = 'gnd';
            else if (obj.pinStates && obj.pinStates[pin]) sourceType = 'vcc'; // Parameter to switch on
            
            addNode({ id: `${obj.id}-${pin}`, objId: obj.id, x, y, sourceType, sinkType: sourceType });
          });

        } else if (obj.componentType === 'battery') {
          const vccCoords = getPinCoordinates(obj, 'vcc');
          const gndCoords = getPinCoordinates(obj, 'gnd');
          if (vccCoords) addNode({ id: `${obj.id}-vcc`, objId: obj.id, x: vccCoords.x, y: vccCoords.y, sourceType: 'vcc' });
          if (gndCoords) addNode({ id: `${obj.id}-gnd`, objId: obj.id, x: gndCoords.x, y: gndCoords.y, sourceType: 'gnd' });
        } else if (obj.componentType === 'led') {
          const anodeCoords = getPinCoordinates(obj, 'anode');
          const cathodeCoords = getPinCoordinates(obj, 'cathode');
          if (anodeCoords) addNode({ id: `${obj.id}-anode`, objId: obj.id, x: anodeCoords.x, y: anodeCoords.y, sinkType: 'vcc' });
          if (cathodeCoords) addNode({ id: `${obj.id}-cathode`, objId: obj.id, x: cathodeCoords.x, y: cathodeCoords.y, sinkType: 'gnd' });
        } else if (obj.componentType === 'motor' || obj.componentType === 'wheel' || obj.componentType === 'robot-arm') {
          addNode({ id: `${obj.id}-term1`, objId: obj.id, x: obj.x + w * 0.3, y: obj.y + h * 0.9, sinkType: 'vcc' });
          addNode({ id: `${obj.id}-term2`, objId: obj.id, x: obj.x + w * 0.7, y: obj.y + h * 0.9, sinkType: 'gnd' });
        } else if (obj.componentType === 'resistor') {
          const leftCoords = getPinCoordinates(obj, 'left');
          const rightCoords = getPinCoordinates(obj, 'right');
          const n1 = leftCoords ? addNode({ id: `${obj.id}-left`, objId: obj.id, x: leftCoords.x, y: leftCoords.y, isConductor: true }) : null;
          const n2 = rightCoords ? addNode({ id: `${obj.id}-right`, objId: obj.id, x: rightCoords.x, y: rightCoords.y, isConductor: true }) : null;
          if (n1 && n2) addNet([n1, n2]);
        } else if (obj.componentType === 'breadboard') {
          const scaleX = w / 300;
          const scaleY = h / 120;

          const topVccIds = Array.from({ length: 30 }).map((_, i) => addNode({
            id: `${obj.id}-top-vcc-${i}`, objId: obj.id, x: obj.x + (20 + i * 9) * scaleX, y: obj.y + 12 * scaleY, isConductor: true
          }));
          addNet(topVccIds);

          const topGndIds = Array.from({ length: 30 }).map((_, i) => addNode({
            id: `${obj.id}-top-gnd-${i}`, objId: obj.id, x: obj.x + (20 + i * 9) * scaleX, y: obj.y + 24 * scaleY, isConductor: true
          }));
          addNet(topGndIds);

          const botVccIds = Array.from({ length: 30 }).map((_, i) => addNode({
            id: `${obj.id}-bot-vcc-${i}`, objId: obj.id, x: obj.x + (20 + i * 9) * scaleX, y: obj.y + 108 * scaleY, isConductor: true
          }));
          addNet(botVccIds);

          const botGndIds = Array.from({ length: 30 }).map((_, i) => addNode({
            id: `${obj.id}-bot-gnd-${i}`, objId: obj.id, x: obj.x + (20 + i * 9) * scaleX, y: obj.y + 96 * scaleY, isConductor: true
          }));
          addNet(botGndIds);

          Array.from({ length: 30 }).forEach((_, c) => {
            const stripIds = Array.from({ length: 5 }).map((_, r) => addNode({
              id: `${obj.id}-t1-${c}-${r}`, objId: obj.id, x: obj.x + (20 + c * 9) * scaleX, y: obj.y + (38 + r * 6) * scaleY, isConductor: true
            }));
            addNet(stripIds);
          });

          Array.from({ length: 30 }).forEach((_, c) => {
            const stripIds = Array.from({ length: 5 }).map((_, r) => addNode({
              id: `${obj.id}-t2-${c}-${r}`, objId: obj.id, x: obj.x + (20 + c * 9) * scaleX, y: obj.y + (70 + r * 6) * scaleY, isConductor: true
            }));
            addNet(stripIds);
          });
        }
      } else if (obj.type === 'circuit-wire') {
        let p1x = obj.x1 ?? obj.x; let p1y = obj.y1 ?? obj.y;
        let p2x = obj.x2 ?? obj.x; let p2y = obj.y2 ?? obj.y;
        let p1Snapped = false;
        let p2Snapped = false;
        
        if (obj.startPin && obj.startBoardId) {
           const b = objects.find(o => o.id === obj.startBoardId);
           if (b) { const coords = getPinCoordinates(b, obj.startPin); if (coords) { p1x = coords.x; p1y = coords.y; p1Snapped = true; } }
        }
        if (obj.endPin && obj.endBoardId) {
           const b = objects.find(o => o.id === obj.endBoardId);
           if (b) { const coords = getPinCoordinates(b, obj.endPin); if (coords) { p2x = coords.x; p2y = coords.y; p2Snapped = true; } }
        }
        
        const p1Id = addNode({ id: `${obj.id}-p1`, objId: obj.id, x: p1x, y: p1y, isConductor: true, isExactSnapped: p1Snapped });
        const p2Id = addNode({ id: `${obj.id}-p2`, objId: obj.id, x: p2x, y: p2y, isConductor: true, isExactSnapped: p2Snapped });
        addNet([p1Id, p2Id]);
      } else if (obj.type === 'draw' && obj.points && obj.points.length > 0) {
        const ptsIds = obj.points.map((p, i) => addNode({ id: `${obj.id}-pt${i}`, objId: obj.id, x: p.x, y: p.y, isConductor: true }));
        addNet(ptsIds);
      } else {
        const cx = obj.x + w / 2;
        const cy = obj.y + h / 2;
        const s1 = addNode({ id: `${obj.id}-c`, objId: obj.id, x: cx, y: cy, isConductor: true });
        addNet([s1]);
      }
    });

    const parent = new Map<string, string>();
    nodes.forEach(n => parent.set(n.id, n.id));

    const find = (i: string): string => {
      if (parent.get(i) === i) return i;
      const p = find(parent.get(i)!);
      parent.set(i, p);
      return p;
    };

    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent.set(rootI, rootJ);
      }
    };

    nets.forEach(net => {
      const arr = Array.from(net);
      for (let i = 1; i < arr.length; i++) {
        union(arr[0], arr[i]);
      }
    });

    // Exact pin snapping for wires to board pins
    objects.forEach(obj => {
      if (obj.type === 'circuit-wire') {
        if (obj.startBoardId && obj.startPin) {
          if (parent.has(`${obj.id}-p1`) && parent.has(`${obj.startBoardId}-${obj.startPin}`)) {
            union(`${obj.id}-p1`, `${obj.startBoardId}-${obj.startPin}`);
          }
        }
        if (obj.endBoardId && obj.endPin) {
          if (parent.has(`${obj.id}-p2`) && parent.has(`${obj.endBoardId}-${obj.endPin}`)) {
            union(`${obj.id}-p2`, `${obj.endBoardId}-${obj.endPin}`);
          }
        }
      }
    });

    // Spatial merge with symmetric closest-pair logic to prevent short circuits
    const THRESHOLD = 16;
    
    const getClosestNode = (n1: typeof nodes[0], targetObjId: string) => {
      let closest: typeof nodes[0] | null = null;
      let minDst = Infinity;
      nodes.forEach(n2 => {
        if (n2.objId === targetObjId) {
          const d = getDistance(n1, n2);
          if (d < minDst) {
            minDst = d;
            closest = n2;
          }
        }
      });
      return closest;
    };

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        if (n1.isExactSnapped || n2.isExactSnapped) continue;
        
        if (n1.objId !== n2.objId && find(n1.id) !== find(n2.id)) {
          const d = getDistance(n1, n2);
          if (d < THRESHOLD) {
            const closestToN1 = getClosestNode(n1, n2.objId);
            const closestToN2 = getClosestNode(n2, n1.objId);
            
            if (closestToN1?.id === n2.id && closestToN2?.id === n1.id) {
              union(n1.id, n2.id);
            }
          }
        }
      }
    }

    const netTypes = new Map<string, { hasVcc: boolean, hasGnd: boolean }>();
    
    nodes.forEach(n => {
      const root = find(n.id);
      if (!netTypes.has(root)) {
        netTypes.set(root, { hasVcc: false, hasGnd: false });
      }
      const type = netTypes.get(root)!;
      if (n.sourceType === 'vcc') type.hasVcc = true;
      if (n.sourceType === 'gnd') type.hasGnd = true;
    });

    let isShortCircuit = false;
    for (const type of Array.from(netTypes.values())) {
      if (type.hasVcc && type.hasGnd) {
        isShortCircuit = true;
      }
    }

    const powered = new Set<string>();
    
    if (!isShortCircuit) {
      objects.forEach(obj => {
        if (obj.componentType === 'battery' || obj.componentType === 'esp32') {
          powered.add(obj.id);
        }
      });

      objects.forEach(obj => {
        const objNodes = nodes.filter(n => n.objId === obj.id);
        
        let hasVccPower = false;
        let hasGndPower = false;

        objNodes.forEach(n => {
          if (n.sinkType === 'vcc') {
            if (netTypes.get(find(n.id))?.hasVcc) hasVccPower = true;
          }
          if (n.sinkType === 'gnd') {
            if (netTypes.get(find(n.id))?.hasGnd) hasGndPower = true;
          }
        });

        if (hasVccPower && hasGndPower) {
          powered.add(obj.id);
        }
        
        if (obj.type === 'circuit-wire') {
          const isWirePowered = objNodes.some(n => {
            const t = netTypes.get(find(n.id));
            return t?.hasVcc || t?.hasGnd;
          });
          if (isWirePowered) {
            powered.add(obj.id);
          }
        }
      });
    }

    return { poweredIds: powered, isShortCircuit };
  }, [objects, isSimulating]);

  const poweredComponentsCount = useMemo(() => {
    return Array.from(poweredIds).filter(id => {
      const o = objects.find(obj => obj.id === id);
      return o && o.type === 'component' && o.componentType !== 'battery';
    }).length;
  }, [poweredIds, objects]);

  const prevPoweredCountRef = useRef(0);

  useEffect(() => {
    if (isSimulating && poweredComponentsCount > prevPoweredCountRef.current && poweredComponentsCount > 0) {
      speakTextLocal(`Fantastic! Sipho's circuit is active and flowing! ${poweredComponentsCount} electrical component${poweredComponentsCount > 1 ? 's are' : ' is'} fully powered!`);
      playSimulationSound('chime');
    }
    prevPoweredCountRef.current = poweredComponentsCount;
  }, [poweredComponentsCount, isSimulating]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [originalObjects, setOriginalObjects] = useState<CanvasObject[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard events for deleting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        commitObjects(prev => {
          const remaining = prev.filter(obj => !selectedIds.includes(obj.id));
          return remaining.filter(obj => {
            if (obj.type === 'circuit-wire' || (obj.type === 'component' && obj.componentType === 'wire')) {
              const hasStart = obj.startBoardId && remaining.some(b => b.id === obj.startBoardId);
              const hasEnd = obj.endBoardId && remaining.some(b => b.id === obj.endBoardId);
              return hasStart && hasEnd;
            }
            return true;
          });
        });
        setSelectedIds([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  useEffect(() => {
    if (actionState === 'idle') {
      pushCurrentStateToHistory();
    }
  }, [actionState]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) {
      setValidationError("🔒 This design is certified and locked by the AI Tutor!");
      return;
    }
    setHasDragged(false);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'select' || activeTool === 'fill') {
      // If we clicked on empty space without hitting an object or handle
      if (activeTool === 'select') {
        setSelectedIds([]);
        setActionState('selecting');
        setMarqueeStart({ x, y });
        setSelectionBox({ x, y, width: 0, height: 0 });
      }
      return;
    }

    if (activeTool === 'draw' || activeTool === 'eraser') {
      setActionState('drawing');
      const newPath: CanvasObject = {
        id: Date.now().toString(),
        type: 'draw',
        x: 0, y: 0, width: 0, height: 0,
        points: [{ x, y }],
        color: activeTool === 'eraser' ? '#ffffff' : currentColor,
        strokeWidth: activeTool === 'eraser' ? currentStrokeWidth * 4 : currentStrokeWidth,
      };
      setObjects([...objects, newPath]);
      if (activeTool !== 'eraser') setSelectedIds([newPath.id]);
    } else if (['line', 'rectangle', 'circle', 'triangle', 'oval', 'curly', 'circuit-wire'].includes(activeTool)) {
      setActionState('drawing');
      const newShape: CanvasObject = {
        id: Date.now().toString(),
        type: activeTool,
        x, y, 
        width: 0, height: 0,
        x1: x, y1: y, x2: x, y2: y,
        color: currentColor,
        strokeWidth: activeTool === 'circuit-wire' ? 4 : currentStrokeWidth,
      };
      setObjects([...objects, newShape]);
      setSelectedIds([newShape.id]);
    } else if (activeTool === 'text') {
      setInlineTextPos({ x, y });
      setInlineTextVal('');
    } else if (activeTool === 'component' && activeComponent) {
      let width = 50;
      let height = 50;
      
      if (activeComponent === 'esp32') {
        width = 96;
        height = 268;
      } else if (activeComponent === 'breadboard') {
        width = 240;
        height = 96;
      } else if (activeComponent === 'resistor') {
        width = 100;
        height = 30;
      } else if (activeComponent === 'battery') {
        width = 100;
        height = 60;
      } else if (activeComponent === 'led') {
        width = 150;
        height = 125;
      } else if (activeComponent === 'motor' || activeComponent === 'wheel') {
        width = 80;
        height = 80;
      } else if (activeComponent === 'robot-arm') {
        width = 100;
        height = 100;
      }

      const newComp: CanvasObject = {
        id: Date.now().toString(),
        type: 'component',
        componentType: activeComponent,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        color: currentColor,
        strokeWidth: 2,
      };
      commitObjects(prev => [...prev, newComp]);
      setSelectedIds([newComp.id]);
      setActiveTool('select');
      setActiveComponent(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Apply grid snapping (10px grid)
    const SNAP_GRID = 10;
    const isSnapping = !e.altKey; // Hold Alt to disable snapping
    
    if (isSnapping) {
      x = Math.round(x / SNAP_GRID) * SNAP_GRID;
      y = Math.round(y / SNAP_GRID) * SNAP_GRID;
    }

    if (actionState === 'selecting' && marqueeStart) {
      setHasDragged(true);
      const rx = Math.min(marqueeStart.x, e.clientX - rect.left);
      const ry = Math.min(marqueeStart.y, e.clientY - rect.top);
      const rw = Math.abs(e.clientX - rect.left - marqueeStart.x);
      const rh = Math.abs(e.clientY - rect.top - marqueeStart.y);
      setSelectionBox({ x: rx, y: ry, width: rw, height: rh });
      
      const newSelectedIds = objects.filter(obj => {
        const objRight = (obj.x1 ?? obj.x) + (obj.width ?? 0);
        const objBottom = (obj.y1 ?? obj.y) + (obj.height ?? 0);
        const objX = Math.min(obj.x1 ?? obj.x, obj.x2 ?? obj.x);
        const objY = Math.min(obj.y1 ?? obj.y, obj.y2 ?? obj.y);
        const finalRight = Math.max(objRight, obj.x2 ?? obj.x);
        const finalBottom = Math.max(objBottom, obj.y2 ?? obj.y);
        
        return objX < rx + rw && finalRight > rx && objY < ry + rh && finalBottom > ry;
      }).map(o => o.id);
      
      setSelectedIds(newSelectedIds);
      return;
    }

    if (actionState === 'drawing') {
      setHasDragged(true);
      setObjects(prev => {
        const newObjects = [...prev];
        const currentObj = newObjects[newObjects.length - 1];
        if (!currentObj) return newObjects;

        if (currentObj.type === 'draw' && currentObj.points) {
          currentObj.points.push({ x, y });
        } else if (currentObj.type === 'line' || currentObj.type === 'curly' || currentObj.type === 'circuit-wire') {
          currentObj.x2 = x;
          currentObj.y2 = y;
          if (currentObj.type === 'circuit-wire') {
             const obstacles = prev.filter(o => o.type === 'component' && o.componentType !== 'wire');
             const startDir = getPinDirection(currentObj.startBoardId, currentObj.startPin);
             const endDir = getPinDirection(currentObj.endBoardId, currentObj.endPin);
             currentObj.waypoints = routeWireManhattan(
                currentObj.x1 ?? 0, currentObj.y1 ?? 0,
                currentObj.x2 ?? 0, currentObj.y2 ?? 0,
                startDir, endDir,
                obstacles, currentObj.startBoardId, currentObj.endBoardId,
                currentObj.id,
                prev.filter(o => o.type === 'circuit-wire') as any[]
             );
          }
        } else if (['rectangle', 'circle', 'triangle', 'oval'].includes(currentObj.type)) {
          // Allow drawing backwards
          const startX = currentObj.x1 ?? currentObj.x;
          const startY = currentObj.y1 ?? currentObj.y;
          currentObj.x = Math.min(startX, x);
          currentObj.y = Math.min(startY, y);
          currentObj.width = Math.abs(x - startX);
          currentObj.height = Math.abs(y - startY);
        }
        return newObjects;
      });
    } else if (actionState === 'moving' && selectedIds.length > 0 && dragStart && originalObjects.length > 0) {
      setHasDragged(true);
      // Calculate delta based on the snapped or unsnapped current position vs the original pointer start
      let dx = x - dragStart.x;
      let dy = y - dragStart.y;
      
      setObjects(prev => {
        let newObjects = prev.map(obj => {
          if (selectedIds.includes(obj.id)) {
            const originalObject = originalObjects.find(o => o.id === obj.id);
            if (!originalObject) return obj;
            if (obj.type === 'draw' && obj.points && originalObject.points) {
              return {
                ...obj,
                points: originalObject.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
              };
            } else if (obj.type === 'circuit-wire') {
              if (obj.startBoardId && obj.endBoardId) {
                const originalWaypoints = originalObject.waypoints || [];
                const shiftedWaypoints = originalWaypoints.map((p, idx) => {
                  if (idx === 0 || idx === originalWaypoints.length - 1) return p;
                  return { x: p.x + dx, y: p.y + dy };
                });
                return {
                  ...obj,
                  waypoints: shiftedWaypoints,
                };
              } else {
                return {
                  ...obj,
                  x1: (originalObject.x1 ?? 0) + dx,
                  y1: (originalObject.y1 ?? 0) + dy,
                  x2: (originalObject.x2 ?? 0) + dx,
                  y2: (originalObject.y2 ?? 0) + dy,
                };
              }
            } else if (obj.type === 'line' || obj.type === 'curly') {
              return {
                ...obj,
                x1: (originalObject.x1 ?? 0) + dx,
                y1: (originalObject.y1 ?? 0) + dy,
                x2: (originalObject.x2 ?? 0) + dx,
                y2: (originalObject.y2 ?? 0) + dy,
              };
            } else {
              let newX = originalObject.x + dx;
              let newY = originalObject.y + dy;
              if (isSnapping) {
                newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
                newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;
              }
              return {
                ...obj,
                x: newX,
                y: newY,
              };
            }
          }
          
          // If moving a component, update attached wires
          if (obj.type === 'circuit-wire') {
            let modified = false;
            const newObj = { ...obj };
            
            if (obj.startBoardId && selectedIds.includes(obj.startBoardId) && obj.startPin) {
              const movingBoard = originalObjects.find(o => o.id === obj.startBoardId);
              if (movingBoard) {
                const coords = getPinCoordinates({ ...movingBoard, x: movingBoard.x + dx, y: movingBoard.y + dy }, obj.startPin);
                if (coords) {
                  newObj.x1 = coords.x;
                  newObj.y1 = coords.y;
                  modified = true;
                }
              }
            }
            if (obj.endBoardId && selectedIds.includes(obj.endBoardId) && obj.endPin) {
              const movingBoard = originalObjects.find(o => o.id === obj.endBoardId);
              if (movingBoard) {
                const coords = getPinCoordinates({ ...movingBoard, x: movingBoard.x + dx, y: movingBoard.y + dy }, obj.endPin);
                if (coords) {
                  newObj.x2 = coords.x;
                  newObj.y2 = coords.y;
                  modified = true;
                }
              }
            }
            if (modified) return newObj;
          }
          return obj;
        });
        
        // Recalculate routes for circuit-wire
        if (originalObjects.some(o => o.type === 'component')) {
           const obstacles = newObjects.filter(o => o.type === 'component' && o.componentType !== 'wire');
           
           const wiresToRoute = [...newObjects.filter(o => o.type === 'circuit-wire')]
             .sort((a, b) => (a.x1 ?? 0) - (b.x1 ?? 0) || (a.y1 ?? 0) - (b.y1 ?? 0));
             
           const routedWiresAcc: any[] = [];
           const routedWiresMap = new Map<string, any>();
           
           for (const wire of wiresToRoute) {
               const startDir = getPinDirection(wire.startBoardId, wire.startPin);
               const endDir = getPinDirection(wire.endBoardId, wire.endPin);
               
               const routedWire = {
                 ...wire,
                 waypoints: routeWireManhattan(
                    wire.x1 ?? 0, wire.y1 ?? 0,
                    wire.x2 ?? 0, wire.y2 ?? 0,
                    startDir, endDir,
                    obstacles, wire.startBoardId, wire.endBoardId,
                    wire.id,
                    routedWiresAcc
                 )
               };
               routedWiresAcc.push(routedWire);
               routedWiresMap.set(wire.id, routedWire);
           }
           
           newObjects = newObjects.map(obj => 
             obj.type === 'circuit-wire' ? routedWiresMap.get(obj.id) : obj
           );
        }

        return newObjects;
      });
    } else if (actionState === 'resizing' && selectedIds.length === 1 && resizeHandle && originalObjects.length === 1) {
      setHasDragged(true);
      const originalObject = originalObjects[0];
      setObjects(prev => {
        let newObjects = prev.map(obj => {
          if (obj.id !== selectedIds[0]) return obj;
          
          const newObj = { ...obj };
          if (obj.type === 'line' || obj.type === 'curly' || obj.type === 'circuit-wire') {
            if (resizeHandle === 'start') {
              newObj.x1 = x;
              newObj.y1 = y;
            } else if (resizeHandle === 'end') {
              newObj.x2 = x;
              newObj.y2 = y;
            }
          } else {
            // Rectangle, Circle, Triangle, Component
            // Resize handles: tl, tr, bl, br
            const right = originalObject.x + originalObject.width;
            const bottom = originalObject.y + originalObject.height;
            
            if (resizeHandle === 'br') {
              newObj.width = Math.max(10, x - newObj.x);
              newObj.height = Math.max(10, y - newObj.y);
            } else if (resizeHandle === 'tl') {
              newObj.x = Math.min(x, right - 10);
              newObj.y = Math.min(y, bottom - 10);
              newObj.width = right - newObj.x;
              newObj.height = bottom - newObj.y;
            } else if (resizeHandle === 'tr') {
              newObj.y = Math.min(y, bottom - 10);
              newObj.width = Math.max(10, x - newObj.x);
              newObj.height = bottom - newObj.y;
            } else if (resizeHandle === 'bl') {
              newObj.x = Math.min(x, right - 10);
              newObj.width = right - newObj.x;
              newObj.height = Math.max(10, y - newObj.y);
            }
          }
          return newObj;
        });

        if (originalObject.type === 'circuit-wire') {
           const obstacles = newObjects.filter(o => o.type === 'component' && o.componentType !== 'wire');
           
           const routedWiresAcc = newObjects.filter(o => o.type === 'circuit-wire' && !selectedIds.includes(o.id));
           const wiresToRoute = [...newObjects.filter(o => o.type === 'circuit-wire' && selectedIds.includes(o.id))]
             .sort((a, b) => (a.x1 ?? 0) - (b.x1 ?? 0) || (a.y1 ?? 0) - (b.y1 ?? 0));
             
           const routedWiresMap = new Map<string, any>();
           
           for (const wire of wiresToRoute) {
               const startDir = getPinDirection(wire.startBoardId, wire.startPin); 
               const endDir = getPinDirection(wire.endBoardId, wire.endPin);
               const routedWire = {
                 ...wire,
                 waypoints: routeWireManhattan(
                    wire.x1 ?? 0, wire.y1 ?? 0,
                    wire.x2 ?? 0, wire.y2 ?? 0,
                    startDir, endDir,
                    obstacles, wire.startBoardId, wire.endBoardId,
                    wire.id,
                    routedWiresAcc
                 )
               };
               routedWiresAcc.push(routedWire);
               routedWiresMap.set(wire.id, routedWire);
           }
           
           newObjects = newObjects.map(obj => 
              routedWiresMap.has(obj.id) ? routedWiresMap.get(obj.id) : obj
           );
        }
        
        return newObjects;
      });
    }
  };

  const autoSnapPin = (wireId: string, endpoint: 'start' | 'end', board: CanvasObject, pin: string) => {
    commitObjects(prev => {
      let newObjects = prev.map(obj => {
        if (obj.id === wireId) {
          const newObj = { ...obj };
          if (endpoint === 'start') {
            newObj.startPin = pin;
            newObj.startBoardId = board.id;
            const coords = getPinCoordinates(board, pin);
            if (coords) {
              newObj.x1 = coords.x;
              newObj.y1 = coords.y;
            }
          } else {
            newObj.endPin = pin;
            newObj.endBoardId = board.id;
            const coords = getPinCoordinates(board, pin);
            if (coords) {
              newObj.x2 = coords.x;
              newObj.y2 = coords.y;
            }
          }
          return newObj;
        }
        return obj;
      });
      
      const wire = newObjects.find(o => o.id === wireId);
      if (wire && wire.type === 'circuit-wire') {
        const obstacles = newObjects.filter(o => o.type === 'component' && o.componentType !== 'wire');
        newObjects = newObjects.map(obj => {
          if (obj.id === wireId) {
             const startDir = getPinDirection(obj.startBoardId, obj.startPin); 
             const endDir = getPinDirection(obj.endBoardId, obj.endPin);
             return {
               ...obj,
               waypoints: routeWireManhattan(
                  obj.x1 ?? 0, obj.y1 ?? 0,
                  obj.x2 ?? 0, obj.y2 ?? 0,
                  startDir, endDir,
                  obstacles, obj.startBoardId, obj.endBoardId,
                  obj.id,
                  prev.filter(o => o.type === 'circuit-wire') as any[]
               )
             };
          }
          return obj;
        });
      }
      return newObjects;
    });
  };

  const handlePointerUp = () => {
    if ((actionState === 'moving' || actionState === 'resizing') && pendingIsolateId && !hasDragged) {
      setSelectedIds([pendingIsolateId]);
    }
    setPendingIsolateId(null);
    
    let wireToCheck: CanvasObject | null = null;
    
    if (actionState === 'drawing') {
      wireToCheck = objects[objects.length - 1];
    } else if ((actionState === 'moving' || actionState === 'resizing') && selectedIds.length > 0) {
      wireToCheck = objects.find(o => o.id === selectedIds[0]) || null; // just checks first selected wire for board pinning
    }

    if (wireToCheck && (wireToCheck.type === 'circuit-wire' || (wireToCheck.type === 'component' && wireToCheck.componentType === 'wire'))) {
      if (wireToCheck.startBoardId && wireToCheck.endBoardId) {
        // Already connected! Keep it connected. Ensure endpoint positions are exactly pinned to parent components.
        const startBoard = objects.find(o => o.id === wireToCheck?.startBoardId);
        const endBoard = objects.find(o => o.id === wireToCheck?.endBoardId);
        if (startBoard && endBoard) {
          const startCoords = getPinCoordinates(startBoard, wireToCheck.startPin || '');
          const endCoords = getPinCoordinates(endBoard, wireToCheck.endPin || '');
          if (startCoords && endCoords) {
            setObjects(prev => prev.map(o => o.id === wireToCheck?.id ? {
              ...o,
              x1: startCoords.x,
              y1: startCoords.y,
              x2: endCoords.x,
              y2: endCoords.y,
              waypoints: o.waypoints && o.waypoints.length > 0 ? [
                { x: startCoords.x, y: startCoords.y },
                ...o.waypoints.slice(1, -1),
                { x: endCoords.x, y: endCoords.y }
              ] : undefined
            } : o));
          }
        }
        setActionState('idle');
        setDragStart(null);
        setOriginalObjects([]);
        setResizeHandle(null);
        setSelectionBox(null);
        setMarqueeStart(null);
        return;
      }

      const boards = objects.filter(o => o.type === 'component' && (o.componentType === 'esp32' || o.componentType === 'resistor' || o.componentType === 'led' || o.componentType === 'battery' || o.componentType === 'motor' || o.componentType === 'wheel' || o.componentType === 'robot-arm' || o.componentType === 'breadboard'));
      let foundEndBoard = false;
      let foundStartBoard = false;
      
      const endX = wireToCheck.x2 ?? wireToCheck.x;
      const endY = wireToCheck.y2 ?? wireToCheck.y;
      
      const newQueue = [...pinSelectorQueue];

      const findClosestBreadboardPin = (board: CanvasObject, px: number, py: number) => {
        const w = board.width || 240;
        const h = board.height || 96;
        const scaleX = w / 300;
        const scaleY = h / 120;
        
        let closestPin = '';
        let minDist = Infinity;
        const SNAP_RADIUS = 20;

        const checkPin = (name: string, pinX: number, pinY: number) => {
          const dist = Math.hypot(px - pinX, py - pinY);
          if (dist < minDist && dist < SNAP_RADIUS) {
            minDist = dist;
            closestPin = name;
          }
        };

        // Check top rails
        for (let i = 0; i < 30; i++) {
          checkPin(`top-vcc-${i}`, board.x + (20 + i * 9) * scaleX, board.y + 12 * scaleY);
          checkPin(`top-gnd-${i}`, board.x + (20 + i * 9) * scaleX, board.y + 24 * scaleY);
        }

        // Check bottom rails
        for (let i = 0; i < 30; i++) {
          checkPin(`bot-vcc-${i}`, board.x + (20 + i * 9) * scaleX, board.y + 108 * scaleY);
          checkPin(`bot-gnd-${i}`, board.x + (20 + i * 9) * scaleX, board.y + 96 * scaleY);
        }

        // Check main terminal strips
        for (let c = 0; c < 30; c++) {
          for (let r = 0; r < 5; r++) {
            checkPin(`t1-${c}-${r}`, board.x + (20 + c * 9) * scaleX, board.y + (38 + r * 6) * scaleY);
            checkPin(`t2-${c}-${r}`, board.x + (20 + c * 9) * scaleX, board.y + (70 + r * 6) * scaleY);
          }
        }

        return closestPin || null;
      };
      
      for (const board of boards) {
        if (board.componentType === 'esp32') {
          const bx = board.x;
          const by = board.y;
          const bw = board.width || 80;
          const bh = board.height || 200;
          
          if (!foundEndBoard && endX >= bx && endX <= bx + bw && endY >= by && endY <= by + bh) {
            newQueue.push({
              objectId: wireToCheck.id,
              endpoint: 'end',
              boardId: board.id,
              x: endX,
              y: endY
            });
            foundEndBoard = true;
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;

          if (!foundStartBoard && startX >= bx && startX <= bx + bw && startY >= by && startY <= by + bh) {
            newQueue.push({
              objectId: wireToCheck.id,
              endpoint: 'start',
              boardId: board.id,
              x: startX,
              y: startY
            });
            foundStartBoard = true;
          }
        } else if (board.componentType === 'breadboard') {
          const closestEndPin = findClosestBreadboardPin(board, endX, endY);
          if (!foundEndBoard && closestEndPin) {
            autoSnapPin(wireToCheck.id, 'end', board, closestEndPin);
            foundEndBoard = true;
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;
          const closestStartPin = findClosestBreadboardPin(board, startX, startY);
          if (!foundStartBoard && closestStartPin) {
            autoSnapPin(wireToCheck.id, 'start', board, closestStartPin);
            foundStartBoard = true;
          }
        } else if (board.componentType === 'resistor') {
          const leftCoords = getPinCoordinates(board, 'left');
          const rightCoords = getPinCoordinates(board, 'right');
          const SNAP_RADIUS = 50;

          if (!foundEndBoard && leftCoords && rightCoords) {
            const distLeft = Math.hypot(endX - leftCoords.x, endY - leftCoords.y);
            const distRight = Math.hypot(endX - rightCoords.x, endY - rightCoords.y);
            const minSpace = Math.min(distLeft, distRight);
            if (minSpace < SNAP_RADIUS) {
              if (distLeft <= distRight) {
                autoSnapPin(wireToCheck.id, 'end', board, 'left');
              } else {
                autoSnapPin(wireToCheck.id, 'end', board, 'right');
              }
              foundEndBoard = true;
            }
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;

          if (!foundStartBoard && leftCoords && rightCoords) {
            const distLeft = Math.hypot(startX - leftCoords.x, startY - leftCoords.y);
            const distRight = Math.hypot(startX - rightCoords.x, startY - rightCoords.y);
            const minSpace = Math.min(distLeft, distRight);
            if (minSpace < SNAP_RADIUS) {
              if (distLeft <= distRight) {
                autoSnapPin(wireToCheck.id, 'start', board, 'left');
              } else {
                autoSnapPin(wireToCheck.id, 'start', board, 'right');
              }
              foundStartBoard = true;
            }
          }
        } else if (board.componentType === 'led') {
          const anodeCoords = getPinCoordinates(board, 'anode');
          const cathodeCoords = getPinCoordinates(board, 'cathode');
          const SNAP_RADIUS = 50;

          if (!foundEndBoard && anodeCoords && cathodeCoords) {
            const distAnode = Math.hypot(endX - anodeCoords.x, endY - anodeCoords.y);
            const distCathode = Math.hypot(endX - cathodeCoords.x, endY - cathodeCoords.y);
            const minSpace = Math.min(distAnode, distCathode);
            if (minSpace < SNAP_RADIUS) {
              if (distAnode <= distCathode) {
                autoSnapPin(wireToCheck.id, 'end', board, 'anode');
              } else {
                autoSnapPin(wireToCheck.id, 'end', board, 'cathode');
              }
              foundEndBoard = true;
            }
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;

          if (!foundStartBoard && anodeCoords && cathodeCoords) {
            const distAnode = Math.hypot(startX - anodeCoords.x, startY - anodeCoords.y);
            const distCathode = Math.hypot(startX - cathodeCoords.x, startY - cathodeCoords.y);
            const minSpace = Math.min(distAnode, distCathode);
            if (minSpace < SNAP_RADIUS) {
              if (distAnode <= distCathode) {
                autoSnapPin(wireToCheck.id, 'start', board, 'anode');
              } else {
                autoSnapPin(wireToCheck.id, 'start', board, 'cathode');
              }
              foundStartBoard = true;
            }
          }
        } else if (board.componentType === 'battery') {
          const vccCoords = getPinCoordinates(board, 'vcc');
          const gndCoords = getPinCoordinates(board, 'gnd');
          const SNAP_RADIUS = 20;

          if (!foundEndBoard && vccCoords && Math.hypot(endX - vccCoords.x, endY - vccCoords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'end', board, 'vcc');
            foundEndBoard = true;
          } else if (!foundEndBoard && gndCoords && Math.hypot(endX - gndCoords.x, endY - gndCoords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'end', board, 'gnd');
            foundEndBoard = true;
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;

          if (!foundStartBoard && vccCoords && Math.hypot(startX - vccCoords.x, startY - vccCoords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'start', board, 'vcc');
            foundStartBoard = true;
          } else if (!foundStartBoard && gndCoords && Math.hypot(startX - gndCoords.x, startY - gndCoords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'start', board, 'gnd');
            foundStartBoard = true;
          }
        } else if (board.componentType === 'motor' || board.componentType === 'wheel' || board.componentType === 'robot-arm') {
          const term1Coords = getPinCoordinates(board, 'term1');
          const term2Coords = getPinCoordinates(board, 'term2');
          const SNAP_RADIUS = 20;

          if (!foundEndBoard && term1Coords && Math.hypot(endX - term1Coords.x, endY - term1Coords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'end', board, 'term1');
            foundEndBoard = true;
          } else if (!foundEndBoard && term2Coords && Math.hypot(endX - term2Coords.x, endY - term2Coords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'end', board, 'term2');
            foundEndBoard = true;
          }

          const startX = wireToCheck.x1 ?? wireToCheck.x;
          const startY = wireToCheck.y1 ?? wireToCheck.y;

          if (!foundStartBoard && term1Coords && Math.hypot(startX - term1Coords.x, startY - term1Coords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'start', board, 'term1');
            foundStartBoard = true;
          } else if (!foundStartBoard && term2Coords && Math.hypot(startX - term2Coords.x, startY - term2Coords.y) < SNAP_RADIUS) {
            autoSnapPin(wireToCheck.id, 'start', board, 'term2');
            foundStartBoard = true;
          }
        }
      }
      
      const startX = wireToCheck.x1 ?? wireToCheck.x;
      const startY = wireToCheck.y1 ?? wireToCheck.y;
      const dist = Math.hypot(endX - startX, endY - startY);

      if (dist < 15 && (!foundStartBoard && !foundEndBoard)) {
        // Delete the wire because it's just a tiny click and not connected to anything
        setObjects(prev => prev.filter(o => o.id !== wireToCheck?.id));
        setSelectedIds([]);
        // Clean up any pending pin selection for this deleted wire
        setPinSelectorQueue(prev => prev.filter(item => item.objectId !== wireToCheck?.id));
      } else {
        if (newQueue.length > pinSelectorQueue.length) {
          setPinSelectorQueue(newQueue);
        }
      }
    }

    setActionState('idle');
    setDragStart(null);
    setOriginalObjects([]);
    setResizeHandle(null);
    setSelectionBox(null);
    setMarqueeStart(null);
  };

  const startObjectMove = (e: React.PointerEvent, obj: CanvasObject) => {
    if (activeTool !== 'select' && activeTool !== 'fill') return;
    
    e.stopPropagation();
    setHasDragged(false);
    
    if (activeTool === 'fill') {
      if (['rectangle', 'circle', 'triangle', 'oval'].includes(obj.type)) {
        commitObjects(prev => prev.map(o => o.id === obj.id ? { ...o, fillColor: currentColor } : o));
      }
      return;
    }
    
    let currentSelectedIds = selectedIds;
    if (e.shiftKey) {
      currentSelectedIds = selectedIds.includes(obj.id) ? selectedIds.filter(id => id !== obj.id) : [...selectedIds, obj.id];
      setSelectedIds(currentSelectedIds);
    } else {
      if (!selectedIds.includes(obj.id)) {
        currentSelectedIds = [obj.id];
        setSelectedIds(currentSelectedIds);
      } else {
        setPendingIsolateId(obj.id);
      }
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setOriginalObjects(objects.filter(o => currentSelectedIds.includes(o.id)));
      setActionState('moving');
    }
  };

  const startObjectResize = (e: React.PointerEvent, obj: CanvasObject, handle: string) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setHasDragged(false);
    setSelectedIds([obj.id]);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeHandle(handle);
      setOriginalObjects([obj]);
      setActionState('resizing');

      // Clear the pin information for the end being dragged so it can be re-snapped!
      if (obj.type === 'circuit-wire') {
        setObjects(prev => prev.map(o => o.id === obj.id ? {
          ...o,
          startBoardId: handle === 'start' ? undefined : o.startBoardId,
          startPin: handle === 'start' ? undefined : o.startPin,
          endBoardId: handle === 'end' ? undefined : o.endBoardId,
          endPin: handle === 'end' ? undefined : o.endPin,
        } : o));
      }
    }
  };

  const deleteSelected = () => {
    if (selectedIds.length > 0) {
      commitObjects(prev => {
        const remaining = prev.filter(obj => !selectedIds.includes(obj.id));
        return remaining.filter(obj => {
          if (obj.type === 'circuit-wire' || (obj.type === 'component' && obj.componentType === 'wire')) {
            const hasStart = obj.startBoardId && remaining.some(b => b.id === obj.startBoardId);
            const hasEnd = obj.endBoardId && remaining.some(b => b.id === obj.endBoardId);
            return hasStart && hasEnd;
          }
          return true;
        });
      });
      setSelectedIds([]);
    }
  };

  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    
    const offset = 20;
    const duplicatedObjects: CanvasObject[] = [];
    const newSelectedIds: string[] = [];

    for (const id of selectedIds) {
      const target = objects.find(obj => obj.id === id);
      if (!target) continue;

      const newId = Date.now().toString() + Math.random().toString().substring(2, 6);
      let duplicated: CanvasObject;

      if (target.type === 'draw' && target.points) {
        duplicated = {
          ...target,
          id: newId,
          points: target.points.map(p => ({ x: p.x + offset, y: p.y + offset }))
        };
      } else if (target.type === 'line' || target.type === 'curly') {
        duplicated = {
          ...target,
          id: newId,
          x1: (target.x1 ?? target.x) + offset,
          y1: (target.y1 ?? target.y) + offset,
          x2: (target.x2 ?? target.x) + offset,
          y2: (target.y2 ?? target.y) + offset,
        };
      } else {
        duplicated = {
          ...target,
          id: newId,
          x: target.x + offset,
          y: target.y + offset,
        };
      }
      duplicatedObjects.push(duplicated);
      newSelectedIds.push(newId);
    }

    commitObjects(prev => [...prev, ...duplicatedObjects]);
    setSelectedIds(newSelectedIds);
    speakTextLocal(`Duplicated items!`);
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear your workstation?')) {
      commitObjects([]);
      setSelectedIds([]);
    }
  };

  const getComponentIcon = (type: ComponentType, isPowered = false, obj?: CanvasObject) => {
    switch (type) {
      case 'battery': return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
          <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 60" preserveAspectRatio="none">
            {/* Battery Body */}
            <rect x="15" y="10" width="70" height="40" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
            
            {/* Battery Core Highlight */}
            <rect x="22" y="15" width="56" height="30" rx="4" fill={isPowered ? "#10b981" : "#059669"} className="transition-all" />
            
            {/* Metallic Caps */}
            <path d="M 15,20 L 11,20 L 11,40 L 15,40 Z" fill="#94a3b8" />
            <path d="M 85,20 L 89,20 L 89,40 L 85,40 Z" fill="#ef4444" />
            
            {/* Energy Icon / Lightning Bolt */}
            <path d="M 52,18 L 43,31 L 51,31 L 48,42 L 57,29 L 49,29 Z" fill={isPowered ? "#fbbf24" : "#10b981"} className={isPowered ? "animate-pulse" : ""} />
            
            {/* Labels */}
            <text x="27" y="34" fontSize="11" fontWeight="bold" fill="#94a3b8" textAnchor="middle" style={{ userSelect: 'none' }}>-</text>
            <text x="73" y="34" fontSize="11" fontWeight="bold" fill="#fca5a5" textAnchor="middle" style={{ userSelect: 'none' }}>+</text>

            {/* Connection Terminals */}
            <line x1="10" y1="30" x2="15" y2="30" stroke="#64748b" strokeWidth="3" />
            <line x1="85" y1="30" x2="90" y2="30" stroke="#ef4444" strokeWidth="3" />
          </svg>

          {/* Connection Points Overlaid */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <circle cx="10" cy="50%" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair pointer-events-auto' : ''} />
            <circle cx="90%" cy="50%" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair pointer-events-auto' : ''} />
            
            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                <circle cx="10" cy="50%" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" />
                <circle cx="90%" cy="50%" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" />
              </>
            )}
          </svg>
        </div>
      );
      case 'led': {
        const hasResistor = objects && objects.some(o => o.type === 'component' && o.componentType === 'resistor');
        return (
        <div className="relative w-full h-full flex items-center justify-center">
          {isPowered && !hasResistor && obj && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] sm:text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-50 flex items-center gap-1">
              <span>⚠️</span> In real circuits, add a resistor!
            </div>
          )}
          <svg viewBox="0 0 489 408" className={`w-full h-full drop-shadow-md transition-all ${isPowered ? 'scale-105' : ''}`} style={{ filter: isPowered ? 'drop-shadow(0 0 20px rgba(242,82,54,0.95)) drop-shadow(0 0 8px rgba(242,82,54,0.8))' : 'none' }}>
            <image 
              href={greycodeLedTransparentSvg.src} 
              x="0" 
              y="0" 
              width="489" 
              height="408" 
              preserveAspectRatio="xMidYMid meet" 
            />
            {/* If powered, render a glowing overlay over the bulb area */}
            {isPowered && (
              <g style={{ mixBlendMode: 'screen' }}>
                {/* Outer radial glow */}
                <circle cx="244" cy="101" r="60" fill="url(#ledGlowActive)" opacity="0.8" />
                {/* Inner bright spot */}
                <circle cx="244" cy="101" r="25" fill="#fff" opacity="0.5" filter="url(#ledBlur)" />
              </g>
            )}
            
            <defs>
              <radialGradient id="ledGlowActive" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="30%" stopColor="#ff5236" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#ff0000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
              </radialGradient>
              <filter id="ledBlur">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            {/* Connection Points (aligning perfectly with the legs) */}
            {/* Anode leg end is at (229.5, 355) */}
            <circle cx="229.5" cy="355" r="14" fill="#f8fafc" stroke="#3b82f6" strokeWidth="3" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="229.5" cy="355" r="6" fill="#3b82f6" />
            <text x="185" y="365" fontSize="32" fontWeight="extrabold" fill="#ef4444" style={{ userSelect: 'none', pointerEvents: 'none' }}>+</text>
            
            {/* Cathode leg end is at (260.5, 271) */}
            <circle cx="260.5" cy="271" r="14" fill="#f8fafc" stroke="#3b82f6" strokeWidth="3" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="260.5" cy="271" r="6" fill="#3b82f6" />
            <text x="285" y="281" fontSize="32" fontWeight="extrabold" fill="#3b82f6" style={{ userSelect: 'none', pointerEvents: 'none' }}>-</text>

            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                {/* Always-on pulsing helper rings to show snap area */}
                <circle cx="229.5" cy="355" r="45" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.5)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse pointer-events-none" />
                <circle cx="260.5" cy="271" r="45" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.5)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse pointer-events-none" />

                {/* Larger hover zones */}
                <circle cx="229.5" cy="355" r="45" fill="rgba(59,130,246,0.25)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" style={{ pointerEvents: 'all' }} />
                <circle cx="260.5" cy="271" r="45" fill="rgba(59,130,246,0.25)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" style={{ pointerEvents: 'all' }} />
              </>
            )}
          </svg>
        </div>
      );
      }
      case 'resistor': return (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 200 60" className="w-full h-full drop-shadow-md">
            {/* Wire Left */}
            <path d="M5,30 L50,30" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            {/* Wire Right */}
            <path d="M150,30 L195,30" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            {/* Body */}
            <path d="M50,15 L150,15 Q160,15 160,30 Q160,45 150,45 L50,45 Q40,45 40,30 Q40,15 50,15 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="2" />
            {/* Color Bands (e.g. 220 ohm: Red Red Brown) */}
            <rect x="65" y="15" width="10" height="30" fill="#ef4444" />
            <rect x="90" y="15" width="10" height="30" fill="#ef4444" />
            <rect x="115" y="15" width="10" height="30" fill="#78350f" />
            <rect x="140" y="15" width="10" height="30" fill="#fbbf24" /> {/* Gold tolerance */}
            
            {/* Connection Points */}
            <circle cx="5" cy="30" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="195" cy="30" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                <circle cx="5" cy="30" r="35" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" style={{ pointerEvents: 'all' }} />
                <circle cx="195" cy="30" r="35" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair pointer-events-auto" style={{ pointerEvents: 'all' }} />
              </>
            )}
          </svg>
        </div>
      );
      case 'breadboard': return (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 300 120" className="w-[120%] h-[120%] drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
            {/* Base */}
            <rect x="0" y="0" width="300" height="120" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Red/Blue Rails Top */}
            <line x1="15" y1="12" x2="285" y2="12" stroke="#ef4444" strokeWidth="2" />
            <line x1="15" y1="24" x2="285" y2="24" stroke="#3b82f6" strokeWidth="2" />
            
            {/* Red/Blue Rails Bottom */}
            <line x1="15" y1="96" x2="285" y2="96" stroke="#3b82f6" strokeWidth="2" />
            <line x1="15" y1="108" x2="285" y2="108" stroke="#ef4444" strokeWidth="2" />
            
            {/* Holes Top Rails */}
            <g fill="#475569">
              {Array.from({ length: 30 }).map((_, i) => (
                <React.Fragment key={`top-${i}`}>
                  <circle cx={20 + i * 9} cy="12" r="2.5" />
                  <circle cx={20 + i * 9} cy="24" r="2.5" />
                </React.Fragment>
              ))}
            </g>

            {/* Holes Bottom Rails */}
            <g fill="#475569">
              {Array.from({ length: 30 }).map((_, i) => (
                <React.Fragment key={`bot-${i}`}>
                  <circle cx={20 + i * 9} cy="96" r="2.5" />
                  <circle cx={20 + i * 9} cy="108" r="2.5" />
                </React.Fragment>
              ))}
            </g>

            {/* Main Terminal Strips */}
            <g fill="#475569">
              {Array.from({ length: 30 }).map((_, c) => (
                Array.from({ length: 5 }).map((_, r) => (
                  <circle key={`t1-${c}-${r}`} cx={20 + c * 9} cy={38 + r * 6} r="2.5" />
                ))
              ))}
              {Array.from({ length: 30 }).map((_, c) => (
                Array.from({ length: 5 }).map((_, r) => (
                  <circle key={`t2-${c}-${r}`} cx={20 + c * 9} cy={70 + r * 6} r="2.5" />
                ))
              ))}
            </g>

            {/* Center Divider */}
            <rect x="15" y="65" width="270" height="3" fill="#e2e8f0" />
            <rect x="15" y="66" width="270" height="1" fill="#94a3b8" />
          </svg>
        </div>
      );
      case 'esp32': {
        const leftPins = ['TX', 'RX', '3V3', 'GND_1', '22', '21', '23', '19', '18', '5', '4', '2', '0', 'RST', 'GND_2', 'VIN_5V'];
        const rightPins = ['3V3_2', 'GND_3', '36', '39', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', '15', 'VBAT'];
        
        return (
        <svg className="w-full h-full select-none" viewBox="16 33 48 134" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" title="Microcontroller">
          <defs>
            <filter id="statusGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <image 
            href={greycodeBoardSvg.src} 
            x="0" 
            y="0" 
            width="80" 
            height="200" 
            preserveAspectRatio="xMidYMid meet" 
          />
          {/* Microcontroller LEDs (Glow Only over existing board LEDs) */}
          <g>
            {isPowered && (
              <>
                <circle cx="40" cy="150" r="10" fill="#10b981" filter="url(#statusGlow)" opacity="0.4" style={{ mixBlendMode: 'screen' }} />
                <circle cx="40" cy="150" r="3" fill="#10b981" filter="url(#statusGlow)" opacity="0.7" style={{ mixBlendMode: 'screen' }} className="animate-pulse" />
                <circle cx="40" cy="140" r="10" fill="#3b82f6" filter="url(#statusGlow)" opacity="0.4" style={{ mixBlendMode: 'screen' }} />
                <circle cx="40" cy="140" r="3" fill="#3b82f6" filter="url(#statusGlow)" opacity="0.7" style={{ mixBlendMode: 'screen' }} className="animate-pulse" style={{animationDuration: '0.8s'}} />
              </>
            )}
          </g>

          {/* Dynamic Wi-Fi Signals when Powered */}
          {isPowered && (
            <g opacity="0.85" className="animate-pulse">
              <circle cx="40" cy="110" r="24" stroke="#3b82f6" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2 3" fill="none" opacity="0.3" />
              <circle cx="40" cy="110" r="36" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 4" fill="none" opacity="0.2" />
            </g>
          )}

          {/* Clickable GPIO Pins */}
          {activeTool === 'select' && obj && (
            <g style={{ pointerEvents: 'all' }}>
              {leftPins.map((pin, i) => {
                if (pin.startsWith('GND') || pin.startsWith('3V3') || pin === 'VIN_5V' || pin === 'TX' || pin === 'RX' || pin === 'RST') return null;
                const cy = 46.15 + i * 3.175;
                const isHigh = obj.pinStates?.[pin];
                return (
                  <circle
                    key={pin}
                    cx="21.4"
                    cy={cy}
                    r="2.5"
                    fill={isHigh ? "#ef4444" : "transparent"}
                    stroke={isHigh ? "#fca5a5" : "rgba(255,255,255,0.2)"}
                    strokeWidth="0.5"
                    className="cursor-pointer hover:stroke-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      commitObjects(prev => prev.map(o => o.id === obj.id ? {
                        ...o,
                        pinStates: { ...(o.pinStates || {}), [pin]: !isHigh }
                      } : o));
                    }}
                  />
                );
              })}
              {rightPins.map((pin, i) => {
                if (pin.startsWith('GND') || pin.startsWith('3V3') || pin === 'VBAT') return null;
                const cy = 46.15 + i * 3.175;
                const isHigh = obj.pinStates?.[pin];
                return (
                  <circle
                    key={pin}
                    cx="59.0"
                    cy={cy}
                    r="2.5"
                    fill={isHigh ? "#ef4444" : "transparent"}
                    stroke={isHigh ? "#fca5a5" : "rgba(255,255,255,0.2)"}
                    strokeWidth="0.5"
                    className="cursor-pointer hover:stroke-white transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      commitObjects(prev => prev.map(o => o.id === obj.id ? {
                        ...o,
                        pinStates: { ...(o.pinStates || {}), [pin]: !isHigh }
                      } : o));
                    }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      );
      }
      case 'motor': return (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Outer spindle cap */}
            <circle cx="50" cy="40" r="10" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <circle cx="50" cy="40" r="3" fill="#64748b" className={isPowered ? "animate-spin" : ""} style={{ transformOrigin: '50px 40px' }} />
            
            {/* Motor Cylindrical Body */}
            <circle cx="50" cy="45" r="30" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
            {/* Steel texture shading */}
            <circle cx="50" cy="45" r="26" fill="none" stroke="#e2e8f0" strokeWidth="2" opacity="0.4" />
            <path d="M 25,45 A 25,25 0 0,0 75,45" fill="none" stroke="#64748b" strokeWidth="6" opacity="0.3" />
            
            {/* Back cap casing */}
            <path d="M 30,65 L 70,65 L 65,85 L 35,85 Z" fill="#1e293b" />
            
            {/* Connection terminals/pins extending down */}
            <line x1="30" y1="80" x2="30" y2="90" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="80" x2="70" y2="90" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            
            {/* Plus and Minus symbols */}
            <text x="27" y="76" fontSize="10" fontWeight="bold" fill="#f59e0b" textAnchor="middle">+</text>
            <text x="73" y="76" fontSize="10" fontWeight="bold" fill="#3b82f6" textAnchor="middle">-</text>

            {/* Connection Points */}
            <circle cx="30" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="70" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                <circle cx="30" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
                <circle cx="70" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
              </>
            )}
          </svg>
        </div>
      );
      case 'wheel': return (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Outer rubber tire */}
            <circle cx="50" cy="45" r="38" fill="#0f172a" stroke="#334155" strokeWidth="4" />
            {/* Tire Tread lines */}
            <circle cx="50" cy="45" r="34" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="6,4" className={isPowered ? "animate-spin" : ""} style={{ transformOrigin: '50px 45px' }} />
            
            {/* Wheel hub */}
            <circle cx="50" cy="45" r="22" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            <circle cx="50" cy="45" r="6" fill="#475569" />
            
            {/* Spokes inside hub */}
            <g className={isPowered ? "animate-spin" : ""} style={{ transformOrigin: '50px 45px' }}>
              <line x1="50" y1="15" x2="50" y2="75" stroke="#94a3b8" strokeWidth="4" />
              <line x1="20" y1="45" x2="80" y2="45" stroke="#94a3b8" strokeWidth="4" />
              <circle cx="50" cy="45" r="12" fill="none" stroke="#64748b" strokeWidth="2" />
            </g>

            {/* Back Connector block */}
            <rect x="25" y="76" width="50" height="10" rx="3" fill="#475569" />
            
            {/* Connection points extend to 30 and 70 */}
            <line x1="30" y1="80" x2="30" y2="90" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="80" x2="70" y2="90" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />

            {/* Connection Points */}
            <circle cx="30" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="70" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                <circle cx="30" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
                <circle cx="70" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
              </>
            )}
          </svg>
        </div>
      );
      case 'robot-arm': return (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Heavy Base */}
            <rect x="20" y="70" width="60" height="15" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <rect x="35" y="60" width="30" height="10" fill="#475569" />
            
            {/* Joints and Arm Segment */}
            <g className={isPowered ? "animate-pulse" : ""}>
              {/* Lower segment */}
              <line x1="50" y1="65" x2="35" y2="35" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
              <circle cx="50" cy="65" r="6" fill="#1e293b" />
              
              {/* Elbow joint */}
              <circle cx="35" cy="35" r="6" fill="#1e293b" />
              
              {/* Upper segment */}
              <line x1="35" y1="35" x2="65" y2="20" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
              
              {/* Claw/Gripper */}
              <circle cx="65" cy="20" r="4" fill="#1e293b" />
              <path d="M 65,20 Q 75,10 75,25" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <path d="M 65,20 Q 75,30 70,35" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Connection points extend to 30 and 70 */}
            <line x1="30" y1="80" x2="30" y2="90" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="80" x2="70" y2="90" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />

            {/* Connection Points */}
            <circle cx="30" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            <circle cx="70" cy="90" r="4" fill="#cbd5e1" stroke="#3b82f6" strokeWidth="2" className={activeTool === 'circuit-wire' ? 'cursor-crosshair' : ''} />
            {/* Snap Highlights */}
            {activeTool === 'circuit-wire' && (
              <>
                <circle cx="30" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
                <circle cx="70" cy="90" r="16" fill="rgba(59,130,246,0.3)" className="opacity-0 hover:opacity-100 transition-opacity cursor-crosshair" style={{ pointerEvents: 'all' }} />
              </>
            )}
          </svg>
        </div>
      );
      default: return null;
    }
  };

  const renderObject = (obj: CanvasObject) => {
    const isSelected = selectedIds.includes(obj.id);
    const isInteractive = activeTool === 'select' || activeTool === 'fill' || activeTool === 'eraser';
    const isPowered = isSimulating && poweredIds.has(obj.id);
    
    if (obj.type === 'draw') {
      return (
        <g key={obj.id} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          <polyline
            points={obj.points?.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={obj.color}
            strokeWidth={obj.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            onPointerDown={(e) => startObjectMove(e, obj)}
            className={activeTool === 'select' ? 'cursor-move hover:opacity-80' : ''}
            style={{ pointerEvents: 'stroke' }}
          />
          {isPowered && (
            <polyline
              points={obj.points?.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={(obj.strokeWidth || 3) + 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-electrons opacity-90"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {isSelected && obj.points && (
            <rect
              x={Math.min(...obj.points.map(p => p.x)) - 5}
              y={Math.min(...obj.points.map(p => p.y)) - 5}
              width={Math.max(...obj.points.map(p => p.x)) - Math.min(...obj.points.map(p => p.x)) + 10}
              height={Math.max(...obj.points.map(p => p.y)) - Math.min(...obj.points.map(p => p.y)) + 10}
              fill="none"
              stroke="#3b82f6"
              strokeDasharray="4 4"
              strokeWidth={2}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    }
    
    if (obj.type === 'line') {
      return (
        <g key={obj.id} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          {/* Invisible thicker line for easier clicking */}
          <line
            x1={obj.x1} y1={obj.y1} x2={obj.x2} y2={obj.y2}
            stroke="transparent" strokeWidth={15}
            onPointerDown={(e) => startObjectMove(e, obj)}
            className={activeTool === 'select' ? 'cursor-move' : ''}
          />
          <line
            x1={obj.x1} y1={obj.y1} x2={obj.x2} y2={obj.y2}
            stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
          {isPowered && (
            <line
              x1={obj.x1} y1={obj.y1} x2={obj.x2} y2={obj.y2}
              stroke="#fbbf24" strokeWidth={(obj.strokeWidth || 3) + 3} strokeLinecap="round"
              className="animate-electrons opacity-90"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {obj.startPin && (
            <text x={(obj.x1 ?? 0) + 5} y={(obj.y1 ?? 0) - 5} fontSize="10" fill="#334155" fontWeight="bold" className="drop-shadow-sm select-none" style={{ pointerEvents: 'none' }}>
              {obj.startPin}
            </text>
          )}
          {obj.endPin && (
            <text x={(obj.x2 ?? 0) + 5} y={(obj.y2 ?? 0) - 5} fontSize="10" fill="#334155" fontWeight="bold" className="drop-shadow-sm select-none" style={{ pointerEvents: 'none' }}>
              {obj.endPin}
            </text>
          )}
          {isSelected && (
            <>
              <circle cx={obj.x1 ?? obj.x} cy={obj.y1 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'start')} />
              <circle cx={obj.x2 ?? obj.x} cy={obj.y2 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'end')} />
            </>
          )}
        </g>
      );
    }

    if (obj.type === 'circuit-wire') {
      const isSelected = selectedIds.includes(obj.id);
      const isPowered = poweredIds.has(obj.id);
      
      if (!obj.waypoints || obj.waypoints.length === 0) {
        return null;
      }
      
      const pointsStr = obj.waypoints.map(p => `${p.x},${p.y}`).join(' ');
      return (
        <g key={obj.id} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          <polyline
            points={pointsStr}
            fill="none" stroke="transparent" strokeWidth={15}
            onPointerDown={(e) => startObjectMove(e, obj)}
            className={activeTool === 'select' ? 'cursor-move' : ''}
          />
          <polyline
            points={pointsStr}
            fill="none" stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinecap="square" strokeLinejoin="miter"
            style={{ pointerEvents: 'none' }}
          />
          {isPowered && (
            <polyline
              points={pointsStr}
              fill="none" stroke="#fbbf24" strokeWidth={(obj.strokeWidth || 3) + 3} strokeLinecap="square" strokeLinejoin="miter"
              className="animate-electrons opacity-90"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {isSelected && (
            <>
              <circle cx={obj.x1 ?? obj.x} cy={obj.y1 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} onPointerDown={(e) => startObjectResize(e, obj, 'start')} className="cursor-pointer" />
              <circle cx={obj.x2 ?? obj.x} cy={obj.y2 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} onPointerDown={(e) => startObjectResize(e, obj, 'end')} className="cursor-pointer" />
            </>
          )}
        </g>
      );
    }
    
    if (obj.type === 'curly') {
      const startDir = getPinDirection(obj.startBoardId, obj.startPin);
      const endDir = getPinDirection(obj.endBoardId, obj.endPin);
      
      return (
        <g key={obj.id} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          {/* Invisible thicker path for easier clicking */}
          <path
            d={getCurlyPath(obj.x1 ?? obj.x, obj.y1 ?? obj.y, obj.x2 ?? obj.x, obj.y2 ?? obj.y, startDir, endDir)}
            fill="none" stroke="transparent" strokeWidth={15}
            onPointerDown={(e) => startObjectMove(e, obj)}
            className={activeTool === 'select' ? 'cursor-move' : ''}
          />
          <path
            d={getCurlyPath(obj.x1 ?? obj.x, obj.y1 ?? obj.y, obj.x2 ?? obj.x, obj.y2 ?? obj.y, startDir, endDir)}
            fill="none" stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
          {isPowered && (
            <path
              d={getCurlyPath(obj.x1 ?? obj.x, obj.y1 ?? obj.y, obj.x2 ?? obj.x, obj.y2 ?? obj.y, startDir, endDir)}
              fill="none" stroke="#fbbf24" strokeWidth={(obj.strokeWidth || 3) + 3} strokeLinecap="round"
              className="animate-electrons opacity-90"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {obj.startPin && (
            <text x={(obj.x1 ?? 0) + 5} y={(obj.y1 ?? 0) - 5} fontSize="10" fill="#334155" fontWeight="bold" className="drop-shadow-sm select-none" style={{ pointerEvents: 'none' }}>
              {obj.startPin}
            </text>
          )}
          {obj.endPin && (
            <text x={(obj.x2 ?? 0) + 5} y={(obj.y2 ?? 0) - 5} fontSize="10" fill="#334155" fontWeight="bold" className="drop-shadow-sm select-none" style={{ pointerEvents: 'none' }}>
              {obj.endPin}
            </text>
          )}
          {isSelected && (
            <>
              <circle cx={obj.x1 ?? obj.x} cy={obj.y1 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'start')} />
              <circle cx={obj.x2 ?? obj.x} cy={obj.y2 ?? obj.y} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'end')} />
            </>
          )}
        </g>
      );
    }
    
    if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'oval' || obj.type === 'triangle' || obj.type === 'component') {
      let content = null;
      if (obj.type === 'rectangle') {
        content = <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} />;
      } else if (obj.type === 'circle' || obj.type === 'oval') {
        content = <ellipse cx={obj.x + obj.width/2} cy={obj.y + obj.height/2} rx={obj.width/2} ry={obj.height/2} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} />;
      } else if (obj.type === 'triangle') {
        content = <polygon points={`${obj.x + obj.width/2},${obj.y} ${obj.x},${obj.y + obj.height} ${obj.x + obj.width},${obj.y + obj.height}`} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinejoin="round" />;
      } else if (obj.type === 'component' && obj.componentType) {
        content = (
          <foreignObject x={obj.x} y={obj.y} width={obj.width} height={obj.height}>
            <div className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
              isPowered ? 'scale-105' : ''
            }`}>
              {getComponentIcon(obj.componentType, isPowered, obj)}
            </div>
          </foreignObject>
        );
      }

      return (
        <g key={obj.id} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          {isPowered && obj.type !== 'component' && (
            <rect 
              x={obj.x - 6} y={obj.y - 6} 
              width={obj.width + 12} height={obj.height + 12} 
              rx={16} ry={16} 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth={3} 
              className="animate-pulse opacity-80" 
              style={{ pointerEvents: 'none' }} 
            />
          )}
          {content}
          
          {/* Invisible rect for easier clicking, put on TOP of content so it receives events */}
          <rect
            x={obj.x} y={obj.y} width={obj.width} height={obj.height}
            fill="transparent" stroke="transparent" strokeWidth={0}
            onPointerDown={(e) => startObjectMove(e, obj)}
            className={activeTool === 'select' ? 'cursor-move' : activeTool === 'fill' ? 'cursor-crosshair' : ''}
          />
          
          {isSelected && (
            <>
              {obj.type === 'component' ? (
                // Elegant selection highlight for components - no resize handles or dashed lines, keeping connection points clear
                <rect
                  x={obj.x - 3}
                  y={obj.y - 3}
                  width={obj.width + 6}
                  height={obj.height + 6}
                  rx={8}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <>
                  <rect x={obj.x - 2} y={obj.y - 2} width={obj.width + 4} height={obj.height + 4} fill="none" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} style={{ pointerEvents: 'none' }} />
                  <circle cx={obj.x} cy={obj.y} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onPointerDown={(e) => startObjectResize(e, obj, 'tl')} />
                  <circle cx={obj.x + obj.width} cy={obj.y} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nesw-resize" onPointerDown={(e) => startObjectResize(e, obj, 'tr')} />
                  <circle cx={obj.x} cy={obj.y + obj.height} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nesw-resize" onPointerDown={(e) => startObjectResize(e, obj, 'bl')} />
                  <circle cx={obj.x + obj.width} cy={obj.y + obj.height} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onPointerDown={(e) => startObjectResize(e, obj, 'br')} />
                </>
              )}
            </>
          )}
        </g>
      );
    }
    
    if (obj.type === 'text') {
      return (
        <g key={obj.id} onPointerDown={(e) => startObjectMove(e, obj)} className={activeTool === 'select' ? 'cursor-move' : activeTool === 'eraser' ? 'cursor-not-allowed' : ''} style={!isInteractive ? { pointerEvents: 'none' } : undefined}>
          <rect
            x={obj.x - 5} y={obj.y - (obj.fontSize || 16) + 5} 
            width={(obj.text || '').length * ((obj.fontSize || 16) * 0.6) + 10} 
            height={(obj.fontSize || 16) + 10}
            fill="transparent"
          />
          <text
            x={obj.x}
            y={obj.y}
            fill={obj.color}
            fontSize={obj.fontSize}
            fontFamily="sans-serif"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {obj.text}
          </text>
          {isSelected && (
            <rect
              x={obj.x - 5} y={obj.y - obj.fontSize! + 5} 
              width={(obj.text || '').length * ((obj.fontSize || 16) * 0.6) + 10} 
              height={(obj.fontSize || 16) + 10}
              fill="none" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    }
    
    return null;
  };

  const objectCount = objects.length;
  const uniqueColors = Array.from(new Set(objects.map(obj => obj.color)));
  
  const hasBattery = objects.some(obj => obj.type === 'component' && (obj.componentType === 'battery' || obj.componentType === 'esp32'));
  const hasPowerConsumer = objects.some(obj => obj.type === 'component' && ['led', 'motor', 'robot-arm', 'wheel', 'esp32'].includes(obj.componentType || ''));
  const hasElectronics = hasBattery && hasPowerConsumer;
  
  // Pattern check (horizontal or vertical beads with alternating colors)
  const beadShapes = objects.filter(obj => ['circle', 'rectangle', 'triangle'].includes(obj.type));
  let hasPattern = false;
  let patternDescription = '';
  if (beadShapes.length >= 3) {
    const sortedBeadsX = [...beadShapes].sort((a, b) => a.x - b.x);
    let isAlignedX = true;
    for (let i = 1; i < sortedBeadsX.length; i++) {
      if (Math.abs(sortedBeadsX[i].y - sortedBeadsX[0].y) > 120) {
        isAlignedX = false;
        break;
      }
    }
    
    const sortedBeadsY = [...beadShapes].sort((a, b) => a.y - b.y);
    let isAlignedY = true;
    for (let i = 1; i < sortedBeadsY.length; i++) {
      if (Math.abs(sortedBeadsY[i].x - sortedBeadsY[0].x) > 120) {
        isAlignedY = false;
        break;
      }
    }
    
    if (isAlignedX || isAlignedY) {
      const sorted = isAlignedX ? sortedBeadsX : sortedBeadsY;
      const colors = sorted.map(b => b.color);
      let alternating = true;
      for (let i = 2; i < colors.length; i++) {
        if (colors[i] !== colors[i - 2] || colors[i] === colors[i - 1]) {
          alternating = false;
          break;
        }
      }
      if (alternating && colors.length >= 3 && colors[0] !== colors[1]) {
        hasPattern = true;
        patternDescription = isAlignedX ? 'Horizontal Alternating Pattern' : 'Vertical Alternating Pattern';
      }
    }

    // Circular / Ring Pattern Check: Sort by polar angle relative to the center of all beads
    if (!hasPattern && beadShapes.length >= 3) {
      const centerX = beadShapes.reduce((sum, b) => sum + b.x, 0) / beadShapes.length;
      const centerY = beadShapes.reduce((sum, b) => sum + b.y, 0) / beadShapes.length;
      
      const sortedBeadsAngle = [...beadShapes].sort((a, b) => {
        const angleA = Math.atan2(a.y - centerY, a.x - centerX);
        const angleB = Math.atan2(b.y - centerY, b.x - centerX);
        return angleA - angleB;
      });
      
      const colorsAngle = sortedBeadsAngle.map(b => b.color);
      let alternatingAngle = true;
      for (let i = 2; i < colorsAngle.length; i++) {
        if (colorsAngle[i] !== colorsAngle[i - 2] || colorsAngle[i] === colorsAngle[i - 1]) {
          alternatingAngle = false;
          break;
        }
      }
      if (alternatingAngle && colorsAngle.length >= 3 && colorsAngle[0] !== colorsAngle[1]) {
        hasPattern = true;
        patternDescription = 'Circular Alternating Pattern';
      }
    }

    // General Adjacent/Nearest-Neighbor Path Pattern Check: Traces any general loop, curve, or wave
    if (!hasPattern && beadShapes.length >= 3) {
      const buildNearestNeighborPath = (startIdx: number, beads: typeof beadShapes) => {
        const path = [beads[startIdx]];
        const visited = new Set<number>([startIdx]);
        while (visited.size < beads.length) {
          const last = path[path.length - 1];
          let nearestIdx = -1;
          let minDist = Infinity;
          for (let i = 0; i < beads.length; i++) {
            if (!visited.has(i)) {
              const dx = beads[i].x - last.x;
              const dy = beads[i].y - last.y;
              const dist = dx * dx + dy * dy;
              if (dist < minDist) {
                minDist = dist;
                nearestIdx = i;
              }
            }
          }
          if (nearestIdx !== -1) {
            path.push(beads[nearestIdx]);
            visited.add(nearestIdx);
          } else {
            break;
          }
        }
        return path;
      };

      for (let i = 0; i < beadShapes.length; i++) {
        const path = buildNearestNeighborPath(i, beadShapes);
        const colors = path.map(b => b.color);
        let alternating = true;
        for (let j = 2; j < colors.length; j++) {
          if (colors[j] !== colors[j - 2] || colors[j] === colors[j - 1]) {
            alternating = false;
            break;
          }
        }
        if (alternating && colors.length >= 3 && colors[0] !== colors[1]) {
          hasPattern = true;
          patternDescription = mode === 'bracelet' ? 'Circular Bracelet Pattern' : 'Alternating Pattern';
          break;
        }
      }
    }
  }

  // Real-time Stars calculation
  let earnedStars = 0;
  if (objectCount >= 3) {
    if (mode === 'bracelet') {
      earnedStars = 3;
      if (uniqueColors.length === 2) {
        earnedStars = 7;
        if (hasPattern) {
          earnedStars = 10;
        }
      } else if (hasPattern) {
        earnedStars = 10;
      }
    } else {
      earnedStars = 1;
      if (uniqueColors.length >= 3) {
        earnedStars = 2;
      }
      if (hasPattern || hasElectronics) {
        earnedStars = 3;
      }
    }
  }

  return (
    <div className={`bg-white select-none flex flex-col transition-all duration-300 ${
      isSimulatedFullscreen 
        ? 'fixed inset-0 z-[9999] w-screen h-screen p-4 bg-slate-100 overflow-hidden' 
        : 'rounded-3xl border-4 border-slate-100 shadow-sm h-full min-h-[600px]'
    }`}>
      
      {/* Circuit Simulator Top-Bar (Moved to the absolute top, above the header and color bar!) */}
      {mode === 'general' && (
        <div className="bg-slate-900 text-white p-3 px-6 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none transition-all shrink-0">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes flow-electrons {
              from { stroke-dashoffset: 24; }
              to { stroke-dashoffset: 0; }
            }
            .animate-electrons {
              stroke-dasharray: 8, 8;
              animation: flow-electrons 0.7s linear infinite;
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.15); opacity: 0.95; }
            }
            .animate-pulse-glow {
              animation: pulse-glow 1.5s ease-in-out infinite;
            }
          `}} />

          {/* Left Column: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl hidden sm:block">
              <Zap className={`w-5 h-5 ${isSimulating ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  Sipho's Simulation Lab 🔬⚡
                </h4>
                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/40">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
                    {isSimulating ? 'Live' : 'Standby'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden md:block">
                Test your circuits with batteries, LEDs, motors, and connections.
              </p>
            </div>
          </div>

          {/* Middle Section: Status / Feedback Message */}
          <div className="flex-1 max-w-xl bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/50 text-[11px] sm:text-xs leading-snug flex items-center">
            {(() => {
              const hasBattery = objects.some(obj => obj.type === 'component' && (obj.componentType === 'battery' || obj.componentType === 'esp32'));
              const hasPowerConsumer = objects.some(obj => obj.type === 'component' && ['led', 'motor', 'robot-arm', 'wheel', 'esp32'].includes(obj.componentType || ''));
              
              if (!hasBattery) {
                return (
                  <div className="text-amber-300 font-medium">
                    ⚠️ <strong>No Battery!</strong> Place a Green Battery component onto the canvas to supply power!
                  </div>
                );
              }
              if (!hasPowerConsumer) {
                return (
                  <div className="text-amber-300 font-medium">
                    ⚠️ <strong>No Consumer!</strong> Place an LED light, Motor, Wheel, Robot Arm, or ESP32 Board to receive power!
                  </div>
                );
              }
              if (isSimulating) {
                if (isShortCircuit) {
                  return (
                    <div className="text-rose-400 font-bold animate-pulse">
                      💥 <strong>Short Circuit!</strong> VCC (+) and GND (-) are touching! Fix the wiring.
                    </div>
                  );
                }
                if (poweredComponentsCount > 0) {
                  return (
                    <div className="text-emerald-300 font-bold flex items-center gap-1">
                      ✨ <strong>Success!</strong> {poweredComponentsCount} component{poweredComponentsCount > 1 ? 's are' : ' is'} powered up and active!
                    </div>
                  );
                } else {
                  return (
                    <div className="text-cyan-300 font-medium animate-pulse">
                      🔌 <strong>Not Connected!</strong> Connect both VCC (+) and GND (-) pins with 2 separate wires!
                    </div>
                  );
                }
              }
              return (
                <div className="text-slate-300 font-medium">
                  💡 Click the green button to toggle circuit power simulation.
                </div>
              );
            })()}
          </div>

          {/* Right Section: Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextSim = !isSimulating;
                setIsSimulating(nextSim);
                playSimulationSound(nextSim ? 'power-up' : 'power-down');
                speakTextLocal(nextSim 
                  ? "Starting circuit simulation! Click components to inspect power levels." 
                  : "Simulation stopped. Inventions powered down."
                );
              }}
              className={`w-full md:w-44 py-2 px-5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm ${
                isSimulating
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/40'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/40 animate-pulse'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSimulating ? 'Stop Simulation' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Header toolbar */}
      <div className="bg-indigo-50 p-4 border-b-2 border-indigo-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-tight">
              {mode === 'bracelet' ? 'Beaded Bracelet Designer' : 'Creative Arts Workstation'}
            </h2>
          </div>

          {mode !== 'bracelet' && (
            <div className="flex bg-indigo-100/80 p-1 rounded-xl border border-indigo-200/50 shadow-3xs ml-2">
              <button
                type="button"
                onClick={() => {
                  setWorkstationTab('designer');
                  speakTextLocal("Switched to Circuit Designer.");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
                  workstationTab === 'designer' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-200/50'
                }`}
              >
                <span>🔌 Circuit Designer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkstationTab('microblocks');
                  speakTextLocal("Switched to MicroBlocks coding.");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
                  workstationTab === 'microblocks' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-200/50'
                }`}
              >
                <span>🧱 MicroBlocks Coder</span>
              </button>
            </div>
          )}

          {/* Audio voice guidance button */}
          <button
            type="button"
            onClick={() => {
              const textToSpeak = mode === 'bracelet'
                ? "Welcome to your Beaded Bracelet Designer! Place circular beads in a row and alternate exactly two colors to design your beautiful bracelet and create a perfect AB repeating pattern!"
                : "Welcome to your Creative Arts Workstation! Draw freely, place shapes, and assemble electronic circuits with batteries and LEDs to power your robot designs!";
              speakTextLocal(textToSpeak);
            }}
            className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-extrabold rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-3xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Guidance 🔊</span>
          </button>

          {/* Go Full Screen button */}
          <button
            type="button"
            onClick={() => setIsSimulatedFullscreen(prev => !prev)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
          >
            {isSimulatedFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isSimulatedFullscreen ? 'Exit Full Screen' : 'Go Full Screen 🖥️'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowActivities(prev => !prev)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <span>{showActivities ? 'Hide Tasks' : 'Show Tasks'}</span>
          </button>
          
          {onComplete && (
            <button
              disabled={isSubmittingWorkstation}
              onClick={() => {
                if (!otherActivitiesCompleted) {
                  setValidationError("⚠️ Finish typing your big vocabulary word and exploring the guide first before submitting!");
                  speakTextLocal("Please complete the other workbook activities first before submitting your final design!");
                  setTimeout(() => setValidationError(null), 5000);
                  return;
                }
                if (objects.length < 3) {
                  setValidationError("Please add at least 3 items, shapes, or drawings to complete your design!");
                  setTimeout(() => setValidationError(null), 4000);
                  return;
                }

                if (mode === 'bracelet') {
                  setIsSubmittingWorkstation(true);
                  setValidationError("🤖 AI Tutor is carefully verifying your beaded bracelet pattern... Please wait! 🌟");
                  speakTextLocal("AI Tutor is verifying your beaded bracelet design pattern... Let's see your beautiful bracelet!");

                  const triggerAIVerifySubmit = async (imgData: string | null) => {
                    try {
                      const res = await fetch("/api/check-workstation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          activityId: "R-T1-W7-bracelet",
                          title: "Beaded Bracelet Design",
                          description: "Place colorful circular beads in a row and alternate exactly two colors to create a repeating AB pattern (e.g. Red, Blue, Red, Blue).",
                          targetDescription: "Must be circular beads placed in a pattern alternating exactly two colors (such as Red and Blue, or Orange and Yellow). They must have drawn actual beads (circles or freehand circular shapes) and they must be colored in an alternating pattern. Look at the image to confirm they didn't just place random lines or non-patterned/single-color elements. If they have extra items or used more than 2 colors without a repeating pattern, fail them with an encouraging message.",
                          imageData: imgData,
                          objects: objects.map(obj => {
                            if (obj.type === 'draw') {
                              return { ...obj, points: '...omitted to save bandwidth...' };
                            }
                            return obj;
                          })
                        })
                      });
                      const data = await res.json();
                      setIsSubmittingWorkstation(false);
                      if (data.score !== undefined && data.score !== null) {
                        setValidationError(null);
                        speakTextLocal(data.feedback || "Wonderful! Your pattern has been approved by the AI Tutor!");
                        onComplete(data.score, 10, data.feedback);
                      } else if (data.success) {
                        setValidationError(null);
                        speakTextLocal("Wonderful! Your pattern has been approved by the AI Tutor!");
                        onComplete(data.score || earnedStars, 10, data.feedback);
                      } else {
                        speakTextLocal(data.feedback || "Please try again!");
                        setValidationError(`❌ ${data.feedback || "Please try again!"}`);
                        setTimeout(() => setValidationError(null), 10000);
                      }
                    } catch (err) {
                      console.error("AI verify submit failed:", err);
                      setIsSubmittingWorkstation(false);
                      // Fallback to local evaluation on error so they are not blocked
                      setValidationError(null);
                      onComplete(earnedStars, 10);
                    }
                  };

                  // Capture screenshot from the SVG canvas
                  try {
                    const svgElement = canvasRef.current?.querySelector('svg');
                    if (svgElement) {
                      const serializer = new XMLSerializer();
                      const svgString = serializer.serializeToString(svgElement);
                      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                      const url = URL.createObjectURL(svgBlob);
                      const img = new Image();
                      img.onload = () => {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = 800;
                        tempCanvas.height = 800;
                        const tempCtx = tempCanvas.getContext('2d');
                        if (tempCtx) {
                          tempCtx.fillStyle = '#ffffff';
                          tempCtx.fillRect(0, 0, 800, 800);
                          tempCtx.drawImage(img, 0, 0, 1500, 1500, 0, 0, 800, 800);
                          const dataUrl = tempCanvas.toDataURL('image/png');
                          URL.revokeObjectURL(url);
                          triggerAIVerifySubmit(dataUrl);
                        } else {
                          URL.revokeObjectURL(url);
                          triggerAIVerifySubmit(null);
                        }
                      };
                      img.onerror = () => {
                        URL.revokeObjectURL(url);
                        triggerAIVerifySubmit(null);
                      };
                      img.src = url;
                    } else {
                      triggerAIVerifySubmit(null);
                    }
                  } catch (e) {
                    console.error("Failed to capture workstation snapshot:", e);
                    triggerAIVerifySubmit(null);
                  }

                } else {
                  onComplete(earnedStars);
                }
              }}
              id="btn-complete-workstation"
              className={`px-4 py-2 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border-b-4 ${
                isSubmittingWorkstation 
                  ? 'bg-slate-400 border-slate-600 cursor-not-allowed opacity-75' 
                  : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 active:border-b-0 active:translate-y-0.5'
              }`}
            >
              {isSubmittingWorkstation ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" />
                  Verifying Pattern...
                </span>
              ) : (
                <>Submit Workstation Design ✨</>
              )}
            </button>
          )}

          {validationError && (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg animate-pulse max-w-xs sm:max-w-md">
              {validationError}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 max-w-full justify-center sm:justify-start">
          <button 
            onClick={() => { setActiveTool('select'); setActiveComponent(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'select' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Select & Move"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTool('draw'); setActiveComponent(null); setSelectedIds([]); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'draw' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Freehand Draw"
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTool('fill'); setActiveComponent(null); setSelectedIds([]); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'fill' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Paint Bucket (Fill Shape)"
          >
            <PaintBucket className="w-5 h-5" />
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-0.5"></div>
          
          {/* Stroke Width Slider */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 border-r border-slate-200 pr-3">
            <span className="text-xs text-slate-500 font-medium">Size</span>
            <input 
              type="range" 
              min="1" max="15" 
              value={currentStrokeWidth}
              onChange={(e) => {
                const width = parseInt(e.target.value);
                setCurrentStrokeWidth(width);
                if (selectedIds.length > 0) {
                  commitObjects(prev => prev.map(obj => selectedIds.includes(obj.id) ? { ...obj, strokeWidth: width } : obj));
                }
              }}
              className="w-16 sm:w-20 accent-indigo-600"
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-wrap gap-1 px-1">
            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#1e293b'].map(color => (
              <button
                key={color}
                onClick={() => { 
                  setCurrentColor(color); 
                  if (selectedIds.length > 0) {
                    commitObjects(prev => prev.map(obj => selectedIds.includes(obj.id) ? { ...obj, color } : obj));
                  } else if (activeTool === 'select') {
                    setActiveTool('draw');
                  }
                }}
                className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 transition-transform ${currentColor === color ? 'scale-110 border-slate-800' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-0.5"></div>
          
          <button onClick={deleteSelected} disabled={selectedIds.length === 0} className={`p-2 sm:p-3 rounded-xl transition-colors ${selectedIds.length > 0 ? 'hover:bg-red-50 text-red-500' : 'text-slate-300 cursor-not-allowed'}`} title="Delete Selected">
            <Trash2 className="w-5 h-5" />
          </button>

          <button onClick={duplicateSelected} disabled={selectedIds.length === 0} className={`p-2 sm:p-3 rounded-xl transition-colors ${selectedIds.length > 0 ? 'hover:bg-indigo-50 text-indigo-600' : 'text-slate-300 cursor-not-allowed'}`} title="Duplicate Selected">
            <Copy className="w-5 h-5" />
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-0.5 hidden sm:block"></div>
          
          <button onClick={undo} disabled={historyIndex <= 0} className={`p-2 sm:p-3 rounded-xl transition-colors ${historyIndex > 0 ? 'hover:bg-indigo-50 text-indigo-600' : 'text-slate-300 cursor-not-allowed'}`} title="Undo">
            <Undo2 className="w-5 h-5" />
          </button>
          
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className={`p-2 sm:p-3 rounded-xl transition-colors ${historyIndex < history.length - 1 ? 'hover:bg-indigo-50 text-indigo-600' : 'text-slate-300 cursor-not-allowed'}`} title="Redo">
            <Redo2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => { setActiveTool('eraser'); setActiveComponent(null); setSelectedIds([]); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Eraser Tool"
          >
            <Eraser className="w-5 h-5" />
          </button>

          <button onClick={clearCanvas} className="p-2 sm:p-3 rounded-xl hover:bg-red-50 text-red-500 font-medium text-sm border border-red-100" title="Clear All">
            Clear
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {workstationTab === 'designer' ? (
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Components Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-b-2 md:border-b-0 md:border-r-2 border-slate-100 p-4 overflow-y-auto">
          
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Lines & Shapes</h3>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
              {[
                { type: 'line', icon: <Minus className="w-6 h-6 text-slate-800" /> },
                { 
                  type: 'curly', 
                  icon: (
                    <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12C6 8 9 16 12 12C15 8 18 16 21 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) 
                },
                { type: 'rectangle', icon: <Square className="w-6 h-6 text-blue-500" /> },
                { type: 'circle', icon: <Circle className="w-6 h-6 text-pink-500" /> },
                { 
                  type: 'oval', 
                  icon: (
                    <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <ellipse cx="12" cy="12" rx="9" ry="5"/>
                    </svg>
                  ) 
                },
                { type: 'triangle', icon: <Triangle className="w-6 h-6 text-purple-500" /> },
                { type: 'text', icon: <Type className="w-6 h-6 text-slate-600" /> }
              ].map(shape => (
                <button
                  key={shape.type}
                  onClick={() => { setActiveTool(shape.type as Tool); setActiveComponent(null); setSelectedIds([]); }}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 bg-white transition-all ${
                    activeTool === shape.type
                    ? 'border-indigo-500 shadow-md transform scale-105' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {shape.icon}
                  <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-2 capitalize">{shape.type}</span>
                </button>
              ))}
            </div>
          </div>

          {mode !== 'bracelet' && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Electronic Parts & Assembly</h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
                {(['battery', 'led', 'resistor', 'breadboard', 'motor', 'wire', 'robot-arm', 'wheel', 'esp32'] as ComponentType[]).map(comp => (
                  <button
                    key={comp}
                    onClick={() => { 
                      if (comp === 'wire') {
                        setActiveTool('circuit-wire');
                        setActiveComponent(null);
                      } else {
                        setActiveTool('component'); 
                        setActiveComponent(comp); 
                      }
                      setSelectedIds([]); 
                    }}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 bg-white transition-all ${
                      (activeTool === 'component' && activeComponent === comp) || (comp === 'wire' && activeTool === 'circuit-wire')
                      ? 'border-indigo-500 shadow-md transform scale-105' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="w-8 h-8">
                      {getComponentIcon(comp)}
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-2 capitalize">
                      {comp === 'esp32' ? 'Microcontroller' : comp.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode !== 'bracelet' && (
            <div className="mb-6 p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-extrabold uppercase text-[11px] tracking-wider text-white">AI Auto-Router ⚡🤖</h3>
              </div>
              
              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                Instruct the AI to route and connect your placed components perfectly!
              </p>
              
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={customRoutePrompt}
                  onChange={(e) => setCustomRoutePrompt(e.target.value)}
                  placeholder="e.g. wire LED cathode to GND"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      runAiAutoRouter(customRoutePrompt);
                    }
                  }}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => runAiAutoRouter(customRoutePrompt)}
                    disabled={isRouting}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    {isRouting ? (
                      <>
                        <span className="animate-spin text-xs">⌛</span>
                        <span>Routing...</span>
                      </>
                    ) : (
                      <>
                        <span>Auto-Route ✨</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      commitObjects(prev => prev.filter(obj => obj.type !== 'circuit-wire'));
                      setAiRoutingMessage(null);
                      speakTextLocal("Cleared all connection wires.");
                    }}
                    disabled={isRouting}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] rounded-xl transition flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    Clear Wires 🧹
                  </button>
                </div>
              </div>

              {aiRoutingMessage && (
                <div className="mt-3 p-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-[10px] text-slate-300 font-medium leading-relaxed max-h-24 overflow-y-auto">
                  <span className="font-extrabold text-amber-400 block mb-0.5">AI Guidance:</span>
                  {aiRoutingMessage}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-slate-800 hidden md:block">
            <p className="font-bold text-xs mb-1">💡 Pro Tips:</p>
            {mode === 'bracelet' ? (
              <ul className="list-disc pl-4 space-y-1.5 mt-2 text-[11px] font-medium leading-relaxed">
                <li>Select the circle shape and drag on the canvas to draw a bead.</li>
                <li>Click a color to dye your beads. Remember to use exactly 2 colors!</li>
                <li>Place your beads in a row and alternate colors (e.g. Red, Blue, Red, Blue) to unlock the 3-star AB pattern!</li>
                <li>Click "Select & Move" to click on any bead to move or scale it.</li>
              </ul>
            ) : (
              <ul className="list-disc pl-4 space-y-1.5 mt-2 text-[11px] font-medium leading-relaxed">
                <li>Select a shape or line tool and drag on the canvas to draw.</li>
                <li>Click "Select & Move" to click on any object to drag and resize it.</li>
                <li>Press the Delete key to remove a selected item.</li>
                <li>Click an electronic part, then click the canvas to place it.</li>
              </ul>
            )}
          </div>
        </div>

        {/* Interactive Canvas Area */}
        <div className="flex-1 relative overflow-auto bg-slate-200">
          <div 
            ref={canvasRef}
            className={`min-w-[1500px] min-h-[1500px] bg-[url('/grid.svg')] bg-repeat bg-white relative overflow-hidden touch-none shadow-sm m-4 ${
              activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <svg className="absolute inset-0 w-full h-full">
            {objects.map(renderObject)}
            {selectionBox && (
              <rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="4 4"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </svg>
          
          {currentPinSelector && (
            <div 
              className="absolute bg-white border border-slate-300 rounded-lg p-3 shadow-xl z-50 flex flex-col gap-2 w-64"
              style={{ left: `${currentPinSelector.x}px`, top: `${currentPinSelector.y}px` }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Select Board Pin</span>
                <button 
                  onClick={() => setPinSelectorQueue(prev => prev.slice(1))}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <AlertCircle size={14} />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1 p-1">
                {['TX', 'RX', '3V3', 'GND_1', '22', '21', '23', '19', '18', '5', '4', '2', '0', 'RST', 'GND_2', 'VIN_5V', '3V3_2', 'GND_3', '36', '39', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', '15', 'VBAT'].map(pin => (
                  <button
                    key={pin}
                    onClick={() => {
                      commitObjects(prev => {
                        let newObjects = prev.map(obj => {
                          if (obj.id === currentPinSelector.objectId) {
                            const newObj = { ...obj };
                            const board = prev.find(o => o.id === currentPinSelector.boardId);
                            
                            if (currentPinSelector.endpoint === 'start') {
                              newObj.startPin = pin;
                              newObj.startBoardId = currentPinSelector.boardId;
                              if (board) {
                                const coords = getPinCoordinates(board, pin);
                                if (coords) {
                                  newObj.x1 = coords.x;
                                  newObj.y1 = coords.y;
                                }
                              }
                            } else {
                              newObj.endPin = pin;
                              newObj.endBoardId = currentPinSelector.boardId;
                              if (board) {
                                const coords = getPinCoordinates(board, pin);
                                if (coords) {
                                  newObj.x2 = coords.x;
                                  newObj.y2 = coords.y;
                                }
                              }
                            }
                            return newObj;
                          }
                          return obj;
                        });
                        
                        // Recalculate routes for circuit-wire
                        const wire = newObjects.find(o => o.id === currentPinSelector.objectId);
                        if (wire && wire.type === 'circuit-wire') {
                           const obstacles = newObjects.filter(o => o.type === 'component' && o.componentType !== 'wire');
                           newObjects = newObjects.map(obj => {
                              if (obj.id === currentPinSelector.objectId) {
                                 const startDir = getPinDirection(obj.startBoardId, obj.startPin); 
                                 const endDir = getPinDirection(obj.endBoardId, obj.endPin);
                                 return {
                                   ...obj,
                                   waypoints: routeWireManhattan(
                                      obj.x1 ?? 0, obj.y1 ?? 0,
                                      obj.x2 ?? 0, obj.y2 ?? 0,
                                      startDir, endDir,
                                      obstacles, obj.startBoardId, obj.endBoardId,
                                      obj.id,
                                      prev.filter(o => o.type === 'circuit-wire') as any[]
                                   )
                                 };
                              }
                              return obj;
                           });
                        }
                        
                        return newObjects;
                      });
                      setPinSelectorQueue(prev => prev.slice(1));
                    }}
                    className="text-[10px] py-1 px-2 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 font-mono font-medium text-slate-600 transition-colors"
                  >
                    {pin.replace(/_\d+$/, '')}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {inlineTextPos && (
            <div 
              className="absolute bg-white border-2 border-indigo-600 rounded-lg p-2 shadow-lg flex items-center gap-1.5 z-50"
              style={{ left: `${inlineTextPos.x}px`, top: `${inlineTextPos.y - 30}px` }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input 
                type="text" 
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-indigo-600 w-36 font-bold text-slate-800"
                value={inlineTextVal}
                onChange={(e) => setInlineTextVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (inlineTextVal.trim()) {
                      const newText: CanvasObject = {
                        id: Date.now().toString(),
                        type: 'text',
                        x: inlineTextPos.x,
                        y: inlineTextPos.y,
                        width: 0,
                        height: 0,
                        color: currentColor,
                        strokeWidth: currentStrokeWidth,
                        text: inlineTextVal.trim(),
                        fontSize: 24,
                      };
                      commitObjects(prev => [...prev, newText]);
                      setSelectedIds([newText.id]);
                    }
                    setInlineTextPos(null);
                    setInlineTextVal('');
                    setActiveTool('select');
                  } else if (e.key === 'Escape') {
                    setInlineTextPos(null);
                    setActiveTool('select');
                  }
                }}
                autoFocus
                placeholder="Type here..."
              />
              <button 
                onClick={() => {
                  if (inlineTextVal.trim()) {
                    const newText: CanvasObject = {
                      id: Date.now().toString(),
                      type: 'text',
                      x: inlineTextPos.x,
                      y: inlineTextPos.y,
                      width: 0,
                      height: 0,
                      color: currentColor,
                      strokeWidth: currentStrokeWidth,
                      text: inlineTextVal.trim(),
                      fontSize: 24,
                    };
                    commitObjects(prev => [...prev, newText]);
                    setSelectedIds([newText.id]);
                  }
                  setInlineTextPos(null);
                  setInlineTextVal('');
                  setActiveTool('select');
                }}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
              >
                Done
              </button>
              <button 
                onClick={() => {
                  setInlineTextPos(null);
                  setActiveTool('select');
                }}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
              >
                ✖
              </button>
            </div>
          )}
          

          
          {objects.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-300 font-black text-xs uppercase tracking-widest text-center">
                {mode === 'bracelet' ? 'Place shape beads to design your bracelet!' : 'Select a tool or component to start creating!'}
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Right Sidebar - Automatic Grading & Achievements */}
        {showActivities && (
          <div className="w-full md:w-72 bg-slate-50 border-t-2 md:border-t-0 md:border-l-2 border-slate-100 p-4 flex flex-col justify-between overflow-y-auto shrink-0" id="workstation-right-sidebar">
            {mode === 'general' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider">Workstation Tasks</h3>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <p className="text-[11px] font-bold text-indigo-950 leading-relaxed">
                  Complete these 4 foundational activities. They contribute <span className="font-black">5% to your final Week 7 marks</span> and unlock Week 7!
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-black text-indigo-700">
                  <span>Tasks Done:</span>
                  <span>{completedActivityIds.length} / 4 Completed</span>
                </div>
                <div className="mt-1.5 w-full bg-indigo-200/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${(completedActivityIds.length / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Incomplete Tasks list (disappear as learner completes them) */}
              <div className="space-y-3">
                {TERM_WORKSTATION_ACTIVITIES.filter(act => !completedActivityIds.includes(act.id)).map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/20 transition duration-150 flex flex-col gap-2 cursor-pointer group"
                    onClick={() => speakTextLocal(`${act.title}. ${act.description}`)}
                    title="Click to hear instruction read aloud!"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0 mt-0.5">{act.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black text-slate-800 leading-snug">{act.title}</p>
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{act.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleCompleteActivity(act.id); }}
                      disabled={checkingActivityId !== null}
                      className={`w-full py-1.5 text-white font-extrabold rounded-lg text-[10px] transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                        checkingActivityId === act.id 
                          ? 'bg-slate-500 cursor-not-allowed animate-pulse' 
                          : checkingActivityId !== null 
                            ? 'bg-indigo-400 opacity-50 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {checkingActivityId === act.id ? (
                        <>
                          <span className="inline-block animate-spin mr-1">⌛</span>
                          <span>AI Checking... 🤖</span>
                        </>
                      ) : (
                        <>
                          <span>Check & Complete</span>
                          <span>✨</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}

                {completedActivityIds.length === 4 && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2 animate-bounce">
                    <span className="text-3xl block">🎉</span>
                    <p className="text-xs font-black text-emerald-950">All 4 Tasks Completed!</p>
                    <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                      Magnificent job, champion! You have earned your 5% workstation mark. <span className="font-bold font-extrabold">Week 7 Beaded Bracelet Designer</span> is now fully unlocked in your Curriculum Map!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Automatic Design Grader</h3>
              </div>

              {/* Dynamic Star Meter */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-5 text-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  {isLocked && certifiedScore !== null ? 'AI Tutor Final Grade' : 'Estimated CAPS Grade'}
                </p>
                <div className="flex justify-center flex-wrap gap-1 mb-2">
                  {(mode === 'bracelet' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3]).map((starVal) => {
                    const isActive = (isLocked && certifiedScore !== null ? certifiedScore : earnedStars) >= starVal;
                    return (
                      <Star 
                        key={starVal} 
                        className={`transition-all ${
                          mode === 'bracelet' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-10 h-10 scale-110'
                        } ${
                          isActive 
                          ? 'fill-amber-400 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]' 
                          : 'text-slate-200 fill-transparent'
                        }`} 
                      />
                    );
                  })}
                </div>
                <p className="text-xs font-black text-slate-700">
                  {isLocked && certifiedScore !== null ? (
                    <span className="text-emerald-600 font-black">✨ {certifiedScore}-Star (Grade Certified!) ✨</span>
                  ) : mode === 'bracelet' ? (
                    earnedStars === 10 ? (
                      <span className="text-emerald-600 font-black">✨ 10-Star (Gold Excellence!) ✨</span>
                    ) : earnedStars >= 7 ? (
                      <span className="text-amber-600 font-black">⭐ {earnedStars}-Star (Great Progress!)</span>
                    ) : earnedStars >= 3 ? (
                      <span className="text-indigo-600 font-black">⭐ {earnedStars}-Star (Basic Design)</span>
                    ) : (
                      <span className="text-slate-400 font-bold">Place items to start grading!</span>
                    )
                  ) : (
                    earnedStars === 3 ? (
                      <span className="text-emerald-600 font-black">✨ 3-Star (Gold Excellence!) ✨</span>
                    ) : earnedStars === 2 ? (
                      <span className="text-amber-600 font-black">⭐ 2-Star (Great Progress!)</span>
                    ) : earnedStars === 1 ? (
                      <span className="text-indigo-600 font-black">⭐ 1-Star (Basic Design)</span>
                    ) : (
                      <span className="text-slate-400 font-bold">Place items to start grading!</span>
                    )
                  )}
                </p>
              </div>

              {/* Achievement / Grading Checklist */}
              <div className="space-y-3">
                {/* Rule 1: Shape Creator */}
                <div className={`p-3 rounded-xl border transition-all ${objectCount >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${objectCount >= 3 ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        {mode === 'bracelet' ? 'Bead Collector (3 Stars)' : 'Shape Creator (1 Star)'}
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {mode === 'bracelet' ? 'Add 3 or more beads to your bracelet design.' : 'Add 3 or more shapes, lines, or parts to your canvas.'}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5 bg-black/5 inline-block px-1.5 py-0.5 rounded text-slate-800">
                        Progress: {objectCount} / 3 items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rule 2: Color Variety or AB Color Pairing */}
                {mode === 'bracelet' ? (
                  <div className={`p-3 rounded-xl border transition-all ${uniqueColors.length === 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${uniqueColors.length === 2 ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-900">AB Color Pairing (7 Stars)</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Use exactly 2 alternating colors (A and B) on your bracelet (e.g. Red and Blue).</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5 bg-black/5 inline-block px-1.5 py-0.5 rounded text-slate-800">
                          Progress: {uniqueColors.length} / 2 colors {uniqueColors.length === 2 ? '✨ Perfect!' : uniqueColors.length > 2 ? '❌ Too many colors for AB pattern!' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl border transition-all ${uniqueColors.length >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${uniqueColors.length >= 3 ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-900">Master Artist (2 Stars)</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Use 3 or more different colors in your designs.</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5 bg-black/5 inline-block px-1.5 py-0.5 rounded text-slate-800">
                          Progress: {uniqueColors.length} / 3 colors
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rule 3: Pattern Maker (For Bracelet Design!) */}
                <div className={`p-3 rounded-xl border transition-all ${hasPattern ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${hasPattern ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        {mode === 'bracelet' ? 'AB Pattern Maker (10 Stars!)' : 'Pattern Maker (3 Stars!)'}
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {mode === 'bracelet' 
                          ? 'Place 3+ beads in a row with alternating colors to create a repeating AB pattern (e.g. Red, Blue, Red).'
                          : 'Place 3+ beads (circles, squares, or triangles) in a row with alternating colors (e.g. Red, Blue, Red).'}
                      </p>
                      {hasPattern ? (
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-emerald-700 bg-emerald-100/60 inline-block px-1.5 py-0.5 rounded">
                          Pattern Found: {patternDescription} 🎉
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 italic">
                          Not aligned or alternating yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom guidelines panel */}
          <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold">
            <p className="flex items-center gap-1.5 mb-1 text-amber-950 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Auto-Grading Rules:
            </p>
            <p className="font-medium text-slate-700 leading-relaxed">
              {mode === 'bracelet' 
                ? "Create a repeating color pattern of beads in a row to score maximum Stars!"
                : "Complete each Workstation task to secure your 5% mark and unlock Week 7!"
              }
            </p>
          </div>
        </div>
        )}

      </div>
      ) : (
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row bg-slate-100">
          {/* MicroBlocks & Scratch Hybrid Layout */}
          
          {/* 1. Blocks Toolbox (Left Panel) */}
          <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-col shrink-0 overflow-y-auto select-none">
            <div className="mb-4">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-600" /> Block Toolbox
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Click blocks to append them to your active program stack!</p>
            </div>

            <div className="space-y-4">
              {/* Event Blocks */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1">🎬 Events & Logic</h4>
                <button
                  type="button"
                  onClick={() => {
                    const id = 'block-' + Date.now();
                    setBlocks(prev => [...prev, { id, type: 'when-start', label: '🎬 When program starts', category: 'control' }]);
                    addConsoleLog("➕ Added block: When program starts");
                    speakTextLocal("Added starts block.");
                  }}
                  className="w-full p-2.5 bg-rose-500 hover:bg-rose-600 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                >
                  <span className="text-sm">🎬</span>
                  <span>When program starts</span>
                </button>
              </div>

              {/* Control Blocks */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">⏱️ Timing</h4>
                <button
                  type="button"
                  onClick={() => {
                    const id = 'block-' + Date.now();
                    setBlocks(prev => [...prev, { id, type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '1.0' }]);
                    addConsoleLog("➕ Added block: Wait seconds");
                    speakTextLocal("Added wait block.");
                  }}
                  className="w-full p-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                >
                  <span className="text-sm">⏱️</span>
                  <span>Wait 1.0 second</span>
                </button>
              </div>

              {/* Pins/Output Blocks */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1">🔌 Microcontroller Pins</h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'set-pin-high', label: '🔌 Set Pin HIGH', category: 'output', paramPin: '18' }]);
                      addConsoleLog("➕ Added block: Set Pin HIGH");
                      speakTextLocal("Added set pin high block.");
                    }}
                    className="w-full p-2 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">⚡</span>
                    <span>Set Pin HIGH</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'set-pin-low', label: '🔌 Set Pin LOW', category: 'output', paramPin: '18' }]);
                      addConsoleLog("➕ Added block: Set Pin LOW");
                      speakTextLocal("Added set pin low block.");
                    }}
                    className="w-full p-2 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">🔌</span>
                    <span>Set Pin LOW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '18' }]);
                      addConsoleLog("➕ Added block: Toggle Pin");
                      speakTextLocal("Added toggle block.");
                    }}
                    className="w-full p-2 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">🔄</span>
                    <span>Toggle Pin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'spin-motor', label: '⚙️ Spin Motor on Pin', category: 'actuator', paramPin: '2', paramValue: '100' }]);
                      addConsoleLog("➕ Added block: Spin Motor on Pin");
                      speakTextLocal("Added motor block.");
                    }}
                    className="w-full p-2 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">⚙️</span>
                    <span>Spin Motor on Pin</span>
                  </button>
                </div>
              </div>

              {/* Scratch Motion Blocks */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">🏃 Scratch Sprite Motion</h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '30' }]);
                      addConsoleLog("➕ Added block: Move steps");
                      speakTextLocal("Added move steps block.");
                    }}
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">🏃</span>
                    <span>Move 30 steps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '15' }]);
                      addConsoleLog("➕ Added block: Turn Right");
                      speakTextLocal("Added turn right block.");
                    }}
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">↪️</span>
                    <span>Turn Right 15°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'turn-left', label: '↩️ Turn Left degrees', category: 'motion', paramValue: '15' }]);
                      addConsoleLog("➕ Added block: Turn Left");
                      speakTextLocal("Added turn left block.");
                    }}
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">↩️</span>
                    <span>Turn Left 15°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'go-to-xy', label: '📍 Go to X: Y:', category: 'motion', paramX: '0', paramY: '0' }]);
                      addConsoleLog("➕ Added block: Go to X: Y:");
                      speakTextLocal("Added navigation block.");
                    }}
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">📍</span>
                    <span>Go to X: 0 Y: 0</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'bounce', label: '💥 If on edge, bounce', category: 'motion' }]);
                      addConsoleLog("➕ Added block: Edge Bounce");
                      speakTextLocal("Added bounce block.");
                    }}
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">💥</span>
                    <span>If on edge, bounce</span>
                  </button>
                </div>
              </div>

              {/* Scratch Looks, Drawing & Pen Blocks */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">🎨 Pen & Looks</h4>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const id = 'block-' + Date.now();
                        setBlocks(prev => [...prev, { id, type: 'pen-down', label: '✏️ Pen DOWN', category: 'looks' }]);
                        addConsoleLog("➕ Added block: Pen Down");
                        speakTextLocal("Added pen down.");
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-3xs"
                    >
                      <span>✏️ Down</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const id = 'block-' + Date.now();
                        setBlocks(prev => [...prev, { id, type: 'pen-up', label: '✏️ Pen UP', category: 'looks' }]);
                        addConsoleLog("➕ Added block: Pen Up");
                        speakTextLocal("Added pen up.");
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-3xs"
                    >
                      <span>✏️ Up</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'set-pen-color', label: '🎨 Set Pen Color', category: 'looks', paramValue: '#fbbf24' }]);
                      addConsoleLog("➕ Added block: Set Pen Color");
                      speakTextLocal("Added pen color block.");
                    }}
                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">🎨</span>
                    <span>Set Pen Color</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'clear-drawings', label: '🧹 Clear Drawings', category: 'looks' }]);
                      addConsoleLog("➕ Added block: Clear Drawings");
                      speakTextLocal("Added clear drawings block.");
                    }}
                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">🧹</span>
                    <span>Clear Stage Drawings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'say-message', label: '💬 Say message', category: 'looks', paramValue: 'Hello, Sipho! 👋' }]);
                      addConsoleLog("➕ Added block: Say Message");
                      speakTextLocal("Added speech block.");
                    }}
                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">💬</span>
                    <span>Say Hello!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'change-sprite-costume', label: '👗 Switch Costume', category: 'looks', paramValue: 'cute-bot' }]);
                      addConsoleLog("➕ Added block: Switch Costume");
                      speakTextLocal("Added costume switch block.");
                    }}
                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">👗</span>
                    <span>Switch Costume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = 'block-' + Date.now();
                      setBlocks(prev => [...prev, { id, type: 'set-sprite-size', label: '📏 Set Sprite size', category: 'looks', paramValue: '100' }]);
                      addConsoleLog("➕ Added block: Set Sprite Size");
                      speakTextLocal("Added sprite size block.");
                    }}
                    className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-3xs"
                  >
                    <span className="text-sm">📏</span>
                    <span>Set Sprite Size %</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Blocks Workspace / Active Stack (Center Section) */}
          <div className="flex-1 p-6 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                  🧱 Active Programming Stack
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize, reorder, or delete blocks to control pin voltages</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-3xs">
                  <input
                    type="checkbox"
                    checked={foreverLoop}
                    onChange={(e) => {
                      setForeverLoop(e.target.checked);
                      addConsoleLog(`🔁 Forever Loop toggled: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                      speakTextLocal(e.target.checked ? "Enabled loop forever." : "Run once mode.");
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Loop Program Forever</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setBlocks([
                      { id: 'b1', type: 'when-start', label: '🎬 When program starts', category: 'control' }
                    ]);
                    addConsoleLog("🧹 Program stack cleared.");
                    speakTextLocal("Cleared coding stack.");
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer active:scale-95"
                >
                  Clear Stack
                </button>
              </div>
            </div>

            {/* Visual Block Stack Workspace */}
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs overflow-y-auto flex flex-col min-h-[400px]">
              {blocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <span className="text-4xl mb-3">🧱</span>
                  <p className="text-sm font-bold">Your Coding Space is Empty!</p>
                  <p className="text-xs mt-1 max-w-xs text-slate-400">Click some block templates in the Block Toolbox on the left to start building your program!</p>
                </div>
              ) : (
                <div className="max-w-xl mx-auto w-full flex flex-col gap-1 relative pb-6">
                  {blocks.map((block, index) => {
                    const isActive = isRunningCode && currentBlockIndex === index;
                    
                    // Unified category colors matching block-toolbox exactly
                    let catColor = "bg-slate-500 border-slate-600";
                    if (block.type === 'when-start') {
                      catColor = "bg-rose-500 border-rose-600";
                    } else if (block.type === 'wait') {
                      catColor = "bg-amber-500 border-amber-600 text-slate-950"; // Dark text for high-contrast on amber
                    } else if (block.category === 'motion') {
                      catColor = "bg-blue-500 border-blue-600";
                    } else if (block.category === 'looks') {
                      catColor = "bg-emerald-500 border-emerald-600";
                    } else if (block.category === 'output') {
                      catColor = "bg-violet-500 border-violet-600";
                    } else if (block.category === 'actuator' || block.type === 'spin-motor') {
                      catColor = "bg-orange-500 border-orange-600";
                    }

                    // Is text light or dark? (Amber needs dark text for premium visual contrast and AAA accessibility)
                    const isDarkText = block.type === 'wait';
                    const labelTextColor = isDarkText ? 'text-slate-950' : 'text-white';
                    const secondaryTextColor = isDarkText ? 'text-slate-900/60' : 'text-white/60';
                    const pillBg = isDarkText ? 'bg-black/10' : 'bg-black/20';
                    const inputTextColor = 'text-slate-950';

                    return (
                      <div
                        key={block.id}
                        className={`group relative flex items-center justify-between py-3.5 pl-6 pr-4 ${catColor} ${labelTextColor} rounded-xl border border-black/10 shadow-sm transition-all duration-200 ${
                          isActive 
                            ? 'scale-[1.02] ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.55)] z-10 translate-x-1' 
                            : 'hover:-translate-y-0.5'
                        }`}
                        style={{
                          marginBottom: '4px'
                        }}
                      >
                        {/* 🧩 Real CSS Interlocking Jigsaw Puzzle Tab & Cutout */}
                        {/* Top Notch Cutout (Matches white background) */}
                        <div className="absolute -top-1 left-12 w-8 h-2 bg-white rounded-b-md border-b border-slate-100 z-10" />

                        {/* Bottom Tab (Only if there is a next block to link into) */}
                        {index < blocks.length - 1 && (
                          <div 
                            className="absolute -bottom-2 left-12 w-8 h-2.5 rounded-b-md shadow-xs z-10 border-b border-x border-black/15"
                            style={{ backgroundColor: 'inherit' }}
                          />
                        )}

                        <div className="flex items-center gap-3 flex-1 min-w-0 z-20">
                          <span className={`text-[10px] font-mono font-black ${secondaryTextColor} w-5`}>
                            #{index + 1}
                          </span>
                          
                          {/* Block Contents with unified inline sentence inputs */}
                          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-extrabold">
                            
                            {block.type === 'when-start' && (
                              <div className="flex items-center gap-1.5">
                                <span>🎬 When program starts</span>
                              </div>
                            )}

                            {block.type === 'wait' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>⏱️ Wait</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="number"
                                    min="0.1"
                                    max="10.0"
                                    step="0.1"
                                    value={block.paramValue || '1.0'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-12 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                  <span className={`ml-1 text-[11px] ${labelTextColor}`}>s</span>
                                </div>
                                <span>seconds</span>
                              </div>
                            )}

                            {(block.type === 'set-pin-high' || block.type === 'set-pin-low' || block.type === 'toggle-pin') && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{block.type === 'set-pin-high' ? '⚡ Set Pin' : block.type === 'set-pin-low' ? '🔌 Set Pin' : '🔄 Toggle Pin'}</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg text-xs`}>
                                  <select
                                    value={block.paramPin || '18'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramPin', e.target.value)}
                                    className={`font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400 cursor-pointer`}
                                  >
                                    <option value="18">D18 (LED Anode)</option>
                                    <option value="5">D5 (Yellow LED)</option>
                                    <option value="4">D4 (Red LED)</option>
                                    <option value="2">D2 (Motor Control)</option>
                                  </select>
                                </div>
                                <span>{block.type === 'set-pin-high' ? 'to HIGH (3.3V)' : block.type === 'set-pin-low' ? 'to LOW (0V)' : ''}</span>
                              </div>
                            )}

                            {block.type === 'spin-motor' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>⚙️ Spin Motor on Pin</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg text-xs`}>
                                  <select
                                    value={block.paramPin || '2'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramPin', e.target.value)}
                                    className={`font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs cursor-pointer focus:ring-2 focus:ring-amber-400`}
                                  >
                                    <option value="18">D18</option>
                                    <option value="5">D5</option>
                                    <option value="4">D4</option>
                                    <option value="2">D2 (Motor)</option>
                                  </select>
                                </div>
                                <span>at speed</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="number"
                                    min="10"
                                    max="100"
                                    step="10"
                                    value={block.paramValue || '100'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-10 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                  <span className="ml-0.5">%</span>
                                </div>
                              </div>
                            )}

                            {block.type === 'move-steps' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>🏃 Move</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="number"
                                    min="-100"
                                    max="100"
                                    step="5"
                                    value={block.paramValue || '30'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-12 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                </div>
                                <span>steps</span>
                              </div>
                            )}

                            {(block.type === 'turn-right' || block.type === 'turn-left') && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{block.type === 'turn-right' ? '↪️ Turn Right ↻' : '↩️ Turn Left ↺'}</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="number"
                                    min="1"
                                    max="360"
                                    step="5"
                                    value={block.paramValue || '15'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-12 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                </div>
                                <span>degrees</span>
                              </div>
                            )}

                            {block.type === 'go-to-xy' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>📍 Go to</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg gap-1`}>
                                  <span className={`text-[10px] ${secondaryTextColor}`}>X:</span>
                                  <input
                                    type="number"
                                    min="-180"
                                    max="180"
                                    step="10"
                                    value={block.paramX || '0'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramX', e.target.value)}
                                    className={`w-10 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                  <span className={`text-[10px] ${secondaryTextColor} ml-1`}>Y:</span>
                                  <input
                                    type="number"
                                    min="-130"
                                    max="130"
                                    step="10"
                                    value={block.paramY || '0'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramY', e.target.value)}
                                    className={`w-10 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'bounce' && (
                              <div className="flex items-center gap-1.5">
                                <span>💥 If on edge, bounce</span>
                              </div>
                            )}

                            {block.type === 'pen-down' && (
                              <div className="flex items-center gap-1.5">
                                <span>✏️ Pen DOWN (Enable drawing)</span>
                              </div>
                            )}

                            {block.type === 'pen-up' && (
                              <div className="flex items-center gap-1.5">
                                <span>✏️ Pen UP (Disable drawing)</span>
                              </div>
                            )}

                            {block.type === 'set-pen-color' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>🎨 Set Pen Color to</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg text-xs`}>
                                  <select
                                    value={block.paramValue || '#fbbf24'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400 cursor-pointer`}
                                  >
                                    <option value="#f43f5e">Rose Red 🔴</option>
                                    <option value="#fbbf24">Amber Gold ⭐</option>
                                    <option value="#10b981">Emerald Green 🟢</option>
                                    <option value="#06b6d4">Neon Cyan 🔵</option>
                                    <option value="#4f46e5">Royal Violet 🟣</option>
                                    <option value="#090d16">Cosmic Dark 🌑</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {block.type === 'clear-drawings' && (
                              <div className="flex items-center gap-1.5">
                                <span>🧹 Clear Stage Drawings</span>
                              </div>
                            )}

                            {block.type === 'say-message' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>💬 Say</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="text"
                                    value={block.paramValue || 'Hello!'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-36 h-6 px-1.5 font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'change-sprite-costume' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>👗 Switch Costume to</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg text-xs`}>
                                  <select
                                    value={block.paramValue || 'cute-bot'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400 cursor-pointer`}
                                  >
                                    <option value="cute-bot">Cute Bot 🤖</option>
                                    <option value="rover-bot">Mars Rover 🚜</option>
                                    <option value="ufo-bot">Spaceship UFO 🛸</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {block.type === 'set-sprite-size' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>📏 Set Sprite Size to</span>
                                <div className={`inline-flex items-center ${pillBg} px-1.5 py-0.5 rounded-lg`}>
                                  <input
                                    type="number"
                                    min="30"
                                    max="200"
                                    step="10"
                                    value={block.paramValue || '100'}
                                    onChange={(e) => handleUpdateBlockParam(block.id, 'paramValue', e.target.value)}
                                    className={`w-12 h-6 text-center font-bold bg-white ${inputTextColor} border-none outline-none rounded-md p-0.5 text-xs focus:ring-2 focus:ring-amber-400`}
                                  />
                                  <span className="ml-1">%</span>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
 
                        {/* Block Action Tools */}
                        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity duration-150 shrink-0 ml-4 z-20">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(block.id, 'up')}
                            disabled={index === 0}
                            className={`p-1.5 ${isDarkText ? 'bg-black/10 hover:bg-black/20 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'} rounded-lg cursor-pointer disabled:opacity-20 transition`}
                            title="Move block up"
                          >
                            🔼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(block.id, 'down')}
                            disabled={index === blocks.length - 1}
                            className={`p-1.5 ${isDarkText ? 'bg-black/10 hover:bg-black/20 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'} rounded-lg cursor-pointer disabled:opacity-20 transition`}
                            title="Move block down"
                          >
                            🔽
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg ml-2 cursor-pointer transition shadow-xs"
                            title="Delete block"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. Scratch Simulator Stage, Controller & Retro Terminal (Right Panel) */}
          <div className="w-full lg:w-[420px] bg-slate-900 text-slate-100 p-5 flex flex-col border-l border-slate-800 shrink-0 select-none overflow-y-auto">
            
            {/* Top Bar Controls */}
            <div className="mb-4">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                ⚡ Interactive Stage & Controller
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Control code execution, select presets, and watch the Scratch Robot animate</p>
            </div>

            {/* Run / Stop / Reset Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={startCodeExecution}
                disabled={isRunningCode}
                className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                <span>▶️ Run</span>
              </button>
              <button
                type="button"
                onClick={stopCodeExecution}
                disabled={!isRunningCode}
                className="py-2.5 px-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-rose-950/20 active:scale-95 cursor-pointer"
              >
                <span>⏹️ Stop</span>
              </button>
              <button
                type="button"
                onClick={resetScratchStage}
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <span>🧹 Reset</span>
              </button>
            </div>

            {/* 🌟 SCRATCH INTERACTIVE SIMULATOR STAGE 🌟 */}
            <div className="mb-4 relative overflow-hidden bg-slate-950 border-2 border-slate-800 rounded-2xl w-full aspect-[4/3] shadow-inner flex flex-col">
              {/* Stage Header */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 text-[9px] font-bold text-slate-500 bg-slate-900/60 backdrop-blur-xs px-2 py-1 rounded-md pointer-events-none">
                <span className="text-slate-400">🤖 Scratch Stage Canvas (400 x 300)</span>
                <span className="font-mono text-cyan-400">X: {spriteX.toFixed(0)} Y: {spriteY.toFixed(0)}</span>
              </div>

              {/* Grid Toggle and Costume Badge */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 text-[8px] font-black pointer-events-none">
                <span className="bg-slate-900/80 text-amber-400 px-1.5 py-0.5 rounded uppercase border border-amber-500/20">Costume: {robotCostume}</span>
                <span className="bg-slate-900/80 text-emerald-400 px-1.5 py-0.5 rounded uppercase border border-emerald-500/20">{penActive ? '✏️ Pen DOWN' : '✏️ Pen UP'}</span>
              </div>

              {/* Main Canvas Area */}
              <svg 
                className="w-full h-full flex-1"
                viewBox="0 0 400 300"
                style={{ background: 'radial-gradient(circle at center, #0b1329 0%, #030712 100%)' }}
              >
                <defs>
                  <linearGradient id="ufo-beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                  {/* Subtle grid pattern */}
                  <pattern id="stage-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Draw Coordinate Grid */}
                <rect width="400" height="300" fill="url(#stage-grid)" />

                {/* Center axis crosshairs */}
                <line x1="200" y1="0" x2="200" y2="300" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                {/* Draw Pen Trails */}
                {drawings.map((line, idx) => (
                  <line
                    key={idx}
                    x1={200 + line.x1}
                    y1={150 - line.y1}
                    x2={200 + line.x2}
                    y2={150 - line.y2}
                    stroke={line.color}
                    strokeWidth={line.width}
                    strokeLinecap="round"
                    opacity="0.95"
                    className="transition-all duration-200"
                  />
                ))}

                {/* Render Animated Sprite at (200 + spriteX, 150 - spriteY) */}
                <g 
                  transform={`translate(${200 + spriteX}, ${150 - spriteY}) rotate(${spriteAngle}) scale(${spriteSize / 100})`}
                  className="transition-all duration-200"
                >
                  {/* Outer glow ring around sprite */}
                  <circle cx="0" cy="0" r="25" fill="#38bdf8" opacity="0.05" className="animate-ping" />
                  
                  {/* Costume-specific rendering */}
                  {(() => {
                    if (robotCostume === 'cute-bot') {
                      return (
                        <g>
                          {/* Antenna */}
                          <line x1="0" y1="-25" x2="0" y2="-15" stroke="#94a3b8" strokeWidth="2" />
                          <circle cx="0" cy="-27" r="3" fill="#06b6d4" className="animate-pulse" />
                          {/* Ears */}
                          <rect x="-17" y="-12" width="4" height="8" rx="2" fill="#475569" />
                          <rect x="13" y="-12" width="4" height="8" rx="2" fill="#475569" />
                          {/* Head */}
                          <rect x="-15" y="-15" width="30" height="20" rx="6" fill="#64748b" stroke="#334155" strokeWidth="2" />
                          {/* Eye screen */}
                          <rect x="-10" y="-11" width="20" height="10" rx="3" fill="#1e293b" />
                          {/* Eyes (glow if running) */}
                          <circle cx="-5" cy="-6" r="2.5" fill={isRunningCode ? '#22d3ee' : '#0891b2'} className={isRunningCode ? 'animate-pulse' : ''} />
                          <circle cx="5" cy="-6" r="2.5" fill={isRunningCode ? '#22d3ee' : '#0891b2'} className={isRunningCode ? 'animate-pulse' : ''} />
                          {/* Mouth line */}
                          <path d="M-4 -1 L 4 -1" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                          {/* Body */}
                          <rect x="-12" y="5" width="24" height="18" rx="4" fill="#475569" stroke="#334155" strokeWidth="2" />
                          {/* Heart icon on chest */}
                          <path d="M-3 11 A 2 2 0 0 1 0 9 A 2 2 0 0 1 3 11 L 0 15 Z" fill="#ef4444" />
                          {/* Arms */}
                          <line x1="-12" y1="10" x2="-20" y2="15" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                          <line x1="12" y1="10" x2="20" y2="15" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                          {/* Left Wheel */}
                          <ellipse cx="-8" cy="24" rx="4" ry="3" fill="#1e293b" />
                          {/* Right Wheel */}
                          <ellipse cx="8" cy="24" rx="4" ry="3" fill="#1e293b" />
                        </g>
                      );
                    } else if (robotCostume === 'rover-bot') {
                      return (
                        <g>
                          {/* Solar panels */}
                          <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                          <line x1="-15" y1="-8" x2="-15" y2="-2" stroke="#1d4ed8" strokeWidth="1" />
                          <line x1="15" y1="-8" x2="15" y2="-2" stroke="#1d4ed8" strokeWidth="1" />
                          {/* Camera Mast */}
                          <line x1="0" y1="-5" x2="0" y2="-18" stroke="#64748b" strokeWidth="2" />
                          <rect x="-6" y="-23" width="12" height="6" rx="1" fill="#475569" />
                          <circle cx="0" cy="-20" r="2.5" fill="#ef4444" className={isRunningCode ? 'animate-ping' : ''} />
                          {/* Chassis */}
                          <polygon points="-18,10 -14,-5 14,-5 18,10" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                          {/* Flag */}
                          <line x1="-12" y1="-5" x2="-12" y2="-14" stroke="#94a3b8" strokeWidth="1" />
                          <polygon points="-12,-14 -12,-10 -5,-12" fill="#f43f5e" />
                          {/* Wheels */}
                          <circle cx="-16" cy="15" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                          <circle cx="-6" cy="15" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                          <circle cx="4" cy="15" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                          <circle cx="14" cy="15" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                        </g>
                      );
                    } else {
                      return (
                        <g>
                          {/* Beam path */}
                          {isRunningCode && (
                            <polygon points="-15,10 15,10 25,35 -25,35" fill="url(#ufo-beam-grad)" opacity="0.45" />
                          )}
                          {/* Dome */}
                          <path d="M-12 -2 A 12 12 0 0 1 12 -2 Z" fill="#22d3ee" stroke="#0891b2" strokeWidth="2" opacity="0.8" />
                          {/* Pilot */}
                          <circle cx="0" cy="-6" r="4.5" fill="#84cc16" />
                          <circle cx="-1.5" cy="-7" r="1" fill="#000" />
                          <circle cx="1.5" cy="-7" r="1" fill="#000" />
                          {/* Disc */}
                          <ellipse cx="0" cy="5" rx="24" ry="7" fill="#64748b" stroke="#334155" strokeWidth="2" />
                          <ellipse cx="0" cy="5" rx="18" ry="3" fill="#94a3b8" />
                          {/* Lights */}
                          <circle cx="-12" cy="5" r="2" fill={isRunningCode ? '#fbbf24' : '#d97706'} className={isRunningCode ? 'animate-pulse' : ''} />
                          <circle cx="-4" cy="6" r="2" fill={isRunningCode ? '#ef4444' : '#b91c1c'} className={isRunningCode ? 'animate-pulse' : ''} />
                          <circle cx="4" cy="6" r="2" fill={isRunningCode ? '#3b82f6' : '#1d4ed8'} className={isRunningCode ? 'animate-pulse' : ''} />
                          <circle cx="12" cy="5" r="2" fill={isRunningCode ? '#84cc16' : '#4d7c0f'} className={isRunningCode ? 'animate-pulse' : ''} />
                          {/* Under antenna */}
                          <line x1="0" y1="12" x2="0" y2="18" stroke="#475569" strokeWidth="2" />
                          <circle cx="0" cy="19" r="2" fill="#f43f5e" />
                        </g>
                      );
                    }
                  })()}
                </g>
              </svg>

              {/* HTML Overlay Speech Bubble floating above Robot Sprite */}
              {spriteSay !== null && (
                <div 
                  className="absolute bg-white text-slate-900 border border-slate-300 px-3 py-1.5 rounded-xl font-extrabold text-[11px] shadow-lg pointer-events-none animate-bounce max-w-[160px] leading-snug"
                  style={{
                    left: `calc(50% + ${spriteX}px - 70px)`,
                    bottom: `calc(50% + ${spriteY}px + 30px)`,
                  }}
                >
                  {spriteSay}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                </div>
              )}
            </div>

            {/* Quick Presets Selection */}
            <div className="mb-4 select-none bg-slate-800/55 border border-slate-800 p-3 rounded-2xl">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                📂 Load Preset Templates
              </h4>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBlocks([
                      { id: 'b1', type: 'when-start', label: '🎬 When program starts', category: 'control' },
                      { id: 'b2', type: 'set-pin-high', label: '🔌 Set Pin HIGH', category: 'output', paramPin: '18' },
                      { id: 'b3', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '1.0' },
                      { id: 'b4', type: 'set-pin-low', label: '🔌 Set Pin LOW', category: 'output', paramPin: '18' },
                      { id: 'b5', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '1.0' },
                    ]);
                    setForeverLoop(true);
                    addConsoleLog("📋 Loaded template: LED Blink on Pin D18.");
                    speakTextLocal("Loaded standard blinking LED template.");
                  }}
                  className="py-1.5 px-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl transition cursor-pointer text-center"
                >
                  LED Blink 🔴
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlocks([
                      { id: 'b1', type: 'when-start', label: '🎬 When program starts', category: 'control' },
                      { id: 'b2', type: 'clear-drawings', label: '🧹 Clear Drawings', category: 'looks' },
                      { id: 'b3', type: 'change-sprite-costume', label: '👗 Switch Costume', category: 'looks', paramValue: 'ufo-bot' },
                      { id: 'b4', type: 'go-to-xy', label: '📍 Go to X: Y:', category: 'motion', paramX: '-60', paramY: '20' },
                      { id: 'b5', type: 'set-pen-color', label: '🎨 Set Pen Color', category: 'looks', paramValue: '#fbbf24' },
                      { id: 'b6', type: 'pen-down', label: '✏️ Pen DOWN', category: 'looks' },
                      { id: 'b7', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '120' },
                      { id: 'b8', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '144' },
                      { id: 'b9', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '120' },
                      { id: 'b10', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '144' },
                      { id: 'b11', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '120' },
                      { id: 'b12', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '144' },
                      { id: 'b13', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '120' },
                      { id: 'b14', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '144' },
                      { id: 'b15', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '120' },
                      { id: 'b16', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '144' },
                      { id: 'b17', type: 'pen-up', label: '✏️ Pen UP', category: 'looks' },
                      { id: 'b18', type: 'say-message', label: '💬 Say message', category: 'looks', paramValue: 'I mapped a celestial star! ⭐' },
                    ]);
                    setForeverLoop(false);
                    addConsoleLog("📋 Loaded template: Star Geometry drawing.");
                    speakTextLocal("Loaded star shape template.");
                  }}
                  className="py-1.5 px-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl transition cursor-pointer text-center"
                >
                  Draw Star ⭐
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlocks([
                      { id: 'b1', type: 'when-start', label: '🎬 When program starts', category: 'control' },
                      { id: 'b2', type: 'clear-drawings', label: '🧹 Clear Drawings', category: 'looks' },
                      { id: 'b3', type: 'change-sprite-costume', label: '👗 Switch Costume', category: 'looks', paramValue: 'rover-bot' },
                      { id: 'b4', type: 'set-sprite-size', label: '📏 Set Sprite size', category: 'looks', paramValue: '85' },
                      { id: 'b5', type: 'go-to-xy', label: '📍 Go to X: Y:', category: 'motion', paramX: '-80', paramY: '0' },
                      { id: 'b6', type: 'set-pen-color', label: '🎨 Set Pen Color', category: 'looks', paramValue: '#06b6d4' },
                      { id: 'b7', type: 'pen-down', label: '✏️ Pen DOWN', category: 'looks' },
                      
                      // 8 segments for a circle
                      { id: 'b8', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b9', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b10', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '18' },
                      { id: 'b11', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },
                      
                      { id: 'b12', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b13', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b14', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '5' },
                      { id: 'b15', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b16', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b17', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b18', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '18' },
                      { id: 'b19', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b20', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b21', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b22', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '5' },
                      { id: 'b23', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b24', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b25', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b26', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '18' },
                      { id: 'b27', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b28', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b29', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b30', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '5' },
                      { id: 'b31', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b32', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b33', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b34', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '18' },
                      { id: 'b35', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b36', type: 'move-steps', label: '🏃 Move steps', category: 'motion', paramValue: '40' },
                      { id: 'b37', type: 'turn-right', label: '↪️ Turn Right degrees', category: 'motion', paramValue: '45' },
                      { id: 'b38', type: 'toggle-pin', label: '🔄 Toggle Pin', category: 'output', paramPin: '5' },
                      { id: 'b39', type: 'wait', label: '⏱️ Wait seconds', category: 'control', paramValue: '0.2' },

                      { id: 'b40', type: 'pen-up', label: '✏️ Pen UP', category: 'looks' },
                      { id: 'b41', type: 'say-message', label: '💬 Say message', category: 'looks', paramValue: 'Orbit mapped & telemetry synched!' },
                    ]);
                    setForeverLoop(true);
                    addConsoleLog("📋 Loaded template: Orbiting Rover (Sync pins & coordinates).");
                    speakTextLocal("Loaded combined orbit rover template.");
                  }}
                  className="py-1.5 px-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl transition cursor-pointer text-center"
                >
                  Orbit Rover 🛸
                </button>
              </div>
            </div>

            {/* REAL-TIME CONTROLLER PINS DASHBOARD */}
            <div className="mb-4 bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 select-none">
                Virtual Microcontroller Pin Status
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { pin: '18', desc: 'D18 LED Anode' },
                  { pin: '5', desc: 'D5 Yellow LED' },
                  { pin: '4', desc: 'D4 Red LED' },
                  { pin: '2', desc: 'D2 Motor Output' }
                ].map((pinConfig) => {
                  // Find the first esp32 board object to inspect pin states
                  const esp32 = objects.find(o => o.componentType === 'esp32');
                  const isHigh = !!(esp32?.pinStates?.[pinConfig.pin]);
                  
                  return (
                    <div 
                      key={pinConfig.pin}
                      className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-between gap-1 select-none ${
                        isHigh 
                          ? 'bg-amber-950/30 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-white truncate">{pinConfig.desc}</p>
                        <p className="text-[8px] text-slate-500 mt-0.5 font-mono">Volts: {isHigh ? '3.3V' : '0.0V'}</p>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${
                        isHigh 
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse' 
                          : 'bg-slate-800 border border-slate-700'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retro Terminal Logs Window */}
            <div className="flex-1 min-h-[140px] max-h-[180px] bg-black border border-slate-800 rounded-2xl p-3.5 font-mono text-[9px] text-emerald-400 flex flex-col overflow-hidden shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5 select-none shrink-0">
                <span className="font-bold text-slate-500 uppercase tracking-wider">🔬 Terminal Output Logs</span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-slate-600 hover:text-emerald-400 transition"
                  title="Clear Console"
                >
                  Clear 🧹
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap font-medium break-all">{log}</div>
                ))}
                {isRunningCode && (
                  <div className="text-emerald-500 animate-pulse font-bold">● Running VM Interpreter...</div>
                )}
              </div>
            </div>

            {/* Shortcut prompt to switch back to designer */}
            <div className="mt-3 p-2 bg-slate-800/20 border border-slate-800/30 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setWorkstationTab('designer')}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition underline cursor-pointer"
              >
                ← Go back to Circuit Designer to draw connection wires!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

