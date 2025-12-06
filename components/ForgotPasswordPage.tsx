import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, MailIcon, ShieldCheckIcon } from './Icons';
import { authService } from '../services/authService';

interface ForgotPasswordPageProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
}

type Step = 'EMAIL' | 'SUCCESS';

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin, onBack }) => {
  const [step, setStep] = useState<Step>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');

  // Auto-redirect to login when success is reached
  useEffect(() => {
    if (step === 'SUCCESS') {
      const timer = setTimeout(() => {
        onSwitchToLogin();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, onSwitchToLogin]);

  // Handlers
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setStep('SUCCESS');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
          // For security reasons, we might want to show success even if user not found, 
          // but for this UX we'll show an error or just fail gracefully.
          setError("User not found.");
      } else {
          setError("Failed to send reset email. Please check the address.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Home
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 relative overflow-hidden">
        
        {/* Step Indicator (Progress Bar) */}
        {step !== 'SUCCESS' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
             <div 
               className="h-full bg-black transition-all duration-500 ease-out"
               style={{ width: '50%' }} 
             />
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 'EMAIL' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailIcon className="w-8 h-8" />
               </div>
               <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Forgot Password?</h2>
               <p className="text-gray-500 text-sm">No worries! Enter your email and we'll send you a reset link.</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-medium rounded-lg text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="animate-fade-in text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheckIcon className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Inbox!</h2>
             <p className="text-gray-500 mb-8">
               We've sent a password reset link to <span className="font-bold text-gray-900">{email}</span>.
               <br/><br/>
               Redirecting to login in 5 seconds...
             </p>
             
             <button 
                onClick={onSwitchToLogin}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Back to Login
              </button>
          </div>
        )}

      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        © 2025 Meme Your Pic. Secure Verification.
      </div>
    </div>
  );
};

export default ForgotPasswordPage;