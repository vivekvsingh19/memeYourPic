
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { UploadIcon, MagicIcon, FireIcon, DownloadIcon, CheckIcon, ArrowDownIcon, SearchIcon, CrownIcon, CameraIcon, ShareIcon } from './Icons';
import BeforeAfterSlider from './BeforeAfterSlider';
import { POPULAR_TEMPLATES, MemeTemplateImage, SUPPORTED_LANGUAGES, DAILY_PACKS } from '../constants';

interface HomePageProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  roastMode: boolean;
  onToggleRoastMode: () => void;
  onGenerate: () => void;
  imageFile: File | null;
  imagePreview: string | null;
  onClearImage: () => void;
  onTemplateSelect: (template: MemeTemplateImage) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onSignupClick: () => void;
  credits: number;
}

const DEMO_IMG = "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=1000&auto=format&fit=crop";

const LOADING_JOKES = [
  "Consulting the Meme Gods... 🧘‍♂️",
  "Cooking up something spicy... 🌶️",
  "Translating 'cringe' to 'based'... 📟",
  "Analyzing vibe levels... 📈",
  "Doing it for the vine... 🎥",
];

const ITEMS_PER_PAGE = 12;

const HomePage: React.FC<HomePageProps> = ({
  onFileSelect,
  isLoading,
  roastMode,
  onToggleRoastMode,
  onGenerate,
  imageFile,
  imagePreview,
  onClearImage,
  onTemplateSelect,
  selectedLanguage,
  onLanguageChange,
  onSignupClick,
  credits
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingText, setLoadingText] = useState("Generating...");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingText(LOADING_JOKES[Math.floor(Math.random() * LOADING_JOKES.length)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Camera Logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Wait for the modal to render and ref to attach
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image horizontally to match user expectation (selfie mode)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onFileSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Filter Templates
  const filteredTemplates = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return POPULAR_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm]);

  const displayedTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const scrollToTemplates = () => {
    document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col items-center pt-32 pb-12">

      {/* ================= HERO SECTION ================= */}
      <section className="w-full max-w-screen-2xl px-4 md:px-16 lg:px-32 xl:px-48 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-8rem)] mb-12">

        {/* Left: Text Content */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 text-center lg:text-left z-10">
          <div className="inline-block mx-auto lg:mx-0 bg-pop-yellow border-2 border-black px-4 py-1.5 rounded-full shadow-hard-sm transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <CrownIcon className="w-3 h-3" />
              The #1 AI Meme Generator
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black leading-[0.9] mb-2">
            DAILY VIRAL <br />
            MEME <span className="text-brand-600 font-meme transform -rotate-2 inline-block hover:scale-110 transition-transform cursor-default drop-shadow-sm origin-left">IDEAS.</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Turn boring photos into <span className="bg-pop-yellow px-2 py-0.5 border-2 border-black rounded-md text-black font-bold transform -skew-x-3 inline-block shadow-[2px_2px_0_0_rgba(0,0,0,1)]">viral gold</span> instantly.
            <br /><span className="text-gray-400 text-lg mt-2 inline-block">Zero skills required. Just pure vibes.</span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-4">
            {['Free to Start', 'Viral Ready', 'TikTok Optimized'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white border-2 border-black rounded-lg text-sm font-bold shadow-hard-sm hover:-translate-y-1 transition-transform cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Upload Box */}
        <div className="col-span-1 lg:col-span-5 w-full relative z-10">
          {/* Decorative elements behind */}
          <div className="absolute top-0 right-0 w-full h-full bg-brand-400 rounded-3xl border-2 border-black transform translate-x-3 translate-y-3 z-0"></div>

          <div className="bg-white rounded-3xl border-2 border-black p-6 relative z-10 shadow-hard-lg">

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                Meme Studio
                <span className="text-brand-500 text-2xl">✨</span>
              </h3>
            </div>

            {/* Drop Zone */}
            <div
              className={`
                    w-full min-h-[300px] md:aspect-[4/3] md:min-h-0 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all group p-4
                    ${imagePreview
                  ? 'border-brand-500 bg-gray-50'
                  : 'border-gray-300 bg-gray-50 hover:border-black hover:bg-brand-50 cursor-pointer'
                }
                  `}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onClearImage(); }}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-lg border-2 border-black shadow-hard-sm flex items-center justify-center hover:bg-red-600 transition-colors z-20"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl border-4 border-black shadow-hard-sm flex items-center justify-center group-hover:scale-105 transition-transform text-brand-500">
                      <UploadIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); startCamera(); }}
                      className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl border-4 border-black shadow-hard-sm flex flex-col items-center justify-center group-hover:scale-105 transition-transform text-brand-500 hover:bg-brand-50 z-20"
                      title="Take Photo"
                    >
                      <CameraIcon className="w-6 h-6 md:w-8 md:h-8 text-black mb-1" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-black">Camera</span>
                    </button>
                  </div>
                  <p className="font-black text-lg md:text-xl text-black uppercase tracking-tight text-center">Drop or Click to Upload</p>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest bg-white px-2 py-1 rounded border border-gray-200 text-center">Supports JPG, PNG, WEBP</p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
              />
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Language Selector */}
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider ml-1">Language</label>
                  <div className="relative h-12">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => onLanguageChange(e.target.value)}
                      className="w-full h-full appearance-none bg-white border-2 border-black rounded-xl pl-4 pr-10 font-bold text-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:shadow-hard-sm transition-shadow"
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>

                {/* Roast Mode Toggle */}
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider ml-1">AI Persona</label>
                  <button
                    onClick={onToggleRoastMode}
                    className={`
                            w-full h-12 flex items-center justify-between px-4 rounded-xl border-2 border-black font-bold text-sm cursor-pointer transition-all
                            ${roastMode ? 'bg-black text-white shadow-hard-sm' : 'bg-white hover:bg-gray-50 text-black'}
                        `}
                  >
                    <div className="flex items-center gap-2">
                      <FireIcon className={`w-5 h-5 ${roastMode ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                      <span className="uppercase tracking-wide">{roastMode ? 'Roast' : 'Chill'}</span>
                    </div>

                    {/* Toggle Switch Visual */}
                    <div className={`w-10 h-5 rounded-full border-2 transition-colors relative flex-shrink-0 ${roastMode ? 'bg-gray-700 border-gray-500' : 'bg-gray-200 border-gray-300'}`}>
                      <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black transition-all duration-300 ${roastMode ? 'right-1 bg-red-500' : 'left-1 bg-white'}`}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <div>
                <div className="flex justify-center mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${credits > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                    {credits > 0 ? `${credits} Credits Left` : '0 Credits Left'}
                  </span>
                </div>
                <button
                  onClick={onGenerate}
                  disabled={isLoading || !imageFile}
                  className={`
                      w-full py-4 rounded-xl text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-black transition-all btn-press
                      ${isLoading || !imageFile
                      ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'bg-pop-yellow text-black shadow-hard hover:bg-yellow-400 hover:translate-y-[-2px]'
                    }
                    `}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <MagicIcon className="w-6 h-6" />
                      Generate Memes
                    </>
                  )}
                </button>
              </div>

              {/* Link to Templates */}
              <div className="text-center pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">OR</p>
                <button
                  onClick={scrollToTemplates}
                  className="inline-flex items-center gap-1 text-sm font-black underline decoration-2 underline-offset-4 decoration-gray-300 hover:decoration-brand-500 hover:text-brand-600 transition-all"
                >
                  Browse viral templates
                  <ArrowDownIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENTLY CREATED (Mock) ================= */}
      <section className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-12 border-t-2 border-dashed border-gray-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-gray-800">
            Community Gallery <span className="text-brand-500">🔥</span>
          </h2>
          <button className="text-sm font-bold text-gray-500 hover:text-black underline">View All</button>
        </div>

        <AutoScrollGallery />
      </section>

      {/* ================= DAILY VIRAL PACKS SECTION ================= */}
      <section className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-red-600 mb-2 inline-block animate-pulse">
              Refreshes in 12h 30m
            </span>
            <h2 className="text-4xl font-black text-black uppercase tracking-tight">
              Daily Viral Packs
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'npc', title: 'NPC Week', desc: 'Oblivion dialogue vibes', emoji: '🤖', color: 'bg-blue-100' },
            { id: 'gym', title: 'Gym Bro Pack', desc: 'Do you even lift?', emoji: '💪', color: 'bg-gray-200' },
            { id: 'anime', title: 'Anime Roast', desc: 'Main character energy', emoji: '✨', color: 'bg-pink-100' },
            { id: 'corp', title: 'Corporate Life', desc: 'Per my last email', emoji: '💼', color: 'bg-indigo-100' },
          ].map((pack) => (
            <div key={pack.id} className={`relative p-6 rounded-3xl border-2 border-black ${pack.color} hover:-translate-y-2 transition-transform cursor-pointer shadow-hard-sm group`}>
              <div className="absolute top-4 right-4 text-4xl group-hover:scale-125 transition-transform">{pack.emoji}</div>
              <h3 className="text-2xl font-black uppercase mt-8 mb-2">{pack.title}</h3>
              <p className="text-sm font-bold text-gray-600 mb-6">{pack.desc}</p>
              <button className="w-full py-3 bg-white border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-colors">
                Generate Pack
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CAMERA MODAL ================= */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto object-cover transform scale-x-[-1]" // Mirror effect for selfie
            />
            <div className="absolute bottom-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
              <button
                onClick={stopCamera}
                className="text-white font-bold bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-full"
              >
                Cancel
              </button>

              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-white border-2 border-black"></div>
              </button>

              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>
      )}

      {/* ================= DEMO SECTION ================= */}
      <section className="w-full bg-white border-y-2 border-black py-20 px-8 md:px-16 lg:px-32 xl:px-48">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-16">

          <div className="flex-1 space-y-6">
            <h2 className="text-5xl font-black text-black leading-none">
              FROM <span className="text-gray-300 line-through decoration-4 decoration-red-500">CRINGE</span> <br />
              TO <span className="bg-pop-yellow px-2 border-2 border-black rounded transform -rotate-1 inline-block shadow-hard-sm">BASED</span>.
            </h2>
            <p className="text-xl font-medium text-gray-600">
              Our AI understands context better than your friends. It analyzes the vibe, the awkwardness, and the chaos to generate captions that actually hit.
            </p>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="rounded-2xl border-4 border-black shadow-hard-lg overflow-hidden bg-gray-100 relative">
              <div className="absolute top-4 left-4 z-20 bg-white border-2 border-black px-3 py-1 rounded font-bold text-xs uppercase shadow-hard-sm">
                Interactive Demo
              </div>
              <BeforeAfterSlider
                originalSrc={DEMO_IMG}
                memeSrc={DEMO_IMG}
                className="aspect-[4/3]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ================= STEPS SECTION ================= */}
      <section className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase mb-4">How to go viral</h2>
          <div className="h-2 w-24 bg-brand-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: UploadIcon, title: "1. Upload", desc: "Drag, drop, or shoot. We accept everything.", color: "bg-acid-green" },
            { icon: MagicIcon, title: "2. AI Magic", desc: "Our AI roasts you & writes the captions.", color: "bg-brand-400" },
            { icon: DownloadIcon, title: "3. Go Viral", desc: "Export in HD. Post it. Watch the likes roll in.", color: "bg-hot-pink" }
          ].map((step, idx) => (
            <div key={idx} className="group relative">
              <div className={`absolute inset-0 ${step.color} rounded-2xl border-2 border-black transform translate-x-2 translate-y-2`}></div>
              <div className="relative bg-white p-8 rounded-2xl border-2 border-black hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-300 flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 rounded-xl border-2 border-black mb-6 flex items-center justify-center ${step.color} shadow-hard-sm`}>
                  <step.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-3">{step.title}</h3>
                <p className="font-medium text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TEMPLATES SECTION ================= */}
      <section id="templates-section" className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div className="text-left">
            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-brand-200 mb-4 inline-block">
              Infinite Library
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">
              Trending Templates
            </h2>
            <p className="text-lg text-gray-500 font-medium mt-2">Pick a classic and start editing instantly.</p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-auto relative group">
            <input
              type="text"
              placeholder="Search memes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="w-full md:w-80 pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-black outline-none font-bold text-gray-800 shadow-sm focus:shadow-hard-sm transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-black transition-colors" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedTemplates.length > 0 ? (
            displayedTemplates.map((tmpl, idx) => (
              <button
                key={tmpl.id}
                onClick={() => onTemplateSelect(tmpl)}
                className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-black bg-white shadow-hard hover:shadow-hard-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Trending Badge for first few items */}
                {idx < 4 && !searchTerm && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <FireIcon className="w-3 h-3" /> Trending
                  </div>
                )}

                {/* Image Container */}
                <div className="w-full h-full bg-gray-100 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  <img
                    src={tmpl.url}
                    alt={tmpl.name}
                    loading="lazy"
                    onLoad={(e) => {
                      (e.target as HTMLElement).previousElementSibling?.remove();
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0 relative z-10"
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"></div>

                {/* Action Button (Visible on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 z-30">
                  <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm border-2 border-black shadow-hard-sm">
                    Edit This
                  </span>
                </div>

                {/* Label Badge */}
                <div className="absolute bottom-3 left-3 right-3 z-30">
                  <div className="bg-white/90 backdrop-blur border-2 border-black px-3 py-2 rounded-lg text-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                    <p className="font-black text-xs uppercase tracking-wider truncate">{tmpl.name}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
              <p className="text-xl font-bold text-gray-400">No templates found for "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-brand-600 font-bold underline">Clear Search</button>
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-full border-2 border-gray-200 hover:border-black hover:bg-gray-50 hover:shadow-hard-sm transition-all"
            >
              Load More Templates
            </button>
          </div>
        )}
      </section>

      {/* ================= STEPS SECTION ================= */}


      {/* ================= PRICING SECTION ================= */}
      <section id="pricing" className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-24 mb-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-tighter">
            Get More Credits
          </h2>
          <p className="text-xl text-gray-600 font-bold max-w-2xl mx-auto">
            Pay once, keep them forever. No monthly subscriptions. No hidden fees.
            <br />
            <span className="text-brand-600">Just pure meme-making power.</span>
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center max-w-screen-xl mx-auto">

          {/* Pack 1: Starter */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col hover:border-black hover:shadow-hard transition-all duration-300 relative group">
            <div className="mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Starter Pack</span>
              <h3 className="text-5xl font-black text-black mt-2">50 <span className="text-2xl text-gray-500">Credits</span></h3>
            </div>

            <div className="text-3xl font-bold text-black mb-6">
              $4.99
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Perfect for casual roasting
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                No expiration date
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Remove watermarks
              </li>
            </ul>

            <button
              onClick={onSignupClick}
              className="w-full py-3 rounded-xl border-2 border-black bg-white text-black font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Pack 2: Pro (Featured) */}
          <div className="bg-black text-white border-4 border-black rounded-3xl p-8 flex flex-col shadow-2xl transform md:-translate-y-4 relative overflow-hidden z-10">
            <div className="absolute top-0 right-0 bg-brand-500 text-black text-xs font-black uppercase px-3 py-1 rounded-bl-xl">
              Most Popular
            </div>

            <div className="mb-4 relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
              <span className="text-sm font-black uppercase tracking-widest text-brand-500">Pro Stash</span>
              <h3 className="text-6xl font-black text-white mt-2">200 <span className="text-2xl text-gray-400">Credits</span></h3>
            </div>

            <div className="flex items-end gap-2 mb-8">
              <span className="text-4xl font-bold text-white">$14.99</span>
              <span className="text-sm text-gray-400 line-through mb-1">$19.99</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 font-bold text-gray-200">
                <div className="bg-brand-500 p-0.5 rounded-full text-black">
                  <CheckIcon className="w-3 h-3" />
                </div>
                Best value for creators
              </li>
              <li className="flex items-center gap-3 font-bold text-gray-200">
                <div className="bg-brand-500 p-0.5 rounded-full text-black">
                  <CheckIcon className="w-3 h-3" />
                </div>
                Priority generation queue
              </li>
              <li className="flex items-center gap-3 font-bold text-gray-200">
                <div className="bg-brand-500 p-0.5 rounded-full text-black">
                  <CheckIcon className="w-3 h-3" />
                </div>
                Access to exclusive styles
              </li>
            </ul>

            <button
              onClick={onSignupClick}
              className="w-full py-4 rounded-xl bg-brand-500 text-black font-black text-lg uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Buy Now
            </button>
          </div>

          {/* Pack 3: Ultimate */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col hover:border-black hover:shadow-hard transition-all duration-300 relative group">
            <div className="mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Meme God</span>
              <h3 className="text-5xl font-black text-black mt-2">500 <span className="text-2xl text-gray-500">Credits</span></h3>
            </div>

            <div className="text-3xl font-bold text-black mb-6">
              $29.99
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Lowest cost per meme
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                Commercial license included
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <CheckIcon className="w-4 h-4 text-green-500" />
                24/7 Priority Support
              </li>
            </ul>

            <button
              onClick={onSignupClick}
              className="w-full py-3 rounded-xl border-2 border-black bg-white text-black font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all"
            >
              Get Ultimate
            </button>
          </div>
        </div>
      </section>

      {/* ================= RECENTLY CREATED (Mock) ================= */}



    </div>
  );
};
const AutoScrollGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    // speed (pixels per frame)
    const speed = 0.5;

    const animate = () => {
      if (scrollRef.current && !isPaused) {
        scrollRef.current.scrollLeft += speed;

        // Reset scroll when reaching the end (simple loop effect)
        // Note: For a true seamless loop, we'd need to duplicate items.
        // For now, this is a simple auto-scroll.
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 1) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto pb-8 -mx-4 px-4 hide-scrollbar gap-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {[
        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=60",
        // Duplicate for looping effect
        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60",
      ].map((src, i) => (
        <div key={i} className="flex-none w-64 md:w-80 group relative aspect-square rounded-xl overflow-hidden border-2 border-black bg-white shadow-hard-sm hover:-translate-y-1 transition-transform">
          <img src={src} className="w-full h-full object-cover" alt="Meme" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => {
                alert("Shared to Community Feed! (Direct sharing available in Editor)");
              }}
              className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform" title="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black transform rotate-2">
            VIRAL
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
