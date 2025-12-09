
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Layer, MemeTemplate, GeneratedCaption } from '../../types';
import { TextIcon, StickerIcon, PaletteIcon, LayersIcon, TrashIcon, UppercaseIcon, StrikethroughIcon, BringToFrontIcon, SendToBackIcon, MoveForwardIcon, MoveBackwardIcon, BoldIcon, CheckIcon, CloseIcon, AspectRatioIcon, SquareIcon, PortraitIcon, LandscapeIcon, ImageIcon, RefreshIcon, UploadIcon, SearchIcon, FireIcon, DownloadIcon } from '../Icons';
import { POPULAR_TEMPLATES, MemeTemplateImage } from '../../constants';

interface ControlPanelProps {
    selectedLayerId: string | null;
    layers: Layer[];
    generatedCaptions: GeneratedCaption[];
    canvasConfig: {
        aspectRatio: number | 'original';
        backgroundColor: string;
    };
    onUpdateLayer: (id: string, updates: Partial<Layer>, saveHistory?: boolean) => void;
    onAddText: (content?: string) => void;
    onAddSticker: (emoji: string) => void;
    onAddImageLayer: (file: File) => void;
    onReplaceBackground: (file: File) => void;
    onUpdateBgImage: (url: string) => void;
    onDeleteLayer: (id: string) => void;
    onSelectLayer: (id: string) => void;
    onReorderLayer: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void;
    onApplyTemplate: (template: MemeTemplate) => void;
    onUpdateCanvas: (updates: { aspectRatio?: number | 'original'; backgroundColor?: string }) => void;
    isPanelCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onExport?: () => void;
}

const TABS = [
    { id: 'text', label: 'Text', icon: TextIcon },
    { id: 'stickers', label: 'Emoji', icon: StickerIcon },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'style', label: 'Style', icon: PaletteIcon },
    { id: 'templates', label: 'Layouts', icon: LayersIcon },
    { id: 'export', label: 'Export', icon: DownloadIcon },
];

const FONTS = [
    { id: 'impact', label: 'Impact' },
    { id: 'oswald', label: 'Oswald' },
    { id: 'roboto', label: 'Roboto' },
    { id: 'comic', label: 'Comic' },
    { id: 'meme', label: 'Marker' },
    { id: 'hand', label: 'Hand' },
    { id: 'cinzel', label: 'Medieval' },
    { id: 'pacifico', label: 'Cute' },
    { id: 'creepster', label: 'Spooky' },
    { id: 'courier', label: 'Retro' },
];

const STICKERS = ['😂', '💀', '🔥', '💯', '🤡', '😭', '👀', '✨', '💔', '🍆', '🍑', '🎉', '💩', '🧠', '🚩', '🧢'];

const TEMPLATES: MemeTemplate[] = [
    {
        id: 'classic',
        label: 'Classic Top/Bottom',
        preview: '',
        layers: [
            { x: 50, y: 10, fontSize: 48, content: 'TOP TEXT' },
            { x: 50, y: 90, fontSize: 48, content: 'BOTTOM TEXT' }
        ]
    },
    {
        id: 'modern',
        label: 'Modern Subtitle',
        preview: '',
        layers: [
            { x: 50, y: 85, fontSize: 32, content: 'TEXT HERE', fontFamily: 'roboto', isUppercase: false, strokeWidth: 2 }
        ]
    },
    {
        id: 'headline',
        label: 'Breaking News',
        preview: '',
        layers: [
            { x: 50, y: 15, fontSize: 40, content: 'BREAKING NEWS', fontFamily: 'oswald', isUppercase: true, color: '#FFFFFF', strokeColor: '#FF0000', strokeWidth: 4 },
            { x: 50, y: 85, fontSize: 32, content: 'DETAILS HERE', fontFamily: 'roboto', isUppercase: false }
        ]
    },
    {
        id: 'sticker-bomb',
        label: 'Chaotic Sticker',
        preview: '',
        layers: [
            { x: 50, y: 50, fontSize: 40, content: 'TEXT HERE' },
            { x: 20, y: 20, type: 'sticker', content: '🔥', scale: 1.5 },
            { x: 80, y: 80, type: 'sticker', content: '💀', scale: 1.5 }
        ]
    },
];

