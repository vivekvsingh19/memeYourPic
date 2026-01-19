
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { UploadIcon, MagicIcon, FireIcon, DownloadIcon, CheckIcon, ArrowDownIcon, SearchIcon, CrownIcon, CameraIcon, ShareIcon } from './Icons';
import BeforeAfterSlider from './BeforeAfterSlider';
import { MemeTemplateImage, SUPPORTED_LANGUAGES, POPULAR_TEMPLATES } from '../constants';
import { fetchMemeTemplates, ImgflipMeme, toMemeTemplateImage } from '../services/imgflipService';

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
  onBuyCredits: (amount: number, cost: string) => void;
  currency?: 'USD' | 'INR';
  onBattleClick?: () => void;
}

const DEMO_IMG = "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=1000&auto=format&fit=crop";
//const DEMO_IMG2 = "https://i.pinimg.com/736x/e1/71/a7/e171a7ff9681364e122c77ab285c80b8.jpg?q=80&w=1000&auto=format&fit=crop";

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
  credits,
  onBuyCredits,
  currency = 'USD',
  onBattleClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingText, setLoadingText] = useState("Generating...");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // API Templates State (Imgflip)
  const [apiTemplates, setApiTemplates] = useState<ImgflipMeme[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Fetch templates from Imgflip API
  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const memes = await fetchMemeTemplates();
      setApiTemplates(memes);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplateError('Failed to load templates. Using cached templates.');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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

  // Filter Templates - Use API templates or fallback to static ones
  const filteredTemplates = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    // Use API templates if available, otherwise fallback to static templates
    const templatesToUse = apiTemplates.length > 0
      ? apiTemplates.map(toMemeTemplateImage)
      : POPULAR_TEMPLATES;

    return templatesToUse.filter(t =>
      t.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, apiTemplates]);

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
            AI MEME <br />
            CAPTIONS IN <span className="text-brand-600 font-meme transform -rotate-2 inline-block hover:scale-110 transition-transform cursor-default drop-shadow-sm origin-left">SECONDS.</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Upload any photo. Our AI writes <span className="bg-pop-yellow px-2 py-0.5 border-2 border-black rounded-md text-black font-bold transform -skew-x-3 inline-block shadow-[2px_2px_0_0_rgba(0,0,0,1)]">hilarious captions</span> that actually land.
            <br /><span className="text-gray-400 text-lg mt-2 inline-block">✨ Free credits to start. No credit card needed.</span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-4">
            {['📸 Any Photo', '🎯 Context-Aware', '🌍 15+ Languages'].map((tag) => (
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

      {/*
      // ================= RECENTLY CREATED (Mock) =================
      <section className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-12 border-t-2 border-dashed border-gray-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-gray-800">
            Community Gallery <span className="text-brand-500">🔥</span>
          </h2>
          <button className="text-sm font-bold text-gray-500 hover:text-black underline">View All</button>
        </div>
        <AutoScrollGallery />
      </section>
      */}

      {/* ================= STEPS SECTION ================= */}
      <section className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase mb-4">Create memes in 3 steps</h2>
          <div className="h-2 w-24 bg-brand-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: UploadIcon, title: "1. Upload", desc: "Drop any pic. Selfie, meme template, anything.", color: "bg-acid-green" },
            { icon: MagicIcon, title: "2. AI Magic", desc: "AI writes killer captions in your style.", color: "bg-brand-400" },
            { icon: DownloadIcon, title: "3. Download", desc: "Share HD meme on Instagram, Twitter, TikTok.", color: "bg-hot-pink" }
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

      {/* ================= DEMO SECTION ================= */}
      <section className="w-full bg-white border-y-2 border-black py-20 px-8 md:px-16 lg:px-32 xl:px-48">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-16">

          <div className="flex-1 space-y-6">
            <h2 className="text-5xl font-black text-black leading-none">
              SAME <span className="text-gray-300 line-through decoration-4 decoration-red-500">BORING</span> <br />
              PHOTO,<br />
              <span className="bg-pop-yellow px-2 border-2 border-black rounded transform -rotate-1 inline-block shadow-hard-sm">HILARIOUS CAPTION</span>.
            </h2>
            <p className="text-xl font-medium text-gray-600">
              AI understands context, humor, and your vibe. It analyzes your photo and writes captions that match your style - whether you want sarcasm, wholesomeness, or roasts.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <span className="font-bold text-gray-700">Context-aware humor</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎭</span>
                <span className="font-bold text-gray-700">Multiple caption styles</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <span className="font-bold text-gray-700">15+ languages supported</span>
              </div>
            </div>
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

      {/* ================= MEME BATTLE SECTION ================= */}
      {/* ================= MEME BATTLE SECTION ================= */}
      {/* HIDDEN - Focus on core meme generation feature. Can be re-enabled later by uncommenting. */}



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





      {/* ================= TEMPLATES SECTION ================= */}
      <section id="templates-section" className="w-full max-w-screen-2xl px-8 md:px-16 lg:px-32 xl:px-48 py-24 border-t-2 border-black">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
            Viral Templates <span className="text-brand-500">🔥</span>
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-xl mx-auto">
            Choose from {apiTemplates.length > 0 ? apiTemplates.length : '100+'} popular meme templates. Click to edit instantly!
          </p>
          <div className="h-2 w-24 bg-brand-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates... (e.g. Drake, Distracted Boyfriend)"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              className="w-full py-4 pl-12 pr-4 bg-white border-2 border-black rounded-xl font-bold focus:outline-none focus:shadow-hard-sm transition-shadow"
            />
          </div>
          <button
            onClick={() => { loadTemplates(); setSearchTerm(''); setVisibleCount(ITEMS_PER_PAGE); }}
            disabled={isLoadingTemplates}
            className="px-6 py-4 bg-white border-2 border-black rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-hard-sm hover:translate-y-[-2px] disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${isLoadingTemplates ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Error Banner */}
        {templateError && (
          <div className="mb-8 p-4 bg-yellow-100 border-2 border-yellow-500 text-yellow-800 rounded-xl font-bold text-center">
            ⚠️ {templateError}
          </div>
        )}

        {/* Template Grid */}
        {isLoadingTemplates ? (
          // Loading Skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl border-2 border-gray-300 animate-pulse"></div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          // No Results
          <div className="text-center py-16">
            <p className="text-2xl font-black text-gray-400">No templates found 😢</p>
            <p className="text-gray-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          // Template Cards
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayedTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative aspect-square bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-hard-lg hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={template.url}
                  alt={template.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                  <span className="text-white text-xs font-bold text-center leading-tight line-clamp-2">
                    {template.name}
                  </span>
                  <button
                    onClick={() => onTemplateSelect(template)}
                    className="bg-brand-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-hard-sm hover:scale-105 transition-transform"
                  >
                    Use This
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoadingTemplates && (
          <div className="text-center mt-10">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-black text-white rounded-xl border-2 border-black font-black uppercase tracking-wide hover:bg-gray-800 transition-colors shadow-hard hover:translate-y-[-2px]"
            >
              Load More Templates
            </button>
          </div>
        )}


      </section>

      {/* ================= PRICING SECTION ================= */}
      <section id="pricing" className="w-full max-w-screen-xl px-4 md:px-8 lg:px-16 py-24 border-t-2 border-black bg-gradient-to-b from-pop-blue/5 to-white">
        <div className="text-center mb-16">
          <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            ⚡ Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 text-black tracking-tight">
            Start Free. <span className="text-brand-600">Scale when you're ready.</span>
          </h2>
          <p className="text-xl font-medium text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get started with free credits. No credit card needed.
            <br className="hidden md:block" />
            <span className="text-sm font-bold text-gray-400 mt-2 block">When you love it, upgrade for unlimited memes.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* FREE TIER */}
          <div className="relative group bg-white rounded-3xl border-2 border-gray-300 p-8 flex flex-col hover:border-black transition-all duration-300 hover:shadow-hard-sm">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-black">Start Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black">$0</span>
              <span className="text-gray-400 font-bold">forever</span>
            </div>

            <div className="text-6xl mb-6 text-center">🎁</div>
            <div className="text-center mb-8">
              <span className="text-3xl font-black">40</span>
              <span className="text-sm uppercase font-bold text-gray-400 ml-2">Free Credits</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <span className="text-green-500 text-lg">✓</span> 4 meme captions generated
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <span className="text-green-500 text-lg">✓</span> All 15+ languages
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <span className="text-green-500 text-lg">✓</span> HD downloads
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-400 line-through decoration-2">
                <span className="text-gray-300 text-lg">×</span> No watermark
              </li>
            </ul>

            <button
              className="w-full py-4 bg-gray-100 hover:bg-black hover:text-white border-2 border-black rounded-xl font-black uppercase tracking-wider transition-all"
            >
              Get Started
            </button>
            <p className="text-center text-xs font-bold text-gray-400 mt-4">Try it now • No signup required</p>
          </div>

          {/* PRO TIER (Highlighted) */}
          <div className="relative group bg-brand-500 rounded-3xl border-4 border-black p-8 flex flex-col shadow-hard">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest border-2 border-white shadow-lg">
              🚀 Best Value
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-md">Pro Unlimited</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-white drop-shadow-md">$9.99</span>
              <span className="text-black/60 font-bold">one-time</span>
            </div>

            <div className="text-7xl mb-6 text-center drop-shadow-lg">🔥</div>
            <div className="text-center mb-8">
              <span className="text-4xl font-black text-white drop-shadow-md">∞</span>
              <span className="text-sm uppercase font-bold text-black/60 ml-2">Unlimited Memes</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm font-bold text-black">
                <div className="bg-white rounded-full p-0.5"><span className="text-brand-600 font-black">✓</span></div> Unlimited AI captions forever
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-black">
                <div className="bg-white rounded-full p-0.5"><span className="text-brand-600 font-black">✓</span></div> <span className="underline decoration-black decoration-2">No watermarks</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-black">
                <div className="bg-white rounded-full p-0.5"><span className="text-brand-600 font-black">✓</span></div> Commercial use license
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-black">
                <div className="bg-white rounded-full p-0.5"><span className="text-brand-600 font-black">✓</span></div> 4K HD exports
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-black">
                <div className="bg-white rounded-full p-0.5"><span className="text-brand-600 font-black">✓</span></div> Priority support
              </li>
            </ul>

            <button
              onClick={() => onBuyCredits(0, '$9.99')}
              className="w-full py-4 bg-black text-white hover:bg-white hover:text-black border-2 border-transparent hover:border-black rounded-xl font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-none translate-y-0 hover:translate-y-1"
            >
              Unlock Unlimited
            </button>
            <p className="text-center text-xs font-bold text-black/50 mt-4">✨ One payment • Forever access • 30-day guarantee</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h3 className="text-2xl font-black uppercase mb-8 text-center text-black">Questions?</h3>
          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-xl p-4">
              <p className="font-black uppercase text-sm mb-2">What's included in the free tier?</p>
              <p className="text-sm text-gray-600">40 free credits = 4 meme captions with full access to all styles and languages. Perfect to test the quality.</p>
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-4">
              <p className="font-black uppercase text-sm mb-2">Can I use Pro memes for my business?</p>
              <p className="text-sm text-gray-600">Yes! Pro includes a commercial license. Use memes for content, brands, agencies - whatever you want.</p>
            </div>
            <div className="bg-white border-2 border-black rounded-xl p-4">
              <p className="font-black uppercase text-sm mb-2">Is there a money-back guarantee?</p>
              <p className="text-sm text-gray-600">Yes. Try it risk-free for 30 days. If you don't love it, full refund. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
const AutoScrollGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Community gallery - meme images with text overlays
  const memeItems = [
    {
      image: "/cat_meme_after_1765357687792.png",
      hasOverlay: false, // Already has text baked in
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
      topText: "SHOWING UP TO WORK",
      bottomText: "ON A MONDAY",
      hasOverlay: true,
    },
    {
      image: "/dog_meme_after_1765357710645.png",
      hasOverlay: false,
    },
    {
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60",
      topText: "WHEN YOU FINALLY",
      bottomText: "GET THE JOKE",
      hasOverlay: true,
    },
    {
      image: "/surprised_cat_meme_1765357750933.png",
      hasOverlay: false,
    },
    {
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60",
      topText: "TRYING TO LOOK",
      bottomText: "PRODUCTIVE AT WORK",
      hasOverlay: true,
    },
    {
      image: "/judgmental_cat_meme_1765357785438.png",
      hasOverlay: false,
    },
    {
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60",
      topText: "WHEN SOMEONE SAYS",
      bottomText: "\"IT'S EASY\"",
      hasOverlay: true,
    },
    {
      image: "/kitten_pov_meme_1765357805278.png",
      hasOverlay: false,
    },
    {
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60",
      topText: "PRETENDING TO LISTEN",
      bottomText: "TO ADVICE",
      hasOverlay: true,
    },
    {
      image: "/relaxed_cat_meme_1765357834521.png",
      hasOverlay: false,
    },
    {
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60",
      topText: "ME AFTER SAYING",
      bottomText: "\"I'M FINE\"",
      hasOverlay: true,
    },
  ];

  // Duplicate for seamless looping
  const duplicatedItems = [...memeItems, ...memeItems];

  useEffect(() => {
    let animationFrameId: number;
    // speed (pixels per frame)
    const speed = 0.5;

    const animate = () => {
      if (scrollRef.current && !isPaused) {
        scrollRef.current.scrollLeft += speed;

        // Reset scroll when reaching the end (seamless loop)
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
      className="flex overflow-x-auto pb-8 -mx-4 px-4 hide-scrollbar gap-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {duplicatedItems.map((item, i) => (
        <div key={i} className="flex-none w-72 md:w-96 group relative rounded-2xl overflow-hidden border-4 border-black bg-white shadow-hard-lg hover:-translate-y-2 transition-all duration-300">
          {/* Meme Image */}
          <div className="aspect-square relative">
            <img
              src={item.image}
              alt="Community Meme"
              className="w-full h-full object-cover"
            />

            {/* Meme Text Overlay for people photos */}
            {item.hasOverlay && (
              <>
                {/* Top Text */}
                {item.topText && (
                  <div className="absolute top-4 left-0 right-0 text-center px-4">
                    <span
                      className="text-white font-black text-2xl md:text-4xl uppercase tracking-wider leading-tight"
                      style={{
                        textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000',
                        fontFamily: 'Impact, "Anton", "Bebas Neue", sans-serif',
                        WebkitTextStroke: '1px black'
                      }}
                    >
                      {item.topText}
                    </span>
                  </div>
                )}

                {/* Bottom Text */}
                {item.bottomText && (
                  <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                    <span
                      className="text-white font-black text-2xl md:text-4xl uppercase tracking-wider leading-tight"
                      style={{
                        textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0 0 #000, 3px 0 0 #000, 0 -3px 0 #000, 0 3px 0 #000',
                        fontFamily: 'Impact, "Anton", "Bebas Neue", sans-serif',
                        WebkitTextStroke: '1px black'
                      }}
                    >
                      {item.bottomText}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => {
                alert("Shared to Community Feed! (Direct sharing available in Editor)");
              }}
              className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-hard-sm border-2 border-black"
              title="Share"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
