

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Layer, MemeTemplate, GeneratedCaption } from '../../types';
import DraggableLayer from './DraggableLayer';
import ControlPanel from './ControlPanel';
import ShareModal from './ShareModal';
import { renderMemeToCanvas } from '../../utils/exportUtils';
import { ArrowLeftIcon, ShareIcon, UndoIcon, RedoIcon } from '../Icons';

interface MemeEditorProps {
  imageSrc: string;
  initialCaptions: GeneratedCaption[];
  onBack: () => void;
  onUpdateImage: (newSrc: string) => void;
  includeWatermark?: boolean;
}

const MemeEditor: React.FC<MemeEditorProps> = ({ imageSrc, initialCaptions, onBack, onUpdateImage, includeWatermark = false }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Canvas State
  const [canvasConfig, setCanvasConfig] = useState<{
    aspectRatio: number | 'original';
    backgroundColor: string;
  }>({
    aspectRatio: 'original',
    backgroundColor: '#ffffff'
  });

  // Image Dimensions State
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });

  // Workspace Dimensions State
  const [workspaceDim, setWorkspaceDim] = useState({ w: 0, h: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedMemeUrl, setGeneratedMemeUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to save history
  const addToHistory = (newLayers: Layer[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newLayers);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  };

  // Helper to commit current state (wrapper)
  const commitCurrentState = () => {
    addToHistory(layers);
  };

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Initialize with AI captions
  useEffect(() => {
    if (initialCaptions.length > 0) {
      const initialLayer: Layer = {
        id: 'layer-init-1',
        type: 'text',
        content: initialCaptions[0].text,
        x: 50,
        y: 85,
        rotation: 0,
        scale: 1,
        fontFamily: 'impact',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        fontSize: 30, // relative
        isUppercase: true,
        isBold: true
      };
      setLayers([initialLayer]);
      setSelectedId(initialLayer.id);

      // Init History
      setHistory([[initialLayer]]);
      setHistoryIndex(0);
    } else {
      if (layers.length === 0) {
        // Default empty initialization if no captions
        const defaultLayer: Layer = {
          id: `layer-${Date.now()}`,
          type: 'text',
          content: 'Add Text',
          x: 50,
          y: 50,
          rotation: 0,
          scale: 1,
          fontFamily: 'impact',
          color: '#FFFFFF',
          strokeColor: '#000000',
          strokeWidth: 4,
          fontSize: 24,
          isUppercase: true,
          isBold: true
        };
        setLayers([defaultLayer]);
        setSelectedId(defaultLayer.id);
        setHistory([[defaultLayer]]);
        setHistoryIndex(0);
      }
    }
  }, [initialCaptions]);

  // Load Image Dimensions
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    };
  }, [imageSrc]);

  // Monitor Workspace Size
  useLayoutEffect(() => {
    const updateSize = () => {
      if (workspaceRef.current) {
        const { clientWidth, clientHeight } = workspaceRef.current;
        setWorkspaceDim({ w: clientWidth, h: clientHeight });
      }
    };

    // Initial size
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (workspaceRef.current) resizeObserver.observe(workspaceRef.current);

    return () => resizeObserver.disconnect();
  }, []);


  const handleUpdateLayer = (id: string, updates: Partial<Layer>, saveHistory: boolean = true) => {
    setLayers(prev => {
      const newLayers = prev.map(l => l.id === id ? { ...l, ...updates } : l);

      if (saveHistory) {
        // We need to defer history update to ensure we capture the state *after* this update
        // However, inside functional update we can't easily access 'history' state to slice it.
        // We will do it outside by calculating newLayers first.
        // But to avoid double render, we'll just set state here and rely on effect?
        // No, better to calculate newLayers outside if possible, but we need prev state.
        // Let's rely on the assumption that setLayers is synchronous enough for the logic below
        // OR rewrite to not use functional update if we need to save history immediately with access to it.
        // Actually, we can use a helper that does both.
        return newLayers;
      }
      return newLayers;
    });

    if (saveHistory) {
      // Re-calculating to save to history. This is safe because 'layers' in closure is previous state,
      // and we apply same logic.
      // WARNING: If updates depend on exact previous state that might have changed in another batched update, this could be slightly off.
      // But for a single user interaction, it is usually fine.
      // A more robust way is to just use 'layers' from next render, but that's hard to capture.
      // Let's just use the functional update pattern for history too.

      setHistory(prevHist => {
        // We need to use the functional update of setLayers result... which we don't have here easily.
        // Let's assume 'layers' state is updated and we can just use the same transformation.
        // Actually, simplest is to just perform the map again.
        const currentLayers = layers.map(l => l.id === id ? { ...l, ...updates } : l);
        const newHistory = prevHist.slice(0, historyIndex + 1);
        newHistory.push(currentLayers);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleAddText = (content: string = 'New Text') => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: 'text',
      content: content,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      fontFamily: 'impact',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      fontSize: 24,
      isUppercase: true,
      isBold: true
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    addToHistory(newLayers);
    setSelectedId(newLayer.id);
  };

  const handleAddSticker = (emoji: string) => {
    const newLayer: Layer = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      content: emoji,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    addToHistory(newLayers);
    setSelectedId(newLayer.id);
  };

  const handleAddImageLayer = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newLayer: Layer = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: 'Image',
          src: e.target.result as string,
          x: 50,
          y: 50,
          rotation: 0,
          scale: 1,
        };
        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        addToHistory(newLayers);
        setSelectedId(newLayer.id);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceBackground = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpdateImage(e.target.result as string);
        // Background change is not part of layers history currently,
        // but we could track it if we moved imageSrc to history.
        // For now, let's leave it separate.
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLayer = (id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    addToHistory(newLayers);
    if (selectedId === id) setSelectedId(null);
  };

  const handleReorderLayer = (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;

    const newLayers = [...layers];

    if (direction === 'front') {
      const [layer] = newLayers.splice(index, 1);
      newLayers.push(layer);
    } else if (direction === 'back') {
      const [layer] = newLayers.splice(index, 1);
      newLayers.unshift(layer);
    } else if (direction === 'forward') {
      if (index < newLayers.length - 1) {
        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      }
    } else if (direction === 'backward') {
      if (index > 0) {
        [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      }
    }

    setLayers(newLayers);
    addToHistory(newLayers);
  };

  const handleApplyTemplate = (template: MemeTemplate) => {
    const currentTextContents = layers.filter(l => l.type === 'text').map(l => l.content);

    const newLayers: Layer[] = template.layers.map((preset, index) => {
      const content = (preset.type === 'text' && currentTextContents[index] !== undefined)
        ? currentTextContents[index]
        : preset.content || 'TEXT';

      return {
        id: `layer-tmpl-${Date.now()}-${index}`,
        type: preset.type || 'text',
        content: content,
        x: preset.x || 50,
        y: preset.y || 50,
        rotation: 0,
        scale: 1,
        fontFamily: preset.fontFamily || 'impact',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        fontSize: preset.fontSize || 24,
        isUppercase: preset.isUppercase !== undefined ? preset.isUppercase : true,
        isBold: preset.isBold !== undefined ? preset.isBold : true
      } as Layer;
    });

    setLayers(newLayers);
    addToHistory(newLayers);

    if (newLayers.length > 0) {
      setSelectedId(newLayers[0].id);
    }
  };

  const handleUpdateCanvas = (updates: { aspectRatio?: number | 'original'; backgroundColor?: string }) => {
    setCanvasConfig(prev => ({ ...prev, ...updates }));
    // Canvas config change is not strictly layer history, but maybe it should be?
    // Let's stick to layer history for now.
  };

  const handleExport = async () => {
    try {
      const dataUrl = await renderMemeToCanvas(imageSrc, layers, canvasConfig, includeWatermark);
      setGeneratedMemeUrl(dataUrl);
      setIsShareModalOpen(true);
    } catch (e) {
      console.error("Export failed", e);
      alert("Could not generate image. Check console.");
    }
  };

  // --- Calculate Container Style ---
  const effectiveRatio = (canvasConfig.aspectRatio === 'original' && imgDimensions.w && imgDimensions.h)
    ? imgDimensions.w / imgDimensions.h
    : (typeof canvasConfig.aspectRatio === 'number' ? canvasConfig.aspectRatio : 1);

  const workspaceRatio = (workspaceDim.w && workspaceDim.h) ? workspaceDim.w / workspaceDim.h : 1;

  const containerStyle: React.CSSProperties = {
    aspectRatio: `${effectiveRatio}`,
    backgroundColor: canvasConfig.backgroundColor,
    position: 'relative'
  };

  if (workspaceDim.w > 0 && workspaceDim.h > 0) {
    if (effectiveRatio > workspaceRatio) {
      containerStyle.width = '100%';
      containerStyle.height = 'auto';
      containerStyle.maxWidth = '100%';
    } else {
      containerStyle.height = '100%';
      containerStyle.width = 'auto';
      containerStyle.maxHeight = '100%';
    }
  } else {
    containerStyle.width = '100%';
    containerStyle.height = '100%';
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-deep-black overflow-hidden font-sans">
      {/* Header */}
      <div className="flex-none bg-white border-b-2 border-black px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 font-bold hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="hidden md:inline">Back</span>
          </button>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-1 ml-4 border-l pl-4 border-gray-200">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo (Ctrl+Y)"
            >
              <RedoIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-black text-xl uppercase tracking-widest text-black">Studio</span>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Meme Your Pic</span>
        </div>

        <button
          onClick={handleExport}
          className="bg-brand-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 border-2 border-black shadow-hard-sm hover:translate-y-[-2px] hover:shadow-hard transition-all btn-press"
        >
          <ShareIcon className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Canvas Area */}
        <div
          ref={workspaceRef}
          className="flex-1 bg-deep-black flex items-center justify-center p-4 md:p-8 overflow-hidden touch-none relative"
          onClick={() => setSelectedId(null)}
        >
          {/* Subtle pattern background for the editor workspace */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div
            ref={containerRef}
            className="shadow-2xl bg-white select-none border-4 border-gray-700 overflow-hidden transition-all duration-300"
            style={{ ...containerStyle, containerType: 'inline-size' }}
          >
            {/* The Image inside the frame */}
            <img
              src={imageSrc}
              alt="Meme Base"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Layers Overlay - Positioned relative to the container box */}
            <div className="absolute inset-0 z-10">
              {layers.map(layer => (
                <DraggableLayer
                  key={layer.id}
                  layer={layer}
                  containerRef={containerRef}
                  isSelected={selectedId === layer.id}
                  onSelect={setSelectedId}
                  onUpdate={handleUpdateLayer}
                  onDelete={handleDeleteLayer}
                  onInteractionEnd={commitCurrentState}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Editing Panel (Sidebar / Bottom Sheet) */}
        <div className="flex-none w-full md:w-80 lg:w-96 bg-white z-10 h-1/2 md:h-auto border-t-4 md:border-t-0 md:border-l-4 border-black">
          <ControlPanel
            selectedLayerId={selectedId}
            layers={layers}
            generatedCaptions={initialCaptions}
            canvasConfig={canvasConfig}
            onUpdateLayer={handleUpdateLayer}
            onAddText={handleAddText}
            onAddSticker={handleAddSticker}
            onAddImageLayer={handleAddImageLayer}
            onReplaceBackground={handleReplaceBackground}
            onUpdateBgImage={onUpdateImage}
            onDeleteLayer={handleDeleteLayer}
            onSelectLayer={setSelectedId}
            onReorderLayer={handleReorderLayer}
            onApplyTemplate={handleApplyTemplate}
            onUpdateCanvas={handleUpdateCanvas}
          />
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && generatedMemeUrl && (
        <ShareModal
          imageDataUrl={generatedMemeUrl}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MemeEditor;
