
import React, { useState } from 'react';
import { UploadIcon, FireIcon, MagicIcon } from './Icons';
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
    setResult(null);
    setError(null);

    try {
      const data = await generateRoastBattle(player1, player2);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate battle. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest border-2 border-black mb-4 animate-bounce">
          New Mode
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
          Friend <span className="text-red-600">Roast</span> Battle
        </h1>
        <p className="text-xl font-bold text-gray-500">
          Upload 2 photos. AI decides who gets cooked. 💀
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative mb-12">

        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-20 h-20 bg-black text-white rounded-full border-4 border-white shadow-hard items-center justify-center">
          <span className="font-black text-3xl italic pr-1">VS</span>
        </div>

        {/* Player 1 */}
        <div className={`bg-blue-50 border-4 border-black rounded-3xl p-6 relative group transition-all duration-300 ${result && result.winner === 1 ? 'ring-8 ring-yellow-400 scale-[1.02] z-10' : ''}`}>

          {result && result.winner === 1 && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-xl border-2 border-black font-black uppercase tracking-widest shadow-hard animate-bounce whitespace-nowrap z-30">
              👑 WINNER: {result.winnerTitle}
            </div>
          )}

          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-xl border-2 border-black font-black uppercase tracking-widest shadow-hard-sm z-10">
            Player 1
          </div>

          <div
            className="aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => document.getElementById('p1-upload')?.click()}
          >
            {p1Preview ? (
              <img src={p1Preview} alt="Player 1" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <UploadIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="font-bold text-blue-900 uppercase">Upload Victim #1</p>
              </div>
            )}
            <input
              id="p1-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 1)}
            />
          </div>

          {result && (
            <div className="mt-4 bg-white border-2 border-black p-4 rounded-xl shadow-sm">
              <p className="font-bold text-xl mb-2">🔥 The Roast:</p>
              <p className="text-gray-800 font-medium italic">"{result.roastP1}"</p>
            </div>
          )}
        </div>

        {/* Player 2 */}
        <div className={`bg-red-50 border-4 border-black rounded-3xl p-6 relative group transition-all duration-300 ${result && result.winner === 2 ? 'ring-8 ring-yellow-400 scale-[1.02] z-10' : ''}`}>

          {result && result.winner === 2 && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-xl border-2 border-black font-black uppercase tracking-widest shadow-hard animate-bounce whitespace-nowrap z-30">
              👑 WINNER: {result.winnerTitle}
            </div>
          )}

          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-xl border-2 border-black font-black uppercase tracking-widest shadow-hard-sm z-10">
            Player 2
          </div>

          <div
            className="aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-red-300 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => document.getElementById('p2-upload')?.click()}
          >
            {p2Preview ? (
              <img src={p2Preview} alt="Player 2" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <UploadIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="font-bold text-red-900 uppercase">Upload Victim #2</p>
              </div>
            )}
            <input
              id="p2-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 2)}
            />
          </div>

          {result && (
            <div className="mt-4 bg-white border-2 border-black p-4 rounded-xl shadow-sm">
              <p className="font-bold text-xl mb-2">🔥 The Roast:</p>
              <p className="text-gray-800 font-medium italic">"{result.roastP2}"</p>
            </div>
          )}
        </div>

      </div>

      {/* Action Bar */}
      <div className="max-w-xl mx-auto">
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <button
          onClick={handleBattle}
          disabled={!player1 || !player2 || isGenerating}
          className={`
            w-full py-6 rounded-2xl text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 border-4 border-black transition-all shadow-hard hover:-translate-y-1
            ${!player1 || !player2
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
              : 'bg-pop-yellow text-black hover:bg-yellow-400'
            }
          `}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin rounded-full h-6 w-6 border-b-4 border-black"></span>
              Judging...
            </>
          ) : (
            <>
              <FireIcon className="w-8 h-8" />
              {result ? 'Rematch?' : 'Start Roast Battle'}
            </>
          )}
        </button>
        <p className="text-center mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Warning: Emotional damage may occur
        </p>

        {/* Verdict Box */}
        {result && (
          <div className="mt-12 bg-black text-white p-8 rounded-3xl border-4 border-pop-yellow shadow-hard text-center">
            <h3 className="text-2xl font-black uppercase text-pop-yellow mb-2">Judge's Verdict</h3>
            <p className="text-xl font-medium mb-6">"{result.reason}"</p>
            <div className="inline-block bg-white/20 px-6 py-3 rounded-xl">
              <p className="font-black text-lg uppercase tracking-widest">{result.overallVerdict}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendBattle;

