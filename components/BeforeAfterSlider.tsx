import React, { useState, useRef } from 'react';
import { SliderIcon } from './Icons';

interface BeforeAfterSliderProps {
  originalSrc: string;
  memeSrc: string;
  className?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ originalSrc, memeSrc, className }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={`relative w-full overflow-hidden select-none group ${className}`} ref={containerRef}>
      {/* 1. Bottom Layer (The Meme / After) */}
      <div className="absolute inset-0 w-full h-full">
         <img src={memeSrc} alt="Meme Version" className="w-full h-full object-cover" />
         {/* Fake Meme Overlay for the demo */}
         <div className="absolute bottom-6 left-0 w-full text-center">
             <p className="font-impact text-white text-3xl md:text-5xl uppercase tracking-wide meme-text-shadow">
               Boss: ‘Clear?’<br/>Me: smiles in confusion.
             </p>
         </div>
      </div>

      {/* 2. Top Layer (The Original / Before) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={originalSrc} alt="Original Version" className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          ORIGINAL
        </div>
      </div>

      {/* 3. Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-600">
           <SliderIcon className="w-4 h-4 rotate-180" />
        </div>
      </div>

      {/* 4. Input Range for Interaction */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleDrag}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
      />
    </div>
  );
};

export default BeforeAfterSlider;