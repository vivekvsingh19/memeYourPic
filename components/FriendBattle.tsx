import React, { useState, useEffect } from 'react';
import { UploadIcon, FireIcon } from './Icons';
import { generateRoastBattle } from '../services/geminiService';
import { BattleResult } from '../types';

const FriendBattle: React.FC = () => {
  const [player1, setPlayer1] = useState<File | null>(null);
  const [player2, setPlayer2] = useState<File | null>(null);
  const [p1Preview, setP1Preview] = useState<string | null>(null);
  const [p2Preview, setP2Preview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVsAnim, setShowVsAnim] = useState(false);

  const handleFileSelect = (file: File, player: 1 | 2) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (player === 1) {
        setPlayer1(file);
        setP1Preview(e.target?.result as string);
      } else {
        setPlayer2(file);
        setP2Preview(e.target?.result as string);
      }
      // Reset result when new file uploaded
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleBattle = async () => {
    if (!player1 || !player2) return;
    setIsGenerating(true);
    setShowVsAnim(true);
    setResult(null);
    setError(null);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const data = await generateRoastBattle(player1, player2);
      // Artificial delay for tension if the API is too fast
      setTimeout(() => {
        setResult(data);
        setIsGenerating(false);
        setShowVsAnim(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate battle. Try again.");
      setIsGenerating(false);
      setShowVsAnim(false);
    }
  };

  const handleShareResult = async () => {
    if (!result) return;

    const text = `
🔥 MEME BATTLE RESULT 🔥
👑 WINNER: ${result.winnerTitle}
🏆 REASON: ${result.reason}

💀 ROAST P1: ${result.roastP1}
💀 ROAST P2: ${result.roastP2}

Verdict: ${result.overallVerdict}

Judge by Meme Your Pic 🤖
    `.trim();

    // Try Native Share first (Mobile/Supported Browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meme Battle Verdict 🥊',
          text: text,
        });
        return; // Success
      } catch (err) {
        console.log('Share cancelled or failed, falling back to clipboard');
      }
    }

    // Fallback to Clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert("Battle results copied to clipboard! Go spam the group chat. 💀");
    } catch (err) {
      console.error("Clipboard failed", err);
      alert("Could not share. Take a screenshot! 📸");
    }
  };

  return (
    <div className="min-h-screen bg-web-bg pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Battle Overlay Animation */}
      {isGenerating && showVsAnim && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
            {/* P1 */}
            <div className="absolute left-0 md:left-20 w-48 h-64 md:w-64 md:h-80 bg-white border-4 border-blue-500 rounded-2xl rotate-[-10deg] animate-shake shadow-[0_0_50px_rgba(59,130,246,0.5)] z-10 overflow-hidden">
              {p1Preview && <img src={p1Preview} className="w-full h-full object-cover" />}
            </div>

            {/* VS Text */}
            <div className="z-30 text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-red-600 italic tracking-tighter animate-slam drop-shadow-[0_4px_0_#fff]">
              VS
            </div>

            {/* P2 */}
            <div className="absolute right-0 md:right-20 w-48 h-64 md:w-64 md:h-80 bg-white border-4 border-red-500 rounded-2xl rotate-[10deg] animate-shake shadow-[0_0_50px_rgba(239,68,68,0.5)] z-10 overflow-hidden">
              {p2Preview && <img src={p2Preview} className="w-full h-full object-cover" />}
            </div>
          </div>
          <p className="mt-12 text-white font-black text-3xl animate-pulse tracking-widest uppercase">
            Judging Aura...
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center mb-12 relative z-10">
        <div className="inline-block bg-red-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest border-2 border-black mb-4 animate-bounce shadow-hard-sm">
          🔥 SAVAGE MODE
        </div>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-white" style={{ WebkitTextStroke: '2px black' }}>
          Meme <span className="text-red-500">Battle</span>
        </h1>
        <p className="text-xl font-bold text-gray-600 bg-white inline-block px-4 py-1 border-2 border-black rounded-lg shadow-sm transform -rotate-2">
          Two enter. One leaves with emotional damage. 💀
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start relative mb-12 z-10">

        {/* VS Badge Static */}
        <div className="absolute left-1/2 top-16 md:top-1/3 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-24 h-24 bg-black text-pop-yellow rounded-full border-4 border-white shadow-hard items-center justify-center active:scale-95 transition-transform hover:rotate-12 cursor-default">
          <span className="font-black text-5xl italic pr-2 pt-1">VS</span>
        </div>

        {/* Player 1 Card */}
        <div className={`
          relative bg-white border-4 border-black rounded-3xl p-6 transition-all duration-500
          ${result?.winner === 1 ? 'ring-8 ring-yellow-400 scale-[1.05] z-10 shadow-[0_20px_0_rgba(0,0,0,0.2)]' : 'shadow-hard hover:-translate-y-1'}
          ${result?.winner === 2 ? 'opacity-80 scale-95 grayscale-[0.5]' : ''}
        `}>

          {result?.winner === 1 && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 animate-slam">
              <div className="bg-yellow-400 text-black px-6 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest text-xl shadow-hard whitespace-nowrap flex items-center gap-2">
                👑 WINNER
              </div>
            </div>
          )}

          <div className="absolute -top-5 left-6 bg-blue-500 text-white px-4 py-1 rounded-lg border-2 border-black font-black uppercase text-sm shadow-hard-sm z-10 rotate-[-2deg]">
            Player 1
          </div>

          <div
            className="aspect-[3/4] bg-blue-50 rounded-2xl border-4 border-black overflow-hidden relative cursor-pointer group"
            onClick={() => document.getElementById('p1-upload')?.click()}
          >
            {p1Preview ? (
              <img src={p1Preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-blue-200 m-2 rounded-xl">
                <UploadIcon className="w-16 h-16 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-blue-900 uppercase text-lg">Upload Fighter #1</span>
              </div>
            )}

            {/* Hover overlay for change */}
            {p1Preview && !isGenerating && !result && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold uppercase border-2 border-white px-4 py-2 rounded-lg">Change Photo</span>
              </div>
            )}
          </div>
          <input id="p1-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 1)} />

          {/* Roast Result P1 */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl border-2 border-black ${result.winner === 1 ? 'bg-yellow-100' : 'bg-red-50'}`}>
              <p className="text-xs font-black text-gray-500 uppercase mb-1">AI Roast</p>
              <p className="text-lg font-bold leading-tight">"{result.roastP1}"</p>
            </div>
          )}
        </div>

        {/* Player 2 Card */}
        <div className={`
          relative bg-white border-4 border-black rounded-3xl p-6 transition-all duration-500
          ${result?.winner === 2 ? 'ring-8 ring-yellow-400 scale-[1.05] z-10 shadow-[0_20px_0_rgba(0,0,0,0.2)]' : 'shadow-hard hover:-translate-y-1'}
          ${result?.winner === 1 ? 'opacity-80 scale-95 grayscale-[0.5]' : ''}
        `}>

          {result?.winner === 2 && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 animate-slam">
              <div className="bg-yellow-400 text-black px-6 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest text-xl shadow-hard whitespace-nowrap flex items-center gap-2">
                👑 WINNER
              </div>
            </div>
          )}

          <div className="absolute -top-5 right-6 bg-red-500 text-white px-4 py-1 rounded-lg border-2 border-black font-black uppercase text-sm shadow-hard-sm z-10 rotate-[2deg]">
            Player 2
          </div>

          <div
            className="aspect-[3/4] bg-red-50 rounded-2xl border-4 border-black overflow-hidden relative cursor-pointer group"
            onClick={() => document.getElementById('p2-upload')?.click()}
          >
            {p2Preview ? (
              <img src={p2Preview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-red-200 m-2 rounded-xl">
                <UploadIcon className="w-16 h-16 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-red-900 uppercase text-lg">Upload Fighter #2</span>
              </div>
            )}
            {/* Hover overlay for change */}
            {p2Preview && !isGenerating && !result && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold uppercase border-2 border-white px-4 py-2 rounded-lg">Change Photo</span>
              </div>
            )}
          </div>
          <input id="p2-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 2)} />

          {/* Roast Result P2 */}
          {result && (
            <div className={`mt-6 p-4 rounded-xl border-2 border-black ${result.winner === 2 ? 'bg-yellow-100' : 'bg-red-50'}`}>
              <p className="text-xs font-black text-gray-500 uppercase mb-1">AI Roast</p>
              <p className="text-lg font-bold leading-tight">"{result.roastP2}"</p>
            </div>
          )}
        </div>

      </div>

      {/* Action Area */}
      <div className="max-w-xl mx-auto text-center relative z-20">
        {error && (
          <div className="bg-red-100 border-l-8 border-red-600 p-4 mb-6 rounded-r-xl text-left">
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        )}

        {!result ? (
          <button
            onClick={handleBattle}
            disabled={!player1 || !player2 || isGenerating}
            className={`
              w-full py-6 rounded-2xl text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 border-4 border-black transition-all shadow-hard transform
              ${!player1 || !player2
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 hover:from-red-400 hover:to-red-500 active:scale-95'
              }
            `}
          >
            {isGenerating ? 'Judgement Day...' : (<><FireIcon className="w-8 h-8" /> FIGHT!</>)}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Verdict Box */}
            <div className="bg-black text-white p-6 rounded-3xl border-4 border-pop-yellow shadow-hard animate-float-fast">
              <h3 className="text-lg font-bold text-pop-yellow uppercase tracking-widest mb-2">The Verdict</h3>
              <p className="text-2xl font-black mb-4 italic">"{result.overallVerdict}"</p>
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-sm text-gray-400 uppercase font-bold mb-1">Reason for victory</p>
                <p className="font-medium text-lg">{result.reason}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setPlayer1(null); setPlayer2(null);
                  setP1Preview(null); setP2Preview(null);
                  setResult(null);
                }}
                className="flex-1 bg-white border-4 border-black py-4 rounded-xl font-black uppercase text-lg shadow-hard hover:-translate-y-1 transition-transform"
              >
                New Battle
              </button>
              <button
                onClick={handleShareResult}
                className="flex-1 bg-yellow-400 border-4 border-black py-4 rounded-xl font-black uppercase text-lg shadow-hard hover:-translate-y-1 transition-transform"
              >
                Share Result
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default FriendBattle;
