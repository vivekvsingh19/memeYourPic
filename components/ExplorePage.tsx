import React, { useState, useEffect, useCallback } from 'react';
import { fetchRedditMemes } from '../services/redditMemeService';
import { fetchIndianTemplates, fetchGlobalTemplates } from '../services/templateService';

interface ExplorePageProps {
  onMemeSelect: (imageUrl: string) => void;
}

// Unified interface for display
interface DisplayMeme {
  id: string;
  url: string;
  title: string;
  ups?: number; // Only for reddit memes
  source: 'reddit' | 'imgflip' | 'local';
}

type TabType = 'trending' | 'indian' | 'classic';

const ExplorePage: React.FC<ExplorePageProps> = ({ onMemeSelect }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [memes, setMemes] = useState<DisplayMeme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemes = useCallback(async (tab: TabType, append: boolean = false) => {
    // If not appending, clear current memes immediately to show loading state or transition
    if (!append) {
      setIsLoading(true);
      setMemes([]);
    }

    setError(null);

    try {
      let newMemes: DisplayMeme[] = [];

      if (tab === 'trending') {
        const redditMemes = await fetchRedditMemes(20);
        newMemes = redditMemes.map(m => ({
          id: m.postLink,
          url: m.url,
          title: m.title,
          ups: m.ups,
          source: 'reddit'
        }));
      } else if (tab === 'indian') {
        const indianTemplates = await fetchIndianTemplates();
        newMemes = indianTemplates.map(m => ({
          id: m.id,
          url: m.url,
          title: m.name,
          source: m.source
        }));
      } else if (tab === 'classic') {
        // Classic templates are static list from Imgflip, usually ~100.
        // We fetching them all at once.
        const globalTemplates = await fetchGlobalTemplates();
        newMemes = globalTemplates.map(m => ({
          id: m.id,
          url: m.url,
          title: m.name,
          source: m.source
        }));
      }

      setMemes(prev => append ? [...prev, ...newMemes] : newMemes);
    } catch (err) {
      console.error('Failed to load memes:', err);
      setError('Failed to load memes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load memes when tab changes
  useEffect(() => {
    loadMemes(activeTab, false);
  }, [activeTab, loadMemes]);

  const formatUpvotes = (ups?: number): string => {
    if (!ups) return '';
    if (ups >= 1000000) return `${(ups / 1000000).toFixed(1)}M`;
    if (ups >= 1000) return `${(ups / 1000).toFixed(1)}k`;
    return ups.toString();
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'indian', label: 'Indian (Desi)', icon: '🇮🇳' },
    { id: 'classic', label: 'Classics', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-brand-500 via-orange-500 to-red-500 border-b-4 border-black pt-32 pb-8">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-16 lg:px-32 xl:px-48">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Meme Library
            </h1>
            <p className="text-lg md:text-xl font-bold text-white mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              Pick a template to start creating
            </p>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 rounded-xl font-black uppercase tracking-wide text-lg border-4 border-black transition-all shadow-hard
                    ${activeTab === tab.id
                      ? 'bg-white text-black scale-105'
                      : 'bg-black text-white hover:bg-gray-800 hover:-translate-y-1'}
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Memes Grid Section */}
      <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-16 lg:px-32 xl:px-48 py-12">

        {/* Refresh/Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase italic truncate">
            {activeTab === 'trending' ? '🔥 Trending Now' : activeTab === 'indian' ? '🇮🇳 Indian Templates' : '🏛️ All Time Classics'}
          </h2>
          <button
            onClick={() => loadMemes(activeTab, false)}
            disabled={isLoading}
            className="p-2 bg-white border-2 border-black rounded-lg hover:shadow-hard-sm transition-all active:translate-y-1"
            title="Refresh"
          >
            <svg className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-6 bg-red-100 border-4 border-red-500 rounded-xl">
            <p className="text-red-800 font-black text-lg text-center">⚠️ {error}</p>
            <button onClick={() => loadMemes(activeTab, false)} className="block mx-auto mt-4 underline font-bold">Try Again</button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && memes.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl border-2 border-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : memes.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-3xl font-black text-gray-400 uppercase">No Memes Found 😢</p>
            <p className="text-xl font-bold text-gray-500 mt-4">Try a different category</p>
          </div>
        ) : (
          /* Memes Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {memes.map((meme, index) => (
              <div
                key={`${meme.id}-${index}`}
                onClick={() => onMemeSelect(meme.url)}
                className="group relative bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-hard-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                {/* Popularity Badge (only for trending) */}
                {meme.ups && (
                  <div className="absolute top-2 right-2 z-10 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-black flex items-center gap-1 border border-black shadow-sm backdrop-blur-sm">
                    <span className="text-orange-500">🔥</span>
                    {formatUpvotes(meme.ups)}
                  </div>
                )}

                {/* Source Badge (optional detail) */}
                {/* <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-1 py-0.5 rounded text-[8px] font-bold uppercase">
                  {meme.source}
                </div> */}

                {/* Image */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  <img
                    src={meme.url}
                    alt={meme.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+Missing';
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                    <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-2 px-1">
                      {meme.title}
                    </p>
                    <span className="bg-brand-500 text-black px-3 py-1 rounded text-xs font-black uppercase border border-black transform scale-90">
                      Use
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && memes.length > 0 && activeTab !== 'classic' && (
          <div className="text-center mt-12">
            <button
              onClick={() => loadMemes(activeTab, true)}
              className="px-8 py-3 bg-white text-black border-4 border-black rounded-xl font-black uppercase tracking-wide text-lg hover:-translate-y-1 transition-transform shadow-hard hover:shadow-hard-md"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
