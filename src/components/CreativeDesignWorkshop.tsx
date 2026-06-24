import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  Play, 
  Image as ImageIcon, 
  Palette, 
  Eraser, 
  PenTool, 
  Move, 
  CheckCircle, 
  Camera,
  RotateCcw,
  Zap,
  RotateCw,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Award,
  Maximize2
} from 'lucide-react';

// Web Audio API Sound Generator for playful Foundation Phase feedback
const playSynthesizerSound = (type: 'pop' | 'power_on' | 'chime' | 'boop' | 'draw' | 'erase') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'power_on') {
      // Ascending cosmic sweeps
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        const startFreq = 220 * (i + 1);
        osc.frequency.setValueAtTime(startFreq, now + i * 0.1);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, now + i * 0.1 + 0.3);
        gain.gain.setValueAtTime(0.08, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.35);
      }
    } else if (type === 'chime') {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === 'boop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'draw') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'erase') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (err) {
    console.error('Audio context error:', err);
  }
};

interface WorkshopPart {
  id: string;
  templateId: string;
  type: string;
  label: string;
  img: string; // Emoji representing the physical item
  category: 'robot' | 'shapes' | 'accessories';
  x: number;
  y: number;
  color: string; // Crayon paint color (e.g. #ef4444)
  colorName: string; // Friendly color name
  size: number; // Scale factor (0.5 to 2.0)
  rotation: number; // Degrees (0 to 360)
  isBouncing?: boolean;
}

interface PartTemplate {
  id: string;
  label: string;
  img: string;
  category: 'robot' | 'shapes' | 'accessories';
}

interface SketchStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface SavedCreation {
  id: string;
  title: string;
  backdrop: 'grid' | 'space' | 'toy' | 'underwater';
  items: WorkshopPart[];
  strokes: SketchStroke[];
  timestamp: string;
}

