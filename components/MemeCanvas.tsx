
import React, { useRef, useEffect } from 'react';

interface MemeCanvasProps {
  imageSrc: string;
  topText: string;
  bottomText: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({ imageSrc, topText, bottomText, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // 1. Setup Canvas Dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 2. Draw Image
      ctx.drawImage(img, 0, 0);

      // 3. Configure Font Styles (Classic Meme Style)
      const fontSize = Math.floor(canvas.width * 0.1); // 10% of width
      ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(2, Math.floor(fontSize * 0.05)); // Thick outline, min 2px
      ctx.textAlign = 'center';
      
      const padding = canvas.width * 0.04; // 4% padding
      const maxWidth = canvas.width - (padding * 2);

      // Helper to wrap text
      const drawWrappedText = (text: string, isBottom: boolean) => {
        if (!text) return;
        const upperText = text.toUpperCase();
        const words = upperText.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        // Measure and split lines
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + " " + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width < maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = words[i];
          }
        }
        lines.push(currentLine);

        // Drawing Coordinates
        const lineHeight = fontSize * 1.2;
        const x = canvas.width / 2;
        let y;

        if (isBottom) {
           // Bottom Text: Draw from bottom up
           const startY = canvas.height - padding; 
           lines.reverse().forEach((line, index) => {
             y = startY - (index * lineHeight);
             // Safety check to ensure we don't draw off-top
             if (y < 0) return; 

             ctx.textBaseline = 'bottom';
             ctx.strokeText(line, x, y);
             ctx.fillText(line, x, y);
           });
        } else {
           // Top Text: Draw from top down
           const startY = padding; 
           lines.forEach((line, index) => {
             y = startY + (index * lineHeight);
             // Safety check to ensure we don't draw off-bottom
             if (y > canvas.height) return;

             ctx.textBaseline = 'top';
             ctx.strokeText(line, x, y);
             ctx.fillText(line, x, y);
           });
        }
      };

      // 4. Draw Texts
      drawWrappedText(topText, false);
      drawWrappedText(bottomText, true);

      // 5. Notify Parent
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
    };
  }, [imageSrc, topText, bottomText, onCanvasReady]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Canvas is displayed scaled via CSS */}
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-[70vh] object-contain"
      />
    </div>
  );
};

export default MemeCanvas;
