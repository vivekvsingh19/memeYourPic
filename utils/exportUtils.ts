

import { Layer } from '../types';

/**
 * Renders the meme editor state onto a high-resolution canvas for export.
 * Handles custom aspect ratios, background colors, and "contain" image scaling.
 */
export const renderMemeToCanvas = async (
  imageSrc: string,
  layers: Layer[],
  canvasConfig: { aspectRatio: number | 'original'; backgroundColor: string } = { aspectRatio: 'original', backgroundColor: '#ffffff' },
  includeWatermark: boolean = false
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // 1. Determine Output Canvas Dimensions
      // If 'original', use the image's dimensions.
      // If specific ratio, calculate dimensions that fit the image while respecting the ratio.
      // We will define a standard "base width" to ensure high quality export (e.g. 1080px).
      
      const BASE_SIZE = 1200;
      let outputWidth, outputHeight;

      if (canvasConfig.aspectRatio === 'original') {
          outputWidth = img.naturalWidth;
          outputHeight = img.naturalHeight;
      } else {
          // For fixed ratios, we standardize on a max dimension to keep quality high
          // But we need to ensure the inner image fits.
          // Let's set the canvas width to BASE_SIZE and calculate height based on ratio.
          const ratio = canvasConfig.aspectRatio as number;
          outputWidth = BASE_SIZE;
          outputHeight = BASE_SIZE / ratio;
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // 2. Draw Background
      ctx.fillStyle = canvasConfig.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Draw Image (Contain Logic)
      // Calculate scaled dimensions to fit inside canvas while preserving aspect ratio
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;

      let renderW, renderH, offsetX, offsetY;

      if (canvasConfig.aspectRatio === 'original') {
          renderW = canvas.width;
          renderH = canvas.height;
          offsetX = 0;
          offsetY = 0;
      } else {
          // "Contain" logic
          if (imgRatio > canvasRatio) {
              // Image is wider than canvas -> fit to width
              renderW = canvas.width;
              renderH = canvas.width / imgRatio;
              offsetX = 0;
              offsetY = (canvas.height - renderH) / 2;
          } else {
              // Image is taller than canvas -> fit to height
              renderH = canvas.height;
              renderW = canvas.height * imgRatio;
              offsetX = (canvas.width - renderW) / 2;
              offsetY = 0;
          }
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

      // 4. Draw Layers
      // Layers are positioned as % of the CANVAS dimensions (not just the image).
      // This matches the updated Editor UI logic where containerRef is the aspect box.
      
      // We need to load all image layers first
      const imageLoadPromises = layers
        .filter(l => l.type === 'image' && l.src)
        .map(l => new Promise<void>((resolveImg) => {
            const layerImg = new Image();
            layerImg.crossOrigin = 'anonymous';
            layerImg.src = l.src!;
            layerImg.onload = () => resolveImg();
            layerImg.onerror = () => resolveImg(); // Proceed even if fail
        }));

      Promise.all(imageLoadPromises).then(() => {
          layers.forEach((layer) => {
            ctx.save();
    
            // Calculate Position (convert % to px relative to output Canvas)
            const x = (layer.x / 100) * canvas.width;
            const y = (layer.y / 100) * canvas.height;
    
            // Move context to layer position and rotate
            ctx.translate(x, y);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.scale(layer.scale, layer.scale);
    
            if (layer.type === 'text') {
              // Font Configuration
              // Calculate font size relative to a standard viewport width (e.g. 800px)
              const referenceWidth = 800;
              const fontSize = (layer.fontSize || 30) * (canvas.width / referenceWidth);
              
              const fontMap: Record<string, string> = {
                'impact': 'Anton, Impact, sans-serif',
                'roboto': 'Roboto, sans-serif',
                'comic': '"Comic Neue", "Comic Sans MS", cursive',
                'meme': '"Permanent Marker", cursive',
                'oswald': 'Oswald, sans-serif',
                'hand': '"Architects Daughter", cursive',
                'cinzel': 'Cinzel, serif',
                'pacifico': 'Pacifico, cursive',
                'creepster': 'Creepster, cursive',
                'courier': '"Courier Prime", monospace',
              };
              
              const fontFamily = fontMap[layer.fontFamily || 'impact'] || 'sans-serif';
              const fontWeight = layer.isBold ? 'bold' : 'normal';
              
              ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              const text = layer.isUppercase ? layer.content.toUpperCase() : layer.content;
              
              // Styles
              ctx.fillStyle = layer.color || 'white';
              ctx.strokeStyle = layer.strokeColor || 'black';
              
              // Scale stroke width proportionally with font size
              const strokeWidth = (layer.strokeWidth ?? 4) * (canvas.width / referenceWidth);
              ctx.lineWidth = strokeWidth;
              ctx.lineJoin = 'round';
              ctx.miterLimit = 2;
    
              // Wrap Text logic
              const maxWidth = layer.width 
                 ? (canvas.width * (layer.width / 100)) 
                 : (canvas.width * 0.9);
    
              const words = text.split(' ');
              const lines = [];
    
              // Handle manual line breaks first if present
              const paragraphs = text.split('\n');
              
              paragraphs.forEach(paragraph => {
                  const pWords = paragraph.split(' ');
                  let pLine = '';
                  
                  for (let n = 0; n < pWords.length; n++) {
                    const testLine = pLine + pWords[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                      lines.push(pLine);
                      pLine = pWords[n] + ' ';
                    } else {
                      pLine = testLine;
                    }
                  }
                  lines.push(pLine);
              });
    
    
              // Draw Lines
              const lineHeight = fontSize * 1.2;
              const totalHeight = lines.length * lineHeight;
              let startY = -(totalHeight / 2) + (lineHeight / 2);
    
              lines.forEach((lineText) => {
                const safeText = lineText.trim(); 
                
                if (layer.strokeWidth !== 0) {
                    ctx.strokeText(safeText, 0, startY);
                }
                ctx.fillText(safeText, 0, startY);
    
                // Strikethrough Logic
                if (layer.isStrikethrough) {
                    const metrics = ctx.measureText(safeText);
                    const lineWidth = metrics.width;
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = layer.color || 'white';
                    ctx.lineWidth = fontSize * 0.08; 
                    ctx.moveTo(-lineWidth / 2, startY);
                    ctx.lineTo(lineWidth / 2, startY);
                    
                    if (layer.strokeWidth && layer.strokeWidth > 0) {
                        ctx.save();
                        ctx.strokeStyle = layer.strokeColor || 'black';
                        ctx.lineWidth = (fontSize * 0.08) + strokeWidth;
                        ctx.stroke();
                        ctx.restore();
                    }
                    
                    ctx.stroke();
                    ctx.restore();
                }
    
                startY += lineHeight;
              });
    
            } else if (layer.type === 'sticker') {
              // Draw Emoji/Sticker
              // Scale sticker size relative to canvas
              ctx.font = `${canvas.width * 0.15}px serif`; 
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(layer.content, 0, 0);
            } else if (layer.type === 'image' && layer.src) {
                // Draw Image Layer
                // Create temp image
                const lImg = new Image();
                lImg.src = layer.src;
                // We assume it's loaded because of Promise.all above
                
                // Draw image centered at 0,0 (context is already translated)
                // Default width ~ 160px relative to typical screen, scale appropriately
                // 40 in w-40 is 10rem = 160px.
                // We'll scale it relative to canvas width similar to text
                const baseWidth = canvas.width * 0.3; // 30% of canvas width
                const aspect = lImg.width / lImg.height;
                const drawWidth = baseWidth;
                const drawHeight = baseWidth / aspect;

                ctx.drawImage(lImg, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
            }
    
            ctx.restore();
          });

          // 5. Draw Watermark (if enabled)
          if (includeWatermark) {
            ctx.save();
            const fontSize = Math.max(16, canvas.width * 0.025); // Responsive font size
            ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            const padding = canvas.width * 0.02;
            
            // Text Shadow / Stroke for readability
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillText("memeyourpic.com", canvas.width - padding, canvas.height - padding);
            
            ctx.restore();
          }
    
          resolve(canvas.toDataURL('image/png'));
      });
    };

    img.onerror = (err) => reject(err);
  });
};
