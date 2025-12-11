
import React from 'react';
import { User } from '../types';
import { CrownIcon } from './Icons';

interface NavbarProps {
  user?: User | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoClick: () => void;
  onPricingClick: () => void;
  onLogoutClick?: () => void;
  onBattleClick?: () => void;
  onExploreClick?: () => void;
  onDashboardClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLoginClick,
  onSignupClick,
  onLogoClick,
  onPricingClick,
  onLogoutClick,
  onBattleClick,
  onExploreClick,
  onDashboardClick
}) => {
  return (
    <nav className="w-full fixed top-0 z-50 py-4 px-4 flex justify-center pointer-events-none">
      <div className="w-full max-w-screen-xl bg-white/90 backdrop-blur-md border-2 border-black rounded-full shadow-hard px-4 md:px-6 py-3 flex justify-between items-center pointer-events-auto">

        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={onLogoClick}
            className="group cursor-pointer flex items-center gap-2"
          >
            <img
              src="/favicon.png"
              alt="Logo"
              className="w-10 h-10 rounded-lg border-2 border-black transform group-hover:rotate-12 transition-transform shadow-sm object-cover"
            />
            <span className="text-lg md:text-xl font-black tracking-tight text-black group-hover:text-brand-600 transition-colors">
              Meme Your Pic
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Explore and Pricing Hidden for MVP */}
            <button
              onClick={onBattleClick}
              className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline decoration-2 underline-offset-4 decoration-red-200 transition-all flex items-center gap-1"
            >
              <span className="animate-pulse">🔥</span> Battle Mode
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onDashboardClick}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition-colors"
              >
                <span className="text-sm font-bold text-gray-800">
                  {user.displayName || 'Meme Lord'}
                </span>
              </button>
              <button
                onClick={onLogoutClick}
                className="text-sm font-bold bg-white text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500 px-3 py-1.5 rounded-full transition-all"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-sm font-bold text-gray-600 hover:text-black transition-colors px-3"
              >
                Log in
              </button>
              <button
                onClick={onSignupClick}
                className="text-sm font-bold bg-brand-500 text-white border-2 border-black px-5 py-2 rounded-full shadow-hard-sm hover:translate-y-[-2px] hover:shadow-hard transition-all btn-press"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
