
import React from 'react';
import { FireIcon, HeartIcon, ShareIcon } from './Icons';

const MOCK_POSTS = [
  { id: 1, user: 'meme_lord_99', image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000', likes: '12.5k', caption: 'Me trying to explain crypto to my grandma' },
  { id: 2, user: 'toxic_ex_gf', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000', likes: '8.2k', caption: 'He said he needed space so I sent him to NASA' },
  { id: 3, user: 'gym_bro_chad', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000', likes: '5.1k', caption: 'Leg day? Never heard of her.' },
  { id: 4, user: 'corporate_slave', image: 'https://images.unsplash.com/photo-1488161628813-99c974fc5bcd?q=80&w=1000', likes: '22k', caption: 'Per my last email...' },
];

const ExplorePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-2">
            Trending <FireIcon className="w-8 h-8 text-red-500" />
          </h1>
          <div className="flex gap-2">
            {['Hot', 'New', 'Top'].map(filter => (
              <button key={filter} className="px-4 py-2 bg-white border-2 border-black rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors">
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          {MOCK_POSTS.map(post => (
            <div key={post.id} className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-hard">
              {/* Header */}
              <div className="p-4 flex items-center gap-3 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black"></div>
                <div>
                  <p className="font-black text-sm">@{post.user}</p>
                  <p className="text-xs text-gray-500 font-bold">2 hours ago</p>
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img src={post.image} alt="Meme" className="w-full h-full object-cover" />
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group">
                    <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group">
                    <ShareIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-sm">Share</span>
                  </button>
                </div>
                <p className="font-medium text-gray-800">
                  <span className="font-black mr-2">@{post.user}</span>
                  {post.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-black text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-hard-sm">
            Load More Memes
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExplorePage;
