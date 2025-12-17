
import React from 'react';
import { User } from '../types';
import { CrownIcon, FireIcon, ImageIcon } from './Icons';

interface UserDashboardProps {
  user: User;
  credits: number;
  onBuyCredits: (amount: number, cost: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, credits, onBuyCredits }) => {
  const scrollToPricing = () => {
    document.getElementById('dashboard-pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white border-2 border-black rounded-3xl p-8 mb-8 shadow-hard flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-gray-200">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">😎</div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">{user.displayName || 'Meme Lord'}</h1>
            <p className="text-gray-500 font-bold">{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-lg font-bold text-xs uppercase border border-brand-200">
                Early Adopter
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-xs uppercase border border-purple-200">
                Pro Roaster
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black mb-1">{credits}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Credits Available</div>
            <button onClick={scrollToPricing} className="mt-4 px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
              Buy More
            </button>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FireIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-black uppercase text-sm">Roast Streak</h3>
            </div>
            <p className="text-3xl font-black">12 Days</p>
            <p className="text-xs text-gray-500 font-bold mt-1">Keep it up! 🔥</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-black uppercase text-sm">Credits Used</h3>
            </div>
            <p className="text-3xl font-black">142</p>
            <p className="text-xs text-gray-500 font-bold mt-1">Lifetime Usage</p>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CrownIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-black uppercase text-sm">Current Level</h3>
            </div>
            <p className="text-3xl font-black">Lvl 5</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-yellow-400 h-full w-[70%]"></div>
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">300 XP to Level 6</p>
          </div>
        </div>

        {/* Saved Memes (Mock) */}
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Your Masterpieces</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold hover:border-black hover:bg-gray-100 cursor-pointer transition-all">
              Meme #{i}
            </div>
          ))}
          <div className="aspect-square bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 font-bold hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 cursor-pointer transition-all">
            <span className="text-2xl mb-2">+</span>
            Create New
          </div>
        </div>



      </div>
    </div>
  );
};

export default UserDashboard;
