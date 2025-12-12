
import React, { useState, useEffect, useCallback } from 'react';
import { FireIcon, HeartIcon, ShareIcon } from './Icons';
import { fetchRedditMemes, RedditMeme, MEME_SUBREDDITS } from '../services/redditMemeService';

const ExplorePage: React.FC = () => {
  const [memes, setMemes] = useState<RedditMeme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('Hot');

  // Fetch memes
  const loadMemes = useCallback(async (subreddit?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMemes = await fetchRedditMemes(30, subreddit || undefined);
      setMemes(fetchedMemes);
    } catch (err) {
      console.error('Failed to load memes:', err);
      setError('Failed to load memes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  const handleSubredditChange = (subreddit: string) => {
    setSelectedSubreddit(subreddit);
    loadMemes(subreddit || undefined);
  };

  const handleRefresh = () => {
    loadMemes(selectedSubreddit || undefined);
  };

  const formatUpvotes = (ups: number): string => {
    if (ups >= 1000000) return `${(ups / 1000000).toFixed(1)}M`;
    if (ups >= 1000) return `${(ups / 1000).toFixed(1)}k`;
    return ups.toString();
  };

  const getTimeAgo = (): string => {
    const times = ['Just now', '2 min ago', '5 min ago', '10 min ago', '30 min ago', '1 hour ago', '2 hours ago'];
    return times[Math.floor(Math.random() * times.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-2">
              Explore <FireIcon className="w-8 h-8 text-orange-500" />
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white border-2 border-black rounded-full font-bold text-sm hover:bg-orange-600 transition-colors shadow-hard-sm flex items-center gap-2 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Subreddit Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => handleSubredditChange('')}
              className={`px-4 py-2 border-2 border-black rounded-full font-bold text-sm whitespace-nowrap transition-colors ${selectedSubreddit === '' ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-100'
                }`}
            >
              🎲 All
            </button>
            {MEME_SUBREDDITS.map(sub => (
              <button
                key={sub}
                onClick={() => handleSubredditChange(sub)}
                className={`px-4 py-2 border-2 border-black rounded-full font-bold text-sm whitespace-nowrap transition-colors ${selectedSubreddit === sub ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-100'
                  }`}
              >
                r/{sub}
              </button>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['Hot', 'New', 'Top'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 border-2 border-black rounded-full font-bold text-sm transition-colors ${activeFilter === filter ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-800 rounded-xl font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden animate-pulse">
                <div className="p-4 flex items-center gap-3 border-b-2 border-gray-100">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl font-black text-gray-400">No memes found 😢</p>
            <p className="text-gray-500 mt-2">Try a different subreddit or refresh</p>
          </div>
        ) : (
          /* Feed */
          <div className="space-y-8">
            {memes.map((meme, index) => (
              <div key={`${meme.postLink}-${index}`} className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-hard">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-black flex items-center justify-center text-white font-black text-sm">
                      {meme.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm">u/{meme.author}</p>
                      <p className="text-xs text-gray-500 font-bold">{getTimeAgo()}</p>
                    </div>
                  </div>
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black border border-orange-200">
                    r/{meme.subreddit}
                  </div>
                </div>

                {/* Title */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-800 line-clamp-2">{meme.title}</p>
                </div>

                {/* Image */}
                <div className="aspect-auto max-h-[600px] bg-gray-100 relative overflow-hidden">
                  <img
                    src={meme.url}
                    alt={meme.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+not+available';
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="p-4">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors group">
                      <span className="text-orange-500 font-black text-xl group-hover:scale-110 transition-transform">▲</span>
                      <span className="font-black text-sm">{formatUpvotes(meme.ups)}</span>
                    </button>
                    <a
                      href={meme.postLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
                    >
                      <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-black text-sm">View on Reddit</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && memes.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleRefresh}
              className="px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-hard-sm border-2 border-black"
            >
              Load More Memes 🔥
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExplorePage;
