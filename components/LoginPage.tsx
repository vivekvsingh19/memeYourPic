import React, { useState } from 'react';
import { GoogleIcon, ArrowLeftIcon } from './Icons';
import { authService } from '../services/authService';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onBack: () => void;
  onForgotPassword?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup, onBack, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      // App.tsx auth listener handles redirect
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setIsLoading(true);
      setError(null);
      try {
          await authService.loginWithGoogle();
          // App.tsx auth listener handles redirect
      } catch (err: any) {
          console.error(err);
          setError("Google sign-in failed.");
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      {/* Back to Home */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Log in to manage your viral empire 👑</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-medium rounded-lg text-center">
                {error}
            </div>
        )}

        {/* Social Login */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLoading}
          className="w-full py-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors font-semibold text-gray-700 mb-6 disabled:opacity-50"
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
           <div className="h-px bg-gray-200 flex-1" />
           <span className="text-xs font-bold text-gray-400 uppercase">Or log in with email</span>
           <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-400"
              placeholder="meme.lord@example.com"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-bold text-gray-700">Password</label>
               <button 
                 type="button" 
                 onClick={onForgotPassword}
                 className="text-xs font-semibold text-brand-600 hover:text-brand-800"
               >
                 Forgot?
               </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToSignup}
            className="font-bold text-brand-600 hover:underline"
          >
            Sign up for free
          </button>
        </div>

      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        © 2025 Meme Your Pic. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;