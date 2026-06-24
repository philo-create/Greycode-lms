'use client';

import React, { useState, useRef, useEffect, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { 
  Palette, PenTool, Battery, Lightbulb, Zap, 
  Settings, MousePointer2, Trash2, Undo2,
  Circle, Square, Triangle, Minus, Type, Eraser, PaintBucket
} from 'lucide-react';

type Tool = 'select' | 'draw' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'component' | 'text' | 'eraser' | 'fill';
type ComponentType = 'battery' | 'led' | 'motor' | 'wire' | 'robot-arm' | 'wheel';

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
  color: string;
  fillColor?: string;
  strokeWidth: number;
  componentType?: ComponentType;
  text?: string;
  fontSize?: number;
}

export default function CreativeWorkstationApp() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(null);
  const [currentColor, setCurrentColor] = useState('#4f46e5');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(4);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Interaction states
  const [isDrawing, setIsDrawing] = useState(false);
  const [actionState, setActionState] = useState<'idle' | 'drawing' | 'moving' | 'resizing'>('idle');
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [originalObject, setOriginalObject] = useState<CanvasObject | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Keyboard events for deleting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        setObjects(prev => prev.filter(obj => obj.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'select' || activeTool === 'fill') {
      // If we clicked on empty space without hitting an object or handle
      if (activeTool === 'select') setSelectedId(null);
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
      if (activeTool !== 'eraser') setSelectedId(newPath.id);
    } else if (['line', 'rectangle', 'circle', 'triangle'].includes(activeTool)) {
      setActionState('drawing');
      const newShape: CanvasObject = {
        id: Date.now().toString(),
        type: activeTool,
        x, y, 
        width: 0, height: 0,
        x1: x, y1: y, x2: x, y2: y,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
      };
      setObjects([...objects, newShape]);
      setSelectedId(newShape.id);
    } else if (activeTool === 'text') {
      const textVal = prompt('Enter text:');
      if (textVal) {
        const newText: CanvasObject = {
          id: Date.now().toString(),
          type: 'text',
          x, y,
          width: 0, height: 0, // text width/height can be estimated but we'll just use x,y
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          text: textVal,
          fontSize: 24,
        };
        setObjects([...objects, newText]);
        setSelectedId(newText.id);
        setActiveTool('select');
      }
    } else if (activeTool === 'component' && activeComponent) {
      const newComp: CanvasObject = {
        id: Date.now().toString(),
        type: 'component',
        componentType: activeComponent,
        x: x - 25,
        y: y - 25,
        width: 50,
        height: 50,
        color: currentColor,
        strokeWidth: 2,
      };
      setObjects([...objects, newComp]);
      setSelectedId(newComp.id);
      setActiveTool('select');
      setActiveComponent(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (actionState === 'drawing') {
      setObjects(prev => {
        const newObjects = [...prev];
        const currentObj = newObjects[newObjects.length - 1];
        if (!currentObj) return newObjects;

        if (currentObj.type === 'draw' && currentObj.points) {
          currentObj.points.push({ x, y });
        } else if (currentObj.type === 'line') {
          currentObj.x2 = x;
          currentObj.y2 = y;
        } else if (['rectangle', 'circle', 'triangle'].includes(currentObj.type)) {
          // Allow drawing backwards (x/y is top left, width/height is absolute)
          const startX = currentObj.x1 ?? currentObj.x;
          const startY = currentObj.y1 ?? currentObj.y;
          currentObj.x = Math.min(startX, x);
          currentObj.y = Math.min(startY, y);
          currentObj.width = Math.abs(x - startX);
          currentObj.height = Math.abs(y - startY);
        }
        return newObjects;
      });
    } else if (actionState === 'moving' && selectedId && dragStart && originalObject) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedId) return obj;
        if (obj.type === 'draw' && obj.points && originalObject.points) {
          return {
            ...obj,
            points: originalObject.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
          };
        } else if (obj.type === 'line') {
          return {
            ...obj,
            x1: (originalObject.x1 ?? 0) + dx,
            y1: (originalObject.y1 ?? 0) + dy,
            x2: (originalObject.x2 ?? 0) + dx,
            y2: (originalObject.y2 ?? 0) + dy,
          };
        } else {
          return {
            ...obj,
            x: originalObject.x + dx,
            y: originalObject.y + dy,
          };
        }
      }));
    } else if (actionState === 'resizing' && selectedId && resizeHandle && originalObject) {
      setObjects(prev => prev.map(obj => {
        if (obj.id !== selectedId) return obj;
        
        const newObj = { ...obj };
        if (obj.type === 'line') {
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
      }));
    }
  };

  const handlePointerUp = () => {
    setActionState('idle');
    setDragStart(null);
    setOriginalObject(null);
    setResizeHandle(null);
  };

  const startObjectMove = (e: React.PointerEvent, obj: CanvasObject) => {
    e.stopPropagation();
    
    if (activeTool === 'fill') {
      if (['rectangle', 'circle', 'triangle'].includes(obj.type)) {
        setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, fillColor: currentColor } : o));
      }
      return;
    }
    
    if (activeTool !== 'select') return;
    
    setSelectedId(obj.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setOriginalObject(obj);
      setActionState('moving');
    }
  };

  const startObjectResize = (e: React.PointerEvent, obj: CanvasObject, handle: string) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    setSelectedId(obj.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeHandle(handle);
      setOriginalObject(obj);
      setActionState('resizing');
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setObjects(prev => prev.filter(obj => obj.id !== selectedId));
      setSelectedId(null);
    }
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear your workstation?')) {
      setObjects([]);
      setSelectedId(null);
    }
  };

  const undo = () => {
    setObjects(prev => prev.slice(0, -1));
    setSelectedId(null);
  };

  const getComponentIcon = (type: ComponentType) => {
    switch (type) {
      case 'battery': return <Battery className="w-full h-full text-green-600" />;
      case 'led': return <Lightbulb className="w-full h-full text-yellow-500" />;
      case 'motor': return <Settings className="w-full h-full text-slate-700" />;
      case 'wire': return <Zap className="w-full h-full text-blue-500" />;
      case 'robot-arm': return <PenTool className="w-full h-full text-indigo-500" />;
      case 'wheel': return <div className="w-full h-full rounded-full border-4 border-slate-800 bg-slate-300" />;
      default: return null;
    }
  };

  const renderObject = (obj: CanvasObject) => {
    const isSelected = selectedId === obj.id;
    
    if (obj.type === 'draw') {
      return (
        <g key={obj.id}>
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
        <g key={obj.id}>
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
          {isSelected && (
            <>
              <circle cx={obj.x1} cy={obj.y1} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'start')} />
              <circle cx={obj.x2} cy={obj.y2} r={6} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-pointer" onPointerDown={(e) => startObjectResize(e, obj, 'end')} />
            </>
          )}
        </g>
      );
    }
    
    if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'component') {
      let content = null;
      if (obj.type === 'rectangle') {
        content = <rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} />;
      } else if (obj.type === 'circle') {
        content = <ellipse cx={obj.x + obj.width/2} cy={obj.y + obj.height/2} rx={obj.width/2} ry={obj.height/2} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} />;
      } else if (obj.type === 'triangle') {
        content = <polygon points={`${obj.x + obj.width/2},${obj.y} ${obj.x},${obj.y + obj.height} ${obj.x + obj.width},${obj.y + obj.height}`} fill={obj.fillColor || "transparent"} stroke={obj.color} strokeWidth={obj.strokeWidth} strokeLinejoin="round" />;
      } else if (obj.type === 'component' && obj.componentType) {
        content = (
          <foreignObject x={obj.x} y={obj.y} width={obj.width} height={obj.height}>
            <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-sm border-2 border-slate-200">
              {getComponentIcon(obj.componentType)}
            </div>
          </foreignObject>
        );
      }

      return (
        <g key={obj.id}>
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
              <rect x={obj.x - 2} y={obj.y - 2} width={obj.width + 4} height={obj.height + 4} fill="none" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} style={{ pointerEvents: 'none' }} />
              <circle cx={obj.x} cy={obj.y} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onPointerDown={(e) => startObjectResize(e, obj, 'tl')} />
              <circle cx={obj.x + obj.width} cy={obj.y} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nesw-resize" onPointerDown={(e) => startObjectResize(e, obj, 'tr')} />
              <circle cx={obj.x} cy={obj.y + obj.height} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nesw-resize" onPointerDown={(e) => startObjectResize(e, obj, 'bl')} />
              <circle cx={obj.x + obj.width} cy={obj.y + obj.height} r={5} fill="#fff" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onPointerDown={(e) => startObjectResize(e, obj, 'br')} />
            </>
          )}
        </g>
      );
    }
    
    if (obj.type === 'text') {
      return (
        <g key={obj.id} onPointerDown={(e) => startObjectMove(e, obj)} className={activeTool === 'select' ? 'cursor-move' : activeTool === 'eraser' ? 'cursor-not-allowed' : ''}>
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
              width={obj.text!.length * (obj.fontSize! * 0.6) + 10} 
              height={obj.fontSize! + 10}
              fill="none" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={2} style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] select-none">
      
      {/* Header toolbar */}
      <div className="bg-indigo-50 p-4 border-b-2 border-indigo-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">Creative Arts Workstation</h2>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => { setActiveTool('select'); setActiveComponent(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'select' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Select & Move"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTool('draw'); setActiveComponent(null); setSelectedId(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'draw' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Freehand Draw"
          >
            <PenTool className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTool('fill'); setActiveComponent(null); setSelectedId(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'fill' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Paint Bucket (Fill Shape)"
          >
            <PaintBucket className="w-5 h-5" />
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          
          {/* Stroke Width Slider */}
          <div className="hidden sm:flex items-center space-x-2 px-2 border-r border-slate-200 pr-4">
            <span className="text-xs text-slate-500 font-medium">Size</span>
            <input 
              type="range" 
              min="1" max="15" 
              value={currentStrokeWidth}
              onChange={(e) => {
                const width = parseInt(e.target.value);
                setCurrentStrokeWidth(width);
                if (selectedId) {
                  setObjects(prev => prev.map(obj => obj.id === selectedId ? { ...obj, strokeWidth: width } : obj));
                }
              }}
              className="w-20 accent-indigo-600"
            />
          </div>

          {/* Color picker */}
          <div className="flex space-x-1 sm:space-x-2 px-1 sm:px-2">
            {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#1e293b'].map(color => (
              <button
                key={color}
                onClick={() => { 
                  setCurrentColor(color); 
                  if (selectedId) {
                    setObjects(prev => prev.map(obj => obj.id === selectedId ? { ...obj, color } : obj));
                  } else if (activeTool === 'select') {
                    setActiveTool('draw');
                  }
                }}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-transform ${currentColor === color ? 'scale-125 border-slate-800' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          
          <button onClick={deleteSelected} disabled={!selectedId} className={`p-2 sm:p-3 rounded-xl transition-colors ${selectedId ? 'hover:bg-red-50 text-red-500' : 'text-slate-300 cursor-not-allowed'}`} title="Delete Selected">
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => { setActiveTool('eraser'); setActiveComponent(null); setSelectedId(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-colors ${activeTool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-50 text-slate-500'}`}
            title="Eraser Tool"
          >
            <Eraser className="w-5 h-5" />
          </button>

          <button onClick={undo} className="p-2 sm:p-3 rounded-xl hover:bg-slate-50 text-slate-500" title="Undo">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={clearCanvas} className="p-2 sm:p-3 rounded-xl hover:bg-red-50 text-red-500 font-medium text-sm border border-red-100 ml-2" title="Clear All">
            Clear
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Components Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-b-2 md:border-b-0 md:border-r-2 border-slate-100 p-4 overflow-y-auto">
          
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Lines & Shapes</h3>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
              {[
                { type: 'line', icon: <Minus className="w-6 h-6 text-slate-800" /> },
                { type: 'rectangle', icon: <Square className="w-6 h-6 text-blue-500" /> },
                { type: 'circle', icon: <Circle className="w-6 h-6 text-pink-500" /> },
                { type: 'triangle', icon: <Triangle className="w-6 h-6 text-purple-500" /> },
                { type: 'text', icon: <Type className="w-6 h-6 text-slate-600" /> }
              ].map(shape => (
                <button
                  key={shape.type}
                  onClick={() => { setActiveTool(shape.type as Tool); setActiveComponent(null); setSelectedId(null); }}
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

          <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Electronic Parts & Assembly</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
            {(['battery', 'led', 'motor', 'wire', 'robot-arm', 'wheel'] as ComponentType[]).map(comp => (
              <button
                key={comp}
                onClick={() => { setActiveTool('component'); setActiveComponent(comp); setSelectedId(null); }}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 bg-white transition-all ${
                  activeTool === 'component' && activeComponent === comp 
                  ? 'border-indigo-500 shadow-md transform scale-105' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="w-8 h-8">
                  {getComponentIcon(comp)}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-600 mt-2 capitalize">{comp.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm text-indigo-800 hidden md:block">
            <p className="font-bold mb-1">💡 Pro Tips:</p>
            <ul className="list-disc pl-4 space-y-2 mt-2">
              <li>Select a shape or line tool and drag on the canvas to draw.</li>
              <li>Click "Select & Move" to click on any object to drag and resize it.</li>
              <li>Press the Delete key to remove a selected item.</li>
              <li>Click an electronic part, then click the canvas to place it.</li>
            </ul>
          </div>
        </div>

        {/* Interactive Canvas Area */}
        <div 
          ref={canvasRef}
          className={`flex-1 min-h-[400px] bg-[url('/grid.svg')] bg-repeat bg-white relative overflow-hidden touch-none ${
            activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg className="absolute inset-0 w-full h-full">
            {objects.map(renderObject)}
          </svg>
          
          {objects.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-300 font-medium text-lg sm:text-xl px-4 text-center">Select a tool or component to start creating!</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

