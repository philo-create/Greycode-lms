import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RotateCcw, Palette, CheckCircle } from 'lucide-react';

export interface ColoringCanvasRef {
  getDataUrl: () => string | null;
}

interface ColoringCanvasProps {
  imageSrc: string;
  altText: string;
  onColor?: () => void;
  externalActiveColor?: string;
  hidePalette?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  containerClassName?: string;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444', ring: 'ring-red-500', bg: 'bg-red-500' },
  { name: 'Orange', hex: '#f97316', ring: 'ring-orange-500', bg: 'bg-orange-500' },
  { name: 'Amber/Yellow', hex: '#fbbf24', ring: 'ring-amber-400', bg: 'bg-amber-400' },
  { name: 'Green', hex: '#22c55e', ring: 'ring-green-500', bg: 'bg-green-500' },
  { name: 'Sky Blue', hex: '#0ea5e9', ring: 'ring-sky-500', bg: 'bg-sky-500' },
  { name: 'Purple', hex: '#a855f7', ring: 'ring-purple-500', bg: 'bg-purple-500' },
  { name: 'Pink', hex: '#ec4899', ring: 'ring-pink-500', bg: 'bg-pink-500' },
];

const ColoringCanvas = forwardRef<ColoringCanvasRef, ColoringCanvasProps>(
  ({ 
    imageSrc, 
    altText, 
    onColor, 
    externalActiveColor, 
    hidePalette,
    canvasWidth = 240,
    canvasHeight = 180,
    containerClassName = "w-56 h-40"
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeColor, setActiveColor] = useState('#fbbf24'); // default Amber
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasColored, setHasColored] = useState(false);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png');
      }
    }));

    const currentColor = externalActiveColor || activeColor;

  // Initialise canvas dimensions based on container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill background with solid white initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale coordinates to internal canvas resolution (240x180)
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      // Prevent scrolling on touch devices while coloring
      if (e.cancelable) e.preventDefault();
    }
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14; // Nice thick crayon size
    ctx.strokeStyle = currentColor;

    setIsDrawing(true);
    setHasColored(true);
    if (onColor) {
      onColor();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasColored(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full mx-auto" id="coloring-canvas-widget">
      {/* Dynamic Canvas Container with Multiply Overlay */}
      <div 
        ref={containerRef}
        className={`relative ${containerClassName} border-4 border-indigo-100 rounded-2xl overflow-hidden shadow-inner bg-white select-none cursor-crosshair group touch-none`}
      >
        {/* Drawing layer underneath */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />

        {/* Multiplying Coloring outline on top - perfectly keeps line art crisp */}
        <img
          src={imageSrc}
          alt={altText}
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply pointer-events-none select-none p-1.5"
          referrerPolicy="no-referrer"
        />

        {/* Clear Overlay button visible on hover or colored */}
        {hasColored && (
          <button
            type="button"
            onClick={clearCanvas}
            title="Reset colors"
            className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-md transition pointer-events-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Colored Star badge indicator */}
        {hasColored && (
          <span className="absolute top-2 right-2 text-md animate-bounce pointer-events-none">
            🎨⭐
          </span>
        )}
      </div>

      {/* Modern Crayon Palette Selector */}
      {!hidePalette && (
        <div className="flex items-center gap-1.5 justify-center py-1 px-2.5 bg-slate-50 border border-slate-100 rounded-full shadow-2xs">
          {COLORS.map((color) => {
            const isSelected = activeColor === color.hex;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => setActiveColor(color.hex)}
                className={`w-5 h-5 rounded-full ${color.bg} transition-transform ${
                  isSelected ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1' : 'hover:scale-110'
                } cursor-pointer`}
                title={color.name}
              />
            );
          })}
        </div>
      )}
      
      {/* Interactive learner hint */}
      <div className="text-[9px] text-indigo-500 font-extrabold flex items-center gap-1 select-none">
        {hasColored ? (
          <span className="text-emerald-600 flex items-center gap-0.5 animate-pulse">
            <CheckCircle className="w-3 h-3 stroke-[3]" /> Colored! Looking Awesome!
          </span>
        ) : (
          <span>🎨 Use your finger/mouse to color it in!</span>
        )}
      </div>
    </div>
  );
});

export default ColoringCanvas;
