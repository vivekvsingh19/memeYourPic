
import React, { useState, useEffect, useCallback } from 'react';
import { FireIcon } from './Icons';
import { fetchRedditMemes, RedditMeme } from '../services/redditMemeService';

interface ExplorePageProps {
  onMemeSelect: (imageUrl: string) => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onMemeSelect }) => {
  const [memes, setMemes] = useState<RedditMeme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch memes
  const loadMemes = useCallback(async (append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMemes = await fetchRedditMemes(20);
      if (append) {
        // Append new memes to existing ones
        setMemes(prev => [...prev, ...fetchedMemes]);
      } else {
        // Replace with new memes
        setMemes(fetchedMemes);
      }
    } catch (err) {
      console.error('Failed to load memes:', err);
      setError('Failed to load trending memes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemes(false);
  }, [loadMemes]);

  const formatUpvotes = (ups: number): string => {
    if (ups >= 1000000) return `${(ups / 1000000).toFixed(1)}M`;
    if (ups >= 1000) return `${(ups / 1000).toFixed(1)}k`;
    return ups.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-brand-500 via-orange-500 to-red-500 border-b-4 border-black pt-32 pb-16">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-16 lg:px-32 xl:px-48">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Trending Memes 🔥
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              The hottest memes from around the internet
            </p>

            {/* Refresh Button */}
            <button
              onClick={() => loadMemes(false)}
              disabled={isLoading}
              className="px-8 py-4 bg-white text-black border-4 border-black rounded-xl font-black uppercase tracking-wide text-lg hover:translate-y-[-4px] transition-transform shadow-hard hover:shadow-hard-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Loading...' : 'Refresh Feed'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Memes Grid Section */}
      <section className="w-full max-w-screen-2xl mx-auto px-8 md:px-16 lg:px-32 xl:px-48 py-16">
        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-6 bg-red-100 border-4 border-red-500 rounded-xl">
            <p className="text-red-800 font-black text-lg text-center">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-orange-100 rounded-xl border-2 border-orange-200 animate-pulse"></div>
            ))}
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl font-black text-gray-400 uppercase">No Memes Found 😢</p>
            <p className="text-xl font-bold text-gray-500 mt-4">Try refreshing the page</p>
          </div>
        ) : (
          /* Memes Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memes.map((meme, index) => (
              <div
                key={`${meme.postLink}-${index}`}
                onClick={() => onMemeSelect(meme.url)}
                className="group relative bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-hard-lg hover:-translate-y-2 transition-all duration-300 shadow-hard-sm cursor-pointer"
              >
                {/* Popularity Badge */}
                <div className="absolute top-2 right-2 z-10 bg-white px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 border-2 border-black shadow-hard-xs">
                  <span className="text-orange-500">🔥</span>
                  {formatUpvotes(meme.ups)}
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={meme.url}
                    alt={meme.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+not+available';
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
                    <p className="text-white text-sm font-bold text-center leading-tight line-clamp-3">
                      {meme.title}
                    </p>
                    <button className="bg-brand-500 text-black px-6 py-2 rounded-lg text-sm font-black uppercase shadow-hard-sm border-2 border-black hover:scale-105 transition-transform">
                      Edit This Meme →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && memes.length > 0 && (
          <div className="text-center mt-16">
            <button
              onClick={() => loadMemes(true)}
              className="px-12 py-5 bg-brand-500 text-black border-4 border-black rounded-xl font-black uppercase tracking-widest text-xl hover:translate-y-[-4px] transition-transform shadow-hard hover:shadow-hard-lg"
            >
              Load More Memes 🔥
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