const COLORS = ['#FFFFFF', '#000000', '#FF0000', '#FFFF00', '#00FF00', '#0000FF', '#FF00FF', '#D4AF37', '#FFB6C1'];

// Helper for Color Conversion
const hexToHsl = (hex: string) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, l: 50 };
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

// Inline Custom Color Picker Component
const CustomColorPicker = ({
    color,
    onChange,
    onClose,
    recentColors
}: {
    color: string,
    onChange: (c: string) => void,
    onClose: () => void,
    recentColors: string[]
}) => {
    const [hue, setHue] = useState(0);
    const [hex, setHex] = useState(color);

    useEffect(() => {
        const { h } = hexToHsl(color);
        setHue(h);
        setHex(color);
    }, [color]);

    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHue = parseInt(e.target.value);
        setHue(newHue);
        // Default to high saturation/brightness when moving hue
        const newColor = hslToHex(newHue, 100, 50);
        onChange(newColor);
        setHex(newColor);
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            onChange(val);
            const { h } = hexToHsl(val);
            setHue(h);
        }
    };

    const handleEyeDropper = async () => {
        if ('EyeDropper' in window) {
            try {
                // @ts-ignore
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                onChange(result.sRGBHex);
            } catch (e) {
                console.log('EyeDropper failed or cancelled');
            }
        } else {
            alert('EyeDropper not supported in this browser');
        }
    };

    return (
        <div className="mt-3 p-4 bg-gray-100 rounded-xl border border-gray-200 animate-fade-in relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-black">
                <CloseIcon className="w-4 h-4" />
            </button>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Custom Picker</label>

            {/* Hue Slider */}
            <div className="mb-4">
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={handleHueChange}
                    className="w-full h-4 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                />
            </div>

            {/* Inputs & Actions */}
            <div className="flex gap-2 items-center mb-3">
                <div
                    className="w-10 h-10 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                ></div>
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">#</span>
                    <input
                        type="text"
                        value={hex.replace('#', '')}
                        onChange={handleHexChange}
                        className="w-full pl-6 pr-2 py-2 rounded-lg border border-gray-300 text-sm font-mono uppercase focus:border-black outline-none"
                        maxLength={6}
                    />
                </div>
                {'EyeDropper' in window && (
                    <button
                        onClick={handleEyeDropper}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                        title="Pick Color from Screen"
                    >
                        <PaletteIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Recent</label>
                    <div className="flex flex-wrap gap-2">
                        {recentColors.map((c, i) => (
                            <button
                                key={i}
                                onClick={() => onChange(c)}
                                className="w-6 h-6 rounded-md border border-gray-300 shadow-sm hover:scale-110 hover:border-black transition-all"
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedLayerId,
    layers,
    generatedCaptions,
    canvasConfig,
    onUpdateLayer,
    onAddText,
    onAddSticker,
    onAddImageLayer,
    onReplaceBackground,
    onUpdateBgImage,
    onDeleteLayer,
    onSelectLayer,
    onReorderLayer,
    onApplyTemplate,
    onUpdateCanvas,
    isPanelCollapsed = false,
    onToggleCollapse,
    onExport
}) => {
    const [activeTab, setActiveTab] = useState('text');

    // State to manage which color picker is open (inline)
    const [activeColorPicker, setActiveColorPicker] = useState<'fill' | 'outline' | 'background' | 'canvas' | null>(null);

    // History of used custom colors
    const [recentColors, setRecentColors] = useState<string[]>([]);

    // Template Search State
    const [templateSearch, setTemplateSearch] = useState('');

    // File inputs Refs
    const addImageInputRef = useRef<HTMLInputElement>(null);
    const replaceBgInputRef = useRef<HTMLInputElement>(null);

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    // Auto-switch to Text tab when selection changes
    useEffect(() => {
        if (selectedLayerId && activeTab === 'templates') {
            setActiveTab('text');
        }
    }, [selectedLayerId]);

    // Close color picker when layer selection changes, unless it's canvas picker
    useEffect(() => {
        if (activeColorPicker !== 'canvas') {
            setActiveColorPicker(null);
        }
    }, [selectedLayerId]);

    // Handle closing picker and saving the current color to history
    const handleCloseColorPicker = () => {
        let colorToSave = '';

        if (activeColorPicker === 'canvas') {
            colorToSave = canvasConfig.backgroundColor;
        } else if (selectedLayer) {
            colorToSave = activeColorPicker === 'fill' ? (selectedLayer.color || '') :
                activeColorPicker === 'outline' ? (selectedLayer.strokeColor || '') :
                    (selectedLayer.backgroundColor || '');
        }

        if (colorToSave && !COLORS.includes(colorToSave)) {
            setRecentColors(prev => {
                const newColors = [colorToSave, ...prev.filter(c => c !== colorToSave)].slice(0, 14);
                return newColors;
            });
        }

        setActiveColorPicker(null);
    };

    const toggleColorPicker = (type: 'fill' | 'outline' | 'background' | 'canvas') => {
        if (activeColorPicker === type) {
            handleCloseColorPicker();
        } else {
            setActiveColorPicker(type);
        }
    };

    // Filter templates for the background picker
    const filteredBgTemplates = useMemo(() => {
        const term = templateSearch.toLowerCase();
        return POPULAR_TEMPLATES.filter(t => t.name.toLowerCase().includes(term));
    }, [templateSearch]);

    const commitLayerUpdate = (id: string) => {
        onUpdateLayer(id, {}, true); // Commit history with empty update
    };

    const handleTabClick = (tabId: string) => {
        if (activeTab === tabId) {
            // If clicking active tab, toggle collapse (mobile only)
            if (onToggleCollapse) onToggleCollapse();
        } else {
            setActiveTab(tabId);
            // If collapsed, expand
            if (isPanelCollapsed && onToggleCollapse) {
                onToggleCollapse();
            }
        }
    };

    return (
        <div className="w-full h-full bg-white flex flex-col-reverse md:flex-col">
            {/* Tabs */}
            <div className="flex-none flex border-t-2 md:border-t-0 md:border-b-2 border-black bg-gray-50 overflow-x-auto z-20 relative">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex-1 min-w-[60px] py-4 flex flex-col items-center justify-center gap-1 text-xs font-black uppercase tracking-wider transition-all
              ${activeTab === tab.id && !isPanelCollapsed
                                ? 'text-brand-600 bg-white md:border-t-4 md:border-t-brand-500 md:-mb-[2px] md:pb-[18px] border-t-4 border-t-brand-500'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
            `}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isPanelCollapsed ? 'hidden md:block' : ''}`}>

                {/* Mobile Drag Handle / Close Indicator */}
                <div className="md:hidden w-full flex justify-center mb-4" onClick={onToggleCollapse}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* TEXT TAB */}
                {activeTab === 'text' && (
                    <div className="space-y-6">

                        {/* AI Persona Selector (New) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                <FireIcon className="w-4 h-4 text-brand-500" />
                                AI Persona Mode
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                {[
                                    { id: 'savage', label: 'Savage', emoji: '🔥', desc: 'No mercy roasts' },
                                    { id: 'chill', label: 'Chill', emoji: '🧊', desc: 'Good vibes only' },
                                    { id: 'british', label: 'British', emoji: '☕', desc: 'Dry sarcasm' },
                                    { id: 'zoomer', label: 'Zoomer', emoji: '💀', desc: 'fr fr no cap' },
                                    { id: 'toxic', label: 'Toxic Ex', emoji: '🚩', desc: 'Gaslighting 101' },
                                    { id: 'sigma', label: 'Sigma', emoji: '🗿', desc: 'Grindset mindset' },
                                    { id: 'anime', label: 'Tsundere', emoji: '💢', desc: 'It\'s not like I like you!' },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            // In a real app, this would trigger a re-generation or update state
                                            // For now, we'll just show visual selection (mock)
                                            // You might want to add a prop `onPersonaChange` later
                                        }}
                                        className="snap-start flex-none flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-black hover:bg-white transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                        title={p.desc}
                                    >
                                        <span className="text-2xl mb-1">{p.emoji}</span>
                                        <span className="text-[10px] font-black uppercase">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Layers List */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-gray-400 uppercase">Layers</label>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">{layers.filter(l => l.type === 'text').length}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {layers.filter(l => l.type === 'text').map((l, i) => (
                                    <div
                                        key={l.id}
                                        onClick={() => onSelectLayer(l.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                                ${selectedLayerId === l.id
                                                ? 'border-black bg-gray-100 shadow-sm'
                                                : 'border-gray-100 bg-white hover:border-gray-300'
                                            }
                            `}
                                    >
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${selectedLayerId === l.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            T{i + 1}
                                        </div>
                                        <span className="flex-1 font-bold text-sm truncate text-gray-800">
                                            {l.content || "Empty"}
                                        </span>
                                        {selectedLayerId === l.id && <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>}
                                    </div>
                                ))}
                                {layers.filter(l => l.type === 'text').length === 0 && (
                                    <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400">No text layers</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => onAddText()}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-hard-sm hover:translate-y-[-1px] btn-press flex items-center justify-center gap-2"
                        >
                            <TextIcon className="w-4 h-4" />
                            ADD NEW TEXT
                        </button>

                        {/* AI Suggestions */}
                        {generatedCaptions.length > 0 && (
                            <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-3">
                                <label className="block text-xs font-bold text-brand-600 uppercase mb-2">
                                    🔥 AI Roast Suggestions
                                </label>
                                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {generatedCaptions.map((cap) => (
                                        <button
                                            key={cap.id}
                                            onClick={() => {
                                                if (selectedLayer && selectedLayer.type === 'text') {
                                                    onUpdateLayer(selectedLayer.id, { content: cap.text });
                                                } else {
                                                    onAddText(cap.text);
                                                }
                                            }}
                                            className="text-left text-sm p-3 bg-white border border-brand-100 rounded-lg hover:border-brand-500 hover:shadow-md transition-all text-gray-700 font-medium active:scale-[0.98]"
                                        >
                                            {cap.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedLayer && selectedLayer.type === 'text' ? (
                            <div className="space-y-4 animate-fade-in pt-4 border-t-2 border-gray-100">
                                <label className="block text-xs font-bold text-gray-400 uppercase">Edit Content</label>
                                <div className="flex gap-2">
                                    <textarea
                                        value={selectedLayer.content}
                                        onChange={(e) => onUpdateLayer(selectedLayer.id, { content: e.target.value }, false)} // Live update, no history save
                                        onBlur={() => commitLayerUpdate(selectedLayer.id)} // Commit on blur
                                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 outline-none font-sans text-lg bg-gray-50"
                                        rows={3}
                                        placeholder="Type your meme text here..."
                                    />
                                </div>

                                <button
                                    onClick={() => onDeleteLayer(selectedLayer.id)}
                                    className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg border-2 border-red-100 hover:border-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    Remove Text
                                </button>
                            </div>
                        ) : (
                            (selectedLayer?.type === 'sticker' || selectedLayer?.type === 'image') && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => onDeleteLayer(selectedLayer.id)}
                                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl border-2 border-red-100 hover:border-red-500 transition-all font-bold inline-flex items-center gap-2"
                                    >
                                        <TrashIcon className="w-4 h-4" /> Delete {selectedLayer.type === 'sticker' ? 'Sticker' : 'Photo'}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'images' && (
                    <div className="space-y-8">

                        {/* 1. Image Layers List */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-gray-400 uppercase">Image Layers</label>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">{layers.filter(l => l.type === 'image' || l.type === 'sticker').length}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {layers.filter(l => l.type === 'image' || l.type === 'sticker').map((l) => (
                                    <div
                                        key={l.id}
                                        onClick={() => onSelectLayer(l.id)}
                                        className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                                    ${selectedLayerId === l.id
                                                ? 'border-black bg-gray-100 shadow-sm'
                                                : 'border-gray-100 bg-white hover:border-gray-300'
                                            }
                                `}
                                    >
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300 flex-shrink-0">
                                            {l.type === 'image' && l.src ? (
                                                <img src={l.src} alt="layer" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl">{l.content}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate">
                                                {l.type === 'sticker' ? 'Sticker' : 'Image'}
                                            </p>
                                        </div>
                                        {selectedLayerId === l.id && <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse mr-2"></div>}
                                    </div>
                                ))}
                                {layers.filter(l => l.type === 'image' || l.type === 'sticker').length === 0 && (
                                    <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-xs font-bold text-gray-400">No image layers</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Add New Image Button */}
                        <div>
                            <button
                                onClick={() => addImageInputRef.current?.click()}
                                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-hard-sm hover:translate-y-[-1px] btn-press flex items-center justify-center gap-2"
                            >
                                <ImageIcon className="w-4 h-4" />
                                ADD NEW IMAGE
                            </button>
                            <input
                                type="file"
                                ref={addImageInputRef}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onAddImageLayer(e.target.files[0]);
                                        e.target.value = ''; // Reset
                                    }
                                }}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Selected Layer Controls (New) */}
                        {(selectedLayer?.type === 'image' || selectedLayer?.type === 'sticker') && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Selected Layer Actions</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onDeleteLayer(selectedLayer.id)}
                                        className="w-full py-2 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete Layer
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-gray-200 my-4"></div>

                        {/* Background Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <RefreshIcon className="w-4 h-4 text-brand-600" />
                                <label className="text-xs font-black text-gray-800 uppercase">Background Image</label>
                            </div>

                            {/* Upload */}
                            <button
                                onClick={() => replaceBgInputRef.current?.click()}
                                className="w-full py-3 mb-4 bg-white border border-gray-300 rounded-xl hover:border-black transition-all flex items-center justify-center gap-2 font-bold text-gray-700 shadow-sm"
                            >
                                <UploadIcon className="w-4 h-4" />
                                Upload New Image
                            </button>
                            <input
                                type="file"
                                ref={replaceBgInputRef}
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onReplaceBackground(e.target.files[0]);
                                        e.target.value = ''; // Reset
                                    }
                                }}
                                accept="image/*"
                                className="hidden"
                            />

                            {/* Library */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Trending Library</label>
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search memes..."
                                            value={templateSearch}
                                            onChange={(e) => setTemplateSearch(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 p-3 max-h-64 overflow-y-auto custom-scrollbar bg-gray-50">
                                    {filteredBgTemplates.map((tmpl) => (
                                        <button
                                            key={tmpl.id}
                                            onClick={() => onUpdateBgImage(tmpl.url)}
                                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white hover:border-brand-500 hover:ring-2 hover:ring-brand-200 transition-all relative group"
                                            title={tmpl.name}
                                        >
                                            <img
                                                src={tmpl.url}
                                                alt={tmpl.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <RefreshIcon className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        </button>
                                    ))}
                                    {filteredBgTemplates.length === 0 && (
                                        <div className="col-span-3 text-center py-4 text-xs text-gray-400 font-medium">
                                            No templates found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* STYLE TAB */}
                {activeTab === 'style' && (
                    <div className="space-y-6">

                        {/* Canvas Settings - Always Visible */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <AspectRatioIcon className="w-4 h-4" /> Canvas
                                </label>
                                {/* Background Color Trigger */}
                                <button
                                    onClick={() => toggleColorPicker('canvas')}
                                    className="w-6 h-6 rounded border border-gray-300 shadow-sm"
                                    style={{ backgroundColor: canvasConfig.backgroundColor }}
                                    title="Canvas Background"
                                />
                            </div>

                            {/* Inline Color Picker for Canvas */}
                            {activeColorPicker === 'canvas' && (
                                <div className="mb-4">
                                    <CustomColorPicker
                                        color={canvasConfig.backgroundColor}
                                        onChange={(c) => onUpdateCanvas({ backgroundColor: c })}
                                        onClose={handleCloseColorPicker}
                                        recentColors={recentColors}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Original', ratio: 'original', icon: AspectRatioIcon },
                                    { label: '1:1', ratio: 1, icon: SquareIcon },
                                    { label: '4:5', ratio: 4 / 5, icon: PortraitIcon },
                                    { label: '16:9', ratio: 16 / 9, icon: LandscapeIcon }
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => onUpdateCanvas({ aspectRatio: opt.ratio as number | 'original' })}
                                        className={`
                                flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all gap-1
                                ${canvasConfig.aspectRatio === opt.ratio
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                            }
                            `}
                                    >
                                        <opt.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedLayer ? (
                            <>
                                {/* Layer Arrangement */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Layer Arrangement</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onReorderLayer(selectedLayer.id, 'back')}
                                            className="flex-1 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center text-gray-600 transition-colors"
                                            title="Send to Back"
                                        >
                                            <SendToBackIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onReorderLayer(selectedLayer.id, 'backward')}
                                            className="flex-1 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center text-gray-600 transition-colors"
                                            title="Move Backward"
                                        >
                                            <MoveBackwardIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onReorderLayer(selectedLayer.id, 'forward')}
                                            className="flex-1 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center text-gray-600 transition-colors"
                                            title="Move Forward"
                                        >
                                            <MoveForwardIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onReorderLayer(selectedLayer.id, 'front')}
                                            className="flex-1 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center text-gray-600 transition-colors"
                                            title="Bring to Front"
                                        >
                                            <BringToFrontIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Position & Transform Controls */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Position & Transform</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">X (%)</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedLayer.x)}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { x: parseFloat(e.target.value) }, false)}
                                                onBlur={() => commitLayerUpdate(selectedLayer.id)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold font-mono focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Y (%)</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedLayer.y)}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { y: parseFloat(e.target.value) }, false)}
                                                onBlur={() => commitLayerUpdate(selectedLayer.id)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold font-mono focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Rotation (°)</label>
                                            <input
                                                type="number"
                                                value={Math.round(selectedLayer.rotation)}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { rotation: parseFloat(e.target.value) }, false)}
                                                onBlur={() => commitLayerUpdate(selectedLayer.id)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold font-mono focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Scale</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={Number(selectedLayer.scale.toFixed(1))}
                                                onChange={(e) => onUpdateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) }, false)}
                                                onBlur={() => commitLayerUpdate(selectedLayer.id)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold font-mono focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Text Specific Styles */}
                                {selectedLayer.type === 'text' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Font Family</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {FONTS.map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => onUpdateLayer(selectedLayer.id, { fontFamily: font.id })}
                                                        className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${selectedLayer.fontFamily === font.id ? 'border-brand-500 bg-brand-500 text-white shadow-hard-sm' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Decoration</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onUpdateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold })}
                                                    className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${selectedLayer.isBold ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}
                                                >
                                                    <BoldIcon className="w-4 h-4" />
                                                    Bold
                                                </button>
                                                <button
                                                    onClick={() => onUpdateLayer(selectedLayer.id, { isUppercase: !selectedLayer.isUppercase })}
                                                    className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${selectedLayer.isUppercase ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}
                                                >
                                                    <UppercaseIcon className="w-4 h-4" />
                                                    CAPS
                                                </button>
                                                <button
                                                    onClick={() => onUpdateLayer(selectedLayer.id, { isStrikethrough: !selectedLayer.isStrikethrough })}
                                                    className={`flex-1 py-2 rounded-lg border-2 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${selectedLayer.isStrikethrough ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}
                                                >
                                                    <StrikethroughIcon className="w-4 h-4" />
                                                    Strike
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fill Color Section */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Fill Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => onUpdateLayer(selectedLayer.id, { color: c })}
                                                        className={`w-10 h-10 rounded-full border-2 transition-transform ${selectedLayer.color === c ? 'border-black scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                {/* Custom Color Trigger */}
                                                <button
                                                    onClick={() => toggleColorPicker('fill')}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center cursor-pointer bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] shadow-sm hover:scale-105 transition-transform"
                                                    title="Custom Color"
                                                >
                                                    {activeColorPicker === 'fill' && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                                </button>
                                            </div>

                                            {/* Inline Picker for Fill */}
                                            {activeColorPicker === 'fill' && (
                                                <CustomColorPicker
                                                    color={selectedLayer.color || '#FFFFFF'}
                                                    onChange={(c) => onUpdateLayer(selectedLayer.id, { color: c })} // TODO: Consider changing to live update + commit on close? For now color picker changes are live and saved.
                                                    onClose={handleCloseColorPicker}
                                                    recentColors={recentColors}
                                                />
                                            )}
                                        </div>

                                        {/* Outline Color Section */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Outline Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => onUpdateLayer(selectedLayer.id, { strokeColor: c })}
                                                        className={`w-10 h-10 rounded-full border-2 transition-transform ${selectedLayer.strokeColor === c ? 'border-black scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                {/* Custom Color Trigger */}
                                                <button
                                                    onClick={() => toggleColorPicker('outline')}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center cursor-pointer bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] shadow-sm hover:scale-105 transition-transform"
                                                    title="Custom Color"
                                                >
                                                    {activeColorPicker === 'outline' && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                                </button>
                                            </div>

                                            {/* Inline Picker for Outline */}
                                            {activeColorPicker === 'outline' && (
                                                <CustomColorPicker
                                                    color={selectedLayer.strokeColor || '#000000'}
                                                    onChange={(c) => onUpdateLayer(selectedLayer.id, { strokeColor: c })}
                                                    onClose={handleCloseColorPicker}
                                                    recentColors={recentColors}
                                                />
                                            )}
                                        </div>

                                        {/* Background Color Section */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Background Color</label>
                                            <div className="flex flex-wrap gap-3">
                                                {/* Transparent Option */}
                                                <button
                                                    onClick={() => onUpdateLayer(selectedLayer.id, { backgroundColor: 'transparent' })}
                                                    className={`w-10 h-10 rounded-full border-2 transition-transform flex items-center justify-center ${!selectedLayer.backgroundColor || selectedLayer.backgroundColor === 'transparent' ? 'border-black scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                                                    title="Transparent"
                                                >
                                                    <div className="w-full h-full rounded-full bg-[linear-gradient(45deg,transparent_45%,#ff0000_45%,#ff0000_55%,transparent_55%)] opacity-30"></div>
                                                </button>

                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => onUpdateLayer(selectedLayer.id, { backgroundColor: c })}
                                                        className={`w-10 h-10 rounded-full border-2 transition-transform ${selectedLayer.backgroundColor === c ? 'border-black scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                {/* Custom Color Trigger */}
                                                <button
                                                    onClick={() => toggleColorPicker('background')}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center cursor-pointer bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] shadow-sm hover:scale-105 transition-transform"
                                                    title="Custom Color"
                                                >
                                                    {activeColorPicker === 'background' && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                                </button>
                                            </div>

                                            {/* Inline Picker for Background */}
                                            {activeColorPicker === 'background' && (
                                                <CustomColorPicker
                                                    color={selectedLayer.backgroundColor || '#FFFFFF'}
                                                    onChange={(c) => onUpdateLayer(selectedLayer.id, { backgroundColor: c })}
                                                    onClose={handleCloseColorPicker}
                                                    recentColors={recentColors}
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Text Size</label>
                                                    <span className="text-xs font-mono font-bold">{selectedLayer.fontSize || 24}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="150"
                                                    value={selectedLayer.fontSize || 24}
                                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) }, false)}
                                                    onMouseUp={() => commitLayerUpdate(selectedLayer.id)}
                                                    onTouchEnd={() => commitLayerUpdate(selectedLayer.id)}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-600 active:accent-brand-700"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Border Width</label>
                                                    <span className="text-xs font-mono font-bold">{selectedLayer.strokeWidth ?? 4}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    value={selectedLayer.strokeWidth ?? 4}
                                                    onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: parseInt(e.target.value) }, false)}
                                                    onMouseUp={() => commitLayerUpdate(selectedLayer.id)}
                                                    onTouchEnd={() => commitLayerUpdate(selectedLayer.id)}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-600 active:accent-brand-700"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-60 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                                <PaletteIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p className="font-bold text-sm">Select an element to style it</p>
                                <p className="text-xs mt-2 text-gray-400">Or use Canvas settings above</p>
                            </div>
                        )}
                    </div>
                )}

                {/* STICKERS TAB */}
                {activeTab === 'stickers' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Click to add</label>
                        <div className="grid grid-cols-4 gap-3">
                            {STICKERS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => onAddSticker(emoji)}
                                    className="text-4xl p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-black hover:bg-white hover:shadow-hard-sm transition-all flex items-center justify-center active:scale-95"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* TEMPLATES TAB */}
                {activeTab === 'templates' && (
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quick Layouts</label>
                        {TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                onClick={() => onApplyTemplate(template)}
                                className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:bg-brand-50 hover:border-brand-500 transition group bg-white"
                            >
                                <span className="font-black text-gray-800 block group-hover:text-brand-600 transition-colors uppercase tracking-wide">{template.label}</span>
                                <span className="text-xs text-gray-400 font-bold">Apply preset</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* EXPORT TAB */}
                {activeTab === 'export' && (
                    <div className="space-y-8">
                        {/* 1. Format Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Output Format</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                                {['Image', 'GIF', 'Video'].map((fmt) => (
                                    <button
                                        key={fmt}
                                        className={`flex-1 py-2 rounded-lg text-sm font-black uppercase transition-all ${fmt === 'Image' ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Viral Card Types */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Viral Card Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Meme Card', icon: '🖼️', desc: 'Standard 1:1' },
                                    { label: 'Vibe Check', icon: '✨', desc: 'Rating Card' },
                                    { label: 'NPC Identity', icon: '🤖', desc: 'Stats Card' },
                                    { label: 'Toxic Trait', icon: '🚩', desc: 'Warning Label' },
                                    { label: 'Persona Score', icon: '💯', desc: 'Rank Card' },
                                    { label: 'Vs Reality', icon: '🆚', desc: 'Side by Side' },
                                ].map((card) => (
                                    <button
                                        key={card.label}
                                        className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-hard-sm transition-all text-left group"
                                    >
                                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform origin-left">{card.icon}</div>
                                        <div className="font-black text-xs uppercase">{card.label}</div>
                                        <div className="text-[10px] text-gray-400 font-bold">{card.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Story Mode Toggle */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                            <div>
                                <h4 className="font-black text-sm uppercase">Story Mode</h4>
                                <p className="text-xs text-gray-500 font-bold">Auto-resize to 9:16 for TikTok/IG</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                            </div>
                        </div>

                        {/* Export CTA */}
                        <button
                            onClick={onExport}
                            className="w-full py-4 bg-brand-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-brand-400 transition shadow-hard btn-press flex items-center justify-center gap-2"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Export Viral Card
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