export default function CreativeDesignWorkshop({ 
  speakText, 
  onComplete 
}: { 
  speakText: (t: string) => void; 
  onComplete?: (stars: number) => void; 
}) {
  // Canvas configuration
  const [backdrop, setBackdrop] = useState<'grid' | 'space' | 'toy' | 'underwater'>('grid');
  const [selectedTool, setSelectedTool] = useState<'grab' | 'pencil' | 'brush' | 'eraser'>('grab');
  const [crayonColor, setCrayonColor] = useState<string>('#ef4444'); // Default Red Crayon
  const [crayonName, setCrayonName] = useState<string>('Red');

  // Assembly Parts State
  const [placedItems, setPlacedItems] = useState<WorkshopPart[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Freehand Sketching State
  const [strokes, setStrokes] = useState<SketchStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<{ x: number; y: number }[] | null>(null);
  const isDrawing = useRef(false);

  // Creative Workshop Features
  const [isPowerOn, setIsPowerOn] = useState<boolean>(false);
  const [gallery, setGallery] = useState<SavedCreation[]>([]);
  const [activeTab, setActiveTab] = useState<'robot' | 'shapes' | 'accessories'>('robot');
  const [customTitle, setCustomTitle] = useState<string>('My Mechanical Robot');

  // References
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Part Templates Database
  const templates: PartTemplate[] = [
    // --- Robot Organ Parts ---
    { id: 'head_retro', label: 'Retro Bot Head', img: '🤖', category: 'robot' },
    { id: 'head_screen', label: 'Smart TV Screen', img: '📺', category: 'robot' },
    { id: 'head_bulb', label: 'Idea Bulb Head', img: '💡', category: 'robot' },
    { id: 'head_radar', label: 'UFO Radar Dome', img: '🛸', category: 'robot' },
    { id: 'body_circuit', label: 'Circuit CPU Core', img: '🔌', category: 'robot' },
    { id: 'body_battery', label: 'Power Battery', img: '🔋', category: 'robot' },
    { id: 'body_gear', label: 'Gearbox Chest', img: '⚙️', category: 'robot' },
    { id: 'body_container', label: 'Cardboard Box', img: '📦', category: 'robot' },
    { id: 'drive_wheel', label: 'Robo Wheel', img: '⚙️', category: 'robot' },
    { id: 'drive_tread', label: 'Tractor Treads', img: '🚜', category: 'robot' },
    { id: 'drive_legs', label: 'Hydraulic Legs', img: '🦵', category: 'robot' },
    { id: 'drive_rocket', label: 'Rocket Booster', img: '🚀', category: 'robot' },
    { id: 'sonar_eye', label: 'Big Sensor Eye', img: '👁️', category: 'robot' },
    { id: 'antenna_dish', label: 'Satellite Dish', img: '📡', category: 'robot' },

    // --- Shapes & Building Blocks ---
    { id: 'shape_star', label: 'Golden Star', img: '⭐', category: 'shapes' },
    { id: 'shape_heart', label: 'Love Heart', img: '❤️', category: 'shapes' },
    { id: 'shape_gem', label: 'Shiny Gem', img: '💎', category: 'shapes' },
    { id: 'shape_red', label: 'Red Bead', img: '🔴', category: 'shapes' },
    { id: 'shape_yellow', label: 'Yellow Bead', img: '🟡', category: 'shapes' },
    { id: 'shape_blue', label: 'Blue Bead', img: '🔵', category: 'shapes' },
    { id: 'shape_green', label: 'Green Bead', img: '🟢', category: 'shapes' },

    // --- Toys & Fun Extras ---
    { id: 'acc_crown', label: 'Crown', img: '👑', category: 'accessories' },
    { id: 'acc_hat', label: 'Wizard Hat', img: '🎩', category: 'accessories' },
    { id: 'acc_shades', label: 'Cool Shades', img: '🕶️', category: 'accessories' },
    { id: 'acc_flag', label: 'Pirate Flag', img: '🏴‍☠️', category: 'accessories' },
    { id: 'acc_balloon', label: 'Party Balloon', img: '🎈', category: 'accessories' },
    { id: 'acc_bow', label: 'Pretty Bow', img: '🎀', category: 'accessories' },
    { id: 'acc_dino', label: 'Dino Buddy', img: '🦖', category: 'accessories' },
  ];

  const crayons = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#facc15' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Gold', hex: '#fbbf24' },
  ];

  // Welcome announcement when workshop first mounts
  useEffect(() => {
    speakText(
      "Welcome to your Week 7 Design Workshop Area! This is a very special place where you are the creator. Choose a backdrop scene, drag and drop cool robot parts, sketch with pencils, and paint with crayons to assemble whatever you imagine! Click Power On to watch it wiggle!"
    );
  }, []);

  // Sync sketch canvas drawing resolution
  const syncCanvasResolution = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  useEffect(() => {
    syncCanvasResolution();
    window.addEventListener('resize', syncCanvasResolution);
    return () => window.removeEventListener('resize', syncCanvasResolution);
  }, []);

  // Imperative canvas drawing loop for freehand strokes
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all historic strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Draw active stroke
    if (activeStroke && activeStroke.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = crayonColor;
      ctx.lineWidth = selectedTool === 'brush' ? 12 : 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(activeStroke[0].x, activeStroke[0].y);
      for (let i = 1; i < activeStroke.length; i++) {
        ctx.lineTo(activeStroke[i].x, activeStroke[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, activeStroke, crayonColor, selectedTool]);

  // Unified coordinates extractor for mouse and touch inputs
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const container = canvasContainerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        return null;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.max(0, Math.min(rect.width, clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, clientY - rect.top))
    };
  };

  // Click handler to select and add elements from catalog
  const handleAddPartToCanvas = (tpl: PartTemplate) => {
    playSynthesizerSound('pop');
    const newPart: WorkshopPart = {
      id: `${tpl.id}_${Date.now()}`,
      templateId: tpl.id,
      type: tpl.id,
      label: tpl.label,
      img: tpl.img,
      category: tpl.category,
      x: 180 + Math.random() * 40,
      y: 150 + Math.random() * 40,
      color: '',
      colorName: '',
      size: 1.0,
      rotation: 0
    };

    setPlacedItems(prev => [...prev, newPart]);
    setSelectedItemId(newPart.id);
    speakText(`Added ${tpl.label} to the workspace canvas.`);
  };

  // Drag and drop event listeners
  const handleCanvasStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (selectedTool === 'pencil' || selectedTool === 'brush') {
      isDrawing.current = true;
      setActiveStroke([{ x: coords.x, y: coords.y }]);
      playSynthesizerSound('draw');
    } else {
      // Find if we clicked/tapped on a placed part (bounding check around coordinate radius)
      // Check from top to bottom (reverse array) so we hit the uppermost item first
      const itemsReversed = [...placedItems].reverse();
      const clickedItem = itemsReversed.find(item => {
        const dist = Math.hypot(item.x - coords.x, item.y - coords.y);
        return dist <= 32 * item.size; // radius check
      });

      if (clickedItem) {
        e.preventDefault();
        setSelectedItemId(clickedItem.id);
        
        if (selectedTool === 'eraser') {
          playSynthesizerSound('erase');
          setPlacedItems(prev => prev.filter(it => it.id !== clickedItem.id));
          setSelectedItemId(null);
          speakText(`Erased ${clickedItem.label}.`);
        } else {
          setDraggingItemId(clickedItem.id);
          dragOffset.current = {
            x: coords.x - clickedItem.x,
            y: coords.y - clickedItem.y
          };
          playSynthesizerSound('pop');
        }
      } else {
        // Clicked empty canvas space
        setSelectedItemId(null);
      }
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (isDrawing.current && (selectedTool === 'pencil' || selectedTool === 'brush')) {
      setActiveStroke(prev => prev ? [...prev, { x: coords.x, y: coords.y }] : [{ x: coords.x, y: coords.y }]);
      if (Math.random() < 0.15) {
        playSynthesizerSound('draw');
      }
    } else if (draggingItemId) {
      e.preventDefault();
      setPlacedItems(prev => prev.map(item => {
        if (item.id === draggingItemId) {
          return {
            ...item,
            x: coords.x - dragOffset.current.x,
            y: coords.y - dragOffset.current.y
          };
        }
        return item;
      }));
    }
  };

  const handleCanvasEnd = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      if (activeStroke && activeStroke.length > 1) {
        const newStroke: SketchStroke = {
          points: activeStroke,
          color: crayonColor,
          width: selectedTool === 'brush' ? 12 : 4
        };
        setStrokes(prev => [...prev, newStroke]);
      }
      setActiveStroke(null);
    }
    setDraggingItemId(null);
  };

  // Coloring crayon logic
  const handleSelectCrayon = (crayon: { name: string; hex: string }) => {
    playSynthesizerSound('pop');
    setCrayonColor(crayon.hex);
    setCrayonName(crayon.name);

    if (selectedItemId) {
      // Paint the selected item!
      setPlacedItems(prev => prev.map(item => {
        if (item.id === selectedItemId) {
          speakText(`Painted ${item.label} with the shiny ${crayon.name} crayon!`);
          return {
            ...item,
            color: crayon.hex,
            colorName: crayon.name
          };
        }
        return item;
      }));
    } else {
      speakText(`Selected the ${crayon.name} crayon for sketching.`);
    }
  };

  // Item modification controls (Rotate, Resize, Delete)
  const handleRotateSelected = (dir: 'cw' | 'ccw') => {
    if (!selectedItemId) return;
    playSynthesizerSound('pop');
    setPlacedItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        const delta = dir === 'cw' ? 30 : -30;
        return {
          ...item,
          rotation: (item.rotation + delta + 360) % 360
        };
      }
      return item;
    }));
  };

  const handleResizeSelected = (dir: 'up' | 'down') => {
    if (!selectedItemId) return;
    playSynthesizerSound('pop');
    setPlacedItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        const delta = dir === 'up' ? 0.15 : -0.15;
        const newSize = Math.max(0.5, Math.min(2.0, item.size + delta));
        return {
          ...item,
          size: parseFloat(newSize.toFixed(2))
        };
      }
      return item;
    }));
  };

  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    playSynthesizerSound('erase');
    const match = placedItems.find(it => it.id === selectedItemId);
    setPlacedItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
    if (match) speakText(`Erased ${match.label}.`);
  };

  const handleClearAll = () => {
    playSynthesizerSound('erase');
    setPlacedItems([]);
    setStrokes([]);
    setSelectedItemId(null);
    setIsPowerOn(false);
    speakText("Cleared the whole workshop canvas. Let's build a brand new design!");
  };

  // Fun Power On Mechanism
  const handleTogglePower = () => {
    if (!isPowerOn) {
      playSynthesizerSound('power_on');
      setIsPowerOn(true);
      speakText("POWER ON! Watch your machine wiggle, bounce, and light up! You are a brilliant robotic design engineer!");
    } else {
      playSynthesizerSound('boop');
      setIsPowerOn(false);
      speakText("Power shut down. Let's keep refining our assembly prototype.");
    }
  };

  // Take photo and save to polaroid gallery
  const handleTakePhoto = () => {
    if (placedItems.length === 0 && strokes.length === 0) {
      playSynthesizerSound('boop');
      speakText("Your canvas is empty! Add some robot parts or sketch lines first, then take a photo!");
      return;
    }

    playSynthesizerSound('chime');
    const id = `photo_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Choose a random playful caption for young learners
    const captions = [
      "Turbo Star Hopper",
      "Sipho's Helper Bot",
      "Space Lab Cruiser",
      "My Magic Maker Hand",
      "Mega Dream Machine",
      "Zola's Sea Explorer"
    ];
    const chosenCaption = captions[Math.floor(Math.random() * captions.length)];

    const newCreation: SavedCreation = {
      id,
      title: `${chosenCaption} (${timestamp})`,
      backdrop,
      items: JSON.parse(JSON.stringify(placedItems)),
      strokes: JSON.parse(JSON.stringify(strokes)),
      timestamp
    };

    setGallery(prev => [newCreation, ...prev].slice(0, 4)); // Keep up to 4 polaroids
    speakText(`SAY CHEESE! 📸 Click! Photo saved to your workshop folder as ${chosenCaption}!`);
  };

  const handleRestoreCreation = (creation: SavedCreation) => {
    playSynthesizerSound('chime');
    setBackdrop(creation.backdrop);
    setPlacedItems(JSON.parse(JSON.stringify(creation.items)));
    setStrokes(JSON.parse(JSON.stringify(creation.strokes)));
    setSelectedItemId(null);
    speakText(`Restored your design: ${creation.title}! Let's keep building!`);
  };

  // Submit and Complete activity with assessment triggers
  const handleSubmitDesign = () => {
    if (placedItems.length < 3) {
      playSynthesizerSound('boop');
      speakText("Let's add at least three different parts to complete our design session!");
      return;
    }

    playSynthesizerSound('chime');
    speakText("Spectacular engineering design! Your workshop model is fully certified. Awarding three stars! Let's show the teacher!");
    if (onComplete) {
      onComplete(3);
    }
  };

  // Select dynamic background class
  const getBackdropClass = () => {
    switch (backdrop) {
      case 'space':
        return 'bg-slate-950 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] border-indigo-950';
      case 'toy':
        return 'bg-amber-50/60 bg-[radial-gradient(#fde047_1.5px,transparent_1.5px)] [background-size:24px_24px] border-amber-200';
      case 'underwater':
        return 'bg-gradient-to-b from-sky-400 to-blue-900 border-sky-300';
      default: // Blueprint grid
        return 'bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] border-slate-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-3xl border-2 border-indigo-100 shadow-sm animate-in fade-in duration-300" id="design-workshop-activity">
      
      {/* Workshop Title Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-indigo-100/60 pb-4 mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full">
            Strand R.5: Design & Build Workshop 🛠️
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
            Zola's Creative Build & Sketch Lab
          </h2>
        </div>
        <div className="text-right text-xs text-slate-500 font-bold max-w-xs md:text-right text-left leading-relaxed">
          🏆 R T1 W7: Non-linear interactive workshop sandbox. Be free, build anything!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* --- LEFT PANEL: TOOLBARS, PALETTES & PARTS BIN (5 Cols) --- */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Backdrop Scene selector */}
          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-3xs space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> 1. Pick Workshop Location
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'grid', emoji: '📐', label: 'Blue Grid' },
                { id: 'space', emoji: '🚀', label: 'Outer Space' },
                { id: 'toy', emoji: '🏡', label: 'Toy Room' },
                { id: 'underwater', emoji: '🐠', label: 'Sea Base' }
              ].map(scene => (
                <button
                  key={scene.id}
                  onClick={() => { playSynthesizerSound('pop'); setBackdrop(scene.id as any); speakText(`Moved base to ${scene.label}`); }}
                  className={`py-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition ${
                    backdrop === scene.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-black scale-102 ring-2 ring-indigo-300' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                  }`}
                >
                  <span className="text-lg">{scene.emoji}</span>
                  <span className="text-[8px] font-bold">{scene.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sketch & Drag tools */}
          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-3xs space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5" /> 2. Choose Builder Tool
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'grab', icon: <Move className="w-4 h-4" />, label: 'Drag Part' },
                { id: 'pencil', icon: <PenTool className="w-4 h-4" />, label: 'Draw' },
                { id: 'brush', icon: <Palette className="w-4 h-4" />, label: 'Paint' },
                { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Erase' }
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => { playSynthesizerSound('pop'); setSelectedTool(tool.id as any); speakText(`Tool set to ${tool.label}`); }}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                    selectedTool === tool.id 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-black' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {tool.icon}
                  <span className="text-[9px] font-bold">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Crayon palette */}
          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-3xs space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> 3. Select Crayon (Coloring)
            </h4>
            <div className="flex flex-wrap gap-1.5 justify-center py-1 bg-slate-50 rounded-xl border border-slate-100">
              {crayons.map(crayon => (
                <button
                  key={crayon.name}
                  onClick={() => handleSelectCrayon(crayon)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-3xs hover:scale-110 active:scale-95 border-2 ${
                    crayonColor === crayon.hex ? 'border-indigo-600 scale-110 ring-2 ring-indigo-300' : 'border-white'
                  }`}
                  style={{ backgroundColor: crayon.hex }}
                  title={crayon.name}
                >
                  {crayonColor === crayon.hex && <span className="text-[10px] text-white">🖍️</span>}
                </button>
              ))}
            </div>
            {selectedItemId ? (
              <p className="text-[9px] font-bold text-indigo-600 text-center animate-pulse">
                ✨ Tap a crayon to paint your SELECTED part!
              </p>
            ) : (
              <p className="text-[9px] font-medium text-slate-400 text-center">
                Paints freehand strokes or selected parts. Current crayon: <b>{crayonName}</b>
              </p>
            )}
          </div>

          {/* Parts Catalog bin */}
          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-3xs flex-1 flex flex-col min-h-[180px] space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                📦 4. Add items to assembly
              </h4>
              <div className="flex gap-1.5">
                {[
                  { id: 'robot', label: 'Bots 🤖' },
                  { id: 'shapes', label: 'Shapes ⭐' },
                  { id: 'accessories', label: 'Extras 👑' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { playSynthesizerSound('pop'); setActiveTab(tab.id as any); }}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg cursor-pointer transition ${
                      activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-3xs' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid scrollable list */}
            <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin pr-1">
              <div className="grid grid-cols-4 gap-2">
                {templates
                  .filter(t => t.category === activeTab)
                  .map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleAddPartToCanvas(tpl)}
                      className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition duration-150 cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-2xl select-none">{tpl.img}</span>
                      <span className="text-[8px] font-bold text-slate-500 text-center leading-tight truncate w-full">
                        {tpl.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT PANEL: THE WORKSPACE CANVAS (7 Cols) --- */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Canvas Viewport frame */}
          <div 
            ref={canvasContainerRef}
            onMouseDown={handleCanvasStart}
            onMouseMove={handleCanvasMove}
            onMouseUp={handleCanvasEnd}
            onMouseLeave={handleCanvasEnd}
            onTouchStart={handleCanvasStart}
            onTouchMove={handleCanvasMove}
            onTouchEnd={handleCanvasEnd}
            className={`w-full h-[360px] rounded-3xl border-4 shadow-md overflow-hidden relative cursor-crosshair select-none transition-all duration-300 ${getBackdropClass()}`}
          >
            {/* Sketching Canvas Overlay */}
            <canvas 
              ref={drawingCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-5"
            />

            {/* Interactive Underwater Rays / Space Stars / Grid Guides */}
            {backdrop === 'underwater' && (
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none z-1 animate-[pulse_6s_infinite]" />
            )}

            {/* Placed Elements Layer */}
            <AnimatePresence>
              {placedItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <motion.div
                    key={item.id}
                    id={`placed-item-${item.id}`}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: item.size,
                      x: item.x,
                      y: item.y,
                      rotate: item.rotation,
                    }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      transform: 'translate(-50%, -50%)',
                      filter: item.color ? `drop-shadow(0 0 10px ${item.color}) drop-shadow(0 4px 6px rgba(0,0,0,0.15))` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))',
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center select-none cursor-grab z-10 ${
                      isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-110 z-20' : ''
                    } ${
                      isPowerOn ? 'animate-bounce' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                    }}
                  >
                    <span 
                      className={`text-4xl block select-none ${
                        isPowerOn && (item.id.includes('wheel') || item.id.includes('gear')) ? 'animate-[spin_2s_linear_infinite]' : ''
                      } ${
                        isPowerOn && item.id.includes('rocket') ? 'animate-pulse' : ''
                      }`}
                    >
                      {item.img}
                    </span>

                    {/* Fun exhaust sparks for powered rockets */}
                    {isPowerOn && item.id.includes('rocket') && (
                      <span className="absolute -bottom-4 text-xs animate-ping">🔥</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Instruction Badge helper */}
            <div className="absolute bottom-3 left-3 bg-slate-950/70 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs pointer-events-none z-10 flex items-center gap-1.5 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shrink-0" />
              <span className="text-[8.5px] font-black uppercase tracking-wider font-mono">
                {selectedTool === 'pencil' || selectedTool === 'brush' ? 'Drawing mode active' : 'Grab & Move Parts active'}
              </span>
            </div>

            {placedItems.length === 0 && strokes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none z-1">
                <span className="text-4xl animate-bounce mb-2">🧑‍🎨</span>
                <h5 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest">
                  Canvas is empty
                </h5>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1 font-bold leading-normal">
                  Tap any robot heads, gear blocks, or starry shapes on the left side to spawn them here! Then drag them around!
                </p>
              </div>
            )}
          </div>

          {/* Controls for Selected Part */}
          <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-3xs flex flex-wrap gap-3 items-center justify-between">
            <div className="space-y-0.5">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">
                Selected Item Controls
              </h5>
              {selectedItemId ? (
                <p className="text-xs font-extrabold text-slate-800">
                  🔧 Adjusting: {placedItems.find(it => it.id === selectedItemId)?.label}
                </p>
              ) : (
                <p className="text-[10.5px] text-slate-505 font-medium">
                  Tap any placed part on the canvas above to tune it!
                </p>
              )}
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                disabled={!selectedItemId}
                onClick={() => handleRotateSelected('ccw')}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Rotate Left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!selectedItemId}
                onClick={() => handleRotateSelected('cw')}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Rotate Right"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!selectedItemId}
                onClick={() => handleResizeSelected('up')}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Make Bigger"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!selectedItemId}
                onClick={() => handleResizeSelected('down')}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Make Smaller"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!selectedItemId}
                onClick={handleDeleteSelected}
                className="p-1.5 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Delete Part"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Master Play Controls & Completion */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Actions Block: Clear, Photo, Power On */}
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleClearAll}
                className="flex-1 sm:flex-initial py-2 px-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All
              </button>

              <button
                onClick={handleTakePhoto}
                className="flex-1 sm:flex-initial py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 text-white rounded-xl text-xs font-extrabold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Save Photo 📸
              </button>

              <button
                onClick={handleTogglePower}
                className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                  isPowerOn 
                    ? 'bg-rose-500 text-white ring-4 ring-rose-300' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isPowerOn ? 'animate-bounce text-yellow-300' : ''}`} />
                {isPowerOn ? 'POWER OFF 🛑' : 'POWER ON ⚡'}
              </button>
            </div>

            {/* Submission Block */}
            <button
              onClick={handleSubmitDesign}
              className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border-b-4 border-amber-700 active:border-b-0 text-amber-955 font-black text-xs uppercase tracking-wide rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 animate-bounce" />
              <span>Submit Design 🏆</span>
            </button>

          </div>

        </div>

      </div>

      {/* --- POLAROID PHOTO GALLERY SUB-ROW --- */}
      {gallery.length > 0 && (
        <div className="mt-8 border-t border-indigo-100 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h4 className="font-black text-xs uppercase text-indigo-900 tracking-wider">
              Your Creations Photo Gallery
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.map((creation) => (
              <motion.div
                key={creation.id}
                whileHover={{ y: -6, rotate: 1 }}
                onClick={() => handleRestoreCreation(creation)}
                className="bg-white p-2.5 pb-4 border border-slate-200 shadow-sm rounded-lg cursor-pointer transform hover:shadow-md transition duration-200 text-center space-y-2 relative"
              >
                <div className="absolute top-2 right-2 bg-slate-950/60 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full">
                  Click to Load
                </div>

                {/* Simulated Polaroid Picture Box */}
                <div className="h-20 w-full bg-slate-100 rounded-md flex items-center justify-center text-3xl border border-slate-100/50 overflow-hidden relative">
                  {/* Background specific indicators */}
                  {creation.backdrop === 'space' && <span className="absolute inset-0 bg-slate-905 opacity-10" />}
                  {creation.backdrop === 'underwater' && <span className="absolute inset-0 bg-blue-905 opacity-10" />}
                  
                  {creation.items.length > 0 ? (
                    <div className="flex gap-1">
                      {creation.items.slice(0, 3).map((it, idx) => (
                        <span key={idx} className="text-2xl drop-shadow-3xs shrink-0 select-none">{it.img}</span>
                      ))}
                    </div>
                  ) : (
                    <span>🎨</span>
                  )}
                </div>

                {/* Caption Block */}
                <div className="space-y-0.5">
                  <p className="text-[9.5px] font-extrabold text-slate-800 leading-tight truncate px-1">
                    {creation.title}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">
                    Backdrop: {creation.backdrop}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
