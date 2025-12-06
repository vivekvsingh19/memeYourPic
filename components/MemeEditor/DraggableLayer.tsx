import React, { useRef, useState } from 'react';
import { Layer } from '../../types';
import { RotateIcon, TrashIcon } from '../Icons';

interface DraggableLayerProps {
  layer: Layer;
  containerRef: React.RefObject<HTMLDivElement>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Layer>, saveHistory?: boolean) => void;
  onDelete: (id: string) => void;
  onInteractionEnd?: () => void;
}

const DraggableLayer: React.FC<DraggableLayerProps> = ({
  layer,
  containerRef,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onInteractionEnd,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); 
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 }); 

  // Handle Dragging (Move)
  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicking a control handle, don't drag the box
    if ((e.target as HTMLElement).dataset.control) return;

    e.stopPropagation();
    onSelect(layer.id);
    
    if (containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPos({ x: layer.x, y: layer.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Convert pixel delta to percentage delta
    const dxPercent = (dx / containerRect.width) * 100;
    const dyPercent = (dy / containerRect.height) * 100;

    onUpdate(layer.id, {
      x: initialPos.x + dxPercent,
      y: initialPos.y + dyPercent,
    }, false); // Don't save history while dragging
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
        setIsDragging(false);
        if(e.target instanceof Element) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
        if (onInteractionEnd) onInteractionEnd();
    }
  };

  // Improved Center-Based Scaling (Works naturally from any corner)
  const handleScaleStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    // Center of the element in viewport coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startScale = layer.scale;
    // Initial distance from center to pointer
    const startDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    const onMove = (moveEvent: PointerEvent) => {
        const currDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
        
        // Avoid division by zero
        if (startDist > 0) {
            const newScale = Math.max(0.1, startScale * (currDist / startDist));
            onUpdate(layer.id, { scale: newScale }, false); // Don't save history while scaling
        }
    };

    const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (onInteractionEnd) onInteractionEnd();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Rotation Logic
  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startRotation = layer.rotation;
    
    // Calculate initial angle
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    const onMove = (moveEvent: PointerEvent) => {
        const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
        const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
        onUpdate(layer.id, { rotation: startRotation + deltaAngle }, false); // Don't save history while rotating
    };

    const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (onInteractionEnd) onInteractionEnd();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Helper for font families
  const getFontFamily = () => {
      switch(layer.fontFamily) {
          case 'impact': return '"Anton", sans-serif';
          case 'roboto': return '"Roboto", sans-serif';
          case 'comic': return '"Comic Neue", cursive';
          case 'meme': return '"Permanent Marker", cursive';
          case 'oswald': return '"Oswald", sans-serif';
          case 'hand': return '"Architects Daughter", cursive';
          case 'cinzel': return '"Cinzel", serif';
          case 'pacifico': return '"Pacifico", cursive';
          case 'creepster': return '"Creepster", cursive';
          case 'courier': return '"Courier Prime", monospace';
          default: return '"Anton", sans-serif';
      }
  };

  return (
    <div
      ref={elementRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      className={`absolute select-none flex items-center justify-center group touch-none`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        // Apply width here to the container so wrapping happens before scaling
        width: layer.width ? `${layer.width}%` : 'auto', 
        maxWidth: layer.width ? 'none' : '90%',
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
        zIndex: isSelected ? 50 : 10,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Content Box */}
      <div 
        className={`
          relative w-full
          ${isSelected 
             ? 'border-2 border-dashed border-brand-500 bg-brand-500/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] shadow-none' 
             : 'border-2 border-transparent hover:border-white/50'
          }
        `}
      >
        {layer.type === 'text' ? (
          <p
            className="text-center leading-tight px-2 py-1"
            style={{
              fontFamily: getFontFamily(),
              fontWeight: layer.isBold ? 'bold' : 'normal',
              color: layer.color || 'white',
              fontSize: `${layer.fontSize || 24}px`,
              textShadow: layer.strokeWidth !== 0 
                ? `
                   -${layer.strokeWidth}px -${layer.strokeWidth}px 0 ${layer.strokeColor},  
                    ${layer.strokeWidth}px -${layer.strokeWidth}px 0 ${layer.strokeColor},
                   -${layer.strokeWidth}px  ${layer.strokeWidth}px 0 ${layer.strokeColor},
                    ${layer.strokeWidth}px  ${layer.strokeWidth}px 0 ${layer.strokeColor}
                  ` 
                : 'none',
              textTransform: layer.isUppercase ? 'uppercase' : 'none',
              textDecoration: layer.isStrikethrough ? 'line-through' : 'none',
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              minWidth: '20px'
            }}
          >
            {layer.content || "Double tap to edit"}
          </p>
        ) : layer.type === 'image' ? (
             <div className="rounded-lg overflow-hidden pointer-events-none">
                 <img src={layer.src} alt="Overlay" className="w-40 h-auto object-cover" />
             </div>
        ) : (
          <div className="text-6xl px-2 py-1">{layer.content}</div>
        )}

        {/* Controls (Only visible when selected) */}
        {isSelected && (
          <>
            {/* Delete Button (Offset Top Right) */}
            <button
                data-control
                onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
                className="absolute -top-8 -right-8 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-30 hover:scale-110 hover:bg-red-600 transition-all border-2 border-white"
                title="Delete Layer"
            >
                <TrashIcon className="w-4 h-4" />
            </button>

            {/* Rotation Handle (Top Center Stick) */}
            <div 
               className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-brand-500 z-20"
            />
            <div
                data-control
                onPointerDown={handleRotateStart}
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-brand-500 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-30 hover:scale-110 text-brand-600"
                title="Rotate"
            >
                <RotateIcon className="w-4 h-4" />
            </div>

            {/* 4 Corner Resize Handles */}
            {/* NW */}
            <div
                data-control
                onPointerDown={handleScaleStart}
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full cursor-nwse-resize z-20 shadow-sm hover:scale-125 transition-transform"
            />
            {/* NE */}
            <div
                data-control
                onPointerDown={handleScaleStart}
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full cursor-nesw-resize z-20 shadow-sm hover:scale-125 transition-transform"
            />
            {/* SW */}
            <div
                data-control
                onPointerDown={handleScaleStart}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full cursor-nesw-resize z-20 shadow-sm hover:scale-125 transition-transform"
            />
            {/* SE */}
            <div
                data-control
                onPointerDown={handleScaleStart}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full cursor-nwse-resize z-20 shadow-sm hover:scale-125 transition-transform"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DraggableLayer;